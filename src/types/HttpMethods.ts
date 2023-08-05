export const HttpMethods = {
  POST: "POST",
  GET: "GET",
  PATCH: "PATCH",
  DELETE: "DELETE",
  PUT: "PUT",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD",
  CONNECT: "CONNECT",
  TRACE: "TRACE",
} as const;

export type HttpMethodsType = typeof HttpMethods;
export type HttpMethodsKeyType = keyof HttpMethodsType;
