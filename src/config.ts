import { record, string } from "typescript-json-decoder";

const envDecoder = record({
  CR_BASE_URL: string,
  CR_CLIENT_ID: string,
  CR_CLIENT_USERNAME: string,
  CR_TOKEN_BASE_URL: string,
  CR_TOKEN_KEY_URL: string,
  CR_CLIENT_PASSWORD: string,
});

const data = envDecoder(process.env);

const config: Record<string, any> = {
  baseUrl: data.CR_BASE_URL,
  clientId: data.CR_CLIENT_ID,
  username: data.CR_CLIENT_USERNAME,
  password: data.CR_CLIENT_PASSWORD,
  tokenUrl: data.CR_TOKEN_BASE_URL,
  tokenKeyUrl: data.CR_TOKEN_KEY_URL,
};

export default Object.freeze(config);