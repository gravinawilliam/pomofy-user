import { MockProxy, mock } from 'jest-mock-extended';

import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import {
  ComparePasswordProviderDTO,
  IComparePasswordProvider
} from '@contracts/providers/password/compare.password-provider';
import {
  FindByEmailUsersRepositoryDTO,
  IFindByEmailUsersRepository
} from '@contracts/repositories/users/find-by-email.users-repository';

import { PasswordProviderMethods, ProviderError, ProviderNames } from '@errors/_shared/provider.error';
import { RepositoryError, RepositoryNames, UsersRepositoryMethods } from '@errors/_shared/repository.error';
import { SignInError, SignInErrorMotive } from '@errors/use-cases/sign-in.error';
import { InvalidEmailError } from '@errors/value-objects/email/invalid-email.error';
import { InvalidPasswordError, InvalidPasswordMotive } from '@errors/value-objects/password/invalid-password.error';

import { UseCase } from '@use-cases/_shared/use-case';
import { CredentialsSignInUseCase, CredentialsSignInUseCaseDTO } from '@use-cases/sign-in/credentials-sign-in.use-case';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';
import { Password } from '@value-objects/password.value-object';

import { failure, success } from '@shared/utils/either.util';
import * as Generate from '@shared/utils/faker.util';

describe('Credentials sign in USE CASE', () => {
  let sut: UseCase<CredentialsSignInUseCaseDTO.Parameters, CredentialsSignInUseCaseDTO.Result>;
  let loggerProvider: MockProxy<ISendLogTimeUseCaseLoggerProvider>;
  let passwordProvider: MockProxy<IComparePasswordProvider>;
  let usersRepository: MockProxy<IFindByEmailUsersRepository>;

  let correctParametersSut: CredentialsSignInUseCaseDTO.Parameters;
  const USER_PASSWORD_ENCRYPTED: Password = Generate.password();
  const USER_ID: Id = Generate.id();

  beforeAll(() => {
    loggerProvider = mock();

    passwordProvider = mock();
    passwordProvider.compare.mockResolvedValue(success({ isEqual: true }));

    usersRepository = mock();
    usersRepository.findByEmail.mockResolvedValue(
      success({
        user: {
          id: USER_ID,
          password: USER_PASSWORD_ENCRYPTED
        }
      })
    );
  });

  beforeEach(() => {
    correctParametersSut = {
      credentials: {
        password: Generate.password().value,
        email: Generate.email().value
      }
    };

    sut = new CredentialsSignInUseCase(loggerProvider, usersRepository, passwordProvider);
  });

  it('should return InvalidPasswordError if validate password return failure', async () => {
    const error = new InvalidPasswordError({ motive: InvalidPasswordMotive.IS_LESS_THAN_8_CHARACTERS });
    jest.spyOn(Password, 'validate').mockImplementationOnce(() => failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(Password.validate).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should return InvalidEmailError if validate email return failure', async () => {
    const error = new InvalidEmailError({ email: 'invalid email' });
    jest.spyOn(Email, 'validate').mockImplementationOnce(() => failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(Email.validate).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call find by email users repository with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(usersRepository.findByEmail).toHaveBeenCalledWith({
      email: new Email({ email: correctParametersSut.credentials.email })
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

  it('should return SignInError if find by email users repository return undefined user', async () => {
    const error = new SignInError({ motive: SignInErrorMotive.EMAIL_NOT_FOUND });
    usersRepository.findByEmail.mockResolvedValueOnce(success({ user: undefined }));

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call compare password provider with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(passwordProvider.compare).toHaveBeenCalledWith({
      password: new Password({ password: correctParametersSut.credentials.password }),
      passwordEncrypted: USER_PASSWORD_ENCRYPTED
    } as ComparePasswordProviderDTO.Parameters);
    expect(passwordProvider.compare).toHaveBeenCalledTimes(1);
  });

  it('should return ProviderError if compare password provider return failure', async () => {
    const error = new ProviderError({
      provider: {
        method: PasswordProviderMethods.COMPARE,
        name: ProviderNames.PASSWORD
      }
    });
    passwordProvider.compare.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(passwordProvider.compare).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should return SignInError if compare password provider return is equal false', async () => {
    const error = new SignInError({ motive: SignInErrorMotive.PASSWORD_NOT_MATCH });
    passwordProvider.compare.mockResolvedValueOnce(success({ isEqual: false }));

    const result = await sut.execute(correctParametersSut);

    expect(passwordProvider.compare).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should successfully credentials sign in', async () => {
    const result = await sut.execute(correctParametersSut);

    const resultSuccess: CredentialsSignInUseCaseDTO.ResultSuccess = { user: { id: USER_ID } };

    expect(result.value).toEqual(resultSuccess);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });
});
