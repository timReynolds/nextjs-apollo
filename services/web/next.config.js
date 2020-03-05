// https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
module.exports = {
  poweredByHeader: false,
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: "secret"
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    environment: process.env.ENVIROMENT || "localhost"
  }
};
