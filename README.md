# PDF to Croissant

Upload an academic paper. Get a validated [MLCommons Croissant](https://mlcommons.org/croissant/) JSON-LD file back.

**Live at [mlcroissant.jetty.bot](https://mlcroissant.jetty.bot)**

An AI agent reads the PDF, extracts dataset metadata (name, description, splits, features, license, citation), builds a Croissant JSON-LD file, validates it against the `mlcroissant` schema, iterates to fix errors, and writes an executive summary of what was extracted and what gaps remain.

---

## How it works

This app is a thin Next.js frontend over [Jetty](https://jetty.io), an infrastructure platform for agentic AI workflows. When you upload a paper:

1. **PDF uploads** to cloud storage via a presigned URL
2. **Jetty provisions a sandbox** — an isolated container with Python, `mlcroissant`, and a coding agent (Gemini CLI)
3. **The agent follows a runbook** — a structured Markdown document that tells it exactly what to do, how to validate, and when to iterate
4. **Results come back** — `croissant.json`, `summary.md`, and `validation_report.json` are persisted to cloud storage
5. **You get an email** when the job finishes, with a link to the results

The entire process takes 2-5 minutes. The sandbox is destroyed after each run; only the output files and execution trajectory remain.

---

## What is a runbook?

A runbook is a recipe for an AI agent. It's a Markdown file that encodes:

- **Objective** — what the agent is doing and for whom
- **Required output files** — the task isn't done until every file exists
- **Parameters** — template variables injected at runtime (e.g. `{{pdf_filename}}`)
- **Steps** — sequential instructions the agent follows
- **Evaluation** — programmatic validation or rubric-based scoring
- **Iteration** — if outputs fail evaluation, the agent reads the error, applies a fix, and retries (bounded to 3 rounds)
- **Final checklist** — verification script to ensure all outputs exist

You can [view this app's runbook](https://mlcroissant.jetty.bot/runbook) to see exactly what the agent does.

Runbooks are portable. You can take the same `RUNBOOK.md` and run it locally with Claude Code, Codex, or Gemini CLI — no web app or Jetty account needed. See the [About page](https://mlcroissant.jetty.bot/about) for instructions.

---

## Run it yourself

### Option A: Use the web app

Go to [mlcroissant.jetty.bot](https://mlcroissant.jetty.bot), upload a PDF, and wait for the email.

### Option B: Run locally with your own agent

```bash
# Copy RUNBOOK.md from this repo, place your PDF in the same directory
claude --system-prompt RUNBOOK.md \
  "Generate a Croissant file for the dataset in paper.pdf"
```

Works with Claude Code, Codex, or Gemini CLI.

### Option C: Connect to Jetty

Install the Jetty MCP server to run workflows in isolated sandboxes with full persistence:

```bash
# Claude Code
claude mcp add jetty -- npx -y jetty-mcp-server

# Any MCP-compatible agent (Cursor, VS Code, Windsurf, Zed)
# Add to your editor's MCP config:
{
  "mcpServers": {
    "jetty": {
      "command": "npx",
      "args": ["-y", "jetty-mcp-server"],
      "env": { "JETTY_API_TOKEN": "mlc_your_token_here" }
    }
  }
}
```

Sign up at [dock.jetty.io](https://dock.jetty.io) to get your API token.

---

## Project structure

```
pdf2croissant/
  RUNBOOK.md              # The agent's instructions (portable)
  app/                    # Next.js application
    src/
      app/
        page.tsx          # Upload form
        about/page.tsx    # How it works + getting started
        runbook/page.tsx  # View the full runbook
        run/[id]/page.tsx # Run results (validation, summary, JSON-LD)
        api/
          run/            # Launch a workflow
          upload-url/     # Presigned upload URLs
          trajectories/   # List runs
          trajectory/     # Single run details
          file/           # Download output files
          webhook/        # Completion notification handler
      lib/
        jetty.ts          # Jetty API client
        types.ts          # TypeScript interfaces
      components/         # React components
      hooks/              # React Query hooks
```

## Development

```bash
cd app
cp .env.local.example .env.local
# Add your JETTY_API_TOKEN to .env.local

npm install
npm run dev
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JETTY_API_TOKEN` | Yes | Jetty API token ([get one](https://dock.jetty.io)) |
| `RESEND_API_KEY` | For email | Resend API key for completion notifications |
| `WEBHOOK_SECRET` | For email | Shared secret for webhook HMAC verification |
| `RESEND_FROM` | No | From address (default: `Croissant Generator <notifications@jetty.bot>`) |

---

## Learn more

- [Jetty documentation](https://docs.jetty.io) — platform docs, guides, API reference
- [Writing runbooks](https://docs.jetty.io/guides/writing-runbooks) — how to write your own
- [MLCommons Croissant](https://mlcommons.org/croissant/) — the metadata standard
- [About page](https://mlcroissant.jetty.bot/about) — detailed explanation of the architecture

---

## License

[MIT](LICENSE)
