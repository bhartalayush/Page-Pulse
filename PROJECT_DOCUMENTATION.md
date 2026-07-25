# Page Pulse | SDE Assignment Documentation

**GitHub Repository**: https://github.com/bhartalayush/Page-Pulse  
**Author**: Ayush BhARTAL  
**Assignment**: Digital Heroes Internship Qualification Task  
**Development Tooling**: Built using **Antigravity** (Google DeepMind AI Agentic Pair Programming Assistant)

---

## 1. Project Overview

Page Pulse is a high-performance web auditing application that analyzes any public website URL and returns real-time metrics on:
- **HTTP Status and Timing**: Response status code and network latency in milliseconds.
- **SEO Semantics**: Title tag presence and length, Meta Description presence and length, H1 tag count, and body text word density.
- **Accessibility (WCAG)**: Detection of `<img>` elements missing required `alt` descriptors.
- **Competitor Comparison**: Side-by-side URL metric auditor.

---

## 2. Technical Architecture and Tech Stack

- **Frontend**: React 18 with TypeScript, Vite 6, Tailwind CSS v4, Motion (Framer Motion v12) for keyframe animations, Lucide Icons.
- **Backend / API**: Vercel Serverless Function (`api/audit.ts`) + custom Vite server middleware for local development.
- **HTML Parsing**: `cheerio` for fast, lightweight server-side DOM parsing.
- **Unit Testing**: `vitest` for automated test coverage of HTML edge cases.
- **AI Tooling**: Developed in collaboration with Google DeepMind Antigravity AI pair programming assistant.

```
sde assignment/
├── api/
│   └── audit.ts              # Serverless endpoint (GET /api/audit?url=...)
├── src/
│   ├── components/
│   │   └── ThemeToggle.tsx   # Theme utility
│   ├── pages/
│   │   └── Landing.tsx       # Main SPA Dashboard
│   ├── utils/
│   │   ├── parser.ts         # Cheerio HTML audit parser logic
│   │   └── parser.test.ts    # Vitest unit tests for HTML parsing
│   ├── App.tsx               # Client-side router setup
│   ├── index.css             # Design tokens & float keyframe animations
│   └── main.tsx              # React entry point
├── index.html                # HTML entry point with Google Fonts
├── package.json              # Project dependencies and test scripts
├── vite.config.ts            # Vite configuration with local API proxy
├── vercel.json               # Serverless route rewrites
├── README.md                 # Quickstart guide & project overview
└── PROJECT_DOCUMENTATION.md  # Comprehensive assignment report
```

---

## 3. Quick Start and Setup Guide

### Prerequisites
- Node.js: v18.0.0 or higher
- npm: v9.0.0 or higher

