import { sessionsTable, type NewSession, type UpdateSession } from "../schema";
import { db, type DBTransaction } from "../connection";
import { eq } from "drizzle-orm";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export namespace SessionRepository {
  /**
   * Creates a new session in the database
   * @param payload new session
   * @param options extra options for query
   * @returns the created session
   */
  export async function create(
    payload: NewSession,
    options?: {
      /**
       * Transaction to use for the query
       */
      tx?: DBTransaction;
    },
  ) {
    const queryClient = options?.tx ?? db;
    try {
      const result = await withMetrics("insert", "sessions", async () =>
        queryClient.insert(sessionsTable).values(payload).returning(),
      );
      const [session] = result;

      logger.audit("Created new session", {
        module: "session",
        action: "repository:create",
        session: session,
      });

      return session;
    } catch (err) {
      logger.error("Error creating session", {
        module: "session",
        action: "repository:create",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Updates a session in the database
   * @param id id of the session
   * @param payload new session details
   * @param options extra options for query
   * @returns the updated session
   */
  export async function updateById(
    id: string,
    payload: UpdateSession,
    options?: {
      /**
       * Transaction to use for the query
       */
      tx?: DBTransaction;
    },
  ) {
    const queryClient = options?.tx ?? db;
    try {
      const result = await withMetrics("update", "sessions", async () =>
        queryClient.update(sessionsTable).set(payload).where(eq(sessionsTable.id, id)).returning(),
      );
      const [updatedSession] = result;

      logger.audit("Updated session", {
        module: "session",
        action: "repository:updateById",
        session: updatedSession,
      });

      return updatedSession;
    } catch (err) {
      logger.error("Error updating session", {
        module: "session",
        action: "repository:updateById",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Finds a session by id
   * @param id id of the session
   * @param options extra options for query
   * @returns the session or undefined if not found
   */
  export async function findById(
    id: string,
    options?: {
      /**
       * Transaction to use for the query
       */
      tx?: DBTransaction;
    },
  ) {
    const queryClient = options?.tx ?? db;
    try {
      return await withMetrics("select", "sessions", async () =>
        queryClient.query.sessionsTable.findFirst({
          where: eq(sessionsTable.id, id),
        }),
      );
    } catch (err) {
      logger.error("Error finding session by id", {
        module: "session",
        action: "repository:findById",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Finds a session by user id
   * @param userId id of the user
   * @param options extra options for query
   * @returns the session or undefined if not found
   */
  export async function findByUserId(
    userId: string,
    options?: {
      /**
       * Transaction to use for the query
       */
      tx?: DBTransaction;
    },
  ) {
    const queryClient = options?.tx ?? db;
    try {
      return await withMetrics("select", "sessions", async () =>
        queryClient.query.sessionsTable.findFirst({
          where: eq(sessionsTable.userId, userId),
        }),
      );
    } catch (err) {
      logger.error("Error finding session by user id", {
        module: "session",
        action: "repository:findByUserId",
        error: err,
      });
      throw err;
    }
  }
}

// Backward-compatibility alias
export const SessionService = SessionRepository;
