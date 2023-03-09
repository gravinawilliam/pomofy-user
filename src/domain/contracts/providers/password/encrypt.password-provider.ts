import { ProviderError } from '@errors/_shared/provider.error';

import { Password } from '@value-objects/password.value-object';

import { Either } from '@shared/utils/either.util';

export namespace EncryptPasswordProviderDTO {
  export type Parameters = Readonly<{ password: Password }>;

  export type ResultError = ProviderError;
  export type ResultSuccess = Readonly<{ passwordEncrypted: Password }>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface IEncryptPasswordProvider {
  encrypt(parameters: EncryptPasswordProviderDTO.Parameters): EncryptPasswordProviderDTO.Result;
}
