import { AxiosError, AxiosResponse } from "axios";
import { ZodError, ZodIssue } from "zod";

export function handleError<TErrorType extends Error>(
  error: TErrorType | any,
  cb?: Partial<{
    zodError: (e?: ZodIssue[]) => void;
    axiosError: (e?: AxiosResponse) => void;
    anyError: (e?: Error) => void;
  }>
): void {
  try {
    if (error instanceof AxiosError) {
      if (cb?.axiosError) cb.axiosError(error.response);
      return;
    } else if (error instanceof ZodError) {
      if (cb?.zodError) cb.zodError(error.errors);
      return;
    }
    if (cb?.anyError) cb.anyError(error);
  } catch (error) {
    throw error;
  }
}
