import { UseCase } from '@use-cases/_shared/use-case';
import { CredentialsSignInUseCase, CredentialsSignInUseCaseDTO } from '@use-cases/sign-in/credentials-sign-in.use-case';

import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';
import { makePasswordProvider } from '@factories/providers/password-provider.factory';
import { makeUsersRepository } from '@factories/repositories/users-repository.factory';

export const makeCredentialsSignInUseCase = (): UseCase<
  CredentialsSignInUseCaseDTO.Parameters,
  CredentialsSignInUseCaseDTO.Result
> => new CredentialsSignInUseCase(makeLoggerProvider(), makeUsersRepository(), makePasswordProvider());
