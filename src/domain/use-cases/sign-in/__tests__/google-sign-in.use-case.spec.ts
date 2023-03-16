import { MockProxy, mock } from 'jest-mock-extended';

import {
  ILoadUserGoogleApiProvider,
  LoadUserGoogleApiProviderDTO
} from '@contracts/providers/google-api/load-user.google-api-provider';
import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import {
  FindByEmailUsersRepositoryDTO,
  IFindByEmailUsersRepository
} from '@contracts/repositories/users/find-by-email.users-repository';
import {
  ISaveWithGoogleAccountUsersRepository,
  SaveWithGoogleAccountUsersRepositoryDTO
} from '@contracts/repositories/users/save-with-google-account.users-repository';
import { IUpdateUsersRepository, UpdateUsersRepositoryDTO } from '@contracts/repositories/users/update.users-repository';

import { GoogleApiProviderMethods, ProviderError, ProviderNames } from '@errors/_shared/provider.error';
import { RepositoryError, RepositoryNames, UsersRepositoryMethods } from '@errors/_shared/repository.error';

import { UseCase } from '@use-cases/_shared/use-case';
import { GoogleSignInUseCase, GoogleSignInUseCaseDTO } from '@use-cases/sign-in/google-sign-in.use-case';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';

import { failure, success } from '@shared/utils/either.util';
import * as Generate from '@shared/utils/faker.util';

describe('Google sign in USE CASE', () => {
  let sut: UseCase<GoogleSignInUseCaseDTO.Parameters, GoogleSignInUseCaseDTO.Result>;
  let loggerProvider: MockProxy<ISendLogTimeUseCaseLoggerProvider>;
  let googleApi: MockProxy<ILoadUserGoogleApiProvider>;
  let usersRepository: MockProxy<
    IFindByEmailUsersRepository & ISaveWithGoogleAccountUsersRepository & IUpdateUsersRepository
  >;

  let correctParametersSut: GoogleSignInUseCaseDTO.Parameters;

  const USER_ID: Id = Generate.id();

  const GOOGLE_USER_ID: Id = Generate.id();
  const GOOGLE_USER_EMAIL: Email = Generate.email();
  const GOOGLE_USER_NAME: string = Generate.fullName();

  beforeAll(() => {
    loggerProvider = mock();

    googleApi = mock();
    googleApi.loadUser.mockResolvedValue(
      success({
        googleAccount: {
          email: GOOGLE_USER_EMAIL,
          id: GOOGLE_USER_ID,
          name: GOOGLE_USER_NAME
        }
      })
    );

    usersRepository = mock();
    usersRepository.findByEmail.mockResolvedValue(success({ user: undefined }));
    usersRepository.saveWithGoogleAccount.mockResolvedValue(success({ user: { id: USER_ID } }));
    usersRepository.update.mockResolvedValue(success(undefined));
  });

  beforeEach(() => {
    correctParametersSut = { googleAccessToken: 'any_token' };

    sut = new GoogleSignInUseCase(loggerProvider, googleApi, usersRepository);
  });

  it('should call load user google api provider with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(googleApi.loadUser).toHaveBeenCalledWith({
      accessToken: correctParametersSut.googleAccessToken
    } as LoadUserGoogleApiProviderDTO.Parameters);
    expect(googleApi.loadUser).toHaveBeenCalledTimes(1);
  });

  it('should return ProviderError if load user google api provider return failure', async () => {
    const error = new ProviderError({
      provider: {
        method: GoogleApiProviderMethods.LOAD_USER,
        name: ProviderNames.GOOGLE_API
      }
    });
    googleApi.loadUser.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(googleApi.loadUser).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call find by email users repository with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(usersRepository.findByEmail).toHaveBeenCalledWith({
      email: GOOGLE_USER_EMAIL
    } as FindByEmailUsersRepositoryDTO.Parameters);
    expect(usersRepository.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('should return RepositoryError if find by email users repository return failure', async () => {
    const error = new RepositoryError({
      repository: {
        method: UsersRepositoryMethods.FIND_BY_EMAIL,
        name: RepositoryNames.USERS
      }
    });
    usersRepository.findByEmail.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call save with google account users repository with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(usersRepository.saveWithGoogleAccount).toHaveBeenCalledWith({
      email: GOOGLE_USER_EMAIL,
      googleAccountId: GOOGLE_USER_ID,
      isEmailValidated: true
    } as SaveWithGoogleAccountUsersRepositoryDTO.Parameters);
    expect(usersRepository.saveWithGoogleAccount).toHaveBeenCalledTimes(1);
  });

  it('should return RepositoryError if save with google account users repository return failure', async () => {
    const error = new RepositoryError({
      repository: {
        method: UsersRepositoryMethods.SAVE_WITH_GOOGLE_ACCOUNT,
        name: RepositoryNames.USERS
      }
    });
    usersRepository.saveWithGoogleAccount.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.saveWithGoogleAccount).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  //TODO: add title test
  it('should success se nao achou user pelo email e salvou', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(success({ user: undefined }));

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.saveWithGoogleAccount).toHaveBeenCalledTimes(1);
    expect(usersRepository.update).toHaveBeenCalledTimes(0);
    expect(result.value).toEqual({ user: { id: USER_ID } } as GoogleSignInUseCaseDTO.ResultSuccess);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  //TODO: add title test
  it('should success se achou user pelo email e já tem a conta do google salva', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(
      success({
        user: {
          id: USER_ID,
          password: Generate.password(),
          googleAccount: {
            id: GOOGLE_USER_ID
          }
        }
      })
    );

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.saveWithGoogleAccount).toHaveBeenCalledTimes(0);
    expect(usersRepository.update).toHaveBeenCalledTimes(0);
    expect(result.value).toEqual({ user: { id: USER_ID } } as GoogleSignInUseCaseDTO.ResultSuccess);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  //TODO: add title test
  it('should success se achou user pelo email mas não tem a conta do google salva', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(
      success({
        user: {
          id: USER_ID,
          password: Generate.password(),
          googleAccount: undefined
        }
      })
    );

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.saveWithGoogleAccount).toHaveBeenCalledTimes(0);
    expect(usersRepository.update).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual({ user: { id: USER_ID } } as GoogleSignInUseCaseDTO.ResultSuccess);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  it('should call update users repository with correct parameters', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(
      success({
        user: {
          id: USER_ID,
          password: Generate.password(),
          googleAccount: undefined
        }
      })
    );

    await sut.execute(correctParametersSut);

    expect(usersRepository.update).toHaveBeenCalledWith({
      user: {
        id: USER_ID,
        googleAccount: {
          id: GOOGLE_USER_ID
        }
      }
    } as UpdateUsersRepositoryDTO.Parameters);
    expect(usersRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should return RepositoryError if update users repository return failure', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(
      success({
        user: {
          id: USER_ID,
          password: Generate.password(),
          googleAccount: undefined
        }
      })
    );
    const error = new RepositoryError({
      repository: {
        method: UsersRepositoryMethods.UPDATE,
        name: RepositoryNames.USERS
      }
    });
    usersRepository.update.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.update).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });
});
