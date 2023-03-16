import bcrypt from 'bcryptjs';

import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';
import {
  ComparePasswordProviderDTO,
  IComparePasswordProvider
} from '@contracts/providers/password/compare.password-provider';
import {
  EncryptPasswordProviderDTO,
  IEncryptPasswordProvider
} from '@contracts/providers/password/encrypt.password-provider';

import { PasswordProviderMethods, ProviderError, ProviderNames } from '@errors/_shared/provider.error';

import { Password } from '@value-objects/password.value-object';

import { failure, success } from '@shared/utils/either.util';

export default class BCryptPasswordProvider implements IComparePasswordProvider, IEncryptPasswordProvider {
  constructor(private readonly loggerProvider: ISendLogErrorLoggerProvider) {}

  public async compare(parameters: ComparePasswordProviderDTO.Parameters): ComparePasswordProviderDTO.Result {
    try {
      return success({ isEqual: await bcrypt.compare(parameters.password.value, parameters.passwordEncrypted.value) });
    } catch (error: any) {
      const errorProvider = new ProviderError({
        error,
        provider: {
          name: ProviderNames.PASSWORD,
          method: PasswordProviderMethods.COMPARE,
          externalName: 'bcryptjs'
        }
      });

      this.loggerProvider.sendLogError({
        message: errorProvider.message,
        value: error
      });

      return failure(errorProvider);
    }
  }

  public async encrypt(parameters: EncryptPasswordProviderDTO.Parameters): EncryptPasswordProviderDTO.Result {
    try {
      return success({ passwordEncrypted: new Password({ password: await bcrypt.hash(parameters.password.value, 10) }) });
    } catch (error: any) {
      const errorProvider = new ProviderError({
        error,
        provider: {
          name: ProviderNames.PASSWORD,
          method: PasswordProviderMethods.ENCRYPT,
          externalName: 'bcryptjs'
        }
      });

      this.loggerProvider.sendLogError({
        message: errorProvider.message,
        value: error
      });

      return failure(errorProvider);
    }
  }
}
