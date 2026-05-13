---
title: "The Nuclear Football"
date: '2026-05-27T00:00:00.000Z'
slug: 'progressive-discovery-in-mcp-part-3'
---

![A glowing briefcase marked tool-cli being passed between hands in a dark corridor, trailing sparks of shell commands](/images/progressive-discovery/nuclear-mcp-football.webp)

> *The Football is not a weapon. The Football is the authority to use weapons. Whoever holds it can reach any server, call any tool, chain any result - but they must do so deliberately, one command at a time.*

*This is Part 3 of the Progressive Discovery in MCP series. See* [*Part 1*](/blog/progressive-discovery-in-mcp-part-1) *and* [*Part 2*](/blog/progressive-discovery-in-mcp-part-2)*.*

I think with current implementations CLIs are genuinely a better experience than MCP servers a lot of the time. Popular CLIs are already in the training set. Bash is absurdly powerful - streaming, parsing, formatting, networking, SSH. Developers never really move away from the shell because the composability is unmatched. When Mario Zechner says he can replace 21 MCP tools with four bash scripts, he's not wrong about the efficiency.

But CLIs have problems that get handwaved in the "just use bash" discourse. Token replay is a real risk. The full CLI surface is exposed - anything the token can do, the agent can attempt. And when agents hit errors, they bash their head against walls trying to unblock themselves. I've watched agents disable commit signing, attempt to install packages with sudo, and try increasingly creative workarounds. And these aren't just annoyances - an AI agent [deleted a startup's entire production database and backups in 9 seconds](https://www.notebookcheck.net/AI-coding-agent-rips-through-startup-s-entire-production-database-in-9-seconds.1286401.0.html) via an unsupervised API call, and a developer [lost 2.5 years of course data](https://timesofindia.indiatimes.com/technology/tech-news/i-over-relied-on-ai-developer-says-claude-code-accidentally-wiped-2-5-years-of-data-shares-advice-to-prevent-loss/articleshow/129336313.cms) when Claude Code ran a destructive migration unsupervised. With a CLI, there's no annotation saying "this operation is destructive" - it's just another command.

MCP has a better security story here. The harness connects to the MCP server and can keep the token away from the model. Tool annotations (`readOnlyHint`, `destructiveHint`) let clients make policy decisions. But MCP loses on composability - results roundtrip through the model's context, and you can't pipe them through jq.

So the question is: can you get both?

## tool-cli: the thin wrapper

`tool-cli` is a shell command. The agent uses it like any Unix tool. Discovery is progressive - each step pays only the tokens it needs:

```sh
tool-cli --help                                # What servers exist?
tool-cli github                                # What tools does this server have?
tool-cli github search_code                    # What's the schema for this tool?
tool-cli github search_code '{"query":"auth"}' # Call it
```

The agent goes from "what's available?" to a tool call in four progressive steps, paying schema tokens only for the tools it actually uses. Out of 82 available tools across two connected servers, a typical session might fetch schemas for five.

When tools provide `outputSchema`, tool-cli advertises this in the schema description step. The model knows upfront what shape the JSON response will have, making jq filters and downstream processing more reliable. Structured output makes the CLI composability story much stronger - the model can confidently write `jq '.issues[] | {number, title}'` because it knows the response schema before calling.

Shell composability works exactly as you'd expect:

```sh
# List issues and filter with jq
tool-cli github list_issues '{"owner":"github","repo":"github-mcp-server","perPage":10}' \
  | jq '.issues[] | {number, title, state}'

# Search and grep
tool-cli github get_file_contents \
  '{"owner":"github","repo":"github-mcp-server","path":"README.md"}' \
  | tail -n +2 | jq -r '.resource.text' | grep -in copilot

# Loop over cities
for city in London Tokyo Paris; do
  echo "=== $city ==="
  tool-cli weather check_weather '{"city":"'"$city"'"}'
done
```

The intermediate JSON flows through pipes, not through the model's context. The model sees only the final filtered result.

![tool-cli in action - progressive discovery piped through grep](/images/progressive-discovery/tool-cli-grep.png)

## The architecture that matters

Here's the subtle part. `tool-cli` is not a standalone MCP client. It's a thin HTTP client that calls the extension's JSON-RPC server on localhost.

```
Agent (mcpi) --> shell exec --> tool-cli <server> <tool> '{args}'
                                   |
                                   v
                          HTTP JSON-RPC (localhost)
                                   |
                                   v
                        ToolCliRpcServer (in extension)
                                   |
                                   v
                        McpClientManager --> MCP Server(s)
```

The actual MCP call happens in the extension process, through the same `McpClientManager` that handles skill-gated tools and Code Mode sandbox calls. This is the same harness that all three tiers route through.

Why does this matter?

**Every tool-cli invocation appears in the agent log.** Skills, tool-cli one-shots, and Code Mode sandbox calls alike. Full observability without instrumentation.

**The harness is the single choke point.** Future human-in-the-loop gating can be added at one point - the `McpClientManager` - and it covers all three tiers. Tool annotations can be checked. Destructive calls can be gated through user confirmation. This works regardless of which tier initiated the call.

**Sandbox port forwarding.** If you're running the agent in a sandbox (container, VM, restricted environment), you don't need to allow-list MCP server URLs. Just forward the tool-cli port from the sandbox to the harness. The agent gets full MCP access through a single localhost port, with all the security controls the harness provides. People have literally been trying to build custom shells and AI operating systems - you can get pretty rigid blast radius control with all the benefits if you pursue this approach.

## Shared secret auth

The RPC server binds to `127.0.0.1` only. A shared secret token is generated per session and passed to the CLI via environment variable (`TOOL_CLI_TOKEN`). Every request is authenticated:

```
$ TOOL_CLI_TOKEN=bogus tool-cli github list_issues '{...}'
Authentication failed: invalid or missing TOOL_CLI_TOKEN

$ TOOL_CLI_PORT=1 tool-cli github list_issues '{...}'
Error: tool-cli server not running. Is mcpi-ext loaded?
```

This is defense-in-depth. Even though the server binds to localhost, another local process can't just probe the port and call tools without the token. The token is session-scoped - it's generated when the extension starts and dies when the session ends.

## Why this beats "just give the agent CLIs"

The `gh` CLI is excellent. I work on it a bit myself, and models are well-trained on it. But giving an agent any CLI means giving it everything the token can do, with no ability to gate specific operations. If the token has repo scope, the agent can push to any repo. If it has admin scope, it could manage SSH keys. I literally refused to merge a PR for the GitHub MCP Server because even if the token allows it, I didn't want to facilitate agents being prompt-injected to add public SSH keys.

With tool-cli, the harness can inspect tool annotations before executing. A `destructiveHint: true` tool can trigger user confirmation. A `readOnlyHint: true` tool can run without asking. The annotations come from the MCP server, which knows its own tools better than any client-side allow-list. I have thoughts on more advanced HITL that allows more things automatically when they align with the intent of the user, but that's another story. They still do matter, and have saved me and many others plenty of times from actions we'd rather the agent did not do.

This isn't just theoretical safety. Every tool-cli call that goes through the harness can be logged in the same action log as skill-loaded tool calls and Code Mode sandbox calls. One audit trail for everything.

## The honest trade-offs

What you give up vs standalone CLIs:

- **Latency**: tool-cli is a shell exec + HTTP RPC + MCP hop. Only ms per call though.
- **Discoverability**: if the model doesn't know a capability exists, it can't ask for it. Skills mitigate this by advertising intent cheaply. Pure tool-cli requires the model to think "I bet there's a tool for this" - which works well in practice, and the system prompt can influence this significantly.
- **Errors are noisier**: I hit real bugs during testing - a weather server schema validation error, a wrong field name. With declared tools, models get the full JSON schema and make less mistakes. Agents are great at self-correcting though.

When I reach for tool-cli: "I don't know what's available, let me poke around" or "quick one-shot filter" or "pipe through jq and done." It's best for needle in a haystack tasks where the model only wants a small subset of the output.

## For harness builders: integrate it into your own agent

[`@sammorrowdrums/tool-cli`](https://github.com/SamMorrowDrums/tool-cli) is a standalone npm package, not tied to mcpi. It exposes a `ToolProvider` interface with three methods (`getServerNames`, `getTools`, `callTool`) that you implement against your own MCP client. Start the server, set two env vars, and your agent's shell has progressive MCP discovery.

```typescript
import { ToolCliServer } from "@sammorrowdrums/tool-cli/server";

const server = new ToolCliServer(myToolProvider);
const { port, token } = await server.start();
// Set TOOL_CLI_PORT and TOOL_CLI_TOKEN for agent subprocesses
```

You don't even need this package if you prefer another language. The protocol is four JSON-RPC methods over HTTP (`listServers`, `listTools`, `describeTool`, `callTool`). The [repo README](https://github.com/SamMorrowDrums/tool-cli) has implementation examples in Go, Python, and Rust.

> *They pass the Football from hand to hand. It is heavy with potential. Every tool on every server is one command away - but you must type the command yourself. And somewhere behind you, the harness is watching.*
---

*Have thoughts on this article or progressive discovery in MCP in general? I opened a [discussion on GitHub](https://github.com/SamMorrowDrums/cv/discussions/63) for this series.*
