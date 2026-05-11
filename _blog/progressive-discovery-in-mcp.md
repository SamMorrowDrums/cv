---
title: "Progressive Discovery in MCP"
date: '2026-05-11T00:00:00.000Z'
slug: 'progressive-discovery-in-mcp'
---

MCP has a context problem. Every tool a server exposes costs tokens in the system prompt — schema, description, parameters — whether the model needs it or not. Connect three or four servers and you can burn tens of thousands of tokens before the agent does anything useful. Anthropic measured accuracy dropping sharply after 30–50 tools in context. The protocol gives you everything at once, and everything at once is too much.

The answer isn't fewer tools. It's revealing tools at the right time.

## What progressive discovery means

Progressive discovery is the idea that tools should appear in the model's working set only when they're relevant to the current task. The full catalog exists, but the model sees a curated surface. You pay context tokens only for what you actually use.

This isn't a new concept in UI design — every well-designed interface reveals complexity gradually. But applying it to MCP tool catalogs requires solving a specific problem: how do you hide tools from the model's view while keeping them available for dispatch, without invalidating prompt cache every time the set changes?

## Three tiers, one harness

I built [mcpi-ext](https://github.com/SamMorrowDrums/mcpi-ext), an experimental extension for [mcpi](https://github.com/SamMorrowDrums/mcpi), to explore three complementary strategies for progressive tool discovery. Each tier pays only the context tokens it needs, and each is suited to different situations:

| Tier | Name | Mechanism | Best for |
|------|------|-----------|----------|
| 1 — Skills | The Skill Dealer | `skill://` resources gate tools via `allowed-tools` | Curated workflows |
| 2 — tool-cli | The Nuclear Football | CLI progressive discovery via shell | One-shot exploration |
| 3 — Code Mode | Codey C. Maude | Sandboxed JS over read-only tools with `outputSchema` | Computation across many calls |

The important architectural property: **all three tiers route MCP tool calls through the harness**. Whether the model loads a skill, shells out to `tool-cli`, or writes sandboxed JavaScript, the actual MCP call happens in the extension process. Every invocation is logged, observable, and can be gated — one choke point for all three access patterns.

## Tier 1: Skills as lazy-loaded tool groups

This is the core mechanism and the one I'm most excited about. MCP servers ship `skill://` resources — SKILL.md files with frontmatter declaring a name, description, and `allowed-tools` list. On connection, the extension discovers all skills and registers their tools with `deferred: true`: present in the tools array for dispatch but hidden from the model and the system prompt.

```yaml
---
name: review-pr
description: Conduct a thorough code review of a pull request.
allowed-tools:
  - pull_request_read
  - get_file_contents
  - add_comment_to_pending_review
  - pull_request_review_write
---
```

When the model calls `load_skill("review-pr")`, the skill's workflow instructions arrive and its tools get unblocked. The model discovers tools from the skill body and can call them immediately. The tools array and system prompt never change — prompt cache is fully preserved.

### How this differs from Anthropic's tool search

Anthropic's `tool_search` feature (introduced with `defer_loading`) is server-side search: the model queries a BM25 or regex index, and matching tools are loaded into context via `tool_reference` blocks. It's a great solution for the "too many tools" problem.

The skills approach is inspired by the same insight — defer tools and load on demand — but the invocation model is different. Instead of the server searching and returning tools, the **client initiates** loading by calling `load_skill`. The skill isn't just a set of tools — it's a workflow document. When you load `review-pr`, you don't just get four tools unlocked. You get instructions for how to conduct a code review: read the diff first, check for test coverage, use pending reviews to batch comments. The skill is a ceremony, not a search result.

Both Anthropic and OpenAI natively support `defer_loading`. The extension maps `deferred: true` to each provider's native mechanism — Anthropic hides the tool from the model's view, OpenAI auto-injects `tool_search` for server-side discovery. For providers without native support, a `tool_call` hook blocks premature calls and tells the model which skill to load:

> "Tool X requires loading a skill first. Call load_skill with: review-pr"

This creates a natural feedback loop that works across all providers.

### Skills on the GitHub MCP Server

[PR #2382](https://github.com/github/github-mcp-server/pull/2382) on the GitHub MCP Server replaces server instructions with skill resources. The server instructions were a single large text block injected into the system prompt on every connection — workflow guidance, tool usage tips, error handling patterns — all paid upfront regardless of what the agent actually needed to do.

Skills decompose that monolith into targeted resources. Instead of one block covering everything from PR creation to security audits, you get `create-pr`, `review-pr`, `triage-issues`, `debug-ci`, `security-audit` — twenty-seven skills, each mapping a user workflow to a specific set of tools with specific guidance. A test ensures every tool is covered by at least one skill:

```go
func TestAllSkillsCoverAllToolsets(t *testing.T) {
    allToolNames := make(map[string]bool)
    for _, tool := range AllTools(stubTranslator) {
        allToolNames[tool.Tool.Name] = true
    }
    coveredTools := make(map[string]bool)
    for _, skill := range allSkills() {
        for _, toolName := range skill.allowedTools {
            coveredTools[toolName] = true
        }
    }
    for toolName := range allToolNames {
        assert.True(t, coveredTools[toolName],
            "tool %q is not covered by any skill", toolName)
    }
}
```

This same PR also adds structured output schemas to read-only tools. Tools like `list_issues`, `search_code`, and `get_me` now return typed `OutputSchema` and `StructuredContent` alongside the existing text content. This is the server-side prerequisite for Code Mode (Tier 3) — you need machine-parseable output to chain tools in a sandbox.

## Tier 2: tool-cli — the thin wrapper

`tool-cli` is a shell command that speaks JSON-RPC to the extension. The agent uses it like any Unix tool — composable with pipes, grep, jq, loops. Discovery is progressive: server list → tool list → schema → call. Each step pays only the tokens it needs.

```sh
tool-cli --help                                # What servers exist?
tool-cli github                                # What tools does this server have?
tool-cli github search_code                    # What's the schema for this tool?
tool-cli github search_code '{"query":"auth"}' # Call it
```

The subtlety that matters: **tool-cli is just a shortcut to the same invocation path**. The CLI binary is a thin HTTP client that calls the extension's RPC server on localhost. The extension receives the request and dispatches it through the same `McpClientManager` that handles skill-gated tools and Code Mode sandbox calls. Every tool-cli invocation appears in the agent log. Future human-in-the-loop gating can be added at one point — the RPC server — and it covers all three tiers.

This is good for one-shot exploration and ad-hoc chaining. `tool-cli github search_code '{"query":"auth"}' | jq '.items[].path'` — one call, pipe to jq, done. It's the escape hatch for when no skill exists for what you need, or when you just want to poke around a server you haven't used before.

## Tier 3: Code Mode — computation across many calls

Inspired by [Cloudflare's Code Mode](https://blog.cloudflare.com/code-mode/), this tier targets tools that are **read-only** and return **structured output**. When both conditions are met, a tool is safe for autonomous use — it can't modify anything, and its results are machine-parseable.

The model writes JavaScript that chains MCP tool calls inside a V8 isolate — 128MB memory limit, 30-second timeout, no filesystem or network access:

```javascript
const issues = await codemode.list_issues({
  repo: "owner/repo", state: "open"
});
const critical = issues.filter(i =>
  i.labels.includes("critical")
);
const details = await Promise.all(
  critical.map(i => codemode.get_issue({ number: i.number }))
);
return details.map(d => ({
  title: d.title, assignee: d.assignee
}));
```

Tool calls dispatch to the host via `Reference` callbacks — MCP execution happens outside the sandbox. The sandbox can read but never touch the real world.

This is where structured output schemas (from that same PR #2382) become essential. Without `outputSchema`, the sandbox code would be guessing at response shapes. With typed output, the model can write `.filter()`, `.map()`, and `Promise.all()` knowing exactly what fields exist. 876 issues across 9 pages, counting labels per issue, building a histogram — that's a loop with state. Doing it via individual tool calls would mean 9 separate calls plus manual aggregation. Code Mode does it in one sandbox execution.

## The three working together

A real task: "Triage the backlog — find stale bugs older than 90 days with no recent activity, summarize patterns, and close obvious duplicates."

1. **Code Mode** paginated all open bug issues, filtered by `updated < 90d ago`, grouped by label and keyword to find clusters. Computation across many pages — this is what sandboxes are for.

2. **tool-cli** spot-checked suspect issues. `tool-cli github get_issue '{"number":42}'` piped through `jq` to eyeball specific fields. Quick, ad-hoc, composable.

3. **Skills** loaded `triage-issues` to actually close the duplicates — following the project's triage workflow with correct labels, comment templates, and close reasons. The ceremony, performed correctly.

Skills for workflows. tool-cli for one-shots. Code Mode for computation. The three are not competing. They are collaborating.

## What this means for MCP server authors

If you're building MCP servers, the practical takeaway is: **ship skills with your server**. Define `skill://` resources that group your tools into user workflows. Add `outputSchema` to your read-only tools so clients can build Code Mode-style sandboxes on top of them. Use tool annotations (`readOnlyHint`, `destructiveHint`) so harnesses can make safety decisions.

The server doesn't need to know how the client will use these. It just needs to declare: here are my tools, here are the workflows they support, here is the shape of their output. The harness decides when and how to reveal them.

MCP doesn't have a context problem. It has a discovery problem. And the pieces to solve it — skills, tool annotations, structured output — are already in the protocol. You just have to use them.

The [mcpi-ext source](https://github.com/SamMorrowDrums/mcpi-ext) is public. The [skills-as-groups spec proposal](https://github.com/modelcontextprotocol/experimental-ext-grouping/pull/13) is open for discussion. And [PR #2382](https://github.com/github/github-mcp-server/pull/2382) on the GitHub MCP Server shows what this looks like in practice — structured output and skills replacing the monolithic server instructions.
