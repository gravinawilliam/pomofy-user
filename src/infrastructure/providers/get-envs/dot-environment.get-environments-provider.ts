import * as dotEnvConfig from 'dotenv-defaults/config';
import * as dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotEnvConfig);

namespace GetEnvironmentStringDTO {
  export type Parameters = Readonly<{
    key: string;
    defaultValue: string;
  }>;

  export type Result = string;
}

namespace GetEnvironmentNumberDTO {
  export type Parameters = Readonly<{
    key: string;
    defaultValue: number;
  }>;

  export type Result = number;
}

export const getEnvironmentString = (parameters: GetEnvironmentStringDTO.Parameters): GetEnvironmentStringDTO.Result => {
  return process.env[String(parameters.key)] || parameters.defaultValue;
};

export const getEnvironmentNumber = (parameters: GetEnvironmentNumberDTO.Parameters): GetEnvironmentNumberDTO.Result => {
  return Number(process.env[String(parameters.key)] || parameters.defaultValue);
};
