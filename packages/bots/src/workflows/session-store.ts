import type { BotChannel, BotSession } from "@/types/bot.types";

export interface SessionStore {
  getSession(channel: BotChannel, channelUserId: string): Promise<BotSession | null>;
  saveSession(session: BotSession): Promise<void>;
  clearSession(channel: BotChannel, channelUserId: string): Promise<void>;
}

export class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, BotSession>();
  private ttlMs: number;

  constructor(ttlMinutes = 30) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  private getKey(channel: BotChannel, channelUserId: string): string {
    return `${channel}:${channelUserId}`;
  }

  public async getSession(channel: BotChannel, channelUserId: string): Promise<BotSession | null> {
    const key = this.getKey(channel, channelUserId);
    const session = this.sessions.get(key);

    if (!session) return null;

    // Check TTL
    if (Date.now() - session.lastActiveAt.getTime() > this.ttlMs) {
      this.sessions.delete(key);
      return null;
    }

    return session;
  }

  public async saveSession(session: BotSession): Promise<void> {
    const key = this.getKey(session.channel, session.channelUserId);
    session.lastActiveAt = new Date();
    this.sessions.set(key, session);
  }

  public async clearSession(channel: BotChannel, channelUserId: string): Promise<void> {
    const key = this.getKey(channel, channelUserId);
    this.sessions.delete(key);
  }
}
