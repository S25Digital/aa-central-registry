const { default: getCRlient, getRedisCache } = require("../dist");



async function test() {
  const cache = await getRedisCache("redis://localhost:6379")
  const client = getCRlient({
    loggerLevel: "debug",
    cache
  });
  return await client.getToken();
}

return test()
  .then((data) => console.log(data))
  .catch((err) => console.log(JSON.stringify(err)));
