import { sign, verify } from 'jsonwebtoken';

import { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error-logger.provider';
import {
  GenerateJwtTokenProviderDTO,
  IGenerateJwtTokenProvider
} from '@contracts/providers/token/generate-jwt.token-provider';
import { IVerifyJwtTokenProvider, VerifyJwtTokenProviderDTO } from '@contracts/providers/token/verify-jwt.token-provider';

import { ProviderError, ProviderNames, TokenProviderMethods } from '@errors/_shared/provider.error';

import { Id } from '@value-objects/id.value-object';

import { failure, success } from '@shared/utils/either.util';

type ITokenJwtPayloadDTO = {
  iat: number;
  exp: number;
  sub: string;
};

export class JsonwebtokenTokenProvider implements IGenerateJwtTokenProvider, IVerifyJwtTokenProvider {
  constructor(
    private readonly loggerProvider: ISendLogErrorLoggerProvider,
    private readonly environments: {
      SECRET: string;
      EXPIRES_IN: string;
      ALGORITHM: 'HS256' | 'HS384' | 'HS512';
      ISSUER: string;
    }
  ) {}

  public verifyJwt(parameters: VerifyJwtTokenProviderDTO.Parameters): VerifyJwtTokenProviderDTO.Result {
    try {
      const decoded = verify(parameters.token, this.environments.SECRET);
      const { sub } = decoded as ITokenJwtPayloadDTO;

      return success({ user: { id: new Id({ id: sub }) } });
    } catch (error: any) {
      const errorProvider = new ProviderError({
        error,
        provider: { name: ProviderNames.TOKEN, method: TokenProviderMethods.GENERATE_JWT, externalName: 'jsonwebtoken' }
      });

      this.loggerProvider.sendLogError({ message: errorProvider.message, value: error });

      return failure(errorProvider);
    }
  }

  public generateJwt(parameters: GenerateJwtTokenProviderDTO.Parameters): GenerateJwtTokenProviderDTO.Result {
    try {
      return success({
        jwtToken: sign({}, this.environments.SECRET, {
          subject: parameters.user.id.value,
          issuer: this.environments.ISSUER,
          expiresIn: this.environments.EXPIRES_IN,
          algorithm: this.environments.ALGORITHM
        })
      });
    } catch (error: any) {
      const errorProvider = new ProviderError({
        error,
        provider: { name: ProviderNames.TOKEN, method: TokenProviderMethods.GENERATE_JWT, externalName: 'jsonwebtoken' }
      });

      this.loggerProvider.sendLogError({ message: errorProvider.message, value: error });

      return failure(errorProvider);
    }
  }
}
