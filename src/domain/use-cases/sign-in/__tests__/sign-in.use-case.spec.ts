import { MockProxy, mock } from 'jest-mock-extended';

import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import {
  GenerateJwtTokenProviderDTO,
  IGenerateJwtTokenProvider
} from '@contracts/providers/token/generate-jwt.token-provider';

import {
  FacebookApiProviderMethods,
  ProviderError,
  ProviderNames,
  TokenProviderMethods
} from '@errors/_shared/provider.error';
import { LoadUserGoogleApiError } from '@errors/providers/google-api/load-user-google-api.error';
import { SignInError, SignInErrorMotive } from '@errors/use-cases/sign-in.error';

import { UseCase } from '@use-cases/_shared/use-case';
import { CredentialsSignInUseCaseDTO } from '@use-cases/sign-in/credentials-sign-in.use-case';
import { FacebookSignInUseCaseDTO } from '@use-cases/sign-in/facebook-sign-in.use-case';
import { GoogleSignInUseCaseDTO } from '@use-cases/sign-in/google-sign-in.use-case';
import { SignInUseCase, SignInUseCaseDTO } from '@use-cases/sign-in/sign-in.use-case';

import { Id } from '@value-objects/id.value-object';

import { failure, success } from '@shared/utils/either.util';
import * as Generate from '@shared/utils/faker.util';

