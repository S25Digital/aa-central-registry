import { expect } from "chai";
import nock from "nock";

import config from "../src/config";
import getCRClient from "../src";
import { EntityType } from "../src/enums";
import { cache } from "../src/cache";
import { signedToken } from "./data";

const client = getCRClient();
const key = "S25--CR--TOKEN--KEY--1000";

let serverSetup: nock.Scope;
let crSetup: nock.Scope;

describe("The Central Registry Client", () => {
  describe("The getToken Method", () => {
    describe("When a token response is returned from Central registry service", () => {
      before(() => {
        serverSetup = nock(config.tokenUrl)
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

    describe("When get token is called again", () => {
      it("should return the token from the cache", async () => {
        const res = await client.getToken();
        expect(res).to.deep.equal({
          status: 200,
          data: { token: "token", expiry: 86400 },
        });
      });
    });

    describe("When there is an error in token response from Central registry service", () => {
      before(() => {
        cache.remove(key);
        serverSetup = nock(config.tokenUrl)
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
        serverSetup = nock(config.tokenUrl)
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

        crSetup = nock(config.baseUrl)
          .get(`/entityInfo/${entity}`)
          .matchHeader("authorization", "Bearer token")
          .reply(200, [{
            foo: "bar",
          }])
          .get(`/entityInfo/${entity}/test`)
          .matchHeader("authorization", "Bearer token")
          .reply(200, {
            foo: "bar",
          });
      });
      after(() => {
        serverSetup.removeAllListeners();
        crSetup.removeAllListeners();
      });
      describe("when a response is returned from the central registry", () => {
        it("should return the response as it is received", async () => {
          const res = await client[`get${entity}`]();

          expect(res).to.deep.equal({
            data: [{
              foo: "bar",
            }],
            status: 200,
          });
        });
      });

      describe("when a response is returned from the central registry for a specific id", () => {
        it("should return the response as it is received", async () => {
          const res = await client[`get${entity}ById`]("test");

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

  describe("The verify method", () => {
    describe("when the key is available", () => {
      before(() => {
        serverSetup = nock(config.tokenUrl)
          .get("/auth/realms/sahamati/protocol/openid-connect/certs")
          .reply(200, {
            keys: [
              {
                kty: "RSA",
                n: "kR-r0qH9Po_2VG0Eb8PxTiheNLW1owVjlYHxtLwN39FFxSKAf7XmEqUOOwuYjzf2J6esEdQ01aEOKJ-G13CKVRNNBl2LrZGeF4XmbfmIxuZdkcHhjjrtBz6sCMEIzLax0AzLZEUMrnOV7Qc2lDgJvNl8S9Pvxut1TvgYTE0uNvl52LiDL6Kda1UZpVzAFh8vD7FJqJWNa115RqHtYL7TGolTFHyJOuPcKUV1h_RvxYA5enBp7qqoq_F8FFQxHw0kEbTdG6wDsMDF-Qr5oOdvRm_hIJ15Jc6SpjdU5YEb5B7-cCJ9uM1aYe6ZkTw1lCX1J_qX9a5_6qhBg07HZk38pQ",
                e: "AQAB",
                alg: "RS256",
                kid: "test",
                use: "sig",
              },
            ],
          });
      });
      after(() => {
        serverSetup.removeAllListeners();
      });
      it("should verify the token", async () => {
        const res = await client.verifyToken(signedToken);

        expect(res).to.deep.equal({
          isVerified: true,
          payload: {
            foo: "bar",
          },
        });
      });
    });

    describe("when the key is not available", () => {
      before(() => {
        cache.remove("S25--CR--PUBLIC--KEY--1001-test");
        serverSetup = nock(config.tokenUrl)
          .get("/auth/realms/sahamati/protocol/openid-connect/certs")
          .reply(200, {
            keys: [
              {
                kty: "RSA",
                n: "kR-r0qH9Po_2VG0Eb8PxTiheNLW1owVjlYHxtLwN39FFxSKAf7XmEqUOOwuYjzf2J6esEdQ01aEOKJ-G13CKVRNNBl2LrZGeF4XmbfmIxuZdkcHhjjrtBz6sCMEIzLax0AzLZEUMrnOV7Qc2lDgJvNl8S9Pvxut1TvgYTE0uNvl52LiDL6Kda1UZpVzAFh8vD7FJqJWNa115RqHtYL7TGolTFHyJOuPcKUV1h_RvxYA5enBp7qqoq_F8FFQxHw0kEbTdG6wDsMDF-Qr5oOdvRm_hIJ15Jc6SpjdU5YEb5B7-cCJ9uM1aYe6ZkTw1lCX1J_qX9a5_6qhBg07HZk38pQ",
                e: "AQAB",
                alg: "RS256",
                kid: "test1",
                use: "sig",
              },
            ],
          });
      });
      after(() => {
        serverSetup.removeAllListeners();
      });
      it("should reject the token", async () => {
        const res = await client.verifyToken(signedToken);

        expect(res).to.deep.equal({
          isVerified: false,
        });
      });
    });
  });
});
