import { StatusError } from '@errors/_shared/status.error';

import { Email } from '@value-objects/email.value-object';

type ParametersConstructorDTO = { email: Email };

export class EmailAlreadyExistsError {
  readonly status: StatusError;

  readonly message: string;

  readonly name: 'EmailAlreadyExistsError';

  constructor(parameters: ParametersConstructorDTO) {
    this.name = 'EmailAlreadyExistsError';
    this.message = `This email already exists: ${parameters.email.value}.`;
    this.status = StatusError.CONFLICT;
  }
}
