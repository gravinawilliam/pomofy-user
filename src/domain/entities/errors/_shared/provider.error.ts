import { StatusError } from './status.error';

type ParametersConstructorDTO = {
  error?: Error;
  provider: {
    name: ProviderNames;
    method:
      | PasswordProviderMethods
      | EmailProviderMethods
      | CryptoProviderMethods
      | GoogleApiProviderMethods
      | TokenProviderMethods
      | HttpClientProviderMethods
      | FacebookApiProviderMethods;
    externalName?: string;
  };
};

export enum ProviderNames {
  PASSWORD = 'password',
  EMAIL = 'email',
  CRYPTO = 'crypto',
  FACEBOOK_API = 'facebook api',
  TOKEN = 'token',
  GOOGLE_API = 'google api',
  HTTP_CLIENT = 'http client'
}

export enum PasswordProviderMethods {
  ENCRYPT = 'encrypt',
  COMPARE = 'compare'
}

export enum HttpClientProviderMethods {
  GET = 'get'
}

export enum EmailProviderMethods {
  SEND = 'send'
}

export enum TokenProviderMethods {
  GENERATE_JWT = 'generate jwt'
}

export enum FacebookApiProviderMethods {
  LOAD_USER = 'load user'
}

export enum GoogleApiProviderMethods {
  LOAD_USER = 'load user'
}

export enum CryptoProviderMethods {
  GENERATE_ID = 'generate id'
}

export class ProviderError {
  readonly status: StatusError;

  readonly message: string;

  readonly name: 'ProviderError';

  readonly error?: Error;

  constructor(parameters: ParametersConstructorDTO) {
    this.name = 'ProviderError';
    this.message = `Error in ${parameters.provider.name} provider in ${parameters.provider.method} method.${
      parameters.provider.externalName === undefined
        ? ''
        : ` Error in external provider name: ${parameters.provider.externalName}.`
    }`;
    this.status = StatusError.PROVIDER_ERROR;
    this.error = parameters.error;
  }
}
