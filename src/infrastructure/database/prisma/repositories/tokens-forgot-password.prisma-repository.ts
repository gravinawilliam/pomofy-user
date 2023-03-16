import { PrismaClient } from '@prisma/client';

import { IGenerateIdCryptoProvider } from '@contracts/providers/crypto/generate-id.crypto-provider';
import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';
import {
  ISaveTokensForgotPasswordRepository,
  SaveTokensForgotPasswordRepositoryDTO
} from '@contracts/repositories/tokens-forgot-password/save.tokens-forgot-password-repository';

import {
  RepositoryError,
  RepositoryNames,
  TokensForgotPasswordRepositoryMethods
} from '@errors/_shared/repository.error';

import { failure, success } from '@shared/utils/either.util';

export class TokensForgotPasswordPrismaRepository implements ISaveTokensForgotPasswordRepository {
  constructor(
    private readonly loggerProvider: ISendLogErrorLoggerProvider,
    private readonly cryptoProvider: IGenerateIdCryptoProvider,
    private readonly prisma: PrismaClient
  ) {}

  public async save(
    parameters: SaveTokensForgotPasswordRepositoryDTO.Parameters
  ): SaveTokensForgotPasswordRepositoryDTO.Result {
    try {
      const resultUuidProvider = this.cryptoProvider.generateId();
      if (resultUuidProvider.isFailure()) return failure(resultUuidProvider.value);
      const { id } = resultUuidProvider.value;

      await this.prisma.tokenForgotPasswordTable.create({
        data: {
          id: id.value,
          expirationDate: parameters.tokenForgotPassword.expirationDate,
          userId: parameters.tokenForgotPassword.user.id.value,
          value: parameters.tokenForgotPassword.value
        },
        select: {}
      });

      return success(undefined);
    } catch (error: any) {
      const repositoryError = new RepositoryError({
        error,
        repository: {
          name: RepositoryNames.TOKENS_FORGOT_PASSWORD,
          method: TokensForgotPasswordRepositoryMethods.SAVE,
          externalName: 'prisma'
        }
      });
      this.loggerProvider.sendLogError({ message: repositoryError.message, value: error });
      return failure(repositoryError);
    }
  }
}
