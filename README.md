# Page Pulse | Website Auditor

**Live URL**: [link ](https://digitalhero-six.vercel.app/)  
**Repository**: https://github.com/bhartalayush/Page-Pulse  
**Author**: Ayush Bhartal  
**Built for**: Digital Heroes Internship Qualification Task  
**Development Tooling**: Built with **Antigravity** (Google DeepMind AI Agentic Pair Programming Assistant)

---

## Overview

Page Pulse is a high-performance web auditing application that analyzes any public URL and generates real-time reports covering HTTP status, latency, SEO semantic structure, image alt tag accessibility, and body text density.

---

## Features

- **Live URL Auditor**: Fetches and inspects target web pages with an 8-second request cancellation timeout.
- **Interactive Terminal Dashboard**: Renders real-time analysis status and metrics cleanly.
- **Health Pulse Gauge**: Calculates a composite score out of 100 based on standard web guidelines.
- **Detailed SEO Audit**: Validates title length, meta-description presence/length, and H1 heading hierarchy.
- **WCAG Accessibility Check**: Detects image elements missing required alternative description tags.
- **Side-by-Side Competitor Comparison**: Compare two domains side-by-side in a comparative metric table.
- **Raw JSON Inspector**: Inspect and copy raw API response payloads.
- **Audit History**: Caches previous scan logs in browser local storage.
- **High-Contrast Pastel Interface**: Designed with high-contrast pastel styling and full-screen layout.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation and Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Unit Tests**:
   ```bash
   npm run test
   ```
   Executes HTML parsing unit tests using Vitest.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## API Specification

Page Pulse exposes a public, CORS-enabled serverless GET endpoint.

### Request
`GET /api/audit?url=<target_url>`

**Query Parameters:**
- `url` (string, required): The target website URL (e.g. `https://example.com` or `wikipedia.org`).

### Responses

#### 1. Success (200 OK)
```json
{
  "url": "https://example.com",
  "status": 200,
  "responseTimeMs": 184,
  "title": "Example Domain",
  "metaDescription": "No meta description found",
  "h1Count": 1,
  "imagesMissingAlt": 0,
  "wordCount": 125
}
```

#### 2. Invalid Input / Non-HTML Target (400 Bad Request)
```json
{
  "error": "Only HTML pages can be audited. Provided URL returned content-type: 'application/pdf'."
}
```

#### 3. Request Timeout (504 Gateway Timeout)
```json
{
  "error": "Request timed out. The website took too long (more than 8 seconds) to respond."
}
```

#### 4. Network Resolution Error (500 Internal Server Error)
```json
{
  "error": "Failed to fetch page: getaddrinfo ENOTFOUND invalid-domain-target.xyz"
}
```

---

## Technical Design Decisions

### 1. Cheerio Server-Side DOM Parsing
- **Decision**: Used Cheerio for server-side HTML parsing instead of heavy headless browser runners like Puppeteer or Playwright.
- **Reasoning**: Cheerio executes in under 10ms with minimal memory footprint (under 15MB RAM vs 200MB+ for Chromium instances), allowing fast response times under 300ms on serverless deployments.

### 2. Dual Local Proxy and Vercel Serverless Architecture
- **Decision**: Integrated custom Vite dev server middleware directly in `vite.config.ts`.
- **Reasoning**: Eliminates the need for a separate backend process during local development. Running `npm run dev` serves both the frontend SPA and the backend API on a single port (`localhost:5173`), matching production serverless behavior.

### 3. Rule-Based Pulse Scoring Algorithm
- **Decision**: Formulated a weighted scoring metric translating raw HTML statistics into an overall score out of 100.
- **Reasoning**: Aggregates HTTP status (+20), Title length (+15), Meta Description (+15), H1 count (+10), Alt tag compliance (+10), and Word density (+10) into a single visual rating that immediately highlights actionable improvements.

---

## Tooling and Credits

- **Developer**: Ayush Bhartal
- **Assignment**: Digital Heroes SDE Qualification Task
- **AI Tool**: Antigravity
