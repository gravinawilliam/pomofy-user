import { InvalidEmailError } from '@errors/value-objects/email/invalid-email.error';

import { Either, failure, success } from '@shared/utils/either.util';

export class Email {
  public readonly value: string;

  constructor(parameters: { email: string }) {
    this.value = parameters.email.toLowerCase().trim();
    Object.freeze(this);
  }

  public static getDomain(parameters: { email: Email }) {
    return parameters.email.value.split('@')[1];
  }

  public static validate(parameters: { email: string }): Either<InvalidEmailError, { emailValidated: Email }> {
    const MAX_EMAIL_SIZE = 320;

    if (this.emptyOrTooLarge(parameters.email, MAX_EMAIL_SIZE) || this.nonConformant(parameters.email)) {
      return failure(new InvalidEmailError({ email: parameters.email }));
    }

    const [local, domain] = parameters.email.split('@');
    const MAX_LOCAL_SIZE = 64;
    const MAX_DOMAIN_SIZE = 255;

    if (this.emptyOrTooLarge(local, MAX_LOCAL_SIZE) || this.emptyOrTooLarge(domain, MAX_DOMAIN_SIZE)) {
      return failure(new InvalidEmailError({ email: parameters.email }));
    }

    if (this.somePartIsTooLargeIn(domain)) {
      return failure(new InvalidEmailError({ email: parameters.email }));
    }

    return success({ emailValidated: new Email({ email: parameters.email }) });
  }

  private static emptyOrTooLarge(string_: string, maxSize: number): boolean {
    return !string_ || string_.length > maxSize;
  }

  private static nonConformant(email: string): boolean {
    const emailRegex =
      /^[\w!#$%&'*+/=?^`{|}~-](\.?[\w!#$%&'*+/=?^`{|}~-])*@[\dA-Za-z](-*\.?[\dA-Za-z])*\.[A-Za-z](-?[\dA-Za-z])+$/;
    return !emailRegex.test(email);
  }

  private static somePartIsTooLargeIn(domain: string): boolean {
    const maxPartSize = 63;
    const domainParts = domain.split('.');
    return domainParts.some(part => part.length > maxPartSize);
  }
}
