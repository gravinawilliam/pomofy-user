import { RepositoryError } from '@errors/_shared/repository.error';

import { User } from '@models/user.model';

import { Either } from '@shared/utils/either.util';

export namespace UpdateUsersRepositoryDTO {
  export type Parameters = Readonly<{
    user: Pick<User, 'id' | 'facebookAccount' | 'googleAccount'>;
  }>;

  export type ResultError = RepositoryError;
  export type ResultSuccess = Readonly<undefined>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface IUpdateUsersRepository {
  update(parameters: UpdateUsersRepositoryDTO.Parameters): UpdateUsersRepositoryDTO.Result;
}
