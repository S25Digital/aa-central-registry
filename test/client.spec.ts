import { expect } from "chai";
import nock from "nock";
import config from "src/config";

import getCRClient from "src";

const client = getCRClient();

describe("The Central Registry Client", () => {
  describe("The getToken Method", () => {
    describe("When a token response is returned from Central registry service", () => {
      before(() => {
        nock(config.baseUrl)
          .post(
            "/auth/realms/sahamati/protocol/openid-connect/token",
            new URLSearchParams({
              grant_type: "client_credentials",
              scope: "openid",
            }).toString(),
          )
          .matchHeader("Content-Type", "appliccation/x-www-form-urlencoded")
          .basicAuth({ user: config.clientId, pass: config.clientSecret })
          .reply(200, {
            access_token: "token",
            expires_in: 86400,
            token_type: "Bearer",
          });
      });
      it("should return the token after parsing the response", async () => {
        const res = await client.getToken();
        expect(res).to.deep.equal({
          status: 200,
          data: { token: "token", expiry: 86400 },
        });
      });
    });
    describe("When there is an error in token response from Central registry service", () => {
      before(() => {
        nock(config.baseUrl)
          .post(
            "/auth/realms/sahamati/protocol/openid-connect/token",
            new URLSearchParams({
              grant_type: "client_credentials",
              scope: "openid",
            }).toString(),
          )
          .matchHeader("Content-Type", "appliccation/x-www-form-urlencoded")
          .basicAuth({ user: config.clientId, pass: config.clientSecret })
          .reply(400, {
            message: "Error",
          });
      });
      it("should return the token after parsing the response", async () => {
        const res = await client.getToken();
        expect(res).to.deep.equal({
          status: 400,
          error: {
            message: "Error",
          },
        });
      });
    });
  });
});
