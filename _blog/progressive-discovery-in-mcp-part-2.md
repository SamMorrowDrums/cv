---
title: "The Skill Dealer"
date: '2026-05-20T00:00:00.000Z'
slug: 'progressive-discovery-in-mcp-part-2'
---

![A shadowy figure behind a table of glowing cards, each card inscribed with the name of an MCP tool](/images/progressive-discovery/the-skill-dealer.webp)

> *The Skill Dealer does not give you what you ask for. The Skill Dealer gives you what you need - and nothing more.*

*This is Part 2 of the* [*Progressive Discovery in MCP*](/blog/progressive-discovery-in-mcp-part-1) *series.*

Skills are the big idea in this series. tool-cli and Code Mode are powerful, but they're patterns any sufficiently motivated client builder could ship tomorrow. Skills over MCP are different. They change the relationship between server and client. They're an emerging spec direction that could reshape how MCP servers are designed. And they solve the problem that has been nagging me since we hit 100 tools on the GitHub MCP Server: how do you give an agent access to everything without showing it everything?

## The problem with server instructions

MCP has a feature called server instructions. When a client connects, the server can return a block of text that gets injected into the system prompt. On the GitHub MCP Server, we used this for workflow guidance, tool usage tips, error handling patterns. It was useful. It was also a monolith.

Every connection paid the full cost of that text block, regardless of what the agent was about to do. Filing a bug? You still got the PR review workflow. Searching code? You still got the issue triage instructions. Server instructions are paid upfront, always, in full.

The same problem applies to tools themselves. Connect to the GitHub MCP Server and your agent sees 40+ tool schemas in the system prompt. Most of them are irrelevant to what you're about to do. Prompt caching amortizes the billing cost, but cached tokens still sit in the attention window. The model is reasoning past thousands of tokens of schema it doesn't need, on every single turn.

## What a skill is

