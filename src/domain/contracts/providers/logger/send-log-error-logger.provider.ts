export namespace SendLogErrorLoggerProviderDTO {
  export type Parameters = Readonly<{
    message: string;
    value: string | Error | unknown;
  }>;
  export type Result = void;
}

export interface ISendLogErrorLoggerProvider {
  sendLogError(parameters: SendLogErrorLoggerProviderDTO.Parameters): SendLogErrorLoggerProviderDTO.Result;
}
