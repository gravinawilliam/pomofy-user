import { IGenerateJwtTokenProvider } from '@contracts/providers/token/generate-jwt.token-provider';
import { IVerifyJwtTokenProvider } from '@contracts/providers/token/verify-jwt.token-provider';

import { JsonwebtokenTokenProvider } from '@infrastructure/providers/token/jsonwebtoken.token-provider';

import { makeLoggerProvider } from './logger-provider.factory';

export const makeTokenJwtProvider = (): IGenerateJwtTokenProvider & IVerifyJwtTokenProvider =>
  new JsonwebtokenTokenProvider(makeLoggerProvider(), {
    ALGORITHM: 'HS256',
    EXPIRES_IN: '1d',
    ISSUER: 'issuer',
    SECRET: 'secret'
  });
