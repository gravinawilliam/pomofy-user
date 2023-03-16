import 'winston-daily-rotate-file';

import emoji from 'node-emoji';
import { addColors, createLogger, format, Logger as WinstonLoggerType, transports } from 'winston';

import {
  ISendLogErrorLoggerProvider,
  SendLogErrorLoggerProviderDTO
} from '@contracts/providers/logger/send-log-error-logger.provider';
import {
  ISendLogHttpLoggerProvider,
  SendLogHttpLoggerProviderDTO
} from '@contracts/providers/logger/send-log-http-logger.provider';
import {
  ISendLogTimeControllerLoggerProvider,
  SendLogTimeControllerLoggerProviderDTO
} from '@contracts/providers/logger/send-log-time-controller.logger-provider';
import {
  ISendLogTimeUseCaseLoggerProvider,
  SendLogTimeUseCaseLoggerProviderDTO
} from '@contracts/providers/logger/send-log-time-use-case.logger-provider';

enum LevelName {
  SILLY = 'silly',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
  HTTP = 'http',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

const LEVEL_SEVERITY = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const LEVEL_COLOR = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'white',
  silly: 'cyan'
};

const DEFAULT_FORMAT = format.combine(
  format.errors({ stack: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.ms' }),
  format.printf(parameters =>
    `[${parameters.timestamp}] ${parameters.level.toLocaleUpperCase()} ${parameters.message} ${
      parameters.stack || ''
    }`.trim()
  )
);

const CONSOLE_FORMAT = format.combine(
  format(parameters => ({ ...parameters, level: parameters.level.toUpperCase() }))(),
  format.errors({ stack: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.ms' }),
  format.colorize({ all: true }),
  format.printf(parameters =>
    `[${parameters.timestamp}] ${parameters.level} ${parameters.message} ${parameters.stack || ''}`.trim()
  )
);

export class WinstonLoggerProvider
  implements
    ISendLogErrorLoggerProvider,
    ISendLogTimeUseCaseLoggerProvider,
    ISendLogHttpLoggerProvider,
    ISendLogTimeControllerLoggerProvider
{
  private readonly level: string = this.environment.IS_DEVELOPMENT ? LevelName.DEBUG : LevelName.INFO;

  private readonly logsFolder: string = this.environment.LOGS_FOLDER;

  private readonly logger: WinstonLoggerType;

  constructor(
    private readonly environment: {
      IS_DEVELOPMENT: boolean;
      LOGS_FOLDER: string;
    }
  ) {
    this.logger = this.configureAndGetLogger();
  }

  public sendLogTimeController(
    parameters: SendLogTimeControllerLoggerProviderDTO.Parameters
  ): SendLogTimeControllerLoggerProviderDTO.Result {
    this.logger.info(`${emoji.get('bulb')} ${this.getValue(parameters.message)}`);
  }

  public sendLogHttp(parameters: SendLogHttpLoggerProviderDTO.Parameters): SendLogHttpLoggerProviderDTO.Result {
    this.logger.http(`${emoji.get('computer')} ${this.getValue(parameters.message)}`);
  }

  public sendLogError(parameters: SendLogErrorLoggerProviderDTO.Parameters): SendLogErrorLoggerProviderDTO.Result {
    if (parameters.value instanceof Error) {
      this.logger.error(emoji.get('x'), parameters.value);
    } else {
      this.logger.error(`${emoji.get('x')} ${this.getValue(parameters.value)}`);
    }
  }

  public sendLogTimeUseCase(
    parameters: SendLogTimeUseCaseLoggerProviderDTO.Parameters
  ): SendLogTimeUseCaseLoggerProviderDTO.Result {
    this.logger.info(`${emoji.get('bulb')} ${this.getValue(parameters.message)}`);
  }

  private configureAndGetLogger = (): WinstonLoggerType => {
    addColors(LEVEL_COLOR);

    const transportsList = [
      new transports.Console({
        level: this.level,
        handleExceptions: true,
        format: CONSOLE_FORMAT
      }),
      new transports.File({
        filename: `${this.logsFolder}/error.log`,
        level: LevelName.ERROR,
        handleExceptions: true,
        maxsize: 5_242_880, // 5MB
        maxFiles: 1
      }),
      new transports.DailyRotateFile({
        filename: `${this.logsFolder}/all-%DATE%.log`,
        level: this.level,
        handleExceptions: true,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d'
      })
    ];

    return createLogger({
      level: this.level,
      levels: LEVEL_SEVERITY,
      format: DEFAULT_FORMAT,
      transports: transportsList,
      exitOnError: false,
      handleExceptions: true
    });
  };

  private getValue = (parameters: string | unknown): string => {
    if (typeof parameters === 'string') {
      return parameters;
    }
    return JSON.stringify(parameters);
  };
}
