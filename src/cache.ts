import NodeCache from "node-cache";

const nCache = new NodeCache();

export interface ICache {
  set(key: string, value: string): Promise<boolean>;
  get(key: string): Promise<string>;
  remove(key: string): Promise<boolean>;
}

export const cache: ICache = {
  set: async (key: string, value: string) => {
    return nCache.set(key, value, 20 * 3600);
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
