import {
  ILoadUserFacebookApiProvider,
  LoadUserFacebookApiProviderDTO
} from '@contracts/providers/facebook-api/load-user.facebook-api-provider';
import { IGetHttpClientProvider } from '@contracts/providers/http-client/get.http-client-provider';

import { ProviderError } from '@errors/_shared/provider.error';

import { Email } from '@value-objects/email.value-object';
import { Id } from '@value-objects/id.value-object';

import { Either, failure, success } from '@shared/utils/either.util';

export class FacebookApiProvider implements ILoadUserFacebookApiProvider {
  constructor(
    private readonly httpClientProvider: IGetHttpClientProvider,
    private readonly environment: {
      baseUrl: string;
      facebookCredentials: {
        clientId: string;
        clientSecret: string;
      };
    }
  ) {}

  public async loadUser(parameters: LoadUserFacebookApiProviderDTO.Parameters): LoadUserFacebookApiProviderDTO.Result {
    const result = await this.getUserInfo(parameters.accessToken);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (result.isFailure()) return failure(result.value);
    const { email, id } = result.value.facebookAccount;

    return success({ facebookAccount: { id: new Id({ id }), email: new Email({ email }), name: '' } });
  }

  private async getAppToken(): Promise<Either<ProviderError | Error, { accessToken: string }>> {
    const result = await this.httpClientProvider.get({
      url: `${this.environment.baseUrl}/oauth/access_token`,
      params: {
        client_id: this.environment.facebookCredentials.clientId,
        client_secret: this.environment.facebookCredentials.clientSecret,
        grant_type: 'client_credentials'
      }
    });
    if (result.isFailure()) return failure(result.value);

    if (result.value.data.access_token === undefined) {
      // TODO: retornar error custom
      return failure(new Error('erro'));
    }

    return success({ accessToken: result.value.data.access_token });
  }

  private async getDebugToken(clientToken: string): Promise<Either<ProviderError | Error, { userId: string }>> {
    const resultGetAppToken = await this.getAppToken();
    if (resultGetAppToken.isFailure()) return failure(resultGetAppToken.value);
    const { accessToken } = resultGetAppToken.value;

    const result = await this.httpClientProvider.get({
      url: `${this.environment.baseUrl}/debug_token`,
      params: {
        access_token: accessToken,
        input_token: clientToken
      }
    });

    if (result.isFailure()) return failure(result.value);

    if (result.value.data.user_id === undefined) {
      // TODO: retornar error custom
      return failure(new Error('erro'));
    }

    return success({ userId: result.value.data.user_id });
  }

  private async getUserInfo(clientToken: string): Promise<
    Either<
      ProviderError | Error,
      {
        facebookAccount: {
          id: string;
          email: string;
          name: string;
        };
      }
    >
  > {
    const resultGetDebugToken = await this.getDebugToken(clientToken);
    if (resultGetDebugToken.isFailure()) return failure(resultGetDebugToken.value);
    const { userId } = resultGetDebugToken.value;

    const result = await this.httpClientProvider.get({
      url: `${this.environment.baseUrl}/${userId}`,
      params: {
        fields: ['id', 'email'].join(','),
        access_token: clientToken
      }
    });
    if (result.isFailure()) return failure(result.value);
    const { data } = result.value;

    if (data.id === undefined || data.email === undefined) {
      // TODO: retornar error custom
      return failure(new Error('erro'));
    }

    return success({ facebookAccount: { email: data.email, id: data.id, name: data.name } });
  }
}
