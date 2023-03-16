import { IGenerateIdCryptoProvider } from '@contracts/providers/crypto/generate-id.crypto-provider';

import { UuidCryptoProvider } from '@infrastructure/providers/crypto/uuid.crypto-provider';

import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';

export const makeCryptoProvider = (): IGenerateIdCryptoProvider => new UuidCryptoProvider(makeLoggerProvider());
