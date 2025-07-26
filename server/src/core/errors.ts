export class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersistenceError";
  }
}

export class EntityNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntityNotFoundError";
  }
}

export class ParameterInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParameterInvalidError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class UsernameAlreadyExistsError extends Error {
  constructor(username: string) {
    super(`Username "${username}" already exists`);
    this.name = "UsernameAlreadyExistsError";
  }
}

export class TimerLogConsecutiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimerLogConsecutiveError";
  }
}

export class DivisionStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DivisionStatusError";
  }
}

export class RunnerNotParticipatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunnerNotParticipatedError";
  }
}

export class RunnerNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunnerNotSetError";
  }
}

export class CounterNotRegisteredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CounterNotRegisteredError";
  }
}
