import { performance } from 'node:perf_hooks';

import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';

export abstract class UseCase<Parameters, Response> {
  constructor(private readonly loggerProvider: ISendLogTimeUseCaseLoggerProvider) {}

  public async execute(parameters: Parameters): Promise<Response> {
    const startTime = performance.now();
    const response = await this.performOperation(parameters);
    this.loggerProvider.sendLogTimeUseCase({
      message: `${this.constructor.name}.execute(${parameters}) took +${performance.now() - startTime} ms to execute!`
    });
    return response;
  }

  protected abstract performOperation(parameters: Parameters): Response;
}
