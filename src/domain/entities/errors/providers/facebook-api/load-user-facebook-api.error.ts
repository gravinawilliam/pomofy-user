import { StatusError } from '@errors/_shared/status.error';

export class LoadUserFacebookApiError {
  readonly status: StatusError;

  readonly message: string;

  readonly name: 'LoadUserFacebookApiError';

  readonly error?: Error;

  constructor(parameters: { error?: Error }) {
    this.name = 'LoadUserFacebookApiError';
    this.message = `Error in load user facebook api.`;
    this.status = StatusError.INVALID;
    this.error = parameters.error;
  }
}
