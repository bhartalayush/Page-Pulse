import { describe, it, expect } from 'vitest';
import { parseHtml } from './parser';

describe('parseHtml parsing utility', () => {
  it('happy path - should successfully parse valid HTML structure', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page Pulse Audit | Home</title>
          <meta name="description" content="A professional website auditor tool for checking SEO and accessibility metrics.">
        </head>
        <body>
          <h1>Welcome to Page Pulse</h1>
          <h2>Subheading here</h2>
          <p>This is a paragraph with some sample text to count words.</p>
          <img src="logo.png" alt="Page Pulse Logo" />
          <img src="banner.jpg" alt="Beautiful Dashboard Banner" />
          <p>Another paragraph that has more words to make it interesting.</p>
          <script>console.log("ignore me");</script>
          <style>body { background: red; }</style>
        </body>
      </html>
    `;

    const metrics = parseHtml(html);

    expect(metrics.title).toBe('Page Pulse Audit | Home');
    expect(metrics.metaDescription).toBe('A professional website auditor tool for checking SEO and accessibility metrics.');
    expect(metrics.h1Count).toBe(1);
    expect(metrics.imagesMissingAlt).toBe(0);
    // Word count calculation:
    // "Welcome to Page Pulse" (4 words)
    // "Subheading here" (2 words)
    // "This is a paragraph with some sample text to count words." (10 words)
    // "Another paragraph that has more words to make it interesting." (10 words)
    // Total should be around 26 words
    expect(metrics.wordCount).toBeGreaterThanOrEqual(20);
    expect(metrics.wordCount).toBeLessThanOrEqual(30);
  });

  it('failure case 1 - empty or malformed HTML input', () => {
    const metricsEmpty = parseHtml('');
    expect(metricsEmpty.title).toBe('No title tag found');
    expect(metricsEmpty.metaDescription).toBe('No meta description found');
    expect(metricsEmpty.h1Count).toBe(0);
    expect(metricsEmpty.imagesMissingAlt).toBe(0);
    expect(metricsEmpty.wordCount).toBe(0);

    const metricsMalformed = parseHtml('<div>Not even real HTML');
    expect(metricsMalformed.title).toBe('No title tag found');
    expect(metricsMalformed.h1Count).toBe(0);
    expect(metricsMalformed.wordCount).toBe(4); // "Not even real HTML"
  });

  it('failure case 2 - missing title and meta description tags', () => {
    const html = `
      <html>
        <body>
          <h1>Just a header</h1>
          <p>Some content description goes here.</p>
        </body>
      </html>
    `;
    const metrics = parseHtml(html);
    expect(metrics.title).toBe('No title tag found');
    expect(metrics.metaDescription).toBe('No meta description found');
    expect(metrics.h1Count).toBe(1);
  });

  it('failure case 3 - images missing alt attributes', () => {
    const html = `
      <html>
        <body>
          <img src="img1.jpg" /> <!-- missing alt attribute completely -->
          <img src="img2.jpg" alt="" /> <!-- empty alt string -->
          <img src="img3.jpg" alt="   " /> <!-- space-only alt string -->
          <img src="img4.jpg" alt="Valid alt text" /> <!-- valid alt text -->
        </body>
      </html>
    `;
    const metrics = parseHtml(html);
    expect(metrics.imagesMissingAlt).toBe(3); // img1, img2, and img3 should count as missing
  });
});
