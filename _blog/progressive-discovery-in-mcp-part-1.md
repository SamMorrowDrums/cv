---

title: "MCP Doesn't Have a Context Problem"
date: '2026-05-13T00:00:00.000Z'
slug: 'progressive-discovery-in-mcp-part-1'

---

![Three figures in a dark, Sandman-esque realm - The Skill Dealer, The Nuclear Football, and Codey C. Maude - standing before swirling constellations of MCP tool connections](/images/progressive-discovery/banner.webp)

Mario Zechner wrote a post last year called ["What if you don't need MCP?"](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/). I like Mario. I watched him speak at AI Engineer Europe and was genuinely inspired by his approach to [Pi](https://pi.dev/) - the simplicity of it, the emphasis on doing your own context engineering, the "I was just crazy enough to build this" energy. He makes strong arguments about composability, bash fluency, and the tax that large MCP tool schemas impose on agents.

But I think he's wrong about the conclusion, and I think a lot of people are making the same mistake: conflating the laziest possible MCP implementation with the protocol itself.

Mario's critique boils down to: two MCP servers exposing 47 tools using \~32k tokens were just too many tools with too large a context footprint, they confuse the model, the results aren't composable, and you could replace it all with four bash scripts and a 225-token README. He's right about all of that, in that context.

But MCP doesn't tell you to dump every tool into the system prompt. MCP doesn't prevent you from composing results through pipes. MCP doesn't force you to roundtrip every intermediate result through the model. Those are implementation choices, and the entire industry of client builders made them by default because almost nobody applied serious context engineering to MCP.

I work on the [GitHub MCP Server](https://github.com/github/github-mcp-server). We have over 100 tools (just over 40 by default). We serve approaching 12 million tool calls a week. I've lived the tool bloat problem from the inside, and "having a CLI that models are well trained to use" at the same time - we watched agents get worse at using GitHub as we added more tools, while more and more people would ask "why not just use GitHub CLI?". Even myself, I have reasons to do both. I helped build `gh skills` too, adding ability to install agent skills directly from `gh cli`. Clearly, I see some value in CLIs, Skills and MCP all.

We tried toolsets (groups of related tools users could pick). We tried dynamic tool selection. I even prototyped a version with RAG-based semantic tool search back in April 2025. And what happened?

Everyone used the default settings. The dynamic tool selection actually worked well, but it busted the model cache on every tool set change, so we stopped innovating in that direction.

That was genuinely frustrating. We had elegant solutions, all they required was users to configure them. But most users don't configure things. So we took a different path: we optimised the out-of-the-box experience. We reduced the default tool count by 49%, consolidated CRUD tools, [cut output tokens by over 75%](https://github.blog/changelog/2025-09-15-github-mcp-server-0-4-leaner-outputs/) on tools like `list_pull_requests` without losing useful information.

But that was just trimming. Collectively what we have needed to build is progressive discovery - tools that appear in the model's working set only when they're relevant to the current task. The full catalog exists, but the model sees a curated surface. You pay context tokens only for what you actually use.

## The ideas aren't new. So where are the implementations?

Anthropic shipped [tool search with `defer_loading`](https://www.anthropic.com/engineering/advanced-tool-use) - server-side search that loads tools on demand, cutting context by up to 85%. Cloudflare shipped [Code Mode](https://blog.cloudflare.com/code-mode/) - the model writes code against a typed SDK, collapsing hundreds of endpoints into two tools. [Phil Schmid's mcp-cli](https://www.philschmid.de/mcp-cli) showed that progressive discovery via shell commands can reduce token usage by 85x. These are all real, working approaches. And none of them require giving up MCP.

In my [MCP Dev Summit talk](https://www.youtube.com/watch?v=ideYDMJKujE&list=PLjULwdJUtFdhIBhibLEogtK1XYCNaFyFl&index=10), I said "MCP vs CLI is the wrong question" - and I meant it. Both CLIs and MCP are in the mix. Every hot take that says one kills the other is really just saying "at this exact moment, this works well for me." Extrapolating that into the future is a mistake.

I got bored waiting for others, so I finally built the thing I kept talking about.

## Three tiers, three characters

[mcpi](https://github.com/SamMorrowDrums/mcpi) is an experimental fork of [pi](https://pi.dev/) + [extension](https://github.com/SamMorrowDrums/mcpi-ext) that implements three complementary strategies for progressive tool discovery. Each pays only the context tokens it needs. Each handles a different shape of work. And because the best ideas deserve characters, each has a name.

| Tier | Name | Mechanism | Best for |
| --- | --- | --- | --- |
| 1 - Skills | **The Skill Dealer** | `skill://` resources gate tools via `allowed-tools` | Curated workflows |
| 2 - tool-cli | **The Nuclear Football** | CLI progressive discovery via shell | One-shot exploration |
| 3 - Code Mode | **Codey C. Maude** | Sandboxed JS over read-only tools with `outputSchema` | Computation across many calls |

This series goes deep on each. But first, the property that ties them together:

**Every call flows through the harness.** Whether the model loads a skill, shells out to `tool-cli`, or writes sandboxed JavaScript, the actual MCP tool call happens in the extension process. One choke point for all three tiers. Every invocation logged, observable, gatable. That matters for security, auditability, and future human-in-the-loop gating - and it's a point I'll return to throughout the series.

## Additionally - large output offloading

Progressive discovery controls input tokens - what the model sees. But output tokens matter too. A single `list_issues` call can return 50KB of JSON that sits in the transcript forever. Copilot CLI already does this with MCP - large tool responses get written to disk so the agent can use local tools like grep over them instead of bloating context.

The extension does the same thing. It intercepts tool results. If output exceeds a threshold, it writes the full response to a temp file and returns a pointer to the model. The model can read the file if it needs the content, but the default path keeps context lean. This is the output-side equivalent of progressive discovery: don't pay for what you don't need.

## Try it yourself

This is a working system, not a thought experiment. Here's how to set it up:

### 1. Install

```sh
npm install -g @sammorrowdrums/mcpi@latest @sammorrowdrums/mcpi-ext@latest @sammorrowdrums/tool-cli@latest
```

### 2. Configure MCP servers

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

Replace `your-token-here` with your [GitHub personal access token](https://github.com/settings/tokens).

### 3. Run

```sh
mcpi --extension $(npm root -g)/@sammorrowdrums/mcpi-ext/dist/index.js \
  --mcp-config ~/.config/mcpi-ext/mcp.json
```

You'll see the extension discover servers, tools, and skills. From there, you have all three tiers available.

## The series

This is Part 1 of 5. The rest of the series covers each tier in depth:

- **Part 2: The Skill Dealer** - Deep dive into skills over MCP. How `skill://` resources **could** gate tools, preserve prompt cache, and why this emerging spec direction could change how MCP servers are designed.
- **Part 3: The Nuclear Football** - The MCP CLI. Progressive discovery through shell composability, and why routing every call through the harness changes the security story.
- **Part 4: Codey C. Maude** - Code Mode. Sandboxed JavaScript over read-only MCP tools with structured output. Why computation and accountability combine to create a very efficient and powerful harness.
- **Part 5: Three Is Not Redundancy** - How the three tiers compose, what's left to build, and a call to action.

**If you build MCP servers**, this series shows a new paradigm for how your tools get discovered and used. You can experiment with `skill://` resources on your own server today.

**If you build agent harnesses**, you'll find concrete patterns to implement - including the [`tool-cli`](https://github.com/SamMorrowDrums/tool-cli) binary, which is a standalone package you can integrate with your own harness as a progressive discovery layer over any MCP connection.

**If you use agents**, these experiments should help you save money on tokens and have smoother agent runs by keeping only relevant tools in context.

MCP doesn't have a context problem. It has a solution awareness problem. And the pieces of the puzzle required to solve it are mostly already in the protocol.

---

*Have thoughts on this article or progressive discovery in MCP in general? I opened a* [*discussion on GitHub*](https://github.com/SamMorrowDrums/cv/discussions/63) *for this series.*