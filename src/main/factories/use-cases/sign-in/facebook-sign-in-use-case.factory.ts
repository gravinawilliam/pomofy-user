import { UseCase } from '@use-cases/_shared/use-case';
import { FacebookSignInUseCase, FacebookSignInUseCaseDTO } from '@use-cases/sign-in/facebook-sign-in.use-case';

import { makeFacebookApiProvider } from '@factories/providers/facebook-api-provider.factory';
import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';
import { makeUsersRepository } from '@factories/repositories/users-repository.factory';

export const makeFacebookSignInUseCase = (): UseCase<
  FacebookSignInUseCaseDTO.Parameters,
  FacebookSignInUseCaseDTO.Result
> => new FacebookSignInUseCase(makeLoggerProvider(), makeFacebookApiProvider(), makeUsersRepository());
