import { ICache } from "./cache";
import CentralRegistry from "./client";
interface IOptions {
    cache?: ICache;
    loggerLevel?: "debug" | "info" | "error" | "silent";
}

export default function getCRClient(options?: IOptions): CentralRegistry;
export function getRedisCache(url: string): Promise<ICache>;

export * from "./client";
export * from "./cache";
