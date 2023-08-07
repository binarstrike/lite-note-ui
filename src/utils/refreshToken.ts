import { fetchApi } from ".";
import { TokensSchemaType, tokensSchema } from "../schema";

export async function refreshToken(refreshToken: string): Promise<TokensSchemaType> {
  try {
    const fetchToken = await fetchApi<TokensSchemaType>("AUTH_REFRESH", null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    const tokens: TokensSchemaType = tokensSchema.parse(fetchToken.data);
    return tokens;
  } catch (error) {
    throw error;
  }
}
