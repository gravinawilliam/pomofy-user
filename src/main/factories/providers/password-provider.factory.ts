import { IComparePasswordProvider } from '@contracts/providers/password/compare.password-provider';
import { IEncryptPasswordProvider } from '@contracts/providers/password/encrypt.password-provider';

import BCryptPasswordProvider from '@infrastructure/providers/password/bcrypt.password-provider';

import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';

export const makePasswordProvider = (): IEncryptPasswordProvider & IComparePasswordProvider =>
  new BCryptPasswordProvider(makeLoggerProvider());
