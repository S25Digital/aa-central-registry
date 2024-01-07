import axios, { Axios } from "axios";
import { EntityType } from "./enums";
import config from "./config";

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

      return res.data;
    } catch (err) {
      console.log(err);
    }
  }

  private async _getEntityInfo(type: string) {
    const url = `${this._baseUrl}/entityInfo/${type}/`;
    const token = await this.getToken();
    const res = await this._httpClient.request({
      url,
      method: "GET",
      headers: {
        authorization: token,
        "Content-Type": "application/json",
      },
    });

    return res;
  }

  public async getToken() {
    return await this._generateToken();
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
