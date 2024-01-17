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

interface ILibResponse {
  status: number;
  data?: Record<string, any> | Array<Record<string, any>>;
  error?: any;
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
  getToken(): Promise<ILibResponse>;
  getAA(): Promise<ILibResponse>;
  getFIP(): Promise<ILibResponse>;
  getFIU(): Promise<ILibResponse>;
  verifyToken(token: string): Promise<{
    isVerified: boolean;
    payload?: Record<string, any>;
  }>;
}
export default CentralRegistry;
