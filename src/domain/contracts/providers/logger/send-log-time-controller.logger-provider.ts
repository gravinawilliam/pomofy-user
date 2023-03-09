export namespace SendLogTimeControllerLoggerProviderDTO {
  export type Parameters = Readonly<{
    message: string;
  }>;
  export type Result = void;
}

export interface ISendLogTimeControllerLoggerProvider {
  sendLogTimeController(
    parameters: SendLogTimeControllerLoggerProviderDTO.Parameters
  ): SendLogTimeControllerLoggerProviderDTO.Result;
}
