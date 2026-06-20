// Serves the static site as-is, except for /careers?job=<slug> requests:
// there it rewrites <title>/og:title/description/og:description/og:url
// server-side so link previews (WhatsApp, etc.) show the specific job,
// since those crawlers don't execute careers-cms.js client-side.
const ADMIN_API = 'https://admin.apexrmgroup.com';

function stripHtml(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isCareersPage = url.pathname === '/careers' || url.pathname === '/careers.html';
    const slug = url.searchParams.get('job');

    if (!isCareersPage || !slug) {
      const res = await env.ASSETS.fetch(request);
      const passthrough = new Response(res.body, res);
      passthrough.headers.set('X-Worker-Debug', 'passthrough:' + url.pathname + ':' + (slug || 'no-slug'));
      return passthrough;
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const contentType = assetResponse.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return assetResponse;

    let job = null;
    let debugInfo = 'ok';
    try {
      const apiRes = await fetch(ADMIN_API + '/api/public/careers');
      debugInfo = 'apiStatus:' + apiRes.status;
      if (apiRes.ok) {
        const data = await apiRes.json();
        job = (data.items || []).find((j) => j.slug === slug) || null;
        debugInfo += ',itemCount:' + (data.items || []).length + ',found:' + !!job;
      }
    } catch (e) {
      debugInfo = 'fetchError:' + e.message;
    }

    if (!job) {
      const fallback = new Response(assetResponse.body, assetResponse);
      fallback.headers.set('X-Worker-Debug', 'no-job:' + debugInfo);
      return fallback;
    }

    const title = job.title + ' | Careers at APEX R&M GROUP Ltd';
    const descSource = stripHtml(job.description) || ('Apply for ' + job.title + ' at APEX R&M GROUP Ltd.');
    const description = descSource.length > 200 ? descSource.slice(0, 197) + '...' : descSource;
    const pageUrl = url.toString();

    const rewritten = new HTMLRewriter()
      .on('title', { element(el) { el.setInnerContent(title); } })
      .on('meta[name="description"]', { element(el) { el.setAttribute('content', description); } })
      .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', title); } })
      .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', description); } })
      .on('meta[property="og:url"]', { element(el) { el.setAttribute('content', pageUrl); } })
      .transform(assetResponse);
    rewritten.headers.set('X-Worker-Debug', 'rewritten:' + debugInfo);
    return rewritten;
  },
};
