import { ICache } from "./cache";
import CentralRegistry from "./client";
interface IOptions {
    cache: ICache;
}
export default function getCRClient(options?: IOptions): CentralRegistry;
export {};
