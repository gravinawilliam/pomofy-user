import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import { IEncryptPasswordProvider } from '@contracts/providers/password/encrypt.password-provider';
import { IFindByEmailUsersRepository } from '@contracts/repositories/users/find-by-email.users-repository';
import { ISaveUsersRepository } from '@contracts/repositories/users/save.users-repository';

import { ProviderError } from '@errors/_shared/provider.error';
import { RepositoryError } from '@errors/_shared/repository.error';
import { EmailAlreadyExistsError } from '@errors/value-objects/email/email-already-exists.error';
import { InvalidEmailError } from '@errors/value-objects/email/invalid-email.error';
import { InvalidPasswordError } from '@errors/value-objects/password/invalid-password.error';

import { User } from '@models/user.model';

import { UseCase } from '@use-cases/_shared/use-case';

import { Email } from '@value-objects/email.value-object';
import { Password } from '@value-objects/password.value-object';

import { failure, success, Either } from '@shared/utils/either.util';

export class SignUpUseCase extends UseCase<SignUpUseCaseDTO.Parameters, SignUpUseCaseDTO.Result> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider,
    private readonly passwordProvider: IEncryptPasswordProvider,
    private readonly usersRepository: IFindByEmailUsersRepository & ISaveUsersRepository
  ) {
    super(loggerProvider);
  }

  protected async performOperation(parameters: SignUpUseCaseDTO.Parameters): SignUpUseCaseDTO.Result {
    const resultValidatePassword = await this.validatePassword({ password: parameters.password });
    if (resultValidatePassword.isFailure()) return failure(resultValidatePassword.value);
    const { passwordEncrypted } = resultValidatePassword.value;

    const resultValidateEmail = await this.validateEmail({ email: parameters.email });
    if (resultValidateEmail.isFailure()) return failure(resultValidateEmail.value);
    const { emailValidated } = resultValidateEmail.value;

    const resultSaveUser = await this.usersRepository.save({
      user: {
        password: passwordEncrypted,
        email: emailValidated,
        isEmailValidated: false
      }
    });
    if (resultSaveUser.isFailure()) return failure(resultSaveUser.value);
    const { user } = resultSaveUser.value;

    return success({ user: { id: user.id } });
  }

  private async validatePassword(parameters: {
    password: string;
  }): Promise<Either<InvalidPasswordError | ProviderError, { passwordEncrypted: Password }>> {
    const validatePassword = Password.validate({ password: parameters.password });
    if (validatePassword.isFailure()) return failure(validatePassword.value);
    const resultEncryptPassword = await this.passwordProvider.encrypt({
      password: validatePassword.value.passwordValidated
    });
    if (resultEncryptPassword.isFailure()) return failure(resultEncryptPassword.value);
    return success({ passwordEncrypted: resultEncryptPassword.value.passwordEncrypted });
  }

  private async validateEmail(parameters: {
    email: string;
  }): Promise<Either<InvalidEmailError | EmailAlreadyExistsError | RepositoryError, { emailValidated: Email }>> {
    const validateEmail = Email.validate({ email: parameters.email });
    if (validateEmail.isFailure()) return failure(validateEmail.value);
    const { emailValidated } = validateEmail.value;

    const resultFindEmail = await this.usersRepository.findByEmail({ email: emailValidated });
    if (resultFindEmail.isFailure()) return failure(resultFindEmail.value);
    if (resultFindEmail.value.user !== undefined) return failure(new EmailAlreadyExistsError({ email: emailValidated }));

    return success({ emailValidated: validateEmail.value.emailValidated });
  }
}

export namespace SignUpUseCaseDTO {
  export type Parameters = Readonly<{
    password: string;
    email: string;
  }>;

  export type ResultError = Readonly<
    InvalidPasswordError | InvalidEmailError | EmailAlreadyExistsError | RepositoryError | ProviderError
  >;
  export type ResultSuccess = Readonly<{
    user: Pick<User, 'id'>;
  }>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}
