# Loom Demo Script | Page Pulse

**Recommended Duration**: 2 minutes  
**Record at**: https://loom.com  
**Author**: Ayush BhARTAL

---

## Intro (0:00 - 0:20)

Say:

"Hi, my name is Ayush BhARTAL. This is my submission for the Digital Heroes SDE Qualification Task — Page Pulse, a website auditing tool.

The live version is at digitalhero-six.vercel.app and the source code is on GitHub at github.com/bhartalayush/Page-Pulse."

---

## Live Tool Walkthrough (0:20 - 1:05)

1. Open https://digitalhero-six.vercel.app in your browser.

2. Point out the landing screen:
   - "This is the home screen. I have a URL input field and three quick-launch presets."

3. Type `wikipedia.org` into the input and click Scan.
   - "The terminal shows the live audit steps — resolving host, fetching HTML, parsing content, compiling results."

4. Once results appear, walk through each section:
   - "The four KPI cards show HTTP status 200, response time in milliseconds, image alt tag issues, and word count."
   - Click the SEO tab: "The SEO tab validates the page title length, meta description, H1 heading count, and content density against standard guidelines."
   - Click the Accessibility tab: "The accessibility tab flags any image elements missing alt attributes — important for WCAG compliance."
   - Click the JSON tab: "This tab exposes the raw API response — the exact payload the backend returns."

5. Demonstrate error handling:
   - Type `not-a-real-domain-xyz123.com` and click Scan.
   - "The tool returns a clean JSON error — DNS failure — never crashes, never shows an exception."

---

## Code Walkthrough (1:05 - 1:45)

Open `api/audit.ts` in your editor and show:

"The backend is a single Vercel serverless function. The key things I want to highlight:

First — the AbortController timeout. If a page takes longer than 8 seconds, we cancel the fetch and return a 408 with the elapsed time. This prevents the function from hanging indefinitely.

Second — the content-type check. Before we try to parse anything, we verify the response is actually HTML. If someone passes a PDF URL, we return a 400 with the exact content-type received rather than crashing on cheerio.

Third — the parser is fully inlined here rather than imported from a separate file. This was a deliberate fix I made: Vercel does not bundle files imported from outside the api/ directory, so the original import from ../src/utils/parser was silently excluded from the deployment, causing a server error."

---

## What I Would Change With Another Day (1:45 - 2:00)

Say:

"If I had another day, the single change I would make is adding a server-side cache layer — either a Redis KV store or Vercel's own KV — so that repeated audits of the same URL within a short window return a cached result instantly rather than making a fresh network request every time.

The second thing I would add is a Lighthouse-style performance score that also checks things like render-blocking scripts and image format efficiency, which currently the tool does not cover.

Thank you."

---

## Recording Tips

- Keep your browser window large and readable
- Use a dark terminal or VS Code theme for the code walkthrough segment
- Record in 1080p minimum
- Upload to Loom and share the public link with your submission
