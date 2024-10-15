# aa-central-registry

## Overview

This library provides a set of functions to interact with a centralized registry service, handling authentication tokens, entity information, and token verification. It leverages JWT (JSON Web Token) for authentication, caching for performance optimization, and provides methods for managing secrets and entities.

## Features

- **Authentication Token Generation:** Generates and manages user and entity authentication tokens.
- **Secret Management:** Resets and retrieves secrets for the registered entities.
- **Entity Information Retrieval:** Fetches information for different entity types such as AA, FIP, and FIU.
- **Public Key Retrieval:** Fetches public keys for token verification.
- **JWT Token Verification:** Verifies tokens using RS256 encryption algorithm.

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## Environment Vars
Following env vars nned to be set for the package to work.
  - `CR_BASE_URL`: Base URl of the central registry provided by Sahamati.
  - `CR_CLIENT_ID`: Client Id obtained when you are onboarded.
  - `CR_TOKEN_BASE_URL`: Base Url of the token service provided by Sahamati.
  - `CR_CLIENT_USERNAME`: Username for User linked with the entity
  - `CR_CLIENT_PASSWORD`: password for User linked with the entity
  - `CR_RESET_SECRET`: Force-ful reset of the token

## Installation

```bash

npm i @s25digital/aa-central-registry

```

## Usage

1. **Setup CentralRegistry:**

   ```typescript
   import getCRClient, {getRedisCache} from "@s25digital/aa-central-registry";

   const cache = await getRedisCache("redis://localhost:6379");
   
   const centralRegistry = getCRClient({
    cache,
    loggerLevel: "silent"
   });
   ```

2. **Fetch Entity Information:**
   
   ```typescript
   const aaInfo = await centralRegistry.getAA();
   const fipInfo = await centralRegistry.getFIP();
   const fiuInfo = await centralRegistry.getFIU();
   ```

3. **Get Token:**

   Retrieve the authentication token for the client entity.

   ```typescript
   const tokenResponse = await centralRegistry.getToken();
   ```

4. **Verify Token:**

   Verify the authenticity of a token.

   ```typescript
   const verificationResponse = await centralRegistry.verifyToken("your-token-here");
   ```
5. **Using a cache**

  The package implements an in memory cache to store the token. You can replace this in memory cache by implementing a custom cache with a specific interface mentioned below.

  ```typescript
  interface ICache {
    set(key: string, value: string): Promise<boolean>;
    get(key: string): Promise<string>;
    remove(key: string): Promise<boolean>;
  }
  ```
  Once a cache is created, you can pass it on while creating a CR Client.
  
  ```typescript
  const client = getCRClient({
    cache: myCustomCache
  });
  ```

## Methods

### `getToken()`

Generates or retrieves an existing authentication token for the client entity.

### `getAA()`, `getFIP()`, `getFIU()`

Retrieves information about specific entities (Account Aggregators, Financial Information Providers, or Financial Information Users).

### `verifyToken(token: string)`

Verifies the given JWT token using the public key retrieved from the issuer.

## Resources

- [Sahamati Website](https://sahamati.org.in/)
- [Sahamati github](https://github.com/Sahamati)
- [Central Registry Docs](https://github.com/Sahamati/aa-common-service)

The package is developed and maintained by [S25Digital Studio](https://s25.digital)