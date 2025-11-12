// app/config/middlewares.js
module.exports = [
  'strapi::errors',

  // keep your proxy
  { resolve: './src/middlewares/bpProxy' },

  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // keep admin JS tight
          "script-src": ["'self'"],

          // you already rely on inline styles; leaving it enabled
          "style-src": ["'self'", "'unsafe-inline'"],

          // fonts coming from your origin or data URLs
          "font-src": ["'self'", "data:"],

          // allow your images, data URIs, and the Entra icon host
          "img-src": ["'self'", "data:", "blob:", "learn.microsoft.com"],

          // allow audio/video from self or data/blob (future-proof, harmless)
          "media-src": ["'self'", "data:", "blob:"],

          // let the admin talk to HTTPS endpoints (OAuth, APIs, telemetry, etc.)
          "connect-src": ["'self'", "https:"],

          // if you ever embed iframes (NetSuite forms, etc.), this keeps them working
          "frame-src": ["'self'", "https:"],

          // don’t force http→https upgrades in dev; avoids local loop issues
          upgradeInsecureRequests: null,
        },
      },
    },
  },

  'strapi::cors',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
