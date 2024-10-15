const { default: getCRlient, getRedisCache } = require("../dist");

async function test() {
  const cache = await getRedisCache("redis://localhost:6379");
  const client = getCRlient({
    loggerLevel: "debug",
    cache,
  });
  const res = await client.getToken();

  const verifyInfo = await client.verifyToken(res.data.token);

  return { res, verifyInfo };
}

return test()
  .then((data) => console.log(data))
  .catch((err) => console.log(JSON.stringify(err)));
