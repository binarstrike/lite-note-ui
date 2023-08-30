import { ApiEndpoints, ApiEndpointsKeyType } from "../types";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

/**
 * @example
 * const fetchBookmark = await fetchApi<{ id: string, url: string }>("GET /bookmarks/:id");
 * const createBookmark = await fetchApi<{ id: string, url: string }>("POST /bookmarks");
 * const { id, url } = fetchBookmark;
 * @param endpoint
 * @param data
 * @param config
 * @returns
 */
export async function fetchApi<
  TResponseData = any,
  TPayloadData = any,
  TAxiosResponse extends AxiosResponse = AxiosResponse<TResponseData>,
  TConfig extends AxiosRequestConfig = AxiosRequestConfig<TPayloadData>
>(endpoint: ApiEndpointsKeyType, data?: TPayloadData, config?: TConfig): Promise<TAxiosResponse> {
  const [method, urlEndpoint] = ApiEndpoints[endpoint].split(" ");

  const requestConfig = config
    ? { ...config, baseURL: BASE_API_URL, method, data }
    : { baseURL: BASE_API_URL, method, data };

  const axiosRequest = await axios<TResponseData, TAxiosResponse, TPayloadData>(
    urlEndpoint,
    requestConfig
  );
  return axiosRequest;
}
