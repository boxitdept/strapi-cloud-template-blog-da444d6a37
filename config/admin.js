module.exports = ({ env }) => ({
  apiToken: { salt: env('ADMIN_API_TOKEN_SALT') },
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    providers: [
      {
        uid: 'azuread',
        displayName: 'Azure AD',
        icon: 'https://learn.microsoft.com/favicon.ico',
        createStrategy: (strapi) =>
          new (require('passport-azure-ad').OIDCStrategy)(
            {
              identityMetadata: `https://login.microsoftonline.com/${env('AZURE_TENANT_ID')}/v2.0/.well-known/openid-configuration`,
              clientID: env('AZURE_CLIENT_ID'),
              clientSecret: env('AZURE_CLIENT_SECRET'),
              responseType: 'code',
              responseMode: 'query',
              redirectUrl: `${env('ADMIN_URL')}/connect/azuread/callback`,
              allowHttpForRedirectUrl: false,
              scope: ['openid', 'profile', 'email'],
              validateIssuer: true,
              passReqToCallback: true,
            },
            (req, iss, sub, profile, accessToken, refreshToken, done) => {
              done(null, {
                email: profile._json.email || profile._json.preferred_username,
                username: profile._json.preferred_username,
              });
            }
          ),
      },
    ],
  },
});
