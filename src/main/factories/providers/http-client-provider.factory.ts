import { IGetHttpClientProvider } from '@contracts/providers/http-client/get.http-client-provider';

import { AxiosHttpClientProvider } from '@infrastructure/providers/http-client/axios.http-client-provider';

import { makeLoggerProvider } from '@factories/providers/logger-provider.factory';

export const makeHttpClientProvider = (): IGetHttpClientProvider => new AxiosHttpClientProvider(makeLoggerProvider());