describe('Sign in USE CASE', () => {
  let sut: UseCase<SignInUseCaseDTO.Parameters, SignInUseCaseDTO.Result>;
  let loggerProvider: MockProxy<ISendLogTimeUseCaseLoggerProvider>;
  let tokenProvider: MockProxy<IGenerateJwtTokenProvider>;
  let facebookSignInUseCase: MockProxy<UseCase<FacebookSignInUseCaseDTO.Parameters, FacebookSignInUseCaseDTO.Result>>;
  let googleSignInUseCase: MockProxy<UseCase<GoogleSignInUseCaseDTO.Parameters, GoogleSignInUseCaseDTO.Result>>;
  let credentialsSignInUseCase: MockProxy<
    UseCase<CredentialsSignInUseCaseDTO.Parameters, CredentialsSignInUseCaseDTO.Result>
  >;

  let correctParametersSut: SignInUseCaseDTO.Parameters;

  const USER_ID: Id = Generate.id();

  beforeAll(() => {
    loggerProvider = mock();

    tokenProvider = mock();
    tokenProvider.generateJwt.mockReturnValue(success({ jwtToken: 'any_token_jwt' }));

    facebookSignInUseCase = mock();
    facebookSignInUseCase.execute.mockResolvedValue(success({ user: { id: USER_ID } }) as any);

    googleSignInUseCase = mock();
    googleSignInUseCase.execute.mockResolvedValue(success({ user: { id: USER_ID } }) as any);

    credentialsSignInUseCase = mock();
    credentialsSignInUseCase.execute.mockResolvedValue(success({ user: { id: USER_ID } }) as any);
  });

  beforeEach(() => {
    correctParametersSut = {
      credentials: {
        email: 'will@gmail.com',
        password: 'any_password'
      }
    };

    sut = new SignInUseCase(
      loggerProvider,
      tokenProvider,
      facebookSignInUseCase,
      googleSignInUseCase,
      credentialsSignInUseCase
    );
  });

  it('should call credentials sign in use case with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(credentialsSignInUseCase.execute).toHaveBeenCalledWith({
      credentials: {
        email: correctParametersSut.credentials?.email,
        password: correctParametersSut.credentials?.password
      }
    } as CredentialsSignInUseCaseDTO.Parameters);
    expect(credentialsSignInUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return SignInError if credentials sign in use case return failure', async () => {
    const error = new SignInError({ motive: SignInErrorMotive.USER_NOT_FOUND });
    credentialsSignInUseCase.execute.mockResolvedValueOnce(failure(error) as any);

    const result = await sut.execute(correctParametersSut);

    expect(credentialsSignInUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call facebook sign in use case with correct parameters', async () => {
    await sut.execute({ facebookAccessToken: 'any_facebook_token' });

    expect(facebookSignInUseCase.execute).toHaveBeenCalledWith({
      facebookAccessToken: 'any_facebook_token'
    } as FacebookSignInUseCaseDTO.Parameters);
    expect(facebookSignInUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return SignInError if facebook sign in use case return failure', async () => {
    const error = new ProviderError({
      provider: {
        method: FacebookApiProviderMethods.LOAD_USER,
        name: ProviderNames.FACEBOOK_API
      }
    });
    facebookSignInUseCase.execute.mockResolvedValueOnce(failure(error) as any);

    const result = await sut.execute({ facebookAccessToken: 'any_facebook_token' });

    expect(facebookSignInUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call google sign in use case with correct parameters', async () => {
    await sut.execute({ googleAccessToken: 'any_google_token' });

    expect(googleSignInUseCase.execute).toHaveBeenCalledWith({
      googleAccessToken: 'any_google_token'
    } as GoogleSignInUseCaseDTO.Parameters);
    expect(googleSignInUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return SignInError if google sign in use case return failure', async () => {
    const error = new LoadUserGoogleApiError({});
    googleSignInUseCase.execute.mockResolvedValueOnce(failure(error) as any);

    const result = await sut.execute({ googleAccessToken: 'any_google_token' });

    expect(googleSignInUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call generete jwt token provider with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(tokenProvider.generateJwt).toHaveBeenCalledWith({
      user: { id: USER_ID }
    } as GenerateJwtTokenProviderDTO.Parameters);
    expect(tokenProvider.generateJwt).toHaveBeenCalledTimes(1);
  });

  it('should return ProviderError if generete jwt token provider return failure', async () => {
    const error = new ProviderError({
      provider: {
        method: TokenProviderMethods.GENERATE_JWT,
        name: ProviderNames.TOKEN
      }
    });
    tokenProvider.generateJwt.mockReturnValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(tokenProvider.generateJwt).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should return SignInError if parameters.user is undefined', async () => {
    const error = new SignInError({
      motive: SignInErrorMotive.USER_NOT_FOUND
    });

    const result = await sut.execute({});

    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should success sign in with user', async () => {
    const result = await sut.execute({ user: { id: USER_ID } });

    expect(result.value).toEqual({
      accessToken: 'any_token_jwt'
    } as SignInUseCaseDTO.ResultSuccess);
    expect(tokenProvider.generateJwt).toHaveBeenCalledTimes(1);
    expect(facebookSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(credentialsSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(googleSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  it('should success sign in with credentials', async () => {
    const result = await sut.execute(correctParametersSut);

    expect(result.value).toEqual({
      accessToken: 'any_token_jwt'
    } as SignInUseCaseDTO.ResultSuccess);
    expect(tokenProvider.generateJwt).toHaveBeenCalledTimes(1);
    expect(facebookSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(credentialsSignInUseCase.execute).toHaveBeenCalledTimes(1);
    expect(googleSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  it('should success sign in with facebook', async () => {
    const result = await sut.execute({ facebookAccessToken: 'any_facebook_token' });

    expect(result.value).toEqual({
      accessToken: 'any_token_jwt'
    } as SignInUseCaseDTO.ResultSuccess);
    expect(tokenProvider.generateJwt).toHaveBeenCalledTimes(1);
    expect(facebookSignInUseCase.execute).toHaveBeenCalledTimes(1);
    expect(credentialsSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(googleSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  it('should success sign in with google', async () => {
    const result = await sut.execute({ googleAccessToken: 'any_google_token' });

    expect(result.value).toEqual({
      accessToken: 'any_token_jwt'
    } as SignInUseCaseDTO.ResultSuccess);
    expect(tokenProvider.generateJwt).toHaveBeenCalledTimes(1);
    expect(facebookSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(credentialsSignInUseCase.execute).toHaveBeenCalledTimes(0);
    expect(googleSignInUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });
});
