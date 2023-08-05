export const ApiEndpoints = {
  AUTH_SIGNUP: "POST /auth/signup",
  AUTH_SIGNIN: "POST /auth/signin",
  AUTH_REFRESH: "POST /auth/refresh",
  AUTH_LOGOUT: "POST /auth/logout",
  USER_INFO: "GET /users/me",
  USER_UPDATE: "POST /users",
  NOTE_CREATE: "POST /notes",
  NOTE_GET_NOTES: "GET /notes",
  NOTE_GET_BY_ID: "GET /notes/",
  NOTE_UPDATE_BY_ID: "PATCH /notes/",
  NOTE_DELETE_BY_ID: "DELETE /notes/",
} as const;

export type ApiEndpointsType = typeof ApiEndpoints;
export type ApiEndpointsKeyType = keyof ApiEndpointsType;
