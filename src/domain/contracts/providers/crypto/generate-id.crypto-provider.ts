import { ProviderError } from '@errors/_shared/provider.error';

import { Id } from '@value-objects/id.value-object';

import { Either } from '@shared/utils/either.util';

export namespace GenerateIdCryptoProviderDTO {
  export type ResultError = ProviderError;
  export type ResultSuccess = { id: Id };

  export type Result = Either<ResultError, ResultSuccess>;
}

export interface IGenerateIdCryptoProvider {
  generateId(): GenerateIdCryptoProviderDTO.Result;
}
