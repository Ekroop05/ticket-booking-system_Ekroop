const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL || "https://divine-turkey-3833.upstash.io"
});

client.on("error", (err) => {
  console.log("Redis Error:", err);
});

(async () => {
  await client.connect();
  console.log("Redis Connected");
})();

module.exports = client;