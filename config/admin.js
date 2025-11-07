const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;
const jwt = require('jsonwebtoken');

module.exports = ({ env }) => ({
  // Use the names Strapi expects, or it will complain forever.
  apiToken: {
    // WARNING text literally says: apiToken.salt from env('API_TOKEN_SALT')
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      // And this one is TRANSFER_TOKEN_SALT
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    providers: [
      {
        uid: 'azure_ad_oauth2',
        displayName: 'Microsoft Entra ID',
        icon: 'https://learn.microsoft.com/favicon.ico',
        createStrategy: () =>
          new AzureAdOAuth2Strategy(
            {
              authorizationURL: `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/oauth2/v2.0/authorize`,
              tokenURL:        `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/oauth2/v2.0/token`,
              clientID: env('AZURE_CLIENT_ID'),
              clientSecret: env('AZURE_CLIENT_SECRET'),
              callbackURL: `${env('ADMIN_URL')}/connect/azure_ad_oauth2/callback`,
              scope: ['openid', 'profile', 'email'],
              passReqToCallback: false,
            },
            (accessToken, refreshToken, params, _profile, done) => {
              try { console.log('[SSO][Entra] verify fired', { hasId: !!(params try {try { params.id_token) });
                const claims = params?.id_token ? (jwt.decode(params.id_token) || {}) : {};

                // Minimal debug so we can see what Entra sent; rate-limited to once per minute
                try {
                  const now = Math.floor(Date.now() / 60000);
                  if (!global.__strapiAzureLogMinute || global.__strapiAzureLogMinute !== now) {
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

                // Be generous with email source. Some tenants don't emit email claim.
                const emailCandidate =
                  claims.email ||
                  claims.preferred_username ||
                  claims.upn ||
                  claims.unique_name ||
                  null;

                if (!emailCandidate) {
                  return done(new Error('Entra ID did not include an email/UPN claim'));
                }

                const email = String(emailCandidate).toLowerCase();
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
