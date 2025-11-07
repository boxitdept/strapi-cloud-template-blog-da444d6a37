const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;
const jwt = require('jsonwebtoken');

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('ADMIN_API_TOKEN_SALT'),         // fixes deprecation warning
  },
  transfer: {
    token: { salt: env('ADMIN_TRANSFER_TOKEN_SALT') }, // fixes "Missing transfer.token.salt"
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    providers: [
      {
        uid: 'azure_ad_oauth2',                // must be exactly this
        displayName: 'Microsoft Entra ID',
        icon: 'https://learn.microsoft.com/favicon.ico',
        createStrategy: () =>
          new AzureAdOAuth2Strategy(
            {
              authorizationURL: `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/oauth2/v2.0/authorize`,
              tokenURL:        `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/oauth2/v2.0/token`,
              clientID: env('AZURE_CLIENT_ID'),
              clientSecret: env('AZURE_CLIENT_SECRET'),
              callbackURL: `${env('ADMIN_URL')}/connect/azure_ad_oauth2/callback`, // path matches uid
              scope: ['openid', 'profile', 'email'],
              passReqToCallback: false,
            },
            (accessToken, refreshToken, params, _profile, done) => {
              try {
                const claims = params.id_token ? (jwt.decode(params.id_token) || {}) : {};
                const email =
                  claims.email ||
                  claims.preferred_username ||
                  claims.upn ||
                  null;

                if (!email) return done(new Error('Entra ID did not include an email/UPN claim'));

                const username = claims.preferred_username || claims.name || email;
                return done(null, { email, username });
              } catch (e) {
                return done(e);
              }
            }
          ),
      },
    ],
  },
});
