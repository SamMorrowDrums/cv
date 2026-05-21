---
title: "The Skill Dealer: Skills over MCP"
date: '2026-05-20T00:00:00.000Z'
slug: 'progressive-discovery-in-mcp-part-2'
---

![A shadowy figure behind a table of glowing cards, each card inscribed with the name of an MCP tool](/images/progressive-discovery/the-skill-dealer.webp)

> *The Skill Dealer does not simply overwhelm you with everything. The Skill Dealer gives you only what you need. Context is everything.*

*This is Part 2 of the* [*Progressive Discovery in MCP*](/blog/progressive-discovery-in-mcp-part-1) *series.*

Skills over MCP self-describing the server itself is perhaps the most novel idea in this whole series, we'll unpack all parts of this, why it's needed and how I've approached it in my example agent [`mcpi`](https://github.com/SamMorrowDrums/mcpi-ext). I mentioned the harness I build also uses a `tool-cli` and Code Mode. They are powerful, but they're patterns any sufficiently motivated client builder could ship tomorrow. Skills over MCP are different. They change the relationship between server and client. They're an emerging spec direction that could reshape how MCP servers are designed. They help to solve a problem that I've been wrestling with since we first hit tool bloat problems with the [GitHub MCP Server](https://github.com/github/github-mcp-server): how do you give an agent access to everything without showing it everything?

I'll start with this: directionally agents need a combination between seamless guided agentic workflows that maximise success, access to atomic tools that can genuinely accommodate all possible tasks that could need to be achieved (overly compound tools are not better, context issues aside) and smart context management so that large tool outputs and all the instructions are not filling the context window with irrelevant stuff.

CLIs, MCPs, [Plugins](https://github.com/vercel-labs/open-plugin-spec), whatever, it doesn't matter the problems and solutions are the same and **every solution proposed so far as the new standard or best practice has serious flaws**, content marketers don't really want to expose the flaws, but I do and understanding them really matters.

To understand why I'm excited about skills over MCP at all, let's first look at MCP's [Server Instructions](https://modelcontextprotocol.io/specification/2025-11-25/schema#initializeresult-instructions) - which are a preamble for agents that is designed to house a mix of general advice on the purpose and usage of an MCP server, and help with cross-cutting concerns like combined workflows involving multiple tools. When you configure GitHub MCP, the tool surface changes and so do our server instructions. This is better than referencing tools that are not there with a static block, but still not great. For starters, to avoid context bloat a lot of agents don't even read these instructions, but even if they do, they cannot be specific to the task in hand, because the server still has no idea what the user is actually intending to do. These instructions get loaded at the very start. **I really want this to work better**.

## The problem with server instructions

MCP has a feature called [Server Instructions](https://blog.modelcontextprotocol.io/posts/2025-11-03-using-server-instructions/). When a client connects, the server can return a block of text that gets injected into the system prompt. On the GitHub MCP Server, we used this for workflow guidance, tool usage tips, error handling patterns. It is both useful and it is a monolith. We do limit it by active toolsets, but that's hardly progressive discovery.

Every agent either eats the full cost of that context, or ignores it and makes more mistakes but has more context window left. That's a crummy trade either way. On top of this, it is intended to be consumed in its entirety regardless of what the agent is about to do. Filing a bug? You might still have instructions for the PR review workflow. Server instructions are paid upfront, always.

The same problem applies to tools themselves without intervention. Connect to the GitHub MCP Server and your agent sees 40+ tool schemas in the system prompt by default. Many of them are irrelevant to what you're about to do in any given session. Prompt caching amortizes much of the billing cost, but cached tokens still sit in the attention window. The model is reasoning past thousands of tokens of schema it doesn't need, on every single turn.

## What are skills

An [agent skill](https://agentskills.io/specification) is a folder with instructions, possibly scripts and importantly metadata that includes a name and description used to describe the purpose of the skill. The name and description are shown to the model pre-invocation, and the instructions part is only loaded into context when the skill is invoked. The progressive discovery paradigm is baked into most modern agents for skills, but one thing that surprises a lot of people is that they **cannot actually do anything** they are structured prompts, requiring context engineering to surface the metadata to the model, tools to invoke skills and then if a skill bundles scripts they rely on agents having a shell tool. They are popular and can be very effective, however all known progressive discovery paradigms have a critical flaw, which is that the model has not seen the details, and so may not actually invoke it at the right time. RAG, CLI usage and Anthropic's [Tool Search Tool](https://docs.claude.com/en/docs/agents-and-tools/tool-use/tool-search-tool) all have this challenge, and the agent must do some poking around in the dark, and will not always do the right thing at the right time, and may also forget parts or all of the instructions given sufficiently long context to process.

I am still bullish about progressive discovery and how it applies to skills, because I think if you name and describe them well (and write them for what the agent *doesn't do right first time*), then you will reduce token usage and succeed faster. The cheat mode for CLIs is model pre-training, models have a long tail of public usage of popular CLI tools, often this info is stale, but many are stable enough for that not to matter - and models will bash their head off a wall until success usually. Other popular agent primitives  such as MCPs and skills can also benefit from this pre-training once model training and evaluation has had time to catch up - that CLI advantage isn't fixed, it's just currently the case. An unwritten theme in most "best practices for agents" articles is often that they are tightly coupled to exactly how things are today and poorly predict the future, so while reading mine with that lens, please consider that things you thought were fixed about context engineering, MCP and skills probably aren't actually fixed.

I've digressed enough, what is special about skills over MCP?

## Skills over MCP?

Skills can be delivered in many ways; in my `mcpi` experiment, they're served as `skill://` resources on MCP servers. MCP servers can trivially serve agent skills directly to agents (even ones without a filesystem), including ones that can describe how to better use subsets of their own tools etc. doesn't that sound like server instructions? Yes. And doesn't it already come with progressive discovery? Yes, that's exactly where skills over MCP can shine. Even without the addition of progressive discovery of tools, this already could allow MCP server authors to remove Server Instructions, thin out tool descriptions, and make the specific skills load bearing and get some progressive discovery benefit immediately. It's also the case that a team could ship an MCP that has always up-to-date set of team skills without providing tools. MCP servers have always been capable of serving static file content via [Resources](https://modelcontextprotocol.io/specification/2025-11-25/server/resources), and agent builders have pretty much across the board failed to incorporate that effectively, that's not MCP's fault, but I hope Skills over MCP will be enough of a carrot that they finally course correct, and start seeing how powerful this is.

> My top bugbear with this (if you'll allow me to digress), is the GitHub MCP should not have a get_file_content tool, it has [resource templates](https://modelcontextprotocol.io/specification/2025-11-25/server/resources#resource-templates) to get all revisions of all files the agent can access - the only problem? The abject failure of agent harnesses to utilise it - and the kicker is agents could trivially download file content to temp files and allow the agents to read all or part of them with correct extensions and mime types etc. so they would actually have more chance of correct first-time parsing. I will celebrate the day I delete this tool. Now back to skills.

The additions that make agent skills over MCP Resources extra interesting for progressive discovery go beyond the lazy loading of the skill itself to the bundled metadata via the skill frontmatter. Agent harnesses can be built to react to specific metadata in the skill at invocation time. In my `mcpi` PoC each skill declares which MCP tools it relates to. This allows the agent harness to gate tools until a skill is invoked. This way 1000 tools is likely fine, the model will only see a couple of them if it invokes a skill that enables the tools. You can probably see where this is going. The astute amongst you might be asking "but won't this bust the prompt cache?", and the answer is a little further down - but it can and should be a firm no.

These Skill/Tool associations use the `metadata` field with a namespaced key (`io.modelcontextprotocol/tools`) to list out the applicable tools by name. Aside: I had initially looked at overloading the experimental `allowed-tools` field in the agent skills spec. In the end we decided in the [MCP Discord](https://discord.gg/6CSzBmMkjX) that defining custom metadata keys keeps the skill spec clean (and independent) while the MCP-specific tool gating can exist in the custom metadata. The skills specification already allows this, so it doesn't need to wait for formal spec alignment. Clients that don't understand the metadata just ignore it. This can be implemented as a non-standard addition to MCP server integration today (as I have done with `mcpi`).

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

The frontmatter is machine-readable metadata. The body is the workflow document the model receives when it loads the skill. The skill isn't just a set of tools, it's the instructions too.

All this said, there is still the prompt cache problem. Changing the tools available to the model conventionally busts the entire prompt cache by replacing the tools block at the start of the cache. Those folks would be correct, and we will explore how this can be prevented next.

## How deferred gating can work

On connection, the extension discovers all skills from all connected MCP servers via [`resources/list`](https://modelcontextprotocol.io/specification/2025-11-25/server/resources#listing-resources). It registers every tool named in any skill's `io.modelcontextprotocol/tools` with `deferred: true` from the [Tool Search Tool](https://docs.claude.com/en/docs/agents-and-tools/tool-use/tool-search-tool) lazy loading (this is set on the tool declarations to the model API, so the harness is the one that sets this property).

This means:

1. **The tool stays in the tools array** for grammar and dispatch. The model *can* call it.
2. **The tool is excluded from the system prompt.** The model doesn't see the schema until a skill names it.
3. **Provider-native deferral handles visibility** at the API level.

The last point matters. Both Anthropic and OpenAI now support `defer_loading` natively:

- **Anthropic** hides the tool from the model's view but keeps it in the output grammar. When `load_skill` returns, the extension injects `tool_reference` blocks inside the `tool_result` content, which makes the API expand the full tool schemas inline. No `tool_search` needed, no search latency. These `tool_reference` blocks were intended for model backed search results enabling tools when the model searches for them, but they seem to work when sent by the client without being instigated by search. **This is how I would expect this to work in practice**, the agent harness is in control of when a tool should be surfaced, and can use things like skills to decide when that should be.
- **OpenAI Responses** (GPT-5.4+) maps [`defer_loading: true`](https://developers.openai.com/api/docs/guides/tools-tool-search) with an auto-injected `{"type": "tool_search"}`. The model auto-discovers deferred tools via server-side search, and by naming them to the model in a user message, it can instantly find and invoke them. This is less good, but workable.

This creates a natural feedback loop where skills control exactly when tools become available. It would not be a stretch for model providers to add this.

### The cache preservation trick

This is subtle but critical. The tools array and system prompt **never change** throughout the conversation. Deferred tools are in the array from the start, but they get added effectively as user messages in these tool search approaches. Skills are in the system prompt from the start (as one-line name + description entries). When `load_skill` fires, it returns the skill body as a tool result in the conversation, and unblocks tools via provider-native mechanisms. Nothing structural changes. Prompt cache is fully preserved. Not all model providers support even tool search yet, never mind letting agent builders lazy load tools from client side, but I suspect they all will soon. 

![Skills enabling MCP tools - the model loads a skill and gains access to gated tools](/images/progressive-discovery/skills-enabling-mcp-tools.png)

## How this differs from Anthropic's tool search

Anthropic's [tool search](https://www.anthropic.com/engineering/advanced-tool-use) is server-side search: the model queries an index, and matching tools are loaded into context via `tool_reference` blocks. It's a great solution for the "too many tools" problem, and the context savings are real. Real enough they shipped this by default in [Claude Code](https://www.anthropic.com/news/enable-claude-code-to-work-more-autonomously).

The skills approach is inspired by the same insight - defer tools and load on demand - but the invocation model is different:

**Tool search is reactive.** The model decides it needs a tool, searches for it, gets it. The model is doing discovery.

**Skills are proactive.** The MCP server declares workflows. The model loads a workflow by name and gets both the tools *and* instructions for using them together. The server is guiding discovery.

When you load `review-pr`, you don't just get four tools unlocked. You get instructions: read the diff first, check test coverage, batch comments via pending reviews. The skill encodes the ceremony, not just the capability. A search result gives you a hammer. A skill gives you the blueprint.

## Skills on the GitHub MCP Server

[PR #2382](https://github.com/github/github-mcp-server/pull/2382) on the GitHub MCP Server replaces server instructions with skill resources. Twenty-seven skills, each mapping a user workflow to a specific set of tools with specific guidance: `create-pr`, `review-pr`, `triage-issues`, `debug-ci`, `security-audit`, `prepare-release`, and more. Is that too many? Maybe, this is new territory and I am yet to eval the token savings.

A [test ensures every tool is covered](https://github.com/github/github-mcp-server/blob/sammorrowdrums/structured-output-schemas/pkg/github/skill_resources_test.go) by at least one skill. You can't ship a tool without thinking about which workflow it belongs to. You can't add a skill without writing the instructions that make it useful. The skill is the unit of quality, not the tool.

Why did I want every tool to be covered by at least one skill?

## Why this forces better server design

This is the part I care most about. Server instructions were easy to write badly. You can easily dump something that is not actually useful to the model, and stuff put in the context up front doesn't have to earn the right to attention. Skills demand specificity. Each skill is a promise: "if you load this, you will have what you need to accomplish this task effectively."

That promise is testable. Future work could eval skill effectiveness: does loading `review-pr` actually lead to better code reviews than giving the model all tools upfront? I think the answer will be yes, because the skill primes the model with a workflow, not just a set of capabilities, and the model has less context to reason through and so will be more focused on the parts that it has in the window.

It's also backward-compatible. Clients that don't support skills just ignore the `skill://` resources. The tools still work the normal way. Server authors can ship skills today without breaking any existing client.

## The spec direction

The [skills-as-groups proposal](https://github.com/modelcontextprotocol/experimental-ext-grouping/pull/13) is open for discussion on the MCP experimental extensions repo. This is an emerging spec direction, not a ratified standard. I think it could become one. Skills over MCP could enable progressive discovery of the entire MCP surface, making MCP servers act as self-contained plugin systems that work everywhere the protocol does - including sandboxed remote agents, mobile apps, and environments without shell access.

If you're building MCP servers or clients and have opinions on how this should work, the proposal needs your input.

I'm not the only one experimenting in this direction. [Ola Hungerford](https://github.com/olaservo), a fellow MCP maintainer, has a [demo branch on the GitHub MCP Server](https://github.com/github/github-mcp-server/pull/2428) exploring bundled static skills, skill resource templates, and replacing toolset-specific server instructions with bundled skills - without the progressive discovery layer, but along the same axis. The broader skills-on-MCP idea is moving quickly in the [MCP Discord](https://discord.gg/6CSzBmMkjX), and the more clients and servers that adopt the resource convention, the cheaper experimenting with progressive discovery on top of it becomes.

## Try it yourself

If you went through the [Part 1 setup](/blog/progressive-discovery-in-mcp-part-1#try-it-yourself) you already have everything you need. If not, here's the short version targeted at experiencing skills end-to-end.

### 1. Install

```sh
npm install -g @sammorrowdrums/mcpi@latest @sammorrowdrums/mcpi-ext@latest @sammorrowdrums/tool-cli@latest
```

### 2. Configure the GitHub MCP Server (skills branch)

Create `~/.config/mcpi-ext/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server:skill-discovery",
        "stdio"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

The `skill-discovery` image tag is built from [PR #2382](https://github.com/github/github-mcp-server/pull/2382) and ships the twenty-seven `skill://` resources. Replace `your-token-here` with your [GitHub personal access token](https://github.com/settings/tokens).

### 3. Run

```sh
mcpi --extension $(npm root -g)/@sammorrowdrums/mcpi-ext/dist/index.js \
  --mcp-config ~/.config/mcpi-ext/mcp.json
```

### 4. Watch progressive discovery happen

On startup the extension calls [`resources/list`](https://modelcontextprotocol.io/specification/2025-11-25/server/resources#listing-resources), discovers the skills, and registers their declared tools as deferred. You'll see something like `27 skills discovered, N tools deferred` in the harness output.

Then ask the agent something workflow-shaped:

> *"Review pull request #1234 on github/github-mcp-server."*

Watch the conversation log: the model loads the `review-pr` skill, the gated tools (`pull_request_read`, `get_file_contents`, `add_comment_to_pending_review`, `pull_request_review_write`) become visible, and the rest of the 100+ tool catalogue stays out of context. Compare the token usage to running the same prompt against the default GitHub MCP configuration to see the savings for yourself.

## For MCP server developers

If you want to try this on your own server, PR #2382 on the GitHub MCP Server is a concrete example. It adds twenty-seven `skill://` resources and structured output schemas to read-only tools. The skills replace the monolithic server instructions with targeted workflow documents. There is an addition of structured outputs to some tools to enable Code Mode and tool-cli to work with typed, machine-parseable responses rather than guessing at JSON shapes, but that will be covered in parts 3 and 4.

The two things that matter most for progressive discovery compatibility:

1. **Ship `skill://` resources** that group your tools into user workflows. Each skill should map to a real task, not just a category. "Review a PR" is a skill. "Pull request tools" is semantic grouping of tools, or a toolset as we call them in GitHub MCP. 
2. **Add `outputSchema` to read-only tools at least** so that Code Mode (and any future computation layer) can work with typed responses efficiently. They haven't been widely used thus far. I predict that will change with reason. Don't be the person that waits for the other side to implement it, MCP has suffered needlessly from client devs waiting for server devs or vice versa to decide what to do. We should all do better.

The [mcpi-ext server developer guide](https://github.com/SamMorrowDrums/mcpi-ext/blob/main/docs/server-developer-guide.md) has implementation details for both.

> *"What you do not need to know," said the Skill Dealer, shuffling the deck, "you will not be burdened with knowing."*
---

*Have thoughts on this article or progressive discovery in MCP in general? I opened a [discussion on GitHub](https://github.com/SamMorrowDrums/cv/discussions/63) for this series.*
