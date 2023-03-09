import { ProviderError } from '@errors/_shared/provider.error';

import { User } from '@models/user.model';

import { Either } from '@shared/utils/either.util';

export namespace VerifyJwtTokenProviderDTO {
  export type Parameters = Readonly<{ token: string }>;

  export type ResultError = ProviderError;
  export type ResultSuccess = {
    user: Pick<User, 'id'>;
  };

  export type Result = Either<ResultError, ResultSuccess>;
}

export interface IVerifyJwtTokenProvider {
  verifyJwt(parameters: VerifyJwtTokenProviderDTO.Parameters): VerifyJwtTokenProviderDTO.Result;
}
