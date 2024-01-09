import { Axios, AxiosError } from "axios";
import { EntityType } from "./enums";

interface ICentralRegistry {
  url: string;
  clientId: string;
  clientSecret: string;
  httpClient: Axios;
}

class CentralRegistry {
  private _baseUrl: string;
  private _basicAuth: string;
  private _httpClient: Axios;

  constructor(opts: ICentralRegistry) {
    this._baseUrl = opts.url;
    this._basicAuth = btoa(`${opts.clientId}:${opts.clientSecret}`);
    this._httpClient = opts.httpClient;
  }

  private async _generateToken() {
    try {
      const url = `${this._baseUrl}/auth/realms/sahamati/protocol/openid-connect/token`;
      const res = await this._httpClient.request({
        url,
        method: "POST",
        headers: {
          authorization: `Basic ${this._basicAuth}`,
          "Content-Type": "appliccation/x-www-form-urlencoded",
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
    const url = `${this._baseUrl}/entityInfo/${type}/`;
    const { data } = await this.getToken();
    const res = await this._httpClient.request({
      url,
      method: "GET",
      headers: {
        authorization: data.token,
        "Content-Type": "application/json",
      },
    });

    return res;
  }

  public async getToken() {
    try {
      const res = await this._generateToken();
      return {
        status: res.status,
        data: {
          token: res.data.access_token,
          expiry: res.data.expires_in,
        },
      };
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
}

export default CentralRegistry;
