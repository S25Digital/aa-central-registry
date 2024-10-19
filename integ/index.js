const { default: getCRlient, getRedisCache } = require("../dist");

const key = "S25--CR--TOKEN--KEY--1000";
const publicCacheKey = "S25--CR--PUBLIC--KEY--1001";
const secretCacheKey = "S25--CR--SECRET--KEY--1003";

async function test() {
  const cache = await getRedisCache("redis://localhost:6379");
  await cache.remove(key);
  await cache.remove(publicCacheKey);
  await cache.remove(secretCacheKey);
  const client = getCRlient({
    loggerLevel: "debug",
    cache,
  });
  const res = await client.getToken();

  const verifyInfo = await client.verifyToken(res.data.token);

  return { res, verifyInfo };
}

return test()
  .then((data) => console.log("data", data))
  .catch((err) => console.log(JSON.stringify(err)));
