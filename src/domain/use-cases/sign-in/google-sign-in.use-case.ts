import { ILoadUserGoogleApiProvider } from '@contracts/providers/google-api/load-user.google-api-provider';
import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import { IFindByEmailUsersRepository } from '@contracts/repositories/users/find-by-email.users-repository';
import { ISaveWithGoogleAccountUsersRepository } from '@contracts/repositories/users/save-with-google-account.users-repository';
import { IUpdateUsersRepository } from '@contracts/repositories/users/update.users-repository';

import { ProviderError } from '@errors/_shared/provider.error';
import { RepositoryError } from '@errors/_shared/repository.error';
import { LoadUserGoogleApiError } from '@errors/providers/google-api/load-user-google-api.error';

import { User } from '@models/user.model';

import { UseCase } from '@use-cases/_shared/use-case';

import { Either, failure, success } from '@shared/utils/either.util';

export class GoogleSignInUseCase extends UseCase<GoogleSignInUseCaseDTO.Parameters, GoogleSignInUseCaseDTO.Result> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider,
    private readonly googleApi: ILoadUserGoogleApiProvider,
    private readonly usersRepository: IFindByEmailUsersRepository &
      ISaveWithGoogleAccountUsersRepository &
      IUpdateUsersRepository
  ) {
    super(loggerProvider);
  }

  protected async performOperation(parameters: GoogleSignInUseCaseDTO.Parameters): GoogleSignInUseCaseDTO.Result {
    const resultLoadGoogleUser = await this.googleApi.loadUser({ accessToken: parameters.googleAccessToken });
    if (resultLoadGoogleUser.isFailure()) return failure(resultLoadGoogleUser.value);
    const { googleAccount } = resultLoadGoogleUser.value;

    const resultFindUserByEmail = await this.usersRepository.findByEmail({ email: googleAccount.email });
    if (resultFindUserByEmail.isFailure()) return failure(resultFindUserByEmail.value);
    const { user: foundUser } = resultFindUserByEmail.value;

    if (foundUser === undefined) {
      const resultSaveWithGoogleAccount = await this.usersRepository.saveWithGoogleAccount({
        email: googleAccount.email,
        googleAccountId: googleAccount.id,
        isEmailValidated: true
      });
      if (resultSaveWithGoogleAccount.isFailure()) return failure(resultSaveWithGoogleAccount.value);
      const { user } = resultSaveWithGoogleAccount.value;
      return success({ user: { id: user.id } });
    }

    if (foundUser.googleAccount !== undefined) return success({ user: { id: foundUser.id } });

    const resultSaveWithGoogleAccount = await this.usersRepository.update({
      user: { id: foundUser.id, googleAccount: { id: googleAccount.id } }
    });
    if (resultSaveWithGoogleAccount.isFailure()) return failure(resultSaveWithGoogleAccount.value);

    return success({ user: { id: foundUser.id } });
  }
}

export namespace GoogleSignInUseCaseDTO {
  export type Parameters = Readonly<{
    googleAccessToken: string;
  }>;

  export type ResultError = RepositoryError | ProviderError | LoadUserGoogleApiError;
  export type ResultSuccess = Readonly<{ user: Pick<User, 'id'> }>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}
