import { ExcludePropKeys } from "../helper";
import { LocalStorageKeys } from "../types";

export const getAuthToken = (
  tokenType: ExcludePropKeys<typeof LocalStorageKeys, "USER_PROFILE">
) => ({
  headers: {
    Authorization: `Bearer ${localStorage[LocalStorageKeys.ACCESS_TOKEN]}`,
  },
  token: localStorage[LocalStorageKeys[tokenType]],
});
