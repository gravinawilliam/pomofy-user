import { ProviderError } from '@errors/_shared/provider.error';

import { Either } from '@shared/utils/either.util';

export namespace GenerateTokenProviderDTO {
  export type Parameters = Readonly<{
    amountCharacters: number;
  }>;

  export type ResultError = ProviderError;
  export type ResultSuccess = {
    token: string;
  };

  export type Result = Either<ResultError, ResultSuccess>;
}

export interface IGenerateTokenProvider {
  generate(parameters: GenerateTokenProviderDTO.Parameters): GenerateTokenProviderDTO.Result;
}
