import { MockProxy, mock } from 'jest-mock-extended';

import {
  ILoadUserFacebookApiProvider,
  LoadUserFacebookApiProviderDTO
} from '@contracts/providers/facebook-api/load-user.facebook-api-provider';
import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import {
  FindByEmailUsersRepositoryDTO,
  IFindByEmailUsersRepository
} from '@contracts/repositories/users/find-by-email.users-repository';
import {
  ISaveWithFacebookAccountUsersRepository,
  SaveWithFacebookAccountUsersRepositoryDTO
} from '@contracts/repositories/users/save-with-facebook-account.users-repository';
import { IUpdateUsersRepository, UpdateUsersRepositoryDTO } from '@contracts/repositories/users/update.users-repository';

import { FacebookApiProviderMethods, ProviderError, ProviderNames } from '@errors/_shared/provider.error';
import { RepositoryError, RepositoryNames, UsersRepositoryMethods } from '@errors/_shared/repository.error';

import { UseCase } from '@use-cases/_shared/use-case';
import { FacebookSignInUseCase, FacebookSignInUseCaseDTO } from '@use-cases/sign-in/facebook-sign-in.use-case';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';

import { failure, success } from '@shared/utils/either.util';
import * as Generate from '@shared/utils/faker.util';

describe('Facebook sign in USE CASE', () => {
  let sut: UseCase<FacebookSignInUseCaseDTO.Parameters, FacebookSignInUseCaseDTO.Result>;
  let loggerProvider: MockProxy<ISendLogTimeUseCaseLoggerProvider>;
  let facebookApi: MockProxy<ILoadUserFacebookApiProvider>;
  let usersRepository: MockProxy<
    IFindByEmailUsersRepository & ISaveWithFacebookAccountUsersRepository & IUpdateUsersRepository
  >;

  let correctParametersSut: FacebookSignInUseCaseDTO.Parameters;

  const USER_ID: Id = Generate.id();

  const FACEBOOK_USER_ID: Id = Generate.id();
  const FACEBOOK_USER_EMAIL: Email = Generate.email();
  const FACEBOOK_USER_NAME: string = Generate.fullName();

  beforeAll(() => {
    loggerProvider = mock();

    facebookApi = mock();
    facebookApi.loadUser.mockResolvedValue(
      success({
        facebookAccount: {
          id: FACEBOOK_USER_ID,
          email: FACEBOOK_USER_EMAIL,
          name: FACEBOOK_USER_NAME
        }
      })
    );

    usersRepository = mock();
    usersRepository.findByEmail.mockResolvedValue(success({ user: undefined }));
    usersRepository.saveWithFacebookAccount.mockResolvedValue(success({ user: { id: USER_ID } }));
    usersRepository.update.mockResolvedValue(success(undefined));
  });

  beforeEach(() => {
    correctParametersSut = { facebookAccessToken: 'any_token' };

    sut = new FacebookSignInUseCase(loggerProvider, facebookApi, usersRepository);
  });

  it('should call load user facebook api provider with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(facebookApi.loadUser).toHaveBeenCalledWith({
      accessToken: correctParametersSut.facebookAccessToken
    } as LoadUserFacebookApiProviderDTO.Parameters);
    expect(facebookApi.loadUser).toHaveBeenCalledTimes(1);
  });

  it('should return ProviderError if load user facebook api provider return failure', async () => {
    const error = new ProviderError({
      provider: {
        method: FacebookApiProviderMethods.LOAD_USER,
        name: ProviderNames.FACEBOOK_API
      }
    });
    facebookApi.loadUser.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(facebookApi.loadUser).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call find by email users repository with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(usersRepository.findByEmail).toHaveBeenCalledWith({
      email: FACEBOOK_USER_EMAIL
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

  it('should call save with facebook account users repository with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(usersRepository.saveWithFacebookAccount).toHaveBeenCalledWith({
      email: FACEBOOK_USER_EMAIL,
      facebookAccountId: FACEBOOK_USER_ID,
      isEmailValidated: true
    } as SaveWithFacebookAccountUsersRepositoryDTO.Parameters);
    expect(usersRepository.saveWithFacebookAccount).toHaveBeenCalledTimes(1);
  });

  it('should return RepositoryError if save with facebook account users repository return failure', async () => {
    const error = new RepositoryError({
      repository: {
        method: UsersRepositoryMethods.SAVE_WITH_FACEBOOK_ACCOUNT,
        name: RepositoryNames.USERS
      }
    });
    usersRepository.saveWithFacebookAccount.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.saveWithFacebookAccount).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  //TODO: add title test
  it('should success se nao achou user pelo email e salvou', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(success({ user: undefined }));

    const result = await sut.execute(correctParametersSut);

    expect(result.value).toEqual({ user: { id: USER_ID } } as FacebookSignInUseCaseDTO.ResultSuccess);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  //TODO: add title test
  it('should success se achou user pelo email e já tem a conta do facebook salva', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(
      success({
        user: {
          id: USER_ID,
          password: Generate.password(),
          facebookAccount: {
            id: FACEBOOK_USER_EMAIL
          }
        }
      })
    );

    const result = await sut.execute(correctParametersSut);

    expect(result.value).toEqual({ user: { id: USER_ID } } as FacebookSignInUseCaseDTO.ResultSuccess);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  //TODO: add title test
  it('should success se achou user pelo email mas não tem a conta do facebook salva', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(
      success({
        user: {
          id: USER_ID,
          password: Generate.password(),
          facebookAccount: undefined
        }
      })
    );

    const result = await sut.execute(correctParametersSut);

    expect(result.value).toEqual({ user: { id: USER_ID } } as FacebookSignInUseCaseDTO.ResultSuccess);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });

  it('should call update users repository with correct parameters', async () => {
    usersRepository.findByEmail.mockResolvedValueOnce(
      success({
        user: {
          id: USER_ID,
          password: Generate.password(),
          facebookAccount: undefined
        }
      })
    );

    await sut.execute(correctParametersSut);

    expect(usersRepository.update).toHaveBeenCalledWith({
      user: {
        id: USER_ID,
        facebookAccount: {
          id: FACEBOOK_USER_ID
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
          facebookAccount: undefined
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
