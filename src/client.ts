import { Axios } from "axios";
import JWT from "jsonwebtoken";
import { EntityType } from "./enums";
import { ICache } from "./cache";

interface ICentralRegistry {
  url: string;
  clientId: string;
  clientSecret: string;
  httpClient: Axios;
  cache: ICache;
}

const key = "S25--CR--TOKEN--KEY--1000";

class CentralRegistry {
  private _baseUrl: string;
  private _basicAuth: string;
  private _httpClient: Axios;
  private _cache: ICache;

  constructor(opts: ICentralRegistry) {
    this._baseUrl = opts.url;
    this._basicAuth = btoa(`${opts.clientId}:${opts.clientSecret}`);
    this._httpClient = opts.httpClient;
    this._cache = opts.cache;
  }

  private async _generateToken() {
    try {
      const url = `${this._baseUrl}/auth/realms/sahamati/protocol/openid-connect/token`;
      const res = await this._httpClient.request({
        url,
        method: "POST",
        headers: {
          authorization: `Basic ${this._basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          grant_type: "client_credentials",
          scope: "openid",
        }),
      });

      return {
        status: res.status,
        data: res.data,
      };
    } catch (err) {
      return Promise.reject({
        status: err.response.status,
        error: err.response.data,
      });
    }
  }

  private async _getEntityInfo(type: string) {
    try {
      const url = `${this._baseUrl}/entityInfo/${type}/`;
      const { data } = await this.getToken();
      const res = await this._httpClient.request({
        url,
        method: "GET",
        headers: {
          authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        status: res.status,
        data: res.data,
      };
    } catch (err) {
      return {
        status: err.response.status,
        error: err.response.data,
      };
    }
  }

  public async getToken() {
    try {
      const data = await this._cache.get(key);
      if (data) {
        return JSON.parse(data);
      }
      const res = await this._generateToken();
      const resData = {
        status: res.status,
        data: {
          token: res.data.access_token,
          expiry: res.data.expires_in,
        },
      };
      await this._cache.set(key, JSON.stringify(resData));
      return resData;
    } catch (err) {
      return {
        status: err.status,
        error: err.error,
      };
    }
  }

  public async getAA() {
    return await this._getEntityInfo(EntityType.AA);
  }

  public async getFIP() {
    return await this._getEntityInfo(EntityType.FIP);
  }

  public async getFIU() {
    return await this._getEntityInfo(EntityType.FIU);
  }

  public async verifyToken(token: string) {
    const payload = JWT.verify(token, "", {});
  }
}

export default CentralRegistry;
