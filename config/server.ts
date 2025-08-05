export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env(
    "PUBLIC_STRAPI_URL",
    "https://talented-passion-a72e3db6e4.strapiapp.com"
  ),
  app: {
    keys: env.array("APP_KEYS"),
  },
});
