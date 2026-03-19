---
title: "Why Diffing Your MCP Server Matters"
date: '2026-03-19T00:00:00.000Z'
slug: 'why-diffing-your-mcp-server-matters'
---

Your [MCP server](https://modelcontextprotocol.io/) has a public interface. Tools, prompts, resources, capabilities: everything an AI client sees when it connects. Together, these responses form a contract. Unlike a REST API with an OpenAPI spec or a library with type definitions, this contract is defined at runtime. You don't see it until something connects.

I built [mcp-server-diff](https://github.com/SamMorrowDrums/mcp-server-diff) to answer a simple question: what changed between two versions of my server? It's available as a [GitHub Action](https://github.com/marketplace/actions/mcp-server-diff) and a [CLI tool on npm](https://www.npmjs.com/package/mcp-server-diff). The tool probes both versions and compares their `initialize`, `tools/list`, `resources/list`, and `prompts/list` responses, producing a diff that shows exactly which tool, which property, which value changed.

Understanding how your server contract changes is incredibly useful, but it's one of those subtle things that doesn't make sense until you make a subtle mistake. Then suddenly it's invaluable.

## It keeps catching things

During a major refactor of the [GitHub MCP Server](https://github.com/github/github-mcp-server), a colleague at GitHub, Adam, sent me this after the diff workflow flagged something:

> kudos for the MCP diff workflow. Picked up that I missed a bit of toolset filtering

The code looked right. Tests passed. Code review didn't flag anything. But the runtime interface had shifted in a way nobody intended, and the diff caught it before it reached users. This wasn't a one-off. The diff has saved myself and other team members from shipping unintended changes numerous times now. SDK upgrades that silently changed tool schemas. Refactors that accidentally dropped capabilities. Toolset filtering that shifted in ways nobody noticed in code review. Each time, the code and tests looked correct, but the server was advertising something different to clients than we expected.

The pattern is always the same: the diff reveals what lives in the gap between what you think your code does and what your server actually advertises at runtime. Those are different things more often than you'd expect.

The [GitHub MCP Server workflow](https://github.com/github/github-mcp-server/actions/workflows/mcp-diff.yml) tests [eighteen separate configurations](https://github.com/github/github-mcp-server/blob/main/.github/workflows/mcp-diff.yml) on every PR: default mode, read-only mode, dynamic toolsets, individual and combined toolset flags, and custom tool call sequences that exercise dynamic toolset loading. The point is that any of these configuration variants could accidentally diverge from each other during a change, and the diff makes that visible. The GitHub Remote MCP Server uses it on our internal repo too.

## Seven languages, one interface

I maintain [MCP starter repos](https://github.com/SamMorrowDrums?tab=repositories&q=mcp-starter) in Python, TypeScript, Go, Rust, C#, Kotlin, and PHP. I use them for workshops to get people off to a warm start with MCP development in their preferred language, so keeping the interfaces consistent matters.

A [cross-repo workflow](https://github.com/SamMorrowDrums/mcp-starters/issues/26) compares all six non-Python implementations against the Python reference and opens a tracking issue whenever differences are detected. The reports are revealing. The Kotlin SDK negotiates a different protocol version than the others. Python's FastMCP includes `title` fields and icon data on tool annotations while TypeScript puts those at the top level. Go capitalizes parameter types differently. Most of these are SDK-level divergences rather than mistakes in my code, and that's exactly the point. Without the diff, you can't tell whether a difference between your servers comes from how you wrote the code or from how the SDK serializes it.

When I was iterating on consistency for these repos, I used agent loops that compared each starter against the Python reference, had the agent fix what it could, and re-ran the comparison as validation. It's a good example of how a concrete, machine-readable diff gives agents something to iterate against rather than just hoping the output is right.

## People I didn't expect are using it

[Matthew Diakonov](https://github.com/m13v) from [mediar-ai](https://github.com/mediar-ai) reached out on the [starters tracking issue](https://github.com/SamMorrowDrums/mcp-starters/issues/26#issuecomment-4079388640) to share that they maintain MCP servers in both [Swift](https://github.com/mediar-ai/mcp-server-macos-use) and [Rust](https://github.com/mediar-ai/terminator) for their macOS computer use agent. Interface differences between the two had been a constant source of bugs until they added automated conformance tests. That's a use case I'd hoped for but hadn't seen confirmed in the wild yet.

On the official MCP side, [Ola](https://github.com/olaservo) from the MCP project created an [issue on the Inspector repo](https://github.com/modelcontextprotocol/inspector/issues/1034) exploring whether mcp-server-diff could become a plugin for the [Inspector CLI](https://github.com/modelcontextprotocol/inspector), tagged for v2. The fact that the MCP team opened the tracking issue themselves (rather than me asking for it) felt like meaningful validation that this is a real gap in the ecosystem tooling.

I've also [proposed adding the workflow to the official Everything Server](https://github.com/modelcontextprotocol/servers/pull/3260), the protocol's reference implementation that exercises all MCP features. Tracking public interface changes there would help SDK developers validate compliance and catch unintended regressions when the reference server evolves.

## What I'm most excited about

The tool is still in its infancy, but the use cases that keep surfacing are:

- **PR validation**: compare your branch against main to check that interface changes are intentional, not accidental side effects of internal refactoring
- **Regression prevention**: avoid breaking changes during SDK upgrades, dependency updates, or major rewrites (this is where the team and I have got the most value, repeatedly)
- **Cross-language consistency**: maintain similar servers in different languages and always know the exact differences, whether from your code or SDK divergence
- **Release auditing**: compare a new semver tag against the previous one to see what changed in the public interface
- **Fork comparison**: see precisely what a fork changed in the server's public interface
- **SDK compliance testing**: verify reference implementations stay consistent as SDKs evolve

## Try it

The [GitHub Action](https://github.com/marketplace/actions/mcp-server-diff) is a few lines of YAML. The [CLI](https://www.npmjs.com/package/mcp-server-diff) works for ad-hoc comparisons:

```bash
npx mcp-server-diff -b "your-server-command" -t "other-server-command"
```

Full documentation and language-specific examples are in the [repository](https://github.com/SamMorrowDrums/mcp-server-diff).
