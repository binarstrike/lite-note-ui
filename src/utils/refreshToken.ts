import { fetchApi } from ".";
import { TokensSchemaType, tokensSchema } from "../schema";

export async function refreshToken(refreshToken: string): Promise<TokensSchemaType> {
  try {
    const fetchToken = await fetchApi<TokensSchemaType>(
      "AUTH_REFRESH",
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    );
    const tokens = tokensSchema.parse(fetchToken.data);
    return tokens;
  } catch (error) {
    throw error;
  }
}
