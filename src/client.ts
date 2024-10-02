import { Axios } from "axios";
import JWT from "jsonwebtoken";
import toPem from "rsa-pem-from-mod-exp";
import { v4 } from "uuid";
import { subDays } from "date-fns";
import { EntityType } from "./enums";
import { ICache } from "./cache";

interface ICentralRegistry {
  url: string;
  clientId: string;
  httpClient: Axios;
  cache: ICache;
  tokenUrl: string;
  username: string;
  password: string;
}

const key = "S25--CR--TOKEN--KEY--1000";
const publicCacheKey = "S25--CR--PUBLIC--KEY--1001";
const secretCacheKey = "S25--CR--SECRET--KEY--1003";

class CentralRegistry {
  private _baseUrl: string;
  private _clientId: string;
  private _httpClient: Axios;
  private _cache: ICache;
  private _tokenUrl: string;
  private _username: string;
  private _password: string;

  constructor(opts: ICentralRegistry) {
    this._baseUrl = opts.url;
    this._clientId = opts.clientId;
    this._httpClient = opts.httpClient;
    this._cache = opts.cache;
    this._tokenUrl = opts.tokenUrl;
  }

  private async _generateUserAuthToken() {
    const url = `${this._tokenUrl}/iam/v1/user/token/generate`;
    const res = await this._httpClient.request({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams({
        username: this._username,
        password: this._password,
      }),
    });

    return res.data.accessToken;
  }

  private async _resetSecret() {
    const url = `${this._tokenUrl}/iam/v1/entity/secret/reset`;
    const res = await this._httpClient.request({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": await this._generateUserAuthToken()
      },
      data: JSON.stringify({
        ver: "1.0.0",
        timestamp: new Date().toISOString(),
        txnId: v4(),
        entityId: this._clientId,
      }),
    });

    return res.data.secret;
  }

  private async _getSecret() {
    let secret = await this._cache.get(secretCacheKey);

    if (!secret) {
      const url = `${this._tokenUrl}/iam/v1/entity/secret/read`;
      const res = await this._httpClient.request({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": await this._generateUserAuthToken()
        },
        data: JSON.stringify({
          ver: "1.0.0",
          timestamp: new Date().toISOString(),
          txnId: v4(),
          entityId: this._clientId,
        }),
      });

      const secretExpiry = new Date(res.data.expiresOn);

      secret = res.data.secret;

      if (secretExpiry > subDays(new Date(), 5)) {
        secret = await this._resetSecret();
      }

      await this._cache.set(secretCacheKey, secret, 59 * 86400); // set for 59 days

    }

    return secret;
  }

  private async _generateToken() {
    try {
      const url = `${this._tokenUrl}/iam/v1/entity/token/generate`;
      const res = await this._httpClient.request({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          id: this._clientId,
          secret: await this._getSecret(),
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

  private async _getEntityInfo(type: string, id: string = "") {
    try {
      let url = `${this._baseUrl}/entityInfo/${type}`;
      if (id) {
        url = `${url}/${id}`;
      }
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

  private async _getPublicKey(keyId: string) {
    try {
      const data = await this._cache.get(`${publicCacheKey}-${keyId}`);
      if (data) {
        return JSON.parse(data);
      }
      const url = `${this._tokenUrl}/auth/realms/sahamati/protocol/openid-connect/certs`;
      const res = await this._httpClient.request({
        url,
        method: "GET",
      });

      const key = res.data.keys.find(
        (item: Record<string, any>) => item.kid === keyId,
      );

      if (!key) {
        return Promise.reject({
          status: 401,
          error: "wrong key",
        });
      }

      const resData = {
        status: res.status,
        data: toPem(key.n, key.e),
      };

      await this._cache.set(
        `${publicCacheKey}-${keyId}`,
        JSON.stringify(resData),
      );
      return resData;
    } catch (err) {
      return Promise.reject({
        status: err.response.status,
        error: err.response.data,
      });
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
          token: res.data.accessToken,
          expiry: res.data.expiresIn,
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

  public async getAAById(id: string) {
    return await this._getEntityInfo(EntityType.AA, id);
  }

  public async getFIPById(id: string) {
    return await this._getEntityInfo(EntityType.FIP, id);
  }

  public async getFIUById(id: string) {
    return await this._getEntityInfo(EntityType.FIU, id);
  }

  public async verifyToken(token: string) {
    try {
      const decoded = JWT.decode(token, { complete: true });
      const keyId = decoded.header.kid;
      const res = await this._getPublicKey(keyId);
      const payload = JWT.verify(token, res.data, {
        algorithms: ["RS256"],
      });

      if (!payload) {
        return { isVerified: false };
      }

      return { isVerified: true, payload };
    } catch (err) {
      return Promise.resolve({ isVerified: false });
    }
  }
}

export default CentralRegistry;
