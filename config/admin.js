module.exports = ({ env }) => ({
  apiToken: { salt: env('ADMIN_API_TOKEN_SALT') },
  auth: { secret: env('ADMIN_JWT_SECRET') },
});
