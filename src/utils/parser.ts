import * as cheerio from 'cheerio';

export interface AuditMetrics {
  title: string;
  metaDescription: string;
  h1Count: number;
  imagesMissingAlt: number;
  wordCount: number;
}

/**
 * Parses raw HTML content and extracts audit metrics.
 * Safe to execute on any HTML input, malformed or empty.
 */
export function parseHtml(html: string): AuditMetrics {
  if (!html || typeof html !== 'string') {
    return {
      title: 'No title tag found',
      metaDescription: 'No meta description found',
      h1Count: 0,
      imagesMissingAlt: 0,
      wordCount: 0,
    };
  }

  // Load HTML securely
  const $ = cheerio.load(html);

  // 1. Get Title (fallback to first h1, or default if missing)
  const titleText = $('title').first().text().trim();
  const title = titleText || 'No title tag found';

  // 2. Get Meta Description (search name="description" and property="og:description")
  let description = '';
  const descMeta = $('meta[name="description"]').first();
  if (descMeta.length > 0) {
    description = descMeta.attr('content')?.trim() || '';
  }
  
  if (!description) {
    const ogMeta = $('meta[property="og:description"]').first();
    if (ogMeta.length > 0) {
      description = ogMeta.attr('content')?.trim() || '';
    }
  }
  const metaDescription = description || 'No meta description found';

  // 3. Count H1 elements
  const h1Count = $('h1').length;

  // 4. Count images missing alt attributes or having empty alt attributes
  let imagesMissingAlt = 0;
  $('img').each((_, elem) => {
    const alt = $(elem).attr('alt');
    // Count as missing if alt is missing entirely or contains only whitespace
    if (alt === undefined || alt.trim() === '') {
      imagesMissingAlt++;
    }
  });

  // 5. Calculate approximate word count
  // Clone the body (or top level document if body is absent) to strip non-visible tags
  const rootElement = ($('body').length > 0 ? $('body') : $.root()) as any;
  const contentClone = rootElement.clone();
  
  // Remove non-visible elements
  contentClone.find('script, style, svg, iframe, noscript, path, link, meta, head').remove();
  
  const textContent = contentClone.text();
  
  // Clean text and split into words
  const words = textContent
    .replace(/\s+/g, ' ') // replace multiple spaces/newlines with single space
    .trim()
    .split(' ')
    .filter((word: string) => word.length > 0);

  const wordCount = words.length;

  return {
    title,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    wordCount,
  };
}
