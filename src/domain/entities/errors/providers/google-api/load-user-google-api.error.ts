import { StatusError } from '@errors/_shared/status.error';

export class LoadUserGoogleApiError {
  readonly status: StatusError;

  readonly message: string;

  readonly name: 'LoadUserGoogleApiError';

  readonly error?: Error;

  constructor(parameters: { error?: Error }) {
    this.name = 'LoadUserGoogleApiError';
    this.message = `Error in load user google api.`;
    this.status = StatusError.INVALID;
    this.error = parameters.error;
  }
}
