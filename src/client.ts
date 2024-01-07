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
    
  }
}
