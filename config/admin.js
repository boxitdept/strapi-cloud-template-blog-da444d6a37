const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;
const jwt = require('jsonwebtoken');

module.exports = ({ env }) => ({
  apiToken: { salt: env('API_TOKEN_SALT') },
  transfer: { token: { salt: env('TRANSFER_TOKEN_SALT') } },
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    providers: [
      {
        uid: 'azure_ad_oauth2',
        displayName: 'Microsoft Entra ID',
        icon: 'https://learn.microsoft.com/favicon.ico',
        createStrategy: (strapi) =>
          new AzureAdOAuth2Strategy(
            {
              authorizationURL: `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/oauth2/v2.0/authorize`,
              tokenURL: `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/oauth2/v2.0/token`,
              clientID: env('AZURE_CLIENT_ID'),
              clientSecret: env('AZURE_CLIENT_SECRET'),
              callbackURL: `${env('ADMIN_URL')}/connect/azure_ad_oauth2/callback`,
              scope: ['openid', 'profile', 'email'],
              passReqToCallback: false,
              state: true,
            },
            (accessToken, refreshToken, params, profile, done) => {
              const claims = jwt.decode(params.id_token);
              const email = claims.email || claims.preferred_username || claims.upn;
              done(null, {
                email: email,
                username: claims.preferred_username || claims.name || email,
              });
            }
          ),
      },
    ],
  },
});
