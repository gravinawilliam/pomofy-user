export type HttpResponse<Data = any> = {
  statusCode: number;
  data: Data;
};
