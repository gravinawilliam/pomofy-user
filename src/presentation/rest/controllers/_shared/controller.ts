import { performance } from 'perf_hooks';

import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';
import { ISendLogTimeControllerLoggerProvider } from '@contracts/providers/logger/send-log-time-controller.logger-provider';

import { StatusError } from '@domain/entities/errors/_shared/status.error';

import { HttpResponse } from '@shared/types/http-response.type';
import { Either } from '@shared/utils/either.util';

export enum StatusSuccess {
  CREATED = 'created',
  DONE = 'done'
}

export type ResponseSuccess<Data = any> = {
  data: Data;
  status: StatusSuccess;
};

export type ResponseError = {
  message: string;
  status: StatusError;
};

export abstract class Controller<Parameters, Response> {
  constructor(private readonly loggerProvider: ISendLogErrorLoggerProvider & ISendLogTimeControllerLoggerProvider) {}

  public async handle(parameters: Parameters): Promise<HttpResponse> {
    try {
      const startTime = performance.now();

      const response = (await this.performOperation(parameters)) as Either<ResponseError, ResponseSuccess>;
      if (response.isFailure()) {
        this.log({ httpRequest: parameters, startTime });
        return this.makeResponseError(response.value as ResponseError);
      }

      this.log({ httpRequest: parameters, startTime });
      return this.makeResponseGood(response.value as ResponseSuccess);
    } catch (error) {
      this.loggerProvider.sendLogError({
        message: `${this.constructor.name}.execute(${parameters}) error`,
        value: error
      });

      return {
        statusCode: 500,
        data: error
      };
    }
  }

  private log(parameters: { httpRequest: Parameters; startTime: number }) {
    this.loggerProvider.sendLogTimeController({
      message: `${this.constructor.name}.execute(${parameters.httpRequest}) took +${
        performance.now() - parameters.startTime
      } ms to execute!`
    });
  }

  private makeResponseError(error: ResponseError): HttpResponse {
    const statusCode = this.selectStatusCode({ status: error.status });
    return { statusCode, data: { error: error.message } };
  }

  private makeResponseGood(response: ResponseSuccess): HttpResponse {
    const statusCode = this.selectStatusCode({ status: response.status });
    return { statusCode, data: response.data };
  }

  private selectStatusCode(parameters: { status: StatusError | StatusSuccess }): number {
    switch (parameters.status) {
      case StatusError.CONFLICT: {
        return 409;
      }
      case StatusError.INVALID: {
        return 400;
      }
      case StatusError.NOT_FOUND: {
        return 404;
      }
      case StatusError.PROVIDER_ERROR: {
        return 500;
      }
      case StatusError.REPOSITORY_ERROR: {
        return 500;
      }
      case StatusSuccess.CREATED: {
        return 201;
      }
      case StatusSuccess.DONE: {
        return 200;
      }
      default: {
        return 500;
      }
    }
  }

  protected abstract performOperation(parameters: Parameters): Response;
}
