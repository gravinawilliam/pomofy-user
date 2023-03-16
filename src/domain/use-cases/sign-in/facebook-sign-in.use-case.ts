import { ILoadUserFacebookApiProvider } from '@contracts/providers/facebook-api/load-user.facebook-api-provider';
import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import { IFindByEmailUsersRepository } from '@contracts/repositories/users/find-by-email.users-repository';
import { ISaveWithFacebookAccountUsersRepository } from '@contracts/repositories/users/save-with-facebook-account.users-repository';
import { IUpdateUsersRepository } from '@contracts/repositories/users/update.users-repository';

import { ProviderError } from '@errors/_shared/provider.error';
import { RepositoryError } from '@errors/_shared/repository.error';

import { User } from '@models/user.model';

import { UseCase } from '@use-cases/_shared/use-case';

import { Either, failure, success } from '@shared/utils/either.util';

export class FacebookSignInUseCase extends UseCase<FacebookSignInUseCaseDTO.Parameters, FacebookSignInUseCaseDTO.Result> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider,
    private readonly facebookApi: ILoadUserFacebookApiProvider,
    private readonly usersRepository: IFindByEmailUsersRepository &
      ISaveWithFacebookAccountUsersRepository &
      IUpdateUsersRepository
  ) {
    super(loggerProvider);
  }

  protected async performOperation(parameters: FacebookSignInUseCaseDTO.Parameters): FacebookSignInUseCaseDTO.Result {
    const resultLoadFacebookUser = await this.facebookApi.loadUser({
      accessToken: parameters.facebookAccessToken
    });
    if (resultLoadFacebookUser.isFailure()) return failure(resultLoadFacebookUser.value);
    const { facebookAccount } = resultLoadFacebookUser.value;

    const resultFindUserByEmail = await this.usersRepository.findByEmail({
      email: facebookAccount.email
    });
    if (resultFindUserByEmail.isFailure()) return failure(resultFindUserByEmail.value);
    const { user: foundUser } = resultFindUserByEmail.value;

    if (foundUser === undefined) {
      const resultSaveWithFacebookAccount = await this.usersRepository.saveWithFacebookAccount({
        email: facebookAccount.email,
        facebookAccountId: facebookAccount.id,
        isEmailValidated: true
      });
      if (resultSaveWithFacebookAccount.isFailure()) return failure(resultSaveWithFacebookAccount.value);
      const { user } = resultSaveWithFacebookAccount.value;
      return success({ user: { id: user.id } });
    }

    if (foundUser.facebookAccount !== undefined) return success({ user: { id: foundUser.id } });

    const resultSaveWithFacebookAccount = await this.usersRepository.update({
      user: {
        id: foundUser.id,
        facebookAccount: {
          id: facebookAccount.id
        }
      }
    });
    if (resultSaveWithFacebookAccount.isFailure()) return failure(resultSaveWithFacebookAccount.value);

    return success({ user: { id: foundUser.id } });
  }
}

export namespace FacebookSignInUseCaseDTO {
  export type Parameters = Readonly<{
    facebookAccessToken: string;
  }>;

  export type ResultError = RepositoryError | ProviderError;
  export type ResultSuccess = { user: Pick<User, 'id'> };

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}
