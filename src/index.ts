import axios from "axios";
import { cache as nCache, ICache } from "./cache";

import CentralRegistry from "./client";
import config from "./config";

let client: CentralRegistry;

interface IOptions {
  cache: ICache;
}

const opts: IOptions = {
  cache: nCache,
};

export default function getCRClient(options = opts): CentralRegistry {
  if (client) {
    return client;
  }

  client = new CentralRegistry({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    url: config.baseUrl,
    httpClient: axios,
    cache: options.cache,
    tokenUrl: config.tokenUrl
  });

  return client;
}