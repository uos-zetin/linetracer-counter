import { Actor, ActorRole } from "@/core/models";
import { AuthorizationError } from "@/core/errors";

/**
 * 액터에 필요한 역할(requiredRoles)이 하나라도 포함되어 있는지 확인한다.
 * @throws AuthorizationError
 */
export function requireAnyRole(
  actor: Actor,
  ...requiredRoles: ActorRole[]
): void {
  const has = requiredRoles.some((r) => actor.roles.includes(r));
  if (!has) {
    throw new AuthorizationError();
  }
}

/**
 * 액터에 필요한 역할(requiredRoles)이 모두 포함되어 있는지 확인한다.
 * @throws AuthorizationError
 */
export function requireAllRoles(
  actor: Actor,
  ...requiredRoles: ActorRole[]
): void {
  const missing = requiredRoles.filter((r) => !actor.roles.includes(r));
  if (missing.length) {
    throw new AuthorizationError();
  }
}
