import { StatusError } from '@errors/_shared/status.error';

type ParametersConstructorDTO = { email: string };

export class InvalidEmailError {
  readonly status: StatusError;

  readonly message: string;

  readonly name: 'InvalidEmailError';

  constructor(parameters: ParametersConstructorDTO) {
    this.name = 'InvalidEmailError';
    this.message = `This email is invalid: ${parameters.email}.`;
    this.status = StatusError.INVALID;
  }
}
