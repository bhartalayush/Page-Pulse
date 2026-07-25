import { parseHtml } from '../src/utils/parser';

/**
 * Serverless function handler for URL auditing.
 * Accepts GET requests at /api/audit?url=...
 */
export default async function handler(req: any, res: any) {
  // Set CORS headers for API openness
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight
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

  // Basic URL cleanup
  let cleanUrl = targetUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  // Validate format
  try {
    new URL(cleanUrl);
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid URL format. Please enter a valid address (e.g. google.com).'
    });
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
    const fetchResponse = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PagePulse-Auditor/1.0 (Digital Heroes Training Task)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    // Verify response is HTML
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
    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    if (err.name === 'AbortError') {
      return res.status(408).json({
        error: 'Request timed out. The website took too long (more than 8 seconds) to respond.',
        responseTimeMs
      });
    }

    // Capture standard DNS/Network errors gracefully
    return res.status(520).json({
      error: `Failed to fetch page: ${err.message || 'Unknown network error. Check if the domain is correct and active.'}`,
      responseTimeMs
    });
  }
}
