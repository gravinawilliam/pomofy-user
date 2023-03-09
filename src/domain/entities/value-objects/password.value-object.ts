import { InvalidPasswordError, InvalidPasswordMotive } from '@errors/value-objects/password/invalid-password.error';

import { Either, failure, success } from '@shared/utils/either.util';

export class Password {
  public readonly value: string;

  constructor(parameters: { password: string }) {
    this.value = parameters.password;
    Object.freeze(this);
  }

  public static validate(parameters: {
    password: string;
  }): Either<InvalidPasswordError, { passwordValidated: Password }> {
    const passwordFormated = parameters.password.trim();
    if (passwordFormated.split(' ').length > 1) {
      return failure(new InvalidPasswordError({ motive: InvalidPasswordMotive.HAS_SPACE }));
    }
    if (passwordFormated.length > 30) {
      return failure(new InvalidPasswordError({ motive: InvalidPasswordMotive.IS_MORE_THAN_30_CHARACTERS }));
    }
    if (passwordFormated === '' || passwordFormated.length === 0) {
      return failure(new InvalidPasswordError({ motive: InvalidPasswordMotive.IS_BLANK }));
    }
    if (passwordFormated.length < 8) {
      return failure(new InvalidPasswordError({ motive: InvalidPasswordMotive.IS_LESS_THAN_8_CHARACTERS }));
    }
    return success({ passwordValidated: new Password({ password: passwordFormated }) });
  }
}
