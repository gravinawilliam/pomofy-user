import { PrismaClient } from '@prisma/client';

import { IGenerateIdCryptoProvider } from '@contracts/providers/crypto/generate-id.crypto-provider';
import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';
import {
  FindByEmailUsersRepositoryDTO,
  IFindByEmailUsersRepository
} from '@contracts/repositories/users/find-by-email.users-repository';
import {
  ISaveWithFacebookAccountUsersRepository,
  SaveWithFacebookAccountUsersRepositoryDTO
} from '@contracts/repositories/users/save-with-facebook-account.users-repository';
import {
  ISaveWithGoogleAccountUsersRepository,
  SaveWithGoogleAccountUsersRepositoryDTO
} from '@contracts/repositories/users/save-with-google-account.users-repository';
import { ISaveUsersRepository, SaveUsersRepositoryDTO } from '@contracts/repositories/users/save.users-repository';
import { IUpdateUsersRepository, UpdateUsersRepositoryDTO } from '@contracts/repositories/users/update.users-repository';

import { RepositoryError, RepositoryNames, UsersRepositoryMethods } from '@errors/_shared/repository.error';

import { Id } from '@value-objects/id.value-object';

import { Password } from '@domain/entities/value-objects/password.value-object';

import { failure, success } from '@shared/utils/either.util';

export class UsersPrismaRepository
  implements
    IFindByEmailUsersRepository,
    ISaveUsersRepository,
    ISaveWithFacebookAccountUsersRepository,
    ISaveWithGoogleAccountUsersRepository,
    IUpdateUsersRepository
{
  constructor(
    private readonly loggerProvider: ISendLogErrorLoggerProvider,
    private readonly cryptoProvider: IGenerateIdCryptoProvider,
    private readonly prisma: PrismaClient
  ) {}

  public async findByEmail(parameters: FindByEmailUsersRepositoryDTO.Parameters): FindByEmailUsersRepositoryDTO.Result {
    try {
      const foundUser = await this.prisma.usersTable.findFirst({
        where: { email: parameters.email.value },
        select: {
          id: true,
          password: true,
          facebookAccountId: true,
          googleAccountId: true
        }
      });

      if (foundUser === null) return success({ user: undefined });

      return success({
        user: {
          id: new Id({ id: foundUser.id }),
          password: new Password({ password: foundUser.password }),
          facebookAccount:
            foundUser.facebookAccountId === null ? undefined : { id: new Id({ id: foundUser.facebookAccountId }) },
          googleAccount:
            foundUser.googleAccountId === null ? undefined : { id: new Id({ id: foundUser.googleAccountId }) }
        }
      });
    } catch (error: any) {
      const repositoryError = new RepositoryError({
        error,
        repository: {
          name: RepositoryNames.USERS,
          method: UsersRepositoryMethods.FIND_BY_EMAIL,
          externalName: 'prisma'
        }
      });
      this.loggerProvider.sendLogError({
        message: repositoryError.message,
        value: error
      });

      return failure(repositoryError);
    }
  }

  public async save(parameters: SaveUsersRepositoryDTO.Parameters): SaveUsersRepositoryDTO.Result {
    try {
      const resultUuidProvider = this.cryptoProvider.generateId();
      if (resultUuidProvider.isFailure()) return failure(resultUuidProvider.value);
      const { id } = resultUuidProvider.value;

      const created = await this.prisma.usersTable.create({
        data: {
          id: id.value,
          email: parameters.user.email.value,
          password: parameters.user.password.value,
          isEmailValidated: parameters.user.isEmailValidated
        },
        select: {
          id: true
        }
      });

      return success({ user: { id: new Id({ id: created.id }) } });
    } catch (error: any) {
      const repositoryError = new RepositoryError({
        error,
        repository: {
          name: RepositoryNames.USERS,
          method: UsersRepositoryMethods.SAVE,
          externalName: 'prisma'
        }
      });
      this.loggerProvider.sendLogError({
        message: repositoryError.message,
        value: error
      });

      return failure(repositoryError);
    }
  }

  public async saveWithFacebookAccount(
    parameters: SaveWithFacebookAccountUsersRepositoryDTO.Parameters
  ): SaveWithFacebookAccountUsersRepositoryDTO.Result {
    try {
      const resultUuidProvider = this.cryptoProvider.generateId();
      if (resultUuidProvider.isFailure()) return failure(resultUuidProvider.value);
      const { id } = resultUuidProvider.value;

      const created = await this.prisma.usersTable.create({
        data: {
          id: id.value,
          email: parameters.email.value,
          isEmailValidated: parameters.isEmailValidated,
          facebookAccountId: parameters.facebookAccountId.value,
          password: id.value
        },
        select: {
          id: true
        }
      });

      return success({ user: { id: new Id({ id: created.id }) } });
    } catch (error: any) {
      const repositoryError = new RepositoryError({
        error,
        repository: {
          name: RepositoryNames.USERS,
          method: UsersRepositoryMethods.SAVE_WITH_FACEBOOK_ACCOUNT,
          externalName: 'prisma'
        }
      });
      this.loggerProvider.sendLogError({
        message: repositoryError.message,
        value: error
      });

      return failure(repositoryError);
    }
  }

  public async saveWithGoogleAccount(
    parameters: SaveWithGoogleAccountUsersRepositoryDTO.Parameters
  ): SaveWithGoogleAccountUsersRepositoryDTO.Result {
    try {
      const resultUuidProvider = this.cryptoProvider.generateId();
      if (resultUuidProvider.isFailure()) return failure(resultUuidProvider.value);
      const { id } = resultUuidProvider.value;

      const created = await this.prisma.usersTable.create({
        data: {
          id: id.value,
          email: parameters.email.value,
          isEmailValidated: parameters.isEmailValidated,
          googleAccountId: parameters.googleAccountId.value,
          password: id.value
        },
        select: {
          id: true
        }
      });

      return success({ user: { id: new Id({ id: created.id }) } });
    } catch (error: any) {
      const repositoryError = new RepositoryError({
        error,
        repository: {
          name: RepositoryNames.USERS,
          method: UsersRepositoryMethods.SAVE_WITH_GOOGLE_ACCOUNT,
          externalName: 'prisma'
        }
      });
      this.loggerProvider.sendLogError({
        message: repositoryError.message,
        value: error
      });

      return failure(repositoryError);
    }
  }

  public async update(parameters: UpdateUsersRepositoryDTO.Parameters): UpdateUsersRepositoryDTO.Result {
    try {
      await this.prisma.usersTable.update({
        where: { id: parameters.user.id.value },
        data: {
          facebookAccountId:
            parameters.user.facebookAccount === undefined ? null : parameters.user.facebookAccount.id.value,
          googleAccountId: parameters.user.googleAccount === undefined ? null : parameters.user.googleAccount.id.value
        },
        select: {}
      });

      return success(undefined);
    } catch (error: any) {
      const repositoryError = new RepositoryError({
        error,
        repository: {
          name: RepositoryNames.USERS,
          method: UsersRepositoryMethods.UPDATE,
          externalName: 'prisma'
        }
      });
      this.loggerProvider.sendLogError({
        message: repositoryError.message,
        value: error
      });

      return failure(repositoryError);
    }
  }
}