### Installation and Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Unit Tests**:
   ```bash
   npm run test
   ```
   Executes Vitest suite testing happy path, missing tags, empty HTML, and missing alt attributes.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Opens local development server (http://localhost:5173). The API server middleware proxies requests to `/api/audit` seamlessly.

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 4. API Specification and Contracts

### Base Endpoint
`GET /api/audit?url=<target_url>`

### Request Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `url` | string | Yes | The full web URL or domain name to audit (e.g. `https://wikipedia.org` or `example.com`). |

---

### Success Response Schema (200 OK)

```json
{
  "url": "https://example.com",
  "status": 200,
  "responseTimeMs": 142,
  "title": "Example Domain",
  "metaDescription": "No meta description found",
  "h1Count": 1,
  "imagesMissingAlt": 0,
  "wordCount": 124
}
```

#### Field Specifications:
- `url`: Normalized string URL audited.
- `status`: HTTP response status code (e.g. 200).
- `responseTimeMs`: Latency measurement in milliseconds for fetching the remote document.
- `title`: Extracted `<title>` element text, or `'No title tag found'`.
- `metaDescription`: Extracted `<meta name="description">` content, or `'No meta description found'`.
- `h1Count`: Integer count of `<h1>` tags present in document.
- `imagesMissingAlt`: Integer count of `<img>` tags missing a non-empty `alt` attribute.
- `wordCount`: Estimated body text word count (excluding scripts, styles, and markup tags).

---

### Error Response Schemas

#### 1. Missing or Empty URL (400 Bad Request)
```json
{
  "error": "URL parameter is required."
}
```

#### 2. Network Timeout / Failure (504 Gateway Timeout / 500 Error)
```json
{
  "error": "Failed to fetch URL: Request timed out after 8 seconds"
}
```

#### 3. Non-HTML Target Response (415 Unsupported Media Type)
```json
{
  "error": "URL did not return an HTML document (received image/png)"
}
```

---

## 5. Three Key Technical Design Decisions

### Decision 1: Cheerio Server-Side Parsing over Headless Browsers
- **Rationale**: Headless browsers (Puppeteer/Playwright) introduce significant memory overhead (200MB+ per instance) and slow down response latency (3-5s cold starts). Cheerio parses HTML strings in under 10ms with minimal CPU overhead, allowing Page Pulse to scale effortlessly on serverless free-tier limits while delivering response times under 300ms.

### Decision 2: Dual Local Proxy + Vercel Serverless Architecture
- **Rationale**: To ensure a seamless local developer experience without requiring a separate Express server running on another port, a custom Vite plugin middleware was embedded into `vite.config.ts`. It imports `api/audit.ts` directly, enabling `npm run dev` to serve both frontend and API on a single port (`localhost:5173`), matching production serverless routing.

### Decision 3: High-Contrast Pastel Theme System and Centered Vector Layouts
- **Rationale**: Page Pulse uses a curated palette of vibrant pastel gradients (`#D4E6F7`, `#FAD6C5`, `#FAF0C0`, `#E6DCFA`) paired with deep high-contrast text (`#0F2C4A`, `#4A1D0F`, `#4A3B0F`). The KPI cards feature squarish geometry with centered icon badges and metrics to maximize visual hierarchy and scannability.

---

## 6. Loom Video Presentation Script

> **Intro (0:00 - 0:25)**:
> "Hi everyone, my name is Ayush BhARTAL, and today I am demonstrating Page Pulse — a site auditing application built for the Digital Heroes SDE task using Antigravity AI pair programming assistant. Page Pulse allows anyone to input a website URL and receive an instant report covering response latency, SEO structure, accessibility, and content density."

> **Feature Walkthrough (0:25 - 1:10)**:
> "Let us test it by entering a domain like `wikipedia.org`. As soon as I click Scan, the intelligence terminal triggers our backend API endpoint, fetching the page with an 8-second safety timeout and parsing the HTML DOM using Cheerio. Here on the dashboard, we see the calculated Pulse Score, the squarish KPI cards displaying HTTP status, latency, missing image alt tags, and word count. We can switch tabs to view detailed SEO recommendations, accessibility WCAG compliance, run side-by-side competitor comparisons, or inspect the raw JSON response."

> **Code Architecture and Tradeoffs (1:10 - 1:45)**:
> "Under the hood, the backend uses `api/audit.ts` which handles URL normalization, error handling for timeouts or non-HTML responses, and Cheerio parsing. Unit tests in `parser.test.ts` verify our edge cases with Vitest. If I had another day, I would add server-side caching via Redis to avoid re-fetching identical URLs within short windows and render a full Lighthouse performance breakdown."

> **Outro (1:45 - 2:00)**:
> "Clicking Page Pulse in the top navbar instantly brings us back home. Thank you for watching!"

---

## 7. Verification Results

- **TypeScript Compilation**: `npm run build` passed cleanly with 0 errors.
- **Unit Tests**: `npm run test` passed (4/4 tests passing).
- **Footer Credit**: Displays `BUILT FOR DIGITAL HEROES TRAINING TASK BY AYUSH`.
- **GitHub Repository**: https://github.com/bhartalayush/Page-Pulse
