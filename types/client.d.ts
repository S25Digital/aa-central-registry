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

interface IGetTokenResponse {
  token: string;
  expiry: number;
}

interface ILibResponse <T = Record<string, any> | Array<Record<string, any>>>{
  status: number;
  data?: T;
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
  getToken(): Promise<ILibResponse<IGetTokenResponse>>;
  getAA(): Promise<ILibResponse<Array<Record<string, any>>>>;
  getFIP(): Promise<ILibResponse<Array<Record<string, any>>>>;
  getFIU(): Promise<ILibResponse<Array<Record<string, any>>>>;
  getAAById(id: string): Promise<ILibResponse<Record<string, any>>>;
  getFIPById(id: string): Promise<ILibResponse<Record<string, any>>>;
  getFIUById(id: string): Promise<ILibResponse<Record<string, any>>>;
  verifyToken(token: string): Promise<{
    isVerified: boolean;
    payload?: Record<string, any>;
  }>;
}
export default CentralRegistry;
