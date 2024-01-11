import { expect } from "chai";
import nock from "nock";
import config from "src/config";

import getCRClient from "src";
import { EntityType } from "src/enums";

const client = getCRClient();

let serverSetup: nock.Scope;

describe("The Central Registry Client", () => {
  describe("The getToken Method", () => {
    describe("When a token response is returned from Central registry service", () => {
      before(() => {
        serverSetup = nock(config.baseUrl)
          .post(
            "/auth/realms/sahamati/protocol/openid-connect/token",
            new URLSearchParams({
              grant_type: "client_credentials",
              scope: "openid",
            }).toString(),
          )
          .matchHeader("Content-Type", "application/x-www-form-urlencoded")
          .basicAuth({ user: config.clientId, pass: config.clientSecret })
          .reply(200, {
            access_token: "token",
            expires_in: 86400,
            token_type: "Bearer",
          });
      });

      after(() => {
        serverSetup.removeAllListeners();
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
        serverSetup = nock(config.baseUrl)
          .post(
            "/auth/realms/sahamati/protocol/openid-connect/token",
            new URLSearchParams({
              grant_type: "client_credentials",
              scope: "openid",
            }).toString(),
          )
          .matchHeader("Content-Type", "application/x-www-form-urlencoded")
          .basicAuth({ user: config.clientId, pass: config.clientSecret })
          .reply(400, {
            message: "Error",
          });
      });

      after(() => {
        serverSetup.removeAllListeners();
      });
      it("should return the status and error", async () => {
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

  [EntityType.AA, EntityType.FIP, EntityType.FIU].map((entity) => {
    describe(`The getEntity method for ${entity}`, () => {
      before(() => {
        serverSetup = nock(config.baseUrl)
          .post(
            "/auth/realms/sahamati/protocol/openid-connect/token",
            new URLSearchParams({
              grant_type: "client_credentials",
              scope: "openid",
            }).toString(),
          )
          .matchHeader("Content-Type", "application/x-www-form-urlencoded")
          .basicAuth({ user: config.clientId, pass: config.clientSecret })
          .reply(200, {
            access_token: "token",
            expires_in: 86400,
            token_type: "Bearer",
          })
          .get(`/entityInfo/${entity}/`)
          .matchHeader("authorization", "Bearer token")
          .reply(200, {
            foo: "bar",
          });
      });
      after(() => {
        serverSetup.removeAllListeners();
      });
      describe("when a response is returned from the central registry", () => {
        it("should return the response as it is received", async () => {
          const res = await client[`get${entity}`]();

          expect(res).to.deep.equal({
            data: {
              foo: "bar",
            },
            status: 200,
          });
        });
      });
    });
  });
});
