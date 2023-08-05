export interface ErrorResponse {
  error: string;
  statusCode: number;
  message: string;
}

export function isErrorResponse(obj: any): obj is ErrorResponse {
  return obj && "error" in obj && "statusCode" in obj && "message" in obj;
}
