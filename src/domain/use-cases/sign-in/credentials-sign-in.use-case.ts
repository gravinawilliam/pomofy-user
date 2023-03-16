import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import { IComparePasswordProvider } from '@contracts/providers/password/compare.password-provider';
import { IFindByEmailUsersRepository } from '@contracts/repositories/users/find-by-email.users-repository';

import { ProviderError } from '@errors/_shared/provider.error';
import { RepositoryError } from '@errors/_shared/repository.error';
import { SignInError, SignInErrorMotive } from '@errors/use-cases/sign-in.error';
import { InvalidEmailError } from '@errors/value-objects/email/invalid-email.error';
import { InvalidPasswordError } from '@errors/value-objects/password/invalid-password.error';

import { User } from '@models/user.model';

import { UseCase } from '@use-cases/_shared/use-case';

import { Email } from '@value-objects/email.value-object';
import { Password } from '@value-objects/password.value-object';

import { Either, failure, success } from '@shared/utils/either.util';

export class CredentialsSignInUseCase extends UseCase<
  CredentialsSignInUseCaseDTO.Parameters,
  CredentialsSignInUseCaseDTO.Result
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider,
    private readonly usersRepository: IFindByEmailUsersRepository,
    private readonly passwordProvider: IComparePasswordProvider
  ) {
    super(loggerProvider);
  }

  protected async performOperation(
    parameters: CredentialsSignInUseCaseDTO.Parameters
  ): CredentialsSignInUseCaseDTO.Result {
    const resultValidatePassword = Password.validate({ password: parameters.credentials.password });
    if (resultValidatePassword.isFailure()) return failure(resultValidatePassword.value);
    const { passwordValidated } = resultValidatePassword.value;

    const resultFindUser = await this.findUser({ email: parameters.credentials.email });
    if (resultFindUser.isFailure()) return failure(resultFindUser.value);
    const { user } = resultFindUser.value;

    const resultComparePassword = await this.passwordProvider.compare({
      password: passwordValidated,
      passwordEncrypted: user.password
    });
    if (resultComparePassword.isFailure()) return failure(resultComparePassword.value);
    if (resultComparePassword.value.isEqual === false) {
      return failure(new SignInError({ motive: SignInErrorMotive.PASSWORD_NOT_MATCH }));
    }

    return success({ user: { id: user.id } });
  }

  private async findUser(parameters: {
    email: string;
  }): Promise<Either<RepositoryError | InvalidEmailError | SignInError, { user: Pick<User, 'id' | 'password'> }>> {
    const resultValidateEmail = Email.validate({
      email: parameters.email
    });
    if (resultValidateEmail.isFailure()) return failure(resultValidateEmail.value);
    const { emailValidated } = resultValidateEmail.value;

    const result = await this.usersRepository.findByEmail({ email: emailValidated });
    if (result.isFailure()) return failure(result.value);
    if (result.value.user === undefined) return failure(new SignInError({ motive: SignInErrorMotive.EMAIL_NOT_FOUND }));
    const { user } = result.value;

    return success({ user: { id: user.id, password: user.password } });
  }
}

export namespace CredentialsSignInUseCaseDTO {
  export type Parameters = Readonly<{
    credentials: { email: string; password: string };
  }>;

  export type ResultError = RepositoryError | InvalidEmailError | SignInError | ProviderError | InvalidPasswordError;
  export type ResultSuccess = Readonly<{ user: Pick<User, 'id'> }>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}
