import { record, string, optional } from "typescript-json-decoder";

const envDecoder = record({
  CR_BASE_URL: string,
  CR_CLIENT_ID: string,
  CR_CLIENT_SECRET: string,
  CR_TOKEN_BASE_URL: string
});

const data = envDecoder(process.env);

const config: Record<string, any> = {
  baseUrl: data.CR_BASE_URL,
  clientId: data.CR_CLIENT_ID,
  clientSecret: data.CR_CLIENT_SECRET,
  tokenUrl: data.CR_TOKEN_BASE_URL,
};

export default Object.freeze(config);