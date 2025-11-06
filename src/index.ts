import axios from "axios";
import axiosRetry from "axios-retry";
import { createClient, RedisClientType } from "redis";
import Logger from "pino";

import { cache as nCache, ICache, getRedisCacheObj } from "./cache";
import CentralRegistry from "./client";
import config from "./config";

let client: CentralRegistry;

const httpClient = axios.create();

axiosRetry(httpClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    return (
      error.code === "ECONNABORTED" ||
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error?.response?.status >= 500
    );
  },
});

interface IOptions {
  cache?: ICache;
  loggerLevel?: "debug" | "info" | "error" | "silent";
}

let redisClient: RedisClientType;

const opts: IOptions = {
  cache: nCache,
  loggerLevel: "silent",
};

async function connectRedis(url: string) {
  if (!url) {
    throw new Error("Connection url is required");
  }

  redisClient = createClient({
    url: url,
    pingInterval: 15 * 60000, // 15 mins
  });

  await redisClient.connect();

  return redisClient;
}

export async function getRedisCache(url: string) {
  if (!redisClient) {
    await connectRedis(url);
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return getRedisCacheObj(redisClient);
}

export default function getCRClient(options = opts): CentralRegistry {
  if (client) {
    return client;
  }

  const finalOpts: IOptions = {
    cache: options.cache ?? opts.cache,
    loggerLevel: options.loggerLevel ?? opts.loggerLevel,
  };

  const logger = Logger({
    name: "CR_LOGGER",
    level: finalOpts.loggerLevel,
  });

  client = new CentralRegistry({
    clientId: config.clientId,
    url: config.baseUrl,
    httpClient: httpClient,
    cache: finalOpts.cache,
    tokenUrl: config.tokenUrl,
    username: config.username,
    password: config.password,
    logger,
    hardResetSecret: config.resetToken,
    secret: config.secret,
  });

  // call get token to cache token
  client.getToken();

  return client;
}
