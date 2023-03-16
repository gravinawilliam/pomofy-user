import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';
import { makeSignInUseCase } from '@factories/use-cases/sign-in/sing-in-use-case.factory';

import { Controller } from '@presentation/rest/controllers/_shared/controller';
import { SignInController, SignInControllerDTO } from '@presentation/rest/controllers/sign-in/sign-in.controller';

export const makeSignInController = (): Controller<SignInControllerDTO.Parameters, SignInControllerDTO.Result> =>
  new SignInController(makeLoggerProvider(), makeSignInUseCase());
