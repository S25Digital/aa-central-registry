import axios from "axios";
import CentralRegistry from "./client";
import config from "./config";

let client: CentralRegistry;

export default function getCRClient() {
  if (client) {
    return client;
  }

  client = new CentralRegistry({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    url: config.baseUrl,
    httpClient: axios
  });
}
