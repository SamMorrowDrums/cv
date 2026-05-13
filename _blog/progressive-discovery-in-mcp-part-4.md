---
title: "Codey C. Maude"
date: '2026-06-03T00:00:00.000Z'
slug: 'progressive-discovery-in-mcp-part-4'
---

![A luminous figure composed of flowing code, sitting cross-legged in a V8 isolate bubble, reading structured data from floating JSON schemas](/images/progressive-discovery/code-c-maude.webp)

> *Codey does not ask permission. Codey does not need to. Everything Codey touches is read-only, every result is typed, and the sandbox cannot be escaped. Codey is safe by construction.*

*This is Part 4 of the Progressive Discovery in MCP series. See* [*Part 1*](/blog/progressive-discovery-in-mcp-part-1)*,* [*Part 2*](/blog/progressive-discovery-in-mcp-part-2)*, and* [*Part 3*](/blog/progressive-discovery-in-mcp-part-3)*.*

Code Mode is what happens when you take the MCP CLI's composability and remove the per-call context cost entirely. The model writes JavaScript that chains MCP tool calls inside a V8 isolate. The intermediate results never enter the model's context. Only the final computed answer comes back.

This is inspired by [Cloudflare's Code Mode](https://blog.cloudflare.com/code-mode/), which lets agents write TypeScript against a typed SDK to orchestrate tool calls in a Worker sandbox. It's a brilliant idea. But I think their implementation trades away some of MCP's most important properties, and I wanted to explore a version that doesn't.

## The problem with collapsing everything into two tools

Cloudflare's approach gives the model two tools: `search()` (explore the API spec) and `execute()` (run code). This collapses hundreds of endpoints into a tiny token footprint. The efficiency is real.

But when everything is a code blob inside `execute()`, you lose granularity:

- **No per-tool observability.** Which API endpoint did the code call? How many times? You'd have to parse the generated code to find out.
- **No per-tool annotations.** MCP tool annotations (`readOnlyHint`, `destructiveHint`) exist so clients can make safety decisions per operation. Inside a code blob, those annotations don't apply. Everything is just "code that ran."
- **No per-tool HITL.** You can't confirm "are you sure you want to delete this?" when the delete is line 47 of a 60-line script. The model already wrote the code. The granularity of confirmation is the entire execution, not the individual operation.

I think progressive discovery of granular, well-annotated tools is a better path than making fewer mega-tools. You keep MCP's safety properties. You keep observability. You keep the ability to gate specific operations. You just need to be smarter about when and how tools are revealed.

## Eligibility: two conditions

Code Mode in mcpi-ext targets tools that meet two conditions:

1. **`readOnlyHint: true`** - the tool can't modify anything. You could trivially expand this to write and destructive tools, but for that I'd want HITL controls set up first, and I haven't done that yet in this experiment.
2. **`outputSchema` defined** - the tool returns typed, machine-parseable structured output

When both conditions are met, a tool is safe for autonomous use. It can't cause damage, and the model can write `.filter()`, `.map()`, and `Promise.all()` knowing exactly what fields exist. No guessing at response shapes.

This is where [structured output schemas on the GitHub MCP Server](https://github.com/github/github-mcp-server/pull/2382) become essential. That PR adds `OutputSchema` and `StructuredContent` to read-only tools like `list_issues`, `search_code`, `list_pull_requests`, and `get_me`. The Go SDK's `mcp.AddTool[In, Out]()` generic path reflects on the `Out` type to auto-generate a JSON Schema. When the handler returns, the SDK marshals the typed output into `StructuredContent` alongside the existing text `Content`. Backwards compatible, but now machine-parseable.

Not every tool qualifies today. Multi-method tools like `issue_read` (which has `get`, `get_comments`, `get_sub_issues`, `get_labels` methods, each returning a different shape) can't have a single `OutputSchema`. They stay as `Out=any` with no structured output. This is a consequence of consolidating tools to reduce context cost - we merged multiple operations into one tool with a `method` parameter. If progressive discovery became more universally supported across MCP clients, I'd move back towards granular tools. Each operation gets its own schema, its own annotations, its own eligibility for Code Mode. The consolidation was always a workaround for the lack of progressive discovery, not a design preference.

## The sandbox

A caveat: this implementation isn't built to be a perfect sandbox. It's here to showcase the power of the pattern. Building production-grade sandboxes is genuinely hard - GitHub puts tremendous effort into sandboxing for Copilot coding agent, and it's a constant source of complexity. This is a proof of concept.

The code runs in a V8 isolate via [`isolated-vm`](https://github.com/nicholasgasior/isolated-vm):

- 128MB memory limit, 30-second timeout
- No access to filesystem, network, or Node.js APIs
- Tool calls dispatch to the host via `Reference` callbacks. The actual MCP execution happens outside the sandbox, in the extension process, through the same harness that handles skills and tool-cli.
- \~15ms overhead, negligible vs MCP network I/O

I evaluated alternatives. Node's `vm` module is [documented as "not a security mechanism"](https://nodejs.org/api/vm.html#vm-executing-javascript) and is escapable via prototype pollution. Deno subprocess adds 400ms per call. Cloudflare's workerd is powerful but complex for interactive use. `isolated-vm` gives genuine V8-level isolation with minimal overhead.

The model gets two tools:

| Tool | Purpose |
| --- | --- |
| `code_search` | Discover available tools: `codemode.listTools()`, `codemode.describeTools(names)` |
| `code_execute` | Write JS that calls `codemode.toolName(args)`, returns computed result |

## Why this matters: O(data fetched) vs O(answers needed)

Here's the histogram example. I asked the agent to scan all open issues on `github/github-mcp-server` and build a label distribution:

```javascript
const allIssues = [];
let page = 1;
while (true) {
  const result = await codemode.list_issues({
    owner: "github", repo: "github-mcp-server",
    state: "OPEN", perPage: 100, page
  });
  allIssues.push(...result.issues);
  if (result.issues.length < 100) break;
  page++;
}

const labelCounts = {};
for (const issue of allIssues) {
  for (const label of issue.labels) {
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  }
}

return Object.entries(labelCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([label, count]) => ({ label, count }));
```

876 issues across 9 pages. With classical tool calls, that's 9 tool messages of \~50KB JSON each sitting in your transcript forever. The model has to attend over all of that on every subsequent turn.

With Code Mode, the 876 issues live inside V8. Only the label histogram (\~1KB) enters the model's context. The transcript grows with O(answers needed), not O(data fetched). This is not just cheaper. It's algorithmically better. A prompt cache does not fix this - cached input still has to be attended over.

![Code Mode in action - 876 issues scanned, label histogram returned](/images/progressive-discovery/code-mode-histogram.png)

## HITL is still possible

Because every tool call inside the sandbox routes back through the harness via `Reference` callbacks, the extension can still inspect each individual MCP call. If a future version allows write tools in Code Mode (with appropriate gating), the harness could pause execution, ask the user for confirmation, and resume. The sandbox doesn't bypass the choke point. It uses it.

This is the difference between "the model ran some code and stuff happened" and "the model ran code that made 9 auditable MCP calls, each of which we can log, rate-limit, or gate."

## When to reach for Code Mode

The rule is simple: if you need real computation across many calls, Code Mode. Pagination loops. Aggregation. Joins across tool outputs. Math. Anything where the intermediate data is large but the answer is small.

- 876 issues across 9 pages, counting labels, building a histogram
- For each open PR, fetch reviews and compute average time-to-first-review
- Paginate all items, filter by date, group by author, summarize

Doing any of these via individual tool calls means every intermediate result roundtrips through the model. Doing them via tool-cli means the JSON flows through pipes (better), but the bash loop logic gets awkward for complex aggregation. Code Mode is the right shape for this work. Models are good at writing code. Let them write code.

> *"I can see everything," Codey said, eyes reflecting infinite JSON. "I just can't exfiltrate it. That's the point. That's why they trust me."*
---

*Have thoughts on this article or progressive discovery in MCP in general? I opened a [discussion on GitHub](https://github.com/SamMorrowDrums/cv/discussions/63) for this series.*
