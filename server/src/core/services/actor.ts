import {
  AuthenticationError,
  EntityNotFoundError,
  UsernameAlreadyExistsError,
} from "@/core/errors";
import { Actor } from "@/core/models";
import { ActorIdPwRepository, ActorRepository } from "@/core/repositories";
import { ActorService } from "@/core/services";

import { requireAnyRole } from "@/utils/auth";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export class ActorServiceImpl implements ActorService {
  private readonly actorRepo: ActorRepository;
  private readonly actorIdPwRepo: ActorIdPwRepository;

  private readonly SALT_ROUNDS = 10;

  constructor(di: {
    actorRepository: ActorRepository;
    actorIdPwRepository: ActorIdPwRepository;
  }) {
    this.actorRepo = di.actorRepository;
    this.actorIdPwRepo = di.actorIdPwRepository;
  }

  async getActors(actor: Actor): Promise<Actor[]> {
    requireAnyRole(actor, "administrator");
    return this.actorRepo.getAll();
  }

  async setActorRoles(
    actor: Actor,
    targetActorId: string,
    roles: Actor["roles"]
  ): Promise<Actor> {
    requireAnyRole(actor, "administrator");

    const targetActor = await this.actorRepo.getById(targetActorId);
    targetActor.roles = roles;
    return this.actorRepo.update(targetActor);
  }

  async registerWithIdPw(
    name: string,
    username: string,
    password: string
  ): Promise<Actor> {
    if (await this.checkIdPwExists(username)) {
      throw new UsernameAlreadyExistsError(username);
    }

    const newActor = await this.actorRepo.create({
      id: uuidv4(),
      name,
      roles: [],
      createdAt: new Date(),
    });

    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.actorIdPwRepo.create({
      id: uuidv4(),
      actorId: newActor.id,
      username,
      hashedPassword,
      createdAt: new Date(),
    });

    return newActor;
  }

  async checkIdPwExists(username: string): Promise<boolean> {
    return await this.actorIdPwRepo
      .getByUsername(username)
      .then(() => true)
      .catch((err) => {
        if (err instanceof EntityNotFoundError) {
          return false;
        }
        throw err;
      });
  }

  async verifyIdPw(username: string, password: string): Promise<Actor> {
    const actorIdPw = await this.actorIdPwRepo.getByUsername(username);
    const isValid = await bcrypt.compare(password, actorIdPw.hashedPassword);

    if (!isValid) {
      throw new AuthenticationError();
    }

    return this.actorRepo.getById(actorIdPw.actorId);
  }

  async unregister(actor: Actor, targetActorId: string): Promise<void> {
    requireAnyRole(actor, "administrator");

    const targetActor = await this.actorRepo.getById(targetActorId);
    const targetActorIdPw = await this.actorIdPwRepo.getByActorId(
      targetActorId
    );

    await this.actorRepo.delete(targetActor.id);
    await this.actorIdPwRepo.delete(targetActorIdPw.id);
  }
}
