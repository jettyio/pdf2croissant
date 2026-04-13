import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="space-y-12">
      {/* Intro */}
      <section>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          How this works
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          This app is powered by{" "}
          <a
            href="https://jetty.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
          >
            Jetty
          </a>
          , managed infrastructure for agentic AI workflows. When you upload a
          PDF, Jetty provisions an isolated sandbox, runs an AI agent with a
          detailed set of instructions called a{" "}
          <span className="font-medium text-gray-700">runbook</span>, and
          returns the results &mdash; all through a single API call.
        </p>
      </section>

      {/* What happens when you upload */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          What happens when you upload a paper
        </h2>
        <ol className="space-y-4 text-sm leading-relaxed text-gray-600">
          <Step n={1} title="Your PDF is uploaded to cloud storage">
            The file goes directly to Jetty&apos;s sandbox storage via a
            presigned URL &mdash; it never touches an intermediate server.
          </Step>
          <Step n={2} title="Jetty provisions a sandbox">
            An isolated container is spun up with Python, the{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              mlcroissant
            </code>{" "}
            library, and a coding agent (currently Gemini CLI). The agent has
            full autonomy inside the sandbox: shell, network, file system.
          </Step>
          <Step n={3} title="The agent follows the runbook">
            The{" "}
            <Link
              href="/runbook"
              className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
            >
              runbook
            </Link>{" "}
            tells the agent exactly what to do: read the paper, extract dataset
            metadata (name, description, splits, features, license, citation),
            build a Croissant JSON-LD file, validate it against the MLCommons
            schema, and iterate up to 3 times if validation fails.
          </Step>
          <Step n={4} title="Results come back">
            The agent writes{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              croissant.json
            </code>
            ,{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              summary.md
            </code>
            , and{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              validation_report.json
            </code>{" "}
            to the sandbox. Jetty persists every artifact to cloud storage and
            records a full execution trajectory so you can inspect each step.
          </Step>
          <Step n={5} title="The sandbox is destroyed">
            Once the run completes, the container is torn down. Only the output
            files and trajectory remain.
          </Step>
        </ol>
      </section>

      {/* What is a runbook */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          What is a runbook?
        </h2>
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-600">
          A runbook is a structured Markdown document that tells a coding agent
          how to accomplish a complex, multi-step task end-to-end. Think of it as
          a recipe: it defines the objective, the exact files the agent must
          produce, the steps to follow, and the evaluation criteria that
          determine whether the output is good enough.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-700">
                  Section
                </th>
                <th className="px-4 py-3 font-medium text-gray-700">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">Frontmatter</td>
                <td className="px-4 py-2.5">
                  YAML with version, evaluation strategy, agent, model, and
                  sandbox snapshot
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">Objective</td>
                <td className="px-4 py-2.5">
                  What the agent is doing, what it&apos;s producing, and for
                  whom
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">
                  Required output files
                </td>
                <td className="px-4 py-2.5">
                  Every file the agent must write &mdash; the task isn&apos;t
                  complete until they all exist
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">Parameters</td>
                <td className="px-4 py-2.5">
                  Template variables injected at runtime (e.g.{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">
                    {"{{pdf_filename}}"}
                  </code>
                  )
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">Steps</td>
                <td className="px-4 py-2.5">
                  Sequential instructions &mdash; each step can run code, call
                  tools, or write files
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">Evaluation</td>
                <td className="px-4 py-2.5">
                  Programmatic validation or rubric-based scoring to decide if
                  the output passes
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">Iteration</td>
                <td className="px-4 py-2.5">
                  If outputs fail evaluation, the agent reads the error, applies
                  a fix, and retries (bounded, typically 3 rounds)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">
                  Final checklist
                </td>
                <td className="px-4 py-2.5">
                  Imperative verification to ensure all outputs exist before the
                  run ends
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          You can{" "}
          <Link
            href="/runbook"
            className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
          >
            view this app&apos;s runbook
          </Link>{" "}
          to see exactly what the agent does when it processes your paper.
        </p>
      </section>

      {/* Run it yourself */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Run it yourself
        </h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-600">
          You don&apos;t need this web app. The runbook is portable &mdash; you
          can run it locally with your own agent or through Jetty&apos;s API with
          any supported agent.
        </p>

        {/* Option 1: Local */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Option A: Run locally with your own agent
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>
              <span className="mr-2 font-medium text-gray-700">1.</span>
              Copy the runbook from the{" "}
              <Link
                href="/runbook"
                className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
              >
                Runbook
              </Link>{" "}
              page and save it as{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
                RUNBOOK.md
              </code>
            </li>
            <li>
              <span className="mr-2 font-medium text-gray-700">2.</span>
              Place your PDF in the same directory
            </li>
            <li>
              <span className="mr-2 font-medium text-gray-700">3.</span>
              Run with your preferred agent:
            </li>
          </ol>
          <div className="mt-3 space-y-2">
            <AgentCommand
              agent="Claude Code"
              command={`claude --system-prompt RUNBOOK.md \\\n  "Generate a Croissant file for the dataset in paper.pdf"`}
            />
            <AgentCommand
              agent="Codex"
              command={`codex --system-prompt RUNBOOK.md \\\n  "Generate a Croissant file for the dataset in paper.pdf"`}
            />
            <AgentCommand
              agent="Gemini CLI"
              command={`gemini --system-prompt RUNBOOK.md \\\n  "Generate a Croissant file for the dataset in paper.pdf"`}
            />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            The agent will install dependencies, read the PDF, build the
            Croissant file, validate it, and iterate until it passes &mdash; all
            on your machine.
          </p>
        </div>

        {/* Option 2: Jetty Skill */}
        <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50 p-5">
          <h3 className="mb-3 text-sm font-semibold text-sky-800">
            Option B: Install the Jetty skill
          </h3>
          <p className="mb-3 text-sm text-sky-700">
            The Jetty skill connects your coding agent to Jetty&apos;s
            infrastructure. Workflows run in isolated sandboxes with full
            persistence &mdash; no local setup required.
          </p>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-sky-800">
                Claude Code
              </p>
              <pre className="overflow-x-auto rounded-lg bg-sky-900 px-4 py-2.5 text-xs text-sky-100">
                {`claude mcp add jetty -- npx -y jetty-mcp-server`}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-sky-800">
                Cursor / VS Code / Windsurf / Zed
              </p>
              <pre className="overflow-x-auto rounded-lg bg-sky-900 px-4 py-2.5 text-xs text-sky-100">
                {`// Add to your editor's MCP config:
{
  "mcpServers": {
    "jetty": {
      "command": "npx",
      "args": ["-y", "jetty-mcp-server"],
      "env": {
        "JETTY_API_TOKEN": "mlc_your_token_here"
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
          <p className="mt-3 text-xs text-sky-600">
            Once installed, run{" "}
            <code className="rounded bg-sky-100 px-1 py-0.5 font-mono">
              /jetty-setup
            </code>{" "}
            in Claude Code to walk through account creation and API key
            configuration.
          </p>
        </div>

        {/* Option 3: Jetty API */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Option C: Call the Jetty API directly
          </h3>
          <p className="mb-3 text-sm text-gray-600">
            Jetty exposes an OpenAI-compatible{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              /v1/chat/completions
            </code>{" "}
            endpoint. Send a runbook as the system prompt with a{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              jetty
            </code>{" "}
            block, and Jetty handles sandbox provisioning, agent execution, and
            artifact persistence.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-gray-900 px-4 py-3 text-xs text-gray-100">
            {`curl -X POST https://flows-api.jetty.io/v1/chat/completions \\
  -H "Authorization: Bearer $JETTY_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [
      {"role": "system", "content": "<your runbook>"},
      {"role": "user", "content": "Generate a Croissant file for paper.pdf"}
    ],
    "jetty": {
      "runbook": true,
      "collection": "my-collection",
      "task": "pdf2mlcroissant",
      "snapshot": "python312-uv",
      "file_paths": ["path/to/paper.pdf"]
    }
  }'`}
          </pre>
          <p className="mt-3 text-xs text-gray-400">
            Sign up at{" "}
            <a
              href="https://dock.jetty.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 underline underline-offset-2 hover:text-gray-700"
            >
              dock.jetty.io
            </a>{" "}
            to get your API token. Choose any supported agent: Claude Code,
            Codex, or Gemini CLI.
          </p>
        </div>
      </section>

      {/* Supported agents */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Supported agents
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-700">Agent</th>
                <th className="px-4 py-3 font-medium text-gray-700">
                  Default model
                </th>
                <th className="px-4 py-3 font-medium text-gray-700">
                  API key needed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              <tr>
                <td className="px-4 py-2.5 font-medium">Claude Code</td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  claude-sonnet-4-6
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  ANTHROPIC_API_KEY
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium">Codex</td>
                <td className="px-4 py-2.5 font-mono text-xs">gpt-5.4</td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  OPENAI_API_KEY
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium">Gemini CLI</td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  gemini-3.1-pro-preview
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  GOOGLE_API_KEY
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Any MCP-compatible agent (Cursor, VS Code Copilot, Windsurf, Zed) can
          also connect to Jetty via the MCP server.
        </p>
      </section>

      {/* Learn more */}
      <section className="rounded-xl border border-gray-200 bg-white px-5 py-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-800">
          Learn more
        </h2>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li>
            <a
              href="https://docs.jetty.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
            >
              Jetty documentation
            </a>{" "}
            &mdash; full platform docs, guides, and API reference
          </li>
          <li>
            <a
              href="https://docs.jetty.io/guides/writing-runbooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
            >
              Writing runbooks
            </a>{" "}
            &mdash; how to write your own runbooks from scratch
          </li>
          <li>
            <a
              href="https://docs.jetty.io/agents/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
            >
              Agent setup
            </a>{" "}
            &mdash; connecting Claude Code, Codex, and other agents to Jetty
          </li>
          <li>
            <a
              href="https://dock.jetty.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 underline decoration-sky-200 underline-offset-2 hover:decoration-sky-400"
            >
              Create a Jetty account
            </a>{" "}
            &mdash; sign up and get your API token
          </li>
        </ul>
      </section>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
        {n}
      </span>
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="mt-0.5 text-gray-500">{children}</p>
      </div>
    </li>
  );
}

function AgentCommand({
  agent,
  command,
}: {
  agent: string;
  command: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500">{agent}</p>
      <pre className="overflow-x-auto rounded-lg bg-gray-900 px-4 py-2.5 text-xs text-gray-100">
        {command}
      </pre>
    </div>
  );
}
