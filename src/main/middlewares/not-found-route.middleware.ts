import { RequestHandler } from 'express';
import emoji from 'node-emoji';

import { APP_INFO } from '@main/configs/environments.config';

import { HttpStatusCode } from '@shared/utils/http-status-code.util';

type Adapter = () => RequestHandler;

export const notFoundRouteMiddleware: Adapter = () => async (request, response, _next) => {
  if (!response.headersSent) {
    const error = {
      code: 'not_found',
      message: `${emoji.get('cry')} Can't find ${request.method.toUpperCase()} ${request.originalUrl} on this server.`,
      status: HttpStatusCode.NOT_FOUND,
      appVersion: APP_INFO.APP_VERSION
    };
    response.status(error.status).send(error);
  }
  response.end();
};
