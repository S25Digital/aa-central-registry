# aa-central-registry

The package facilitates the integration with Account Aggregator Central Registry Hosted by Sahamati.

The client supports the generation of the auth token, fetch  of entities like FIP, FIU and AA.

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## Environment Vars
Following env vars nned to be set for the package to work.
  - `CR_BASE_URL`: Base URl of the central registry provided by Sahamati.
  - `CR_CLIENT_ID`: Client Id obtained when you are onboarded.
  - `CR_CLIENT_SECRET`: Client secret obtained when you are onboarded.
  - `CR_TOKEN_BASE_URL`: Base Url of the token service provided by Sahamati.

## Installation

```bash

npm i @s25digital/aa-central-registry

```

## Usage

```typescript
import getCRClient from "@s25digital/aa-central-registry";

const client = getCRClient();

// get a token from registry
const token = await client.getToken();

// get Entity Information
const AAList = await client.getAA();

const FIPList = await client.getFIP();

const FIUList = await client.getFIU();
```

## Using a cache
The package implements an in memory cache to store the token. You can replace this in memory cache by implementing a custom cachee with a specific interface mentioned below.

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

## Verification of token
The package also includes a function to verify th tokn. The keys are fetched from the certs endpoint of the service and verified using thee jsonwebtoken package.

```typescript
import getCRClient from "@s25digital/aa-central-registry";

const client = getCRClient();

const res = await client.verifyToken("JWT TOkEN HERE");

console.log(res);

/*
{
  isVerified: true, 
  payload: {...}
}
*/
```

## Resources

- [Sahamati Website](https://sahamati.org.in/)
- [Sahamati github](https://github.com/Sahamati)
- [Central Registry Docs](https://github.com/Sahamati/aa-common-service)

The package is developed and maintained by [S25Digital Studio](https://s25.digital)
