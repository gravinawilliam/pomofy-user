import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';
import { ISendLogTimeControllerLoggerProvider } from '@contracts/providers/logger/send-log-time-controller.logger-provider';

import { UseCase } from '@use-cases/_shared/use-case';
import { SignInUseCaseDTO } from '@use-cases/sign-in/sign-in.use-case';

import { Controller, ResponseSuccess, StatusSuccess } from '@presentation/rest/controllers/_shared/controller';

import { HttpRequest } from '@shared/types/http-request.type';
import { Either, failure, success } from '@shared/utils/either.util';

export class SignInController extends Controller<SignInControllerDTO.Parameters, SignInControllerDTO.Result> {
  constructor(
    loggerProvider: ISendLogErrorLoggerProvider & ISendLogTimeControllerLoggerProvider,
    private readonly signInUseCase: UseCase<SignInUseCaseDTO.Parameters, SignInUseCaseDTO.Result>
  ) {
    super(loggerProvider);
  }

  protected async performOperation(parameters: SignInControllerDTO.Parameters): SignInControllerDTO.Result {
    const resultSignIn = await this.signInUseCase.execute({
      credentials: parameters.body.credentials,
      facebookAccessToken: parameters.body.facebookAccessToken,
      googleAccessToken: parameters.body.googleAccessToken
    });
    if (resultSignIn.isFailure()) return failure(resultSignIn.value);
    const { accessToken } = resultSignIn.value;

    return success({
      data: { access_token: accessToken },
      status: StatusSuccess.DONE
    });
  }
}

export namespace SignInControllerDTO {
  export type Parameters = Readonly<
    HttpRequest<{
      credentials?: {
        email: string;
        password: string;
      };
      facebookAccessToken?: string;
      googleAccessToken?: string;
    }>
  >;

  type ResultError = SignInUseCaseDTO.ResultError;
  type ResultSuccess = Readonly<ResponseSuccess<{ access_token: string }>>;

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}
