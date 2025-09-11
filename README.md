# aa-central-registry

A lightweight TypeScript client to integrate with the Account Aggregator Ecosysetem, **Central Registry** and **Token Issuance Service** (Sahamati).  
The client handles entity-token generation, admin user token generation (for secret read/reset), secret lifecycle management, entity discovery (AA / FIP / FIU), public-key retrieval and JWT verification.

Package on npm: `@s25digital/aa-central-registry`  
Repository: [S25Digital/aa-central-registry](https://github.com/S25Digital/aa-central-registry)

---

## Table of Contents

- [Why use this package](#why-use-this-package)  
- [Features](#features)  
- [Install](#install)  
- [Quick Start](#quick-start)  
- [Public API (methods)](#public-api-methods)  
- [Environment variables / Config](#environment-variables--config)  
- [Cache interface](#cache-interface)  
- [Examples](#examples)  
- [Error handling & troubleshooting](#error-handling--troubleshooting)  
- [Security notes](#security-notes)  
- [Contributing](#contributing)  
- [License](#license)  
- [Resources](#resources)

---

## Why use this package

If your FIU/AA/FIP needs to:

- Discover other participants (base URL, public key, metadata), or  
- Programmatically validate tokens issued by other participants, or  
- Manage the entity secret lifecycle (read / reset via admin user token),

then this package wraps those Central Registry and Token Issuance Service calls and provides token caching and verification helpers so you don’t have to re-implement the flows. It follows the Sahamati Central Registry & Token Issuance Service APIs.

---

## Features

- Generate **entity tokens** (cached) for Central Registry APIs.  
- Generate **admin user tokens** (for secret read/reset ops).  
- Read / reset entity **secrets** and handle expiry logic.  
- Discover entities: list/fetch **AAs, FIPs, FIUs** (and fetch by id).  
- Fetch OIDC certs and convert `n/e` to PEM for **JWT verification** (`rsa-pem-from-mod-exp`).  
- Pluggable **cache implementation** (in-memory default; helpers for Redis available).

---

## Install

```bash
npm install @s25digital/aa-central-registry
# or
yarn add @s25digital/aa-central-registry
````

---

## Quick Start

```ts
import getCRClient, { getRedisCache } from "@s25digital/aa-central-registry";

(async () => {
  // create or reuse a cache (example redis url)
  const cache = await getRedisCache("redis://localhost:6379"); // helper provided

  // create client
  const centralRegistry = getCRClient({
    url: process.env.CR_BASE_URL,
    clientId: process.env.CR_CLIENT_ID,
    tokenUrl: process.env.CR_TOKEN_BASE_URL,
    username: process.env.CR_CLIENT_USERNAME,
    password: process.env.CR_CLIENT_PASSWORD,
    cache,
    loggerLevel: "info"
  });

  // fetch AAs
  const aa = await centralRegistry.getAA();
  console.log(aa);

  // get an entity token
  const tokenResponse = await centralRegistry.getToken();
  console.log(tokenResponse);

  // verify an incoming token
  const verification = await centralRegistry.verifyToken("eyJ...");
  console.log(verification);
})();
```

---

## Public API (methods)

All methods are asynchronous.

* `getToken()`: returns cached entity token or generates a new one.
  Returns `{ status, data: { token, expiry } }` or an error-like object.

* `getAA()`, `getFIP()`, `getFIU()`: fetch lists of entities from the Central Registry.
  Returns `{ status, data }`.

* `getAAById(id)`, `getFIPById(id)`, `getFIUById(id)`: fetch a single entity by id.

* `verifyToken(token: string)`: verifies a JWT by:

  1. decoding to get `iss` and `kid`,
  2. fetching issuer OIDC certs, converting n/e to PEM,
  3. verifying with `jsonwebtoken`.
     Returns `{ isVerified: boolean, payload? }`.

---

## Environment variables / Config

You can pass config explicitly to `getCRClient()` or rely on environment variables.

* `CR_BASE_URL` — Base URL of the Central Registry (e.g. `https://aacommons.sahamati.org.in`)
* `CR_CLIENT_ID` — Client/entity ID assigned when onboarded
* `CR_TOKEN_BASE_URL` — Base URL of Sahamati token service
* `CR_CLIENT_USERNAME` — Admin user username (for secret read/reset)
* `CR_CLIENT_PASSWORD` — Admin user password
* `CR_RESET_SECRET` — boolean (optional) — force a reset on startup

If you use the package’s `getCRClient()` wrapper, the above will be read from `process.env` if not provided explicitly.

---

## Cache interface

The client expects an `ICache` with these async methods:

```ts
interface ICache {
  set(key: string, value: string, ttlSeconds?: number): Promise<boolean>;
  get(key: string): Promise<string | null>;
  remove(key: string): Promise<boolean>;
}
```

> Note: The repo includes an in-memory cache and a Redis helper (`getRedisCache(url)`).
> If you provide a custom cache, make sure the `set` behavior supports TTL.

---

## Examples

### Get list of AAs

```ts
const aaList = await centralRegistry.getAA();
console.log(aaList);
```

### Fetch token and use it

```ts
const { data: { token } } = await centralRegistry.getToken();
// use `token` as Authorization header to call other CR-protected APIs
```

### Verify incoming JWT

```ts
const { isVerified, payload } = await centralRegistry.verifyToken(incomingToken);
if (!isVerified) {
  // reject request
}
```

---

## License

MIT — see `LICENSE` in repo.

---

## Resources

* Repo: [S25Digital/aa-central-registry](https://github.com/S25Digital/aa-central-registry)
* Sahamati Central Registry documentation: [https://aacommons.sahamati.org.in](https://aacommons.sahamati.org.in)

This package is maintained by [S25Digital Studio](https://s25.digital)