# Code Roast Bot

An AI-powered code analysis tool built with Next.js and Google Gemini. Paste your code, choose a mode, and get structured feedback on bugs, security issues, complexity, and refactoring opportunities.

## Features

- **Three analysis modes**
  - **Strict Review** — identifies bugs, security vulnerabilities, and anti-patterns
  - **Optimize** — reports time and space complexity with improvement suggestions
  - **Refactor** — rewrites the code for cleaner structure
- **Five supported languages** — JavaScript, TypeScript, Python, Java, C++
- **Monaco Editor** — syntax-highlighted input and refactored output
- **Structured output** — all results rendered from validated JSON fields; no raw LLM text displayed
- **500-line input limit** — enforced server-side before the LLM is called
- **Rate limiting** — configurable per-IP request throttling

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| LLM | Google Gemini (`@google/genai`) |
| Validation | Zod |
| Editor | Monaco Editor |
| Styling | Tailwind CSS v4 |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/code-roast-bot.git
cd code-roast-bot
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Required
LLM_API_KEY=your_google_gemini_api_key

# Optional — defaults shown
LLM_MODEL=gemini-2.5-flash
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
GLOBAL_REQUEST_LIMIT=500
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx               # Main UI — editor, language/mode picker
  layout.tsx
  api/analyze/route.ts   # POST /api/analyze — validation, LLM call, response
components/
  Header.tsx
  OutputPanel.tsx        # Renders summary, issues, complexity, refactored code
lib/
  schema.ts              # Zod schemas for request and LLM response
  validation.ts          # Request validation and 500-line limit check
  rateLimit.ts           # In-memory per-IP rate limiter
  llm.ts                 # Gemini API integration
types/
  analysis.ts            # Shared TypeScript types
```

## API

### `POST /api/analyze`

**Request body:**

```json
{
  "language": "javascript",
  "mode": "strict",
  "code": "// your code here"
}
```

| Field | Type | Allowed values |
|---|---|---|
| `language` | string | `javascript` `typescript` `python` `java` `cpp` |
| `mode` | string | `strict` `optimize` `refactor` |
| `code` | string | Non-empty, max 500 lines |

**Success response `200`:**

```json
{
  "success": true,
  "data": {
    "summary": "...",
    "issues": [
      {
        "type": "security",
        "severity": "high",
        "line": 12,
        "description": "...",
        "fix": "..."
      }
    ],
    "complexity": { "time": "O(n)", "space": "O(1)" },
    "refactoredCode": null
  }
}
```

**Error response:**

```json
{
  "success": false,
  "error": "..."
}
```

| Condition | Status |
|---|---|
| Invalid language, mode, or empty code | `400` |
| Code exceeds 500 lines | `400` |
| Rate limit exceeded | `429` |
| LLM or schema failure | `500` |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
