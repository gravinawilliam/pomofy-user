import { RequestHandler } from 'express';
import morgan, { StreamOptions } from 'morgan';

import { ISendLogHttpLoggerProvider } from '@contracts/providers/logger/send-log-http-logger.provider';

import { GLOBAL_CONFIG } from '@main/configs/environments.config';
import { makeLoggerProvider } from '@main/factories/providers/logger-provider.factory';

const logger: ISendLogHttpLoggerProvider = makeLoggerProvider();
const stream: StreamOptions = {
  write: message => logger.sendLogHttp({ message: message.slice(0, Math.max(0, message.lastIndexOf('\n'))) })
};
const skip = () => GLOBAL_CONFIG.IS_PRODUCTION;

type Adapter = () => RequestHandler;

export const morganMiddleware: Adapter = () => async (request, response, next) => {
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream,
    skip
  })(request, response, next);
};
