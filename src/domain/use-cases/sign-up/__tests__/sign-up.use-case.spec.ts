import { MockProxy, mock } from 'jest-mock-extended';

import { ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider';
import {
  EncryptPasswordProviderDTO,
  IEncryptPasswordProvider
} from '@contracts/providers/password/encrypt.password-provider';
import {
  FindByEmailUsersRepositoryDTO,
  IFindByEmailUsersRepository
} from '@contracts/repositories/users/find-by-email.users-repository';
import { ISaveUsersRepository, SaveUsersRepositoryDTO } from '@contracts/repositories/users/save.users-repository';

import { PasswordProviderMethods, ProviderError, ProviderNames } from '@errors/_shared/provider.error';
import { RepositoryError, RepositoryNames, UsersRepositoryMethods } from '@errors/_shared/repository.error';
import { EmailAlreadyExistsError } from '@errors/value-objects/email/email-already-exists.error';
import { InvalidEmailError } from '@errors/value-objects/email/invalid-email.error';
import { InvalidPasswordError, InvalidPasswordMotive } from '@errors/value-objects/password/invalid-password.error';

import { UseCase } from '@use-cases/_shared/use-case';
import { SignUpUseCase, SignUpUseCaseDTO } from '@use-cases/sign-up/sign-up.use-case';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';
import { Password } from '@value-objects/password.value-object';

import { failure, success } from '@shared/utils/either.util';
import * as Generate from '@shared/utils/faker.util';

describe('Sign up USE CASE', () => {
  let sut: UseCase<SignUpUseCaseDTO.Parameters, SignUpUseCaseDTO.Result>;
  let loggerProvider: MockProxy<ISendLogTimeUseCaseLoggerProvider>;
  let passwordProvider: MockProxy<IEncryptPasswordProvider>;
  let usersRepository: MockProxy<IFindByEmailUsersRepository & ISaveUsersRepository>;

  let correctParametersSut: SignUpUseCaseDTO.Parameters;
  const PASSWORD_ENCRYPTED: Password = Generate.password();
  const USER_ID: Id = Generate.id();

  beforeAll(() => {
    loggerProvider = mock();

    passwordProvider = mock();
    passwordProvider.encrypt.mockResolvedValue(success({ passwordEncrypted: PASSWORD_ENCRYPTED }));

    usersRepository = mock();
    usersRepository.findByEmail.mockResolvedValue(success({ user: undefined }));
    usersRepository.save.mockResolvedValue(success({ user: { id: USER_ID } }));
  });

  beforeEach(() => {
    correctParametersSut = {
      password: Generate.password().value,
      email: Generate.email().value
    };

    sut = new SignUpUseCase(loggerProvider, passwordProvider, usersRepository);
  });

  it('should return ProviderError if encrypt password provider return failure', async () => {
    const error = new ProviderError({
      provider: {
        method: PasswordProviderMethods.ENCRYPT,
        name: ProviderNames.PASSWORD
      }
    });
    passwordProvider.encrypt.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(passwordProvider.encrypt).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call encrypt password provider with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(passwordProvider.encrypt).toHaveBeenCalledWith({
      password: new Password({ password: correctParametersSut.password })
    } as EncryptPasswordProviderDTO.Parameters);
    expect(passwordProvider.encrypt).toHaveBeenCalledTimes(1);
  });

  it('should return InvalidPasswordError if validate password return failure', async () => {
    const error = new InvalidPasswordError({ motive: InvalidPasswordMotive.HAS_SPACE });
    jest.spyOn(Password, 'validate').mockImplementationOnce(() => failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(Password.validate).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should return InvalidEmailError if validate email return failure', async () => {
    const email = 'invalidEmail';

    const error = new InvalidEmailError({ email });
    jest.spyOn(Email, 'validate').mockImplementationOnce(() => failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(Email.validate).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
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

  it('should call find by email users repository with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(usersRepository.findByEmail).toHaveBeenCalledWith({
      email: new Email({ email: correctParametersSut.email })
    } as FindByEmailUsersRepositoryDTO.Parameters);
    expect(usersRepository.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('should return EmailAlreadyExistsError if find by email users repository return user', async () => {
    const error = new EmailAlreadyExistsError({ email: new Email({ email: correctParametersSut.email }) });
    usersRepository.findByEmail.mockResolvedValueOnce(success({ user: { id: USER_ID, password: Generate.password() } }));

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should return RepositoryError if save users repository return failure', async () => {
    const error = new RepositoryError({
      repository: {
        method: UsersRepositoryMethods.SAVE,
        name: RepositoryNames.USERS
      }
    });
    usersRepository.save.mockResolvedValueOnce(failure(error));

    const result = await sut.execute(correctParametersSut);

    expect(usersRepository.save).toHaveBeenCalledTimes(1);
    expect(result.value).toEqual(error);
    expect(result.isFailure()).toBeTruthy();
    expect(result.isSuccess()).toBeFalsy();
  });

  it('should call save users repository with correct parameters', async () => {
    await sut.execute(correctParametersSut);

    expect(usersRepository.save).toHaveBeenCalledWith({
      user: {
        email: new Email({ email: correctParametersSut.email }),
        password: PASSWORD_ENCRYPTED,
        isEmailValidated: false
      }
    } as SaveUsersRepositoryDTO.Parameters);
    expect(usersRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should successfully sign up', async () => {
    const result = await sut.execute(correctParametersSut);

    const resultSuccess: SignUpUseCaseDTO.ResultSuccess = { user: { id: USER_ID } };

    expect(result.value).toEqual(resultSuccess);
    expect(result.isSuccess()).toBeTruthy();
    expect(result.isFailure()).toBeFalsy();
  });
});
