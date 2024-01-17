export interface ICache {
    set(key: string, value: string): Promise<boolean>;
    get(key: string): Promise<string>;
    remove(key: string): Promise<boolean>;
}
export declare const cache: ICache;
