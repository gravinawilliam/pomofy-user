import { StatusError } from '@errors/_shared/status.error';

type ParametersConstructorDTO = {
  motive: SignInErrorMotive;
};

export enum SignInErrorMotive {
  EMAIL_NOT_FOUND = 'email not found',
  PASSWORD_NOT_MATCH = 'password not match',
  USER_NOT_FOUND = 'user not found'
}

export class SignInError {
  readonly status: StatusError;

  readonly message: string;

  readonly name: 'SignInError';

  constructor(parameters: ParametersConstructorDTO) {
    this.message = `Error sign in because ${parameters.motive}.`;
    this.name = 'SignInError';
    this.status = this.selectStatus(parameters);
  }

  private selectStatus(parameters: ParametersConstructorDTO): StatusError {
    return parameters.motive === SignInErrorMotive.EMAIL_NOT_FOUND ||
      parameters.motive === SignInErrorMotive.USER_NOT_FOUND
      ? StatusError.NOT_FOUND
      : StatusError.INVALID;
  }
}
