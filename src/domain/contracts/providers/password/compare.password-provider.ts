import { ProviderError } from '@errors/_shared/provider.error';

import { Password } from '@domain/entities/value-objects/password.value-object';

import { Either } from '@shared/utils/either.util';

export namespace ComparePasswordProviderDTO {
  export type Parameters = Readonly<{
    password: Password;
    passwordEncrypted: Password;
  }>;

  export type ResultError = ProviderError;
  export type ResultSuccess = Readonly<{ isEqual: boolean }>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface IComparePasswordProvider {
  compare(parameters: ComparePasswordProviderDTO.Parameters): ComparePasswordProviderDTO.Result;
}
