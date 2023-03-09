import { ProviderError } from '@errors/_shared/provider.error';

import { Either } from '@shared/utils/either.util';

export namespace GetHttpClientProviderDTO {
  export type Parameters = Readonly<{
    url: string;
    params?: unknown;
  }>;

  export type ResultError = ProviderError;
  export type ResultSuccess = {
    data: any;
    status: number;
  };

  export type Result = Promise<Either<ResultError, ResultSuccess>>;
}

export interface IGetHttpClientProvider {
  get(parameters: GetHttpClientProviderDTO.Parameters): GetHttpClientProviderDTO.Result;
}
