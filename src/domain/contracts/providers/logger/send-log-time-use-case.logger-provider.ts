export namespace SendLogTimeUseCaseLoggerProviderDTO {
  export type Parameters = Readonly<{
    message: string;
  }>;
  export type Result = void;
}

export interface ISendLogTimeUseCaseLoggerProvider {
  sendLogTimeUseCase(
    parameters: SendLogTimeUseCaseLoggerProviderDTO.Parameters
  ): SendLogTimeUseCaseLoggerProviderDTO.Result;
}
