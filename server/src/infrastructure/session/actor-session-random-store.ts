import { AuthenticationError } from "@/core/errors";
import { ActorSessionStore } from "@/core/interfaces";
import { Actor } from "@/core/models";
import { ActorRepository } from "@/core/repositories";

import crypto from "crypto";

export class ActorSessionRandomStore implements ActorSessionStore {
  private readonly actorRepo: ActorRepository;
  private readonly keyByteLength: number;
  private readonly sessions: Map<
    string,
    {
      actorId: string;
      expiresAt: Date;
    }
  > = new Map();

  constructor(
    di: {
      actorRepository: ActorRepository;
    },
    keyByteLength: number
  ) {
    this.actorRepo = di.actorRepository;
    this.keyByteLength = keyByteLength;

    if (this.keyByteLength < 32) {
      console.warn(
        `Key byte length is set to ${this.keyByteLength}, which is less than the recommended 32 bytes. This may lead to weaker security.`
      );
    }
  }

  private generateRandomBase64Key(): string {
    const buffer = crypto.randomBytes(this.keyByteLength);
    return buffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async createSession(actor: Actor, expiresMsIn: number): Promise<string> {
    const key = this.generateRandomBase64Key();
    this.sessions.set(key, {
      actorId: actor.id,
      expiresAt: new Date(Date.now() + expiresMsIn),
    });
    return key;
  }

  async validateSession(key: string): Promise<Actor> {
    const session = this.sessions.get(key);
    if (!session) {
      throw new AuthenticationError("Authentication failed: Session not found");
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(key);
      throw new AuthenticationError("Authentication failed: Session expired");
    }

    const actor = await this.actorRepo.getById(session.actorId).catch((err) => {
      throw new AuthenticationError(
        "Authentication failed: Actor fetch failed"
      );
    });

    return actor;
  }

  async revokeSession(key: string): Promise<void> {
    this.sessions.delete(key);
  }
}
