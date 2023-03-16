import { UseCase } from '@use-cases/_shared/use-case';
import { SignUpUseCase, SignUpUseCaseDTO } from '@use-cases/sign-up/sign-up.use-case';

import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';
import { makePasswordProvider } from '@factories/providers/password-provider.factory';
import { makeUsersRepository } from '@factories/repositories/users-repository.factory';

export const makeSignUpUseCase = (): UseCase<SignUpUseCaseDTO.Parameters, SignUpUseCaseDTO.Result> =>
  new SignUpUseCase(makeLoggerProvider(), makePasswordProvider(), makeUsersRepository());
