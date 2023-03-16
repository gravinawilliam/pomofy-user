import { ILoadUserFacebookApiProvider } from '@contracts/providers/facebook-api/load-user.facebook-api-provider';

import { FacebookApiProvider } from '@infrastructure/providers/facebook-api/facebook-api.provider';

import { makeHttpClientProvider } from '@factories/providers/http-client-provider.factory';

export const makeFacebookApiProvider = (): ILoadUserFacebookApiProvider =>
  new FacebookApiProvider(makeHttpClientProvider(), {
    baseUrl: '',
    facebookCredentials: { clientId: '', clientSecret: '' }
  });
