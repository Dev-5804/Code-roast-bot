## Project Name: Code Roast Bot

# 1. Product Overview

Build a web application that analyzes pasted source code and returns structured technical feedback using a Large Language Model.

The application must:

* Accept code input
* Allow language selection
* Allow analysis mode selection
* Return strictly structured JSON output
* Render results in structured UI sections
* Never display raw LLM output directly

The product must appear like a professionally built developer tool. It must not visually resemble an AI-generated website.

---

# 2. Target Users

* Developers
* Computer science students
* Interview candidates
* Open source contributors

---

# 3. Functional Requirements

## 3.1 Code Input

The application must include:

* Monaco Editor
* Language selector dropdown
* Analysis mode selector
* Analyze button

### Supported Languages (MVP)

* JavaScript
* TypeScript
* Python
* Java
* C++

Maximum allowed input: 500 lines.
If exceeded, return validation error.

---

## 3.2 Analysis Modes

The application must support exactly three modes:

### Mode 1: Strict Review

Must detect:

* Logical errors
* Security vulnerabilities
* Edge case failures
* Anti-patterns
* Poor practices

### Mode 2: Optimization Analysis

Must include:

* Time complexity
* Space complexity
* Bottlenecks
* Concrete optimization improvements

### Mode 3: Refactor Mode

Must include:

* Structural improvements
* Naming improvements
* Separation of concerns
* Full rewritten version of the code

---

# 4. LLM Output Contract

The LLM must return valid JSON only.

Strict output schema:

```json
{
  "summary": "string",
  "issues": [
    {
      "type": "security | performance | logic | style",
      "severity": "low | medium | high",
      "line": "number | null",
      "description": "string",
      "fix": "string"
    }
  ],
  "complexity": {
    "time": "string | null",
    "space": "string | null"
  },
  "refactoredCode": "string | null"
}
```

Rules:

* If mode ≠ Refactor, `refactoredCode` must be null.
* If mode ≠ Optimization, `complexity` must contain null values.
* If no issues exist, return empty array.
* No additional keys allowed.
* Output must always be valid JSON.

The backend must validate response using schema validation before returning to frontend.

If validation fails:
Return structured error response.

---

# 5. Non-Functional Requirements

* No code execution on server.
* No file system writes.
* Rate limiting required.
* Input sanitization required.
* Response must render within 5 seconds.
* Errors must not expose internal stack traces.

---

# 6. UI/UX Requirements

## 6.1 General Design Rules

The interface must:

* Use neutral color palette (white, black, gray tones).
* No gradients.
* No glassmorphism.
* No neon colors.
* No animated backgrounds.
* No floating AI illustrations.
* No chatbot UI.
* No “AI assistant” phrasing.

Typography:

* Inter or similar professional sans-serif.
* Clear hierarchy (h1, h2, h3).
* Consistent spacing system (8px scale).

Layout:

* Centered container (max-width 1100px).
* 2-column layout on desktop:

  * Left: Editor
  * Right: Output panel
* Single column on mobile.

Buttons:

* Solid black primary button.
* Subtle hover state.
* No glow effects.

Cards:

* Flat.
* Light border.
* 6px–8px border radius.

Code blocks:

* Light theme only.
* Subtle border.
* No colorful themes.

---

## 6.2 Page Sections

### Header

* Logo text: “Code Roast”
* Minimal top navigation (optional: GitHub link)
* No marketing slogans

### Main Section

Left Panel:

* Language dropdown
* Mode dropdown
* Monaco editor
* Analyze button

Right Panel:

* Summary section
* Issues section
* Complexity section (conditional)
* Refactored Code section (conditional)

Each section must have clear divider lines.

---

# 7. API Specification

## Endpoint

POST `/api/analyze`

### Request Body

```json
{
  "language": "string",
  "mode": "strict | optimize | refactor",
  "code": "string"
}
```

### Response

Success:

```json
{
  "success": true,
  "data": { ...LLM structured output }
}
```

Failure:

```json
{
  "success": false,
  "error": "string"
}
```

---

# 8. Backend Logic Flow

1. Validate request body.
2. Validate line count.
3. Construct LLM system + user prompt.
4. Send request to LLM provider.
5. Parse JSON response.
6. Validate against schema.
7. Return structured response.

No raw LLM text should be returned.

---

# 9. Folder Structure

```
/app
  layout.tsx
  page.tsx
  globals.css

  /api
    /analyze
      route.ts

/components
  Editor.tsx
  ModeSelector.tsx
  LanguageSelector.tsx
  OutputPanel.tsx
  IssuesTable.tsx
  ComplexitySection.tsx
  RefactorSection.tsx
  Header.tsx

/lib
  llm.ts
  prompt.ts
  schema.ts
  rateLimit.ts
  validation.ts

/types
  analysis.ts

/styles
  variables.css
```

---

# 10. Environment Variables

```
LLM_API_KEY=
LLM_MODEL=
RATE_LIMIT_MAX=
RATE_LIMIT_WINDOW_MS=
```

---

# 11. Error Handling Requirements

The system must handle:

* Empty input
* Unsupported language
* LLM timeout
* Invalid JSON from LLM
* Schema validation failure
* Rate limit exceeded

All errors must return structured JSON.

---

# 12. Logging Requirements

Log only:

* Request timestamp
* Mode
* Language
* Execution time
* Success/failure

Do not log full source code.

---

# 13. Performance Constraints

* Maximum input size: 500 lines
* Timeout: 15 seconds
* Rate limit: configurable
* Single LLM request per analysis

---

# 14. Security Requirements

* No evaluation of user code.
* No dynamic imports from user input.
* No rendering raw HTML from LLM.
* Escape all output before rendering.

---

# 15. Completion Criteria

The product is complete when:

* All three modes function correctly.
* JSON schema validation is enforced.
* UI strictly follows design rules.
* No gradient or AI-styled design elements exist.
* Application is deployable to Vercel.
* All errors are handled deterministically.