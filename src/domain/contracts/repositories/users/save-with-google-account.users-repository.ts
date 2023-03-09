import { ProviderError } from '@errors/_shared/provider.error';
import { RepositoryError } from '@errors/_shared/repository.error';

import { User } from '@models/user.model';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';

import { Either } from '@shared/utils/either.util';

export namespace SaveWithGoogleAccountUsersRepositoryDTO {
  export type Parameters = Readonly<{
    email: Email;
    googleAccountId: Id;
    isEmailValidated: boolean;
  }>;

  export type ResultError = RepositoryError | ProviderError;
  export type ResultSuccess = Readonly<{ user: Pick<User, 'id'> }>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface ISaveWithGoogleAccountUsersRepository {
  saveWithGoogleAccount(
    parameters: SaveWithGoogleAccountUsersRepositoryDTO.Parameters
  ): SaveWithGoogleAccountUsersRepositoryDTO.Result;
}
