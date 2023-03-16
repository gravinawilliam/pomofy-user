import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';
import { makeSignInUseCase } from '@factories/use-cases/sign-in/sing-in-use-case.factory';
import { makeSignUpUseCase } from '@factories/use-cases/sign-up/sign-up-use-case.factory';

import { Controller } from '@presentation/rest/controllers/_shared/controller';
import { SignUpController, SignUpControllerDTO } from '@presentation/rest/controllers/sign-up/sign-up.controller';

export const makeSignUpController = (): Controller<SignUpControllerDTO.Parameters, SignUpControllerDTO.Result> =>
  new SignUpController(makeLoggerProvider(), makeSignUpUseCase(), makeSignInUseCase());
