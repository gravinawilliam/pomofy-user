import { User } from '@models/user.model';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';

import { ProviderError } from '@domain/entities/errors/_shared/provider.error';
import { RepositoryError } from '@domain/entities/errors/_shared/repository.error';

import { Either } from '@shared/utils/either.util';

export namespace SaveWithFacebookAccountUsersRepositoryDTO {
  export type Parameters = Readonly<{
    email: Email;
    facebookAccountId: Id;
    isEmailValidated: boolean;
  }>;

  export type ResultError = RepositoryError | ProviderError;
  export type ResultSuccess = Readonly<{ user: Pick<User, 'id'> }>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface ISaveWithFacebookAccountUsersRepository {
  saveWithFacebookAccount(
    parameters: SaveWithFacebookAccountUsersRepositoryDTO.Parameters
  ): SaveWithFacebookAccountUsersRepositoryDTO.Result;
}
