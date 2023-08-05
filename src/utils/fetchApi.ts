import { ApiEndpoints, ApiEndpointsKeyType, HttpMethods } from "../types";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

/**
 * @example
 * const fetchBookmark = await fetchApi<{ id: string, url: string }>("/bookmarks/id");
 * const { id, url } = fetchBookmark;
 * @param endpoint
 * @param data
 * @param config
 * @returns
 */
export async function fetchApi<
  UResponseData = any,
  TPayloadData = any,
  VAxiosResponse extends AxiosResponse = AxiosResponse<UResponseData>,
  ZRequestConfig extends AxiosRequestConfig = AxiosRequestConfig<TPayloadData>,
  KApiEndpoints extends string = ApiEndpointsKeyType | (string & {})
>(endpoint: KApiEndpoints, data?: TPayloadData, config?: ZRequestConfig): Promise<VAxiosResponse> {
  const splitedEndpoint = ApiEndpoints[endpoint as ApiEndpointsKeyType].split(" ");

  const [method, urlEndpoint] =
    endpoint in ApiEndpoints
      ? splitedEndpoint
      : splitedEndpoint[0] in HttpMethods
      ? ["GET", splitedEndpoint[1]]
      : ["GET", endpoint];

  const requestConfig = config
    ? { ...config, baseURL: BASE_API_URL, method, data }
    : { baseURL: BASE_API_URL, method, data };

  const axiosRequest = await axios<UResponseData, VAxiosResponse, TPayloadData>(
    urlEndpoint,
    requestConfig
  );
  return axiosRequest;
}