A [skill](https://agentskills.io/specification) is a workflow document - a name, description, and instructions for a task. Skills can be delivered in many ways; in this experiment, they're served as `skill://` resources on MCP servers. The addition that makes them interesting for progressive discovery is tool metadata - the skill declares which MCP tools it relates to, so the harness knows which tools to gate behind it.

A design note: in the latest iteration, tool associations use the `metadata` field with a namespaced key (`io.modelcontextprotocol/tools`) rather than a top-level `allowed-tools` field. This keeps the skill spec clean - the MCP-specific tool gating lives in custom metadata that the skills specification already allows, so it doesn't need to wait for formal spec alignment. Clients that don't understand the metadata just ignore it.

```yaml
---
name: review-pr
description: Conduct a thorough code review of a pull request.
metadata:
  io.modelcontextprotocol/tools: "pull_request_read get_file_contents add_comment_to_pending_review pull_request_review_write"
---

# Review PR

Read the diff first with `pull_request_read` (method: get_diff).
Check for test coverage. Use pending reviews to batch comments
rather than posting them one at a time.

## Available Tools
- `pull_request_read` - read PR details, diff, reviews, comments
- `get_file_contents` - read source files for context
- `add_comment_to_pending_review` - add inline review comments
- `pull_request_review_write` - submit the review
```

The frontmatter is machine-readable metadata. The body is the workflow document the model receives when it loads the skill. The skill isn't just a set of tools. It's a ceremony.

## How deferred gating works

On connection, the extension discovers all skills from all connected MCP servers via `resources/list`. It registers every tool named in any skill's `allowed-tools` with `deferred: true`. This means:

1. **The tool stays in the tools array** for grammar and dispatch. The model *can* call it.
2. **The tool is excluded from the system prompt.** The model doesn't see the schema until a skill names it.
3. **Provider-native deferral handles visibility** at the API level.

The last point matters. Both Anthropic and OpenAI now support `defer_loading` natively:

- **Anthropic** hides the tool from the model's view but keeps it in the output grammar. When `load_skill` returns, the extension injects `tool_reference` blocks inside the `tool_result` content, which makes the API expand the full tool schemas inline. No `tool_search` needed, no search latency.
- **OpenAI Responses** (GPT-5.4+) maps `defer_loading: true` with an auto-injected `{"type": "tool_search"}`. The model auto-discovers deferred tools via server-side search.

This creates a natural feedback loop where skills control exactly when tools become available.

### The cache preservation trick

This is subtle but critical. The tools array and system prompt **never change** throughout the conversation. Deferred tools are in the array from the start. Skills are in the system prompt from the start (as one-line name + description entries). When `load_skill` fires, it returns the skill body as a tool result in the conversation, and unblocks tools via provider-native mechanisms or the hook. Nothing structural changes. Prompt cache is fully preserved.

![Skills enabling MCP tools - the model loads a skill and gains access to gated tools](/images/progressive-discovery/skills-enabling-mcp-tools.png)

## How this differs from Anthropic's tool search

Anthropic's [tool search](https://www.anthropic.com/engineering/advanced-tool-use) is server-side search: the model queries an index, and matching tools are loaded into context via `tool_reference` blocks. It's a great solution for the "too many tools" problem, and the context savings are real (up to 85% reduction).

The skills approach is inspired by the same insight - defer tools and load on demand - but the invocation model is different:

**Tool search is reactive.** The model decides it needs a tool, searches for it, gets it. The model is doing discovery.

**Skills are proactive.** The MCP server declares workflows. The model loads a workflow by name and gets both the tools *and* instructions for using them together. The server is guiding discovery.

When you load `review-pr`, you don't just get four tools unlocked. You get instructions: read the diff first, check test coverage, batch comments via pending reviews. The skill encodes the ceremony, not just the capability. A search result gives you a hammer. A skill gives you the blueprint.

## Skills on the GitHub MCP Server

[PR #2382](https://github.com/github/github-mcp-server/pull/2382) on the GitHub MCP Server replaces server instructions with skill resources. Twenty-seven skills, each mapping a user workflow to a specific set of tools with specific guidance: `create-pr`, `review-pr`, `triage-issues`, `debug-ci`, `security-audit`, `prepare-release`, and more.

A [test ensures every tool is covered](https://github.com/github/github-mcp-server/blob/sammorrowdrums/structured-output-schemas/pkg/github/skill_resources_test.go) by at least one skill. You can't ship a tool without thinking about which workflow it belongs to. You can't add a skill without writing the instructions that make it useful. The skill is the unit of quality, not the tool.

## Why this forces better server design

This is the part I care most about. Server instructions were easy to write badly. You dumped a wall of text and hoped the model would figure it out. Skills demand specificity. Each skill is a promise: "if you load this, you will get these tools and this workflow, and together they will accomplish this task."

That promise is testable. The test above proves coverage. Future work could eval skill effectiveness: does loading `review-pr` actually lead to better code reviews than giving the model all tools upfront? I think the answer is yes, because the skill primes the model with a workflow, not just a set of capabilities.

It's also backward-compatible. Clients that don't support skills just ignore the `skill://` resources. The tools still work the normal way. Server authors can ship skills today without breaking any existing client.

## The spec direction

The [skills-as-groups proposal](https://github.com/modelcontextprotocol/experimental-ext-grouping/pull/13) is open for discussion on the MCP experimental extensions repo. This is an emerging spec direction, not a ratified standard. I think it could become one. Skills over MCP could enable progressive discovery of the entire MCP surface, making MCP servers act as self-contained plugin systems that work everywhere the protocol does - including sandboxed remote agents, mobile apps, and environments without shell access.

If you're building MCP servers or clients and have opinions on how this should work, the proposal needs your input.

I'm not the only one experimenting in this direction. [Ola Hungerford](https://github.com/olaservo), an MCP maintainer, has a [demo branch on the GitHub MCP Server](https://github.com/github/github-mcp-server/pull/2428) exploring bundled static skills, skill resource templates, and replacing toolset-specific server instructions with bundled skills - without the progressive discovery layer, but along the same axis. The broader skills-on-MCP idea is moving quickly in the MCP Discord, and the more clients and servers that adopt the resource convention, the cheaper experimenting with progressive discovery on top of it becomes.

## For MCP server developers

If you want to try this on your own server, [PR #2382 on the GitHub MCP Server](https://github.com/github/github-mcp-server/pull/2382) is a concrete example. It adds twenty-seven `skill://` resources and structured output schemas to read-only tools. The skills replace the monolithic server instructions with targeted workflow documents. The structured outputs enable Code Mode and tool-cli to work with typed, machine-parseable responses rather than guessing at JSON shapes.

The two things that matter most for progressive discovery compatibility:

1. **Ship `skill://` resources** that group your tools into user workflows. Each skill should map to a real task, not just a category. "Review a PR" is a skill. "Pull request tools" is a toolset. The difference is that the skill comes with instructions.
2. **Add `outputSchema` to read-only tools** so that Code Mode (and any future computation layer) can work with typed responses. The MCP SDK's generic registration paths can often infer the schema from your return types.

The [mcpi-ext server developer guide](https://github.com/SamMorrowDrums/mcpi-ext/blob/main/docs/server-developer-guide.md) has implementation details for both.

> *"What you do not need to know," said the Skill Dealer, shuffling the deck, "you will not be burdened with knowing."*
---

*Have thoughts on this article or progressive discovery in MCP in general? I opened a [discussion on GitHub](https://github.com/SamMorrowDrums/cv/discussions/63) for this series.*
