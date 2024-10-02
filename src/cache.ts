import NodeCache from "node-cache";

const nCache = new NodeCache();

export interface ICache {
  set(key: string, value: string, expiry?: number): Promise<boolean>;
  get(key: string): Promise<string>;
  remove(key: string): Promise<boolean>;
}

export const cache: ICache = {
  set: async (key: string, value: string, expiry = 20 * 3600) => {
    return nCache.set(key, value, expiry);
  },
  get: async (key: string) => {
    return nCache.get(key);
  },
  remove: async (key: string) => {
    const res = nCache.del(key);
    if (res > 0) {
      return true;
    }

    return false;
  },
};
