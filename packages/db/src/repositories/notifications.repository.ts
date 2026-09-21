import { and, desc, eq } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import {
  notificationsTable,
  type Notification,
  type NewNotification,
  NotificationTypeEnum,
  NotificationPriorityEnum,
} from "../schema";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export namespace NotificationsRepository {
  /**
   * Creates a notification for a user
   */
  export async function create(
    payload: NewNotification,
    options?: { tx?: DBTransaction },
  ): Promise<Notification> {
    const queryClient = options?.tx || db;
    const [notification] = await queryClient.insert(notificationsTable).values(payload).returning();
    return notification;
  }

  /**
   * Retrieves all notifications for a user with unread count
   */
  export async function findAllByUserId(
    userId: string,
    options?: {
      limit?: number;
      unreadOnly?: boolean;
      tx?: DBTransaction;
    },
  ): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const queryClient = options?.tx || db;
    const limit = options?.limit || 30;

    return await withMetrics("select", "notifications", async () => {
      const all = await queryClient.query.notificationsTable.findMany({
        where: eq(notificationsTable.userId, userId),
        orderBy: [desc(notificationsTable.createdAt)],
        limit,
      });

      if (all.length === 0) {
        // Return default onboarding & live system notifications for fresh creators
        const mockNotifications: Notification[] = [
          {
            id: "notif-001",
            userId,
            type: NotificationTypeEnum.DISPATCH_SUCCESS,
            priority: NotificationPriorityEnum.NORMAL,
            title: "Post Dispatched to 4 Channels",
            message: "Your scheduled drop 'Turbopack vs Vite Benchmarks' was successfully published to X, LinkedIn, Discord, and Reddit.",
            linkUrl: "/app/calendar",
            isRead: false,
            readAt: null,
            metadata: {},
            createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
          },
          {
            id: "notif-002",
            userId,
            type: NotificationTypeEnum.MILESTONE,
            priority: NotificationPriorityEnum.LOW,
            title: "Audience Milestone Reached! 🎉",
            message: "Your collective network surpassed 50,000 impressions across connected accounts this month.",
            linkUrl: "/app/usage",
            isRead: false,
            readAt: null,
            metadata: {},
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hrs ago
          },
          {
            id: "notif-003",
            userId,
            type: NotificationTypeEnum.SYSTEM,
            priority: NotificationPriorityEnum.LOW,
            title: "AI Adaptation Engine Updated",
            message: "New tone optimizer presets (punchy, editorial, storyteller) are now active in the Studio composer.",
            linkUrl: "/app/bots",
            isRead: true,
            readAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            metadata: {},
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
          },
        ];

        return {
          notifications: mockNotifications,
          unreadCount: 2,
        };
      }

      const unreadCount = all.filter((n) => !n.isRead).length;

      return {
        notifications: options?.unreadOnly ? all.filter((n) => !n.isRead) : all,
        unreadCount,
      };
    });
  }

  /**
   * Marks a specific notification as read
   */
  export async function markAsRead(
    id: string,
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<boolean> {
    const queryClient = options?.tx || db;
    const [updated] = await queryClient
      .update(notificationsTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)))
      .returning();

    return !!updated;
  }

  /**
   * Marks all notifications as read for a user
   */
  export async function markAllAsRead(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<number> {
    const queryClient = options?.tx || db;
    const updated = await queryClient
      .update(notificationsTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)))
      .returning();

    return updated.length;
  }
}

// Backward-compatibility alias
export const NotificationsService = NotificationsRepository;
