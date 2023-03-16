import {
  ILoadUserGoogleApiProvider,
  LoadUserGoogleApiProviderDTO
} from '@contracts/providers/google-api/load-user.google-api-provider';
import { IGetHttpClientProvider } from '@contracts/providers/http-client/get.http-client-provider';
import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';

import { GoogleApiProviderMethods, ProviderError, ProviderNames } from '@errors/_shared/provider.error';
import { LoadUserGoogleApiError } from '@errors/providers/google-api/load-user-google-api.error';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';

import { failure, success } from '@shared/utils/either.util';

export class GoogleApiProvider implements ILoadUserGoogleApiProvider {
  constructor(
    private readonly loggerProvider: ISendLogErrorLoggerProvider,
    private readonly httpClientProvider: IGetHttpClientProvider
  ) {}

  public async loadUser(parameters: LoadUserGoogleApiProviderDTO.Parameters): LoadUserGoogleApiProviderDTO.Result {
    try {
      const response = await this.httpClientProvider.get({
        url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${parameters.accessToken}`
      });
      if (response.isFailure()) return failure(new LoadUserGoogleApiError({ error: response.value }));
      if (response.value.status !== 200) return failure(new LoadUserGoogleApiError({}));

      return success({
        googleAccount: {
          email: new Email({ email: response.value.data.email }),
          id: new Id({ id: response.value.data.id }),
          name: response.value.data.name
        }
      });
    } catch (error: any) {
      const errorProvider = new ProviderError({
        error,
        provider: {
          name: ProviderNames.HTTP_CLIENT,
          method: GoogleApiProviderMethods.LOAD_USER,
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
