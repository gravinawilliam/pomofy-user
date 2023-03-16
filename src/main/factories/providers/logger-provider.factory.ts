import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';
import { ISendLogHttpLoggerProvider } from '@contracts/providers/logger/send-log-http-logger.provider';
import { ISendLogTimeControllerLoggerProvider } from '@contracts/providers/logger/send-log-time-controller.logger-provider';
import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';

import { WinstonLoggerProvider } from '@infrastructure/providers/logger/winston.logger-provider';

export const makeLoggerProvider = (): ISendLogErrorLoggerProvider &
  ISendLogTimeUseCaseLoggerProvider &
  ISendLogHttpLoggerProvider &
  ISendLogTimeControllerLoggerProvider =>
  new WinstonLoggerProvider({
    IS_DEVELOPMENT: true,
    LOGS_FOLDER: 'logs'
  });
