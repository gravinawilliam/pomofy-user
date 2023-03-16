import axios from 'axios';

import {
  GetHttpClientProviderDTO,
  IGetHttpClientProvider
} from '@contracts/providers/http-client/get.http-client-provider';
import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';

import { HttpClientProviderMethods, ProviderError, ProviderNames } from '@errors/_shared/provider.error';

import { failure, success } from '@shared/utils/either.util';

export class AxiosHttpClientProvider implements IGetHttpClientProvider {
  constructor(private readonly loggerProvider: ISendLogErrorLoggerProvider) {}

  public async get(parameters: GetHttpClientProviderDTO.Parameters): GetHttpClientProviderDTO.Result {
    try {
      return success(await axios.get(parameters.url, { params: parameters.params }));
    } catch (error: any) {
      const errorProvider = new ProviderError({
        error,
        provider: {
          name: ProviderNames.HTTP_CLIENT,
          method: HttpClientProviderMethods.GET,
          externalName: 'axios'
        }
      });

      this.loggerProvider.sendLogError({
        message: errorProvider.message,
        value: error
      });

      return failure(errorProvider);
    }
  }
}
