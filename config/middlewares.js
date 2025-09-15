// app/config/middlewares.js
module.exports = [
  'strapi::errors',

{ resolve: './src/middlewares/bpProxy' },


  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],   // we inject a <link> to /bp/css/Common.css (same origin)
          "font-src": ["'self'", "data:"],              // fonts now come from our origin via the proxy
          "img-src": ["'self'", "data:"],
          "connect-src": ["'self'"],
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
