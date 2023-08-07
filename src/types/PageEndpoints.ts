const BASE_URL_PATH = import.meta.env.VITE_BASE_URL_PATH;

export const PageEndpoints = {
  ROOT: `${BASE_URL_PATH}`,
  LOGIN: `${BASE_URL_PATH}pages/login/`,
  SIGNUP: `${BASE_URL_PATH}pages/signup/`,
} as const;
