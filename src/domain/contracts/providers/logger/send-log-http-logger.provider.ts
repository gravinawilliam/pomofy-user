export namespace SendLogHttpLoggerProviderDTO {
  export type Parameters = Readonly<{ message: string | unknown }>;
  export type Result = void;
}

export interface ISendLogHttpLoggerProvider {
  sendLogHttp(parameters: SendLogHttpLoggerProviderDTO.Parameters): SendLogHttpLoggerProviderDTO.Result;
}
