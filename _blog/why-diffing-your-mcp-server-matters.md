---
title: "Why Diffing Your MCP Server Matters"
date: '2026-01-28T00:00:00.000Z'
slug: 'why-diffing-your-mcp-server-matters'
---

Your [MCP server](https://modelcontextprotocol.io/) has a public interface. Tools, prompts, resources, capabilities—everything an AI client sees when it connects. As your server evolves, that interface changes. Sometimes intentionally. Sometimes not.

I built [mcp-server-diff](https://github.com/SamMorrowDrums/mcp-server-diff) to answer a simple question: what changed between two versions of my server? It's available as a [GitHub Marketplace Action](https://github.com/marketplace/actions/mcp-server-diff) and a [CLI tool on npm](https://www.npmjs.com/package/mcp-server-diff).

## The Problem with Invisible Changes

MCP servers expose their interface through a handful of protocol methods: `initialize`, `tools/list`, `resources/list`, `prompts/list`. A client calls these to discover what your server can do. The responses define the contract between your server and every AI that uses it.

The challenge is that these interfaces are easy to change accidentally. Rename a parameter, tweak a description, add a required field—any of these can break clients. And unlike a traditional API where you might have type definitions or OpenAPI specs to compare, MCP interfaces are defined at runtime. You don't see them until you connect.

## How It Works

The diff tool probes both versions of your server and compares what they expose. On pull requests, it compares your branch against the merge-base with main. On tag releases, it compares against the previous tag. You get a report showing exactly what changed:

```diff
--- base/tools.json
+++ branch/tools.json

+ tools[new_tool]: {"name": "new_tool", "description": "A newly added tool", ...}
- tools[calculator].inputSchema.properties.precision.type: "string"
+ tools[calculator].inputSchema.properties.precision.type: "number"
```

Each line tells you the path to the change. No need to diff entire JSON blobs—you see exactly which tool, which property, which value changed.

## Where We Use It

At work, [mcp-server-diff runs on CI](https://github.com/github/github-mcp-server) for the [GitHub MCP Server](https://github.com/github/github-mcp-server). It's caught real problems:

**SDK migrations.** When we switched between SDK versions, the diff showed us which tool schemas had subtle changes we hadn't anticipated. A field that was optional became required. A description changed. Without the diff, these would have shipped silently.

**Architecture refactors.** Big refactors are risky. The diff gives us confidence that our internal changes haven't affected the public interface—or shows us exactly what did change so we can decide if that's acceptable.

**Server instructions.** We recently changed how server instructions are generated. The diff made it trivial to verify that the changes were what we intended and nothing more.

**Release validation.** On every semver tag, the action runs automatically, giving us an at-a-glance view of what public interface changes are shipping in that release.

## Consistency Across Projects

I maintain [seven MCP starter repos](https://github.com/SamMorrowDrums?tab=repositories&q=mcp-starter) across different languages. They should all expose identical interfaces—same tools, same schemas, same behavior. But keeping them consistent manually is error-prone.

The CLI makes this easy. I compare each implementation against a reference:

```bash
npx mcp-server-diff -b "node dist/stdio.js" -t "python -m my_server"
```

Any drift shows up immediately. A Go implementation missing a parameter that TypeScript has. A Python implementation with a different description. The diff catches it.

## Real-World Catches

The tool has caught several types of unexpected changes:

- Tool descriptions that changed during refactoring when they shouldn't have
- Required parameters that became optional (or vice versa) due to schema changes
- Resource URIs that subtly changed format
- Capabilities that were accidentally enabled or disabled
- New tools or prompts added before they were ready

The common thread: changes that weren't in anyone's mental model of what the PR did. The kind of thing that passes code review because no one thought to check the runtime interface.

## Comparing Servers Directly

Sometimes you want to compare two servers that aren't different versions of the same codebase. Maybe you're comparing a local server against a remote one, or validating that a containerized version matches your local build.

I've compared the local and remote versions of the GitHub MCP Server this way. I also run it on my [remarkable-mcp](https://github.com/SamMorrowDrums/remarkable-mcp) server to track interface changes there.

The CLI supports this directly:

```bash
# Compare local vs containerized
npx mcp-server-diff -b "go run ./cmd/server" -t "docker run -i myserver:latest"

# Compare local vs remote HTTP endpoint
npx mcp-server-diff -b "./server" -t "https://mcp.example.com/api"
```

## Transport Support

MCP servers can use stdio or HTTP (streamable HTTP). The diff tool supports both, and you can test multiple transports in a single run:

```yaml
configurations: |
  [
    {
      "name": "stdio",
      "transport": "stdio",
      "start_command": "node dist/stdio.js"
    },
    {
      "name": "streamable-http",
      "transport": "streamable-http",
      "start_command": "node dist/http.js",
      "server_url": "http://localhost:3000/mcp"
    }
  ]
```

This catches cases where different transports behave differently—something that shouldn't happen but occasionally does.

## The Philosophy

The core idea is simple: **pay attention to your public interface**. Every change should be intentional.

This isn't about preventing change. MCP servers evolve. Tools get added, schemas get refined, capabilities expand. That's normal and healthy.

What matters is knowing when it happens. A diff in CI means someone has to look at the interface changes and confirm they're expected. That five-second review catches bugs that would otherwise reach users.

## Getting Started

Add it to your CI with a few lines of YAML:

```yaml
name: MCP Server Diff

on:
  pull_request:
    branches: [main]
  push:
    tags: ['v*']

permissions:
  contents: read

jobs:
  mcp-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: SamMorrowDrums/mcp-server-diff@v2
        with:
          setup_node: true
          install_command: npm ci
          build_command: npm run build
          start_command: node dist/stdio.js
```

For one-off comparisons, use the CLI:

```bash
npx mcp-server-diff -b "old-server-command" -t "new-server-command"
```

The action works with any language—you just provide the install, build, and start commands. It includes built-in setup helpers for Node, Python, Go, Rust, and .NET, but custom setups work just as well. Working examples for each language are in the [starter repos](https://github.com/SamMorrowDrums?tab=repositories&q=mcp-starter).

## Try It

The [GitHub Action](https://github.com/marketplace/actions/mcp-server-diff) is the easiest way to start. Add it to your workflow and you'll have visibility into interface changes on every PR.

For ad-hoc comparisons, [install the CLI](https://www.npmjs.com/package/mcp-server-diff) with `npm install -g mcp-server-diff` or run it directly with `npx mcp-server-diff`.

The [repository](https://github.com/SamMorrowDrums/mcp-server-diff) has full documentation, configuration options, and examples for different languages and transports.

If you're building MCP servers, you should know what your public interface looks like—and when it changes.
