import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';
import { ISendLogTimeControllerLoggerProvider } from '@contracts/providers/logger/send-log-time-controller.logger-provider';

import { UseCase } from '@use-cases/_shared/use-case';
import { SignInUseCaseDTO } from '@use-cases/sign-in/sign-in.use-case';
import { SignUpUseCaseDTO } from '@use-cases/sign-up/sign-up.use-case';

import { Controller, ResponseSuccess, StatusSuccess } from '@presentation/rest/controllers/_shared/controller';

import { HttpRequest } from '@shared/types/http-request.type';
import { Either, failure, success } from '@shared/utils/either.util';

export class SignUpController extends Controller<SignUpControllerDTO.Parameters, SignUpControllerDTO.Result> {
  constructor(
    loggerProvider: ISendLogErrorLoggerProvider & ISendLogTimeControllerLoggerProvider,
    private readonly signUpUseCase: UseCase<SignUpUseCaseDTO.Parameters, SignUpUseCaseDTO.Result>,
    private readonly signInUseCase: UseCase<SignInUseCaseDTO.Parameters, SignInUseCaseDTO.Result>
  ) {
    super(loggerProvider);
  }

  protected async performOperation(parameters: SignUpControllerDTO.Parameters): SignUpControllerDTO.Result {
    const resultSignUp = await this.signUpUseCase.execute({
      email: parameters.body.email,
      password: parameters.body.password
    });
    if (resultSignUp.isFailure()) return failure(resultSignUp.value);
    const { user } = resultSignUp.value;

    const resultSignIn = await this.signInUseCase.execute({ user });
    if (resultSignIn.isFailure()) return failure(resultSignIn.value);
    const { accessToken } = resultSignIn.value;

    return success({
      data: { access_token: accessToken },
      status: StatusSuccess.CREATED
    });
  }
}

export namespace SignUpControllerDTO {
  export type Parameters = Readonly<
    HttpRequest<{
      email: string;
      password: string;
    }>
  >;

  type ResultError = SignUpUseCaseDTO.ResultError | SignInUseCaseDTO.ResultError;
  type ResultSuccess = Readonly<ResponseSuccess<{ access_token: string }>>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}
