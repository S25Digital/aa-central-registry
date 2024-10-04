import axios from "axios";
import { cache as nCache, ICache, getRedisCacheObj } from "./cache";

import CentralRegistry from "./client";
import config from "./config";
import { createClient, RedisClientType } from "redis";

let client: CentralRegistry;

interface IOptions {
  cache: ICache;
}

let redisClient: RedisClientType;

const opts: IOptions = {
  cache: nCache,
};

async function connectRedis(url: string) {
  if (!url) {
    throw new Error("Connection url is required");
  }

  redisClient = createClient({
    url: url,
    pingInterval: 15 * 60000 // 15 mins
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

  client = new CentralRegistry({
    clientId: config.clientId,
    url: config.baseUrl,
    httpClient: axios,
    cache: options.cache,
    tokenUrl: config.tokenUrl,
    username: config.username,
    password: config.password,
  });

  return client;
}
