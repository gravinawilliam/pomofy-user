import { ProviderError } from '@errors/_shared/provider.error';
import { RepositoryError } from '@errors/_shared/repository.error';

import { TokenForgotPassword } from '@models/token-forgot-password.model';

import { Either } from '@shared/utils/either.util';

export namespace SaveTokensForgotPasswordRepositoryDTO {
  export type Parameters = Readonly<{
    tokenForgotPassword: TokenForgotPassword;
  }>;

  export type ResultError = RepositoryError | ProviderError;
  export type ResultSuccess = Readonly<undefined>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface ISaveTokensForgotPasswordRepository {
  save(parameters: SaveTokensForgotPasswordRepositoryDTO.Parameters): SaveTokensForgotPasswordRepositoryDTO.Result;
}
