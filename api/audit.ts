import * as cheerio from 'cheerio';

/* ─────────────────────────────────────────────────────────────────
   HTML parser — inlined here so Vercel bundles it with the function
   (cross-directory imports from src/ are not auto-bundled)
───────────────────────────────────────────────────────────────── */
function parseHtml(html: string) {
  if (!html || typeof html !== 'string') {
    return {
      title: 'No title tag found',
      metaDescription: 'No meta description found',
      h1Count: 0,
      imagesMissingAlt: 0,
      wordCount: 0,
    };
  }

  const $ = cheerio.load(html);

  // Title
  const titleText = $('title').first().text().trim();
  const title = titleText || 'No title tag found';

  // Meta description (name or og:description fallback)
  let description = $('meta[name="description"]').first().attr('content')?.trim() || '';
  if (!description) {
    description = $('meta[property="og:description"]').first().attr('content')?.trim() || '';
  }
  const metaDescription = description || 'No meta description found';

  // H1 count
  const h1Count = $('h1').length;

  // Images missing alt
  let imagesMissingAlt = 0;
  $('img').each((_, elem) => {
    const alt = $(elem).attr('alt');
    if (alt === undefined || alt.trim() === '') imagesMissingAlt++;
  });

  // Word count — strip non-visible tags first
  const rootElement = ($('body').length > 0 ? $('body') : $.root()) as any;
  const contentClone = rootElement.clone();
  contentClone.find('script, style, svg, iframe, noscript, path, link, meta, head').remove();
  const words = contentClone
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w: string) => w.length > 0);

  return { title, metaDescription, h1Count, imagesMissingAlt, wordCount: words.length };
}

/* ─────────────────────────────────────────────────────────────────
   Serverless handler — GET /api/audit?url=<target>
───────────────────────────────────────────────────────────────── */
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url: targetUrl } = req.query;

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({
      error: 'Missing URL parameter. Please query /api/audit?url=https://example.com'
    });
  }

  // Normalize URL
  let cleanUrl = targetUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  // Validate format
  try {
    new URL(cleanUrl);
  } catch (_) {
    return res.status(400).json({
      error: 'Invalid URL format. Please enter a valid address (e.g. google.com).'
    });
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const fetchResponse = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PagePulse-Auditor/1.0 (Digital Heroes Training Task)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Math.round(performance.now() - startTime);

    // Reject non-HTML responses
    const contentType = fetchResponse.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return res.status(400).json({
        error: `Only HTML pages can be audited. Provided URL returned content-type: '${contentType}'.`,
        status: fetchResponse.status,
        responseTimeMs
      });
    }

    const htmlText = await fetchResponse.text();
    const auditMetrics = parseHtml(htmlText);

    return res.status(200).json({
      url: cleanUrl,
      status: fetchResponse.status,
      responseTimeMs,
      ...auditMetrics
    });

  } catch (err: any) {
    clearTimeout(timeoutId);
    const responseTimeMs = Math.round(performance.now() - startTime);

    if (err.name === 'AbortError') {
      return res.status(408).json({
        error: 'Request timed out. The website took too long (more than 8 seconds) to respond.',
        responseTimeMs
      });
    }

    return res.status(520).json({
      error: `Failed to fetch page: ${err.message || 'Unknown network error. Check if the domain is correct and active.'}`,
      responseTimeMs
    });
  }
}
