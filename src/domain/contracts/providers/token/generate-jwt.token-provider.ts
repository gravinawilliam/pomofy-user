import { ProviderError } from '@errors/_shared/provider.error';

import { User } from '@models/user.model';

import { Either } from '@shared/utils/either.util';

export namespace GenerateJwtTokenProviderDTO {
  export type Parameters = Readonly<{
    user: Pick<User, 'id'>;
  }>;

  export type ResultError = ProviderError;
  export type ResultSuccess = {
    jwtToken: string;
  };

  export type Result = Either<ResultError, ResultSuccess>;
}

export interface IGenerateJwtTokenProvider {
  generateJwt(parameters: GenerateJwtTokenProviderDTO.Parameters): GenerateJwtTokenProviderDTO.Result;
}
