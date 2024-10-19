import { Axios } from "axios";
import JWT, { JwtPayload } from "jsonwebtoken";
import toPem from "rsa-pem-from-mod-exp";
import { v4 } from "uuid";
import { subDays } from "date-fns";
import { EntityType } from "./enums";
import { ICache } from "./cache";
import { Logger } from "pino";

interface ICentralRegistry {
  url: string;
  clientId: string;
  httpClient: Axios;
  cache: ICache;
  tokenUrl: string;
  username: string;
  password: string;
  logger: Logger;
  hardResetSecret?: boolean;
}

const key = "S25--CR--TOKEN--KEY--1000";
const publicCacheKey = "S25--CR--PUBLIC--KEY--1001";
const secretCacheKey = "S25--CR--SECRET--KEY--1003";

class CentralRegistry {
  private readonly _baseUrl: string;
  private readonly _clientId: string;
  private readonly _httpClient: Axios;
  private readonly _cache: ICache;
  private readonly _tokenUrl: string;
  private readonly _username: string;
  private readonly _password: string;
  private readonly _hardResetSecret: boolean = false;
  private readonly _logger: Logger;

  constructor(opts: ICentralRegistry) {
    this._baseUrl = opts.url;
    this._clientId = opts.clientId;
    this._httpClient = opts.httpClient;
    this._cache = opts.cache;
    this._tokenUrl = opts.tokenUrl;
    this._username = opts.username;
    this._password = opts.password;
    this._logger = opts.logger;
    this._hardResetSecret = opts.hardResetSecret ?? false;
  }

  private async _generateUserAuthToken() {
    this._logger.debug({
      message: "Generating Admin token for processing",
    });
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

    this._logger.debug({
      message: "Admin Token generation was successful",
    });

    return res.data.accessToken;
  }

  private async _resetSecret() {
    this._logger.debug({
      message: "Resetting secret",
    });

    const Authorization = await this._generateUserAuthToken();
    const url = `${this._tokenUrl}/iam/v1/entity/secret/reset`;
    const res = await this._httpClient.request({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization
      },
      data: JSON.stringify({
        ver: "1.0.0",
        timestamp: new Date().toISOString(),
        txnId: v4(),
        entityId: this._clientId,
      }),
    });

    this._logger.debug({
      message: "Secret Reset successful",
    });

    return res.data.secret;
  }

  private async _getSecret() {
    this._logger.debug({
      message: "Get current secret",
    });
    if (this._hardResetSecret == true) {
      this._logger.debug({
        message: "Hard resetting secret",
      });
      const secret = await this._resetSecret();
      await this._cache.set(secretCacheKey, secret, 59 * 86400); // set for 59 days
    }

    let secret = await this._cache.get(secretCacheKey);

    if (!secret) {
      this._logger.debug({
        message: "Reading Secret",
      });
      const Authorization = await this._generateUserAuthToken();
      const url = `${this._tokenUrl}/iam/v1/entity/secret/read`;
      const res = await this._httpClient.request({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization
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

      if (new Date() > subDays(secretExpiry, 5)) {
        this._logger.debug({
          message: "Secret Expired, Reset Secret",
        });
        secret = await this._resetSecret();
      }
      await this._cache.set(secretCacheKey, secret, 59 * 86400); // set for 59 days
    }

    this._logger.debug({
      message: "Secret Read and returning",
    });

    return secret;
  }

  private async _generateToken() {
    try {
      this._logger.debug({
        message: "Generating Entity Token",
      });
      const secret = await this._getSecret();
      const url = `${this._tokenUrl}/iam/v1/entity/token/generate`;
      const res = await this._httpClient.request({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          id: this._clientId,
          secret
        }),
      });

      this._logger.debug({
        message: "Returning entity token",
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

  private async _getPublicKey(iss: string, keyId: string) {
    this._logger.debug({
      message: "Fetch CR Public key for verification",
    });
    try {
      const data = await this._cache.get(`${publicCacheKey}-${keyId}`);
      if (data) {
        this._logger.debug({
          message: "Public Key: Returning from cache",
        });
        return JSON.parse(data);
      }
      const url = `${iss}/protocol/openid-connect/certs`;
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
      this._logger.error({
        message: "Issue in fetching the public key",
        status: err.response.status,
        error: err.response.data,
      });
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
      this._logger.error({
        message: "Issue in getting the token",
        status: err.status,
        error: err.error,
      });
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
      const { iss } = decoded.payload as JwtPayload;
      const res = await this._getPublicKey(iss, keyId);
      const payload = JWT.verify(token, res.data, {
        algorithms: ["RS256"],
      });

      if (!payload) {
        return { isVerified: false };
      }

      return { isVerified: true, payload };
    } catch (err) {
      this._logger.error({
        message: "Issue in token verification",
        err
      })
      return Promise.resolve({ isVerified: false });
    }
  }
}

export default CentralRegistry;
