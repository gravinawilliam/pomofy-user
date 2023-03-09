import { ProviderError } from '@errors/_shared/provider.error';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';

import { Either } from '@shared/utils/either.util';

export namespace LoadUserFacebookApiProviderDTO {
  export type Parameters = Readonly<{
    accessToken: string;
  }>;

  export type ResultError = ProviderError;
  export type ResultSuccess = {
    facebookAccount: {
      id: Id;
      email: Email;
      name: string;
    };
  };

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface ILoadUserFacebookApiProvider {
  loadUser(parameters: LoadUserFacebookApiProviderDTO.Parameters): LoadUserFacebookApiProviderDTO.Result;
}
