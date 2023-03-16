import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import { IGenerateTokenProvider } from '@contracts/providers/token/generate.token-provider';
import { ISaveTokensForgotPasswordRepository } from '@contracts/repositories/tokens-forgot-password/save.tokens-forgot-password-repository';
import { IFindByEmailUsersRepository } from '@contracts/repositories/users/find-by-email.users-repository';

import { ProviderError } from '@errors/_shared/provider.error';
import { RepositoryError } from '@errors/_shared/repository.error';
import { InvalidEmailError } from '@errors/value-objects/email/invalid-email.error';

import { UseCase } from '@use-cases/_shared/use-case';

import { Email } from '@value-objects/email.value-object';

import { Either, failure, success } from '@shared/utils/either.util';

export class SendForgotPasswordNotificationUseCase extends UseCase<
  SendForgotPasswordNotificationUseCaseDTO.Parameters,
  SendForgotPasswordNotificationUseCaseDTO.Result
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider,
    private readonly usersRepository: IFindByEmailUsersRepository,
    private readonly tokenProvider: IGenerateTokenProvider,
    private readonly tokensForgotPasswordRepository: ISaveTokensForgotPasswordRepository
  ) {
    super(loggerProvider);
  }

  protected async performOperation(
    parameters: SendForgotPasswordNotificationUseCaseDTO.Parameters
  ): SendForgotPasswordNotificationUseCaseDTO.Result {
    const validateEmail = Email.validate({ email: parameters.email });
    if (validateEmail.isFailure()) return failure(validateEmail.value);
    const { emailValidated } = validateEmail.value;

    const resultFindEmail = await this.usersRepository.findByEmail({ email: emailValidated });
    if (resultFindEmail.isFailure()) return failure(resultFindEmail.value);
    const { user } = resultFindEmail.value;
    if (user === undefined) return failure(new InvalidEmailError({ email: emailValidated.value }));

    const resultGenerateToken = this.tokenProvider.generate({ amountCharacters: 6 });
    if (resultGenerateToken.isFailure()) return failure(resultGenerateToken.value);
    const { token } = resultGenerateToken.value;

    const resultSaveToken = await this.tokensForgotPasswordRepository.save({
      tokenForgotPassword: {
        user: { id: user.id },
        // * 7_200_000 == 2 hours
        expirationDate: new Date(Date.now() + 7_200_000),
        value: token
      }
    });
    if (resultSaveToken.isFailure()) return failure(resultSaveToken.value);

    return success(undefined);
  }
}

export namespace SendForgotPasswordNotificationUseCaseDTO {
  export type Parameters = Readonly<{
    email: string;
  }>;

  export type ResultError = Readonly<InvalidEmailError | RepositoryError | ProviderError>;
  export type ResultSuccess = Readonly<undefined>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}
