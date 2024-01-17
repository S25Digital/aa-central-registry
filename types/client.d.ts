import { Axios } from "axios";
import JWT from "jsonwebtoken";
import { ICache } from "./cache";
interface ICentralRegistry {
    url: string;
    clientId: string;
    clientSecret: string;
    httpClient: Axios;
    cache: ICache;
    tokenUrl: string;
}
declare class CentralRegistry {
    private _baseUrl;
    private _basicAuth;
    private _httpClient;
    private _cache;
    private _tokenUrl;
    constructor(opts: ICentralRegistry);
    private _generateToken;
    private _getEntityInfo;
    private _getPublicKey;
    getToken(): Promise<any>;
    getAA(): Promise<{
        status: number;
        data: any;
        error?: undefined;
    } | {
        status: any;
        error: any;
        data?: undefined;
    }>;
    getFIP(): Promise<{
        status: number;
        data: any;
        error?: undefined;
    } | {
        status: any;
        error: any;
        data?: undefined;
    }>;
    getFIU(): Promise<{
        status: number;
        data: any;
        error?: undefined;
    } | {
        status: any;
        error: any;
        data?: undefined;
    }>;
    verifyToken(token: string): Promise<{
        isVerified: boolean;
        payload?: undefined;
    } | {
        isVerified: boolean;
        payload: string | JWT.JwtPayload;
    }>;
}
export default CentralRegistry;
