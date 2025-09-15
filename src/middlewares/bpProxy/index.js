// src/middlewares/bpProxy/index.js
// Proxies https://www.boxpartners.com assets under /bp/* so the admin
// can load CSS/fonts from the same origin without CORS drama.
module.exports = (config, { strapi }) => {
  const upstreamOrigin = 'https://www.boxpartners.com';

  return async (ctx, next) => {
    // Only handle GET/HEAD to /bp/*
    if (!ctx.path.startsWith('/bp/') || !['GET', 'HEAD'].includes(ctx.method)) {
      return next();
    }

    // Build target URL, preserving querystring
    // /bp/css/strapi.css  ->  https://www.boxpartners.com/css/strapi.css
    const upstreamPath = ctx.path.replace(/^\/bp\//, '');
    const targetUrl = new URL(upstreamPath + (ctx.search || ''), upstreamOrigin).toString();

    // Small timeout so we don't hang the admin if upstream is slow
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    let res;
    try {
      res = await fetch(targetUrl, {
        method: ctx.method,
        redirect: 'follow',
        // Keep it simple; upstream can compress. Node 20 fetch handles gzip/br.
        signal: controller.signal,
        // Light UA so upstream CDNs don’t act weird
        headers: {
          'User-Agent': 'StrapiProxy/1.0 (+bpProxy)',
        },
      });
    } catch (err) {
      clearTimeout(t);
      strapi.log.warn(`bpProxy: fetch error for ${targetUrl}: ${err.message}`);
      ctx.status = 502;
      ctx.body = 'Bad Gateway';
      return;
    }
    clearTimeout(t);

    // Pass through status
    ctx.status = res.status;

    // Content-Type (default binary so fonts don’t get mangled)
    const ct = res.headers.get('content-type') || 'application/octet-stream';
    ctx.set('Content-Type', ct);

    // Cache a bit; upstream can still set stronger cache headers
    // Prefer upstream Cache-Control/ETag/Last-Modified if present
    const cc = res.headers.get('cache-control');
    if (cc) ctx.set('Cache-Control', cc);
    else ctx.set('Cache-Control', 'public, max-age=300');

    const etag = res.headers.get('etag');
    if (etag) ctx.set('ETag', etag);

    const lm = res.headers.get('last-modified');
    if (lm) ctx.set('Last-Modified', lm);

    // Friendly CORS for our own origin (keeps the browser happy)
    ctx.set('Access-Control-Allow-Origin', ctx.origin);
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Vary', 'Origin');

    // Don’t stream HTML error pages into CSS/font responses if upstream 4xx/5xx
    if (!res.ok && ct.includes('text/html')) {
      ctx.body = `Upstream error ${res.status}`;
      return;
    }

    // Body for GET; HEAD returns headers only
    if (ctx.method === 'HEAD') {
      ctx.body = null;
      return;
    }

    // Buffer the asset so Koa sets correct length and type
    const buf = Buffer.from(await res.arrayBuffer());
    ctx.length = buf.length;
    ctx.body = buf;
  };
};
