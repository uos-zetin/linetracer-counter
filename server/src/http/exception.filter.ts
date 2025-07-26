import {
  AuthenticationError,
  AuthorizationError,
  CounterNotRegisteredError,
  DivisionNotOngoingError,
  DivisionStatusError,
  EntityNotFoundError,
  ParameterInvalidError,
  PersistenceError,
  RunnerNotParticipatedError,
  RunnerNotSetError,
  TimerLogConsecutiveError,
  UsernameAlreadyExistsError,
} from "@/core/errors";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

interface ErrorResponse {
  statusCode: number;
  type: string;
  message: string;
}

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let error: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      type: "InternalServerError",
      message: "An unexpected error occurred.",
    };

    switch (true) {
      case exception instanceof HttpException:
        // Handle NestJS built-in exceptions
        error = {
          statusCode: exception.getStatus(),
          type: exception.constructor.name,
          message: exception.message,
        };
        break;
      case exception instanceof PersistenceError:
        error = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          type: "PersistenceError",
          message: "An unexpected error occurred.",
        };
        break;
      case exception instanceof EntityNotFoundError:
        error = {
          statusCode: HttpStatus.NOT_FOUND,
          type: "EntityNotFoundError",
          message: exception.message,
        };
        break;
      case exception instanceof ParameterInvalidError:
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          type: "ParameterInvalidError",
          message: exception.message,
        };
        break;
      case exception instanceof AuthorizationError:
        error = {
          statusCode: HttpStatus.UNAUTHORIZED,
          type: "AuthorizationError",
          message: exception.message,
        };
        break;
      case exception instanceof AuthenticationError:
        error = {
          statusCode: HttpStatus.UNAUTHORIZED,
          type: "AuthenticationError",
          message: exception.message,
        };
        break;
      case exception instanceof UsernameAlreadyExistsError:
        error = {
          statusCode: HttpStatus.CONFLICT,
          type: "UsernameAlreadyExistsError",
          message: exception.message,
        };
        break;
      case exception instanceof TimerLogConsecutiveError:
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          type: "TimerLogConsecutiveError",
          message: exception.message,
        };
        break;
      case exception instanceof DivisionStatusError:
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          type: "DivisionStatusError",
          message: exception.message,
        };
        break;
      case exception instanceof DivisionNotOngoingError:
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          type: "DivisionNotOngoingError",
          message: exception.message,
        };
        break;
      case exception instanceof RunnerNotParticipatedError:
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          type: "RunnerNotParticipatedError",
          message: exception.message,
        };
        break;
      case exception instanceof RunnerNotSetError:
        error = {
          statusCode: HttpStatus.BAD_REQUEST,
          type: "RunnerNotSetError",
          message: exception.message,
        };
        break;
      case exception instanceof CounterNotRegisteredError:
        error = {
          statusCode: HttpStatus.NOT_FOUND,
          type: "CounterNotRegisteredError",
          message: exception.message,
        };
        break;
    }

    if (error.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    return res.status(error.statusCode).json(error);
  }
}
