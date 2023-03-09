import { RepositoryError } from '@errors/_shared/repository.error';

import { User } from '@models/user.model';

import { Email } from '@value-objects/email.value-object';

import { Either } from '@shared/utils/either.util';

export namespace FindByEmailUsersRepositoryDTO {
  export type Parameters = Readonly<{ email: Email }>;

  export type ResultError = RepositoryError;
  export type ResultSuccess = Readonly<{ user?: Pick<User, 'id' | 'password' | 'facebookAccount' | 'googleAccount'> }>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface IFindByEmailUsersRepository {
  findByEmail(parameters: FindByEmailUsersRepositoryDTO.Parameters): FindByEmailUsersRepositoryDTO.Result;
}
