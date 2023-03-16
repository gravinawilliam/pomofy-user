import { StatusError } from './status.error';

type ParametersConstructorDTO = {
  error?: Error;
  repository: {
    name: RepositoryNames;
    method: UsersRepositoryMethods | TokensForgotPasswordRepositoryMethods;
    externalName?: string;
  };
};

export enum RepositoryNames {
  USERS = 'users',
  TOKENS_FORGOT_PASSWORD = 'tokens forgot password'
}

export enum UsersRepositoryMethods {
  FIND_BY_EMAIL = 'find by email',
  SAVE = 'save',
  SAVE_WITH_FACEBOOK_ACCOUNT = 'save with facebook account',
  SAVE_WITH_GOOGLE_ACCOUNT = 'save with google account',
  UPDATE = 'update'
}

export enum TokensForgotPasswordRepositoryMethods {
  SAVE = 'save'
}

export class RepositoryError {
  readonly status: StatusError;

  readonly message: string;

  readonly name: 'RepositoryError';

  readonly error?: Error;

  constructor(parameters: ParametersConstructorDTO) {
    this.name = 'RepositoryError';
    this.message = `Error in ${parameters.repository.name} repository in ${parameters.repository.method} method.${
      parameters.repository.externalName === undefined
        ? ''
        : ` Error in external lib name: ${parameters.repository.externalName}.`
    }`;
    this.status = StatusError.REPOSITORY_ERROR;
    this.error = parameters.error;
  }
}
