import { UseCase } from '@use-cases/_shared/use-case';
import { SignInUseCase, SignInUseCaseDTO } from '@use-cases/sign-in/sign-in.use-case';

import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';
import { makeTokenJwtProvider } from '@factories/providers/token-provider.factory';

import { makeCredentialsSignInUseCase } from './credentials-sign-in-use-case.factory';
import { makeFacebookSignInUseCase } from './facebook-sign-in-use-case.factory';
import { makeGoogleSignInUseCase } from './google-sign-in-use-case.factory';

export const makeSignInUseCase = (): UseCase<SignInUseCaseDTO.Parameters, SignInUseCaseDTO.Result> =>
  new SignInUseCase(
    makeLoggerProvider(),
    makeTokenJwtProvider(),
    makeFacebookSignInUseCase(),
    makeGoogleSignInUseCase(),
    makeCredentialsSignInUseCase()
  );
