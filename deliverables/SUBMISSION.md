# Page Pulse | Submission

**Submitted by**: Ayush BhARTAL  
**Task**: Digital Heroes SDE Internship Qualification  
**Development Tooling**: Built with Antigravity (Google DeepMind AI Agentic Pair Programming Assistant)

---

## Deliverable Links

| Deliverable | Link |
|---|---|
| Live Deployed URL | https://digitalhero-six.vercel.app/ |
| Public GitHub Repository | https://github.com/bhartalayush/Page-Pulse |
| Vercel Dashboard | https://vercel.com/ayushb/designhero |

---

## Task A Checklist

### a) Backend Endpoint
- Endpoint: `GET /api/audit?url=<target_url>`
- Returns JSON report containing:
  - `status` — HTTP response status code
  - `responseTimeMs` — network latency in milliseconds
  - `title` — extracted page title
  - `metaDescription` — meta description content
  - `h1Count` — count of H1 elements
  - `imagesMissingAlt` — count of images missing alt attributes
  - `wordCount` — approximate visible body word count

### b) Frontend
- Full-screen interactive dashboard with URL input field
- Animated audit progress terminal with step-by-step status
- Squarish high-contrast pastel KPI metric cards post-audit
- SEO audit checklist tab
- WCAG accessibility check tab
- Side-by-side competitor comparison tab
- Raw JSON response inspector tab
- Persistent audit history via browser local storage
- Vanishing navigation bar on scroll inactivity

### c) Error Handling
| Scenario | Response |
|---|---|
| Missing URL parameter | 400 with descriptive error message |
| Invalid URL format | 400 with descriptive error message |
| Non-HTML content type (PDF, image, etc.) | 400 with content-type detail |
| Network timeout (>8 seconds) | 408 with elapsed time |
| DNS failure / unreachable host | 520 with error message |
| All errors | Always return JSON, never crash |

### Credit Line
Footer displays: "BUILT FOR DIGITAL HEROES TRAINING TASK BY AYUSH" — linked to https://digitalheroesco.com

---

## Task B Checklist

### a) Tests
- File: `src/utils/parser.test.ts`
- Framework: Vitest
- Test count: 4 tests, all passing

| Test Case | Description |
|---|---|
| Happy path | Valid HTML with all elements present |
| Empty HTML | Graceful fallback defaults |
| Missing tags | No title, no description, no H1 |
| Missing alt attributes | Correct count of images without alt |

Run tests with:
```bash
npm run test
```

### b) README
- File: `README.md` at root of repository
- Covers: setup guide, API contract with all request/response schemas, 3 design decisions with reasoning

### c) Loom Demo
- Script provided in `LOOM_SCRIPT.md` in this folder
- Record at: https://loom.com
- Recommended duration: 2 minutes

---

## Repository File Structure

```
Page-Pulse/
├── api/
│   └── audit.ts                 # Serverless endpoint (self-contained, parser inlined)
├── src/
│   ├── pages/
│   │   └── Landing.tsx          # Main React SPA dashboard
│   ├── utils/
│   │   ├── parser.ts            # HTML parsing utility (also used for tests)
│   │   └── parser.test.ts       # Vitest unit test suite
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions auto-deploy to GitHub Pages
├── deliverables/
│   ├── SUBMISSION.md            # This file
│   ├── README.md                # Copy of project README
│   ├── PROJECT_DOCUMENTATION.md # Full SDE report and Loom script
│   ├── LOOM_SCRIPT.md           # Loom video recording guide
│   └── tests/
│       └── parser.test.ts       # Copy of unit test file
├── index.html
├── package.json
├── vercel.json
├── vite.config.ts
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion v12) |
| Backend | Vercel Serverless Functions |
| HTML Parser | Cheerio |
| Testing | Vitest |
| Deployment | Vercel (production) + GitHub Pages (static) |
| CI/CD | GitHub Actions |
