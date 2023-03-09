import { StatusError } from '@errors/_shared/status.error';

type ParametersConstructorDTO = {
  motive: InvalidPasswordMotive;
};

export enum InvalidPasswordMotive {
  IS_BLANK = 'is blank',
  IS_LESS_THAN_8_CHARACTERS = 'is less than 8 characters',
  HAS_SPACE = 'has space',
  IS_MORE_THAN_30_CHARACTERS = 'is more than 30 characters',
  INVALID_CHARACTERS = 'invalid characters'
}

export class InvalidPasswordError {
  readonly status: StatusError;

  readonly message: string;

  readonly name: 'InvalidPasswordError';

  constructor(parameters: ParametersConstructorDTO) {
    this.name = 'InvalidPasswordError';
    this.message = `Invalid password because ${parameters.motive}.`;
    this.status = StatusError.INVALID;
  }
}
