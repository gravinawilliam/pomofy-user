import { UseCase } from '@use-cases/_shared/use-case';
import { GoogleSignInUseCase, GoogleSignInUseCaseDTO } from '@use-cases/sign-in/google-sign-in.use-case';

import { makeGoogleApiProvider } from '@factories/providers/google-api-provider.factory';
import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';
import { makeUsersRepository } from '@factories/repositories/users-repository.factory';

export const makeGoogleSignInUseCase = (): UseCase<GoogleSignInUseCaseDTO.Parameters, GoogleSignInUseCaseDTO.Result> =>
  new GoogleSignInUseCase(makeLoggerProvider(), makeGoogleApiProvider(), makeUsersRepository());
