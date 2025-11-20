// app/config/middlewares.js
//
// Global middleware configuration for the Strapi application.
// This file controls request handling, security headers (CSP),
// proxy behavior, and core Strapi middleware order.

module.exports = [
  // Handles application errors and formats them consistently.
  'strapi::errors',

  // Custom proxy middleware to serve selected assets from
  // https://www.boxpartners.com under a local /bp/* path.
  // This keeps admin asset loading aligned with same-origin rules.
  { resolve: './src/middlewares/bpProxy' },

  // Security middleware configuration, including Content Security Policy (CSP).
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        // Start from Strapi's default CSP values for a secure baseline.
        useDefaults: true,
        directives: {
          // Restrict script execution to this origin only.
          "script-src": ["'self'"],

          // Allow styles from this origin and inline styles.
          // Inline styles are required for certain admin UI components.
          "style-src": ["'self'", "'unsafe-inline'"],

          // Allow fonts from this origin and data URLs.
          // Data URLs are used for embedded font resources.
          "font-src": ["'self'", "data:"],

          // Allow images from:
          // - this origin
          // - data URLs (e.g. base64-encoded images)
          // - blob URLs (used by the admin and upload flows)
          // - learn.microsoft.com (for Entra/Azure icons or documentation)
          // - cdn.boxpartners.com (marketing assets and CDN-hosted images)
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "learn.microsoft.com",
            "cdn.boxpartners.com"
          ],

          // Allow audio/video and other media from:
          // - this origin
          // - data/blob URLs
          // - cdn.boxpartners.com for media served via the CDN
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "cdn.boxpartners.com"
          ],

          // Allow XHR/fetch/WebSocket connections to:
          // - this origin
          // - any HTTPS endpoint (e.g. OAuth providers, APIs, telemetry)
          "connect-src": ["'self'", "https:"],

          // Allow iframes from:
          // - this origin
          // - any HTTPS endpoint (e.g. embedded external forms or tools)
          "frame-src": ["'self'", "https:"],

          // Do not auto-upgrade HTTP requests to HTTPS.
          // This avoids issues in local or mixed environments.
          upgradeInsecureRequests: null,
        },
      },
    },
  },

  // Cross-Origin Resource Sharing configuration.
  // Controls which origins are allowed to access the API.
  'strapi::cors',

  // HTTP request logging for debugging and observability.
  'strapi::logger',

  // Normalizes and parses query parameters.
  'strapi::query',

  // Parses request bodies (JSON, form data, etc.).
  'strapi::body',

  // Session management for authenticated flows that use sessions.
  'strapi::session',

  // Serves the favicon for the admin panel and public site.
  'strapi::favicon',

  // Serves static assets from the public directory.
  'strapi::public',
];
