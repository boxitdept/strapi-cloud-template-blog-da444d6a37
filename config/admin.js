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
        createStrategy: (strapi) => {
          const verifyFn = (accessToken, refreshToken, params, _profile, done) => {
            try {
              const claims = params?.id_token ? (jwt.decode(params.id_token) || {}) : {};

              // Minimal debug: rate-limited to once per minute
              try {
                const now = Math.floor(Date.now() / 60000);
                if (global.__strapiAzureLogMinute !== now) {
                  global.__strapiAzureLogMinute = now;
                  console.log('[SSO][Entra] decoded claims:', {
                    tid: claims.tid,
                    oid: claims.oid,
                    sub: claims.sub,
                    name: claims.name,
                    upn: claims.upn,
                    preferred_username: claims.preferred_username,
                    email: claims.email,
                    unique_name: claims.unique_name,
                  });
                }
              } catch {}

              const emailCandidate =
                claims.email ||
                claims.preferred_username ||
                claims.upn ||
                claims.unique_name ||
                null;

              if (!emailCandidate)
                return done(new Error('Entra ID did not include an email/UPN claim'));

              const email = String(emailCandidate).toLowerCase();
              const username = claims.preferred_username || claims.name || email;

              return done(null, { email, username });
            } catch (e) {
              return done(e);
            }
          };

          return new AzureAdOAuth2Strategy(
            {
              authorizationURL: `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/oauth2/v2.0/authorize`,
              tokenURL: `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/oauth2/v2.0/token`,
              clientID: env('AZURE_CLIENT_ID'),
              clientSecret: env('AZURE_CLIENT_SECRET'),
              callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('azure_ad_oauth2'),
              scope: ['openid', 'profile', 'email'],
              passReqToCallback: false,
              state: true, // CSRF protection
            },
            verifyFn
          );
        },
      },
    ],
  },
});
