import { IFindByEmailUsersRepository } from '@contracts/repositories/users/find-by-email.users-repository';
import { ISaveWithFacebookAccountUsersRepository } from '@contracts/repositories/users/save-with-facebook-account.users-repository';
import { ISaveWithGoogleAccountUsersRepository } from '@contracts/repositories/users/save-with-google-account.users-repository';
import { ISaveUsersRepository } from '@contracts/repositories/users/save.users-repository';
import { IUpdateUsersRepository } from '@contracts/repositories/users/update.users-repository';

import { prisma } from '@external/database/prisma/prisma';
import { UsersPrismaRepository } from '@external/database/prisma/repositories/users.prisma-repository';

import { makeCryptoProvider } from '@factories/providers/crypto-provider.factory';
import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';

export const makeUsersRepository = (): IFindByEmailUsersRepository &
  ISaveUsersRepository &
  ISaveWithFacebookAccountUsersRepository &
  ISaveWithGoogleAccountUsersRepository &
  IUpdateUsersRepository => new UsersPrismaRepository(makeLoggerProvider(), makeCryptoProvider(), prisma);
