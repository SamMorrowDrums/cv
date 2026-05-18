---
title: "remarkable-mcp: Three Releases, Three Community PRs"
date: '2026-05-18T00:00:00.000Z'
slug: 'remarkable-mcp-community-cycle'
---

When I [wrote about remarkable-mcp](/blog/building-an-mcp-server-for-remarkable) last time, I closed with a list of open issues: write support, more OCR providers, semantic search, export. The plan was that whichever ones got engagement would get prioritised. That's basically what happened, except other people did most of the work.

Three releases since then. [v0.8.2](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.8.2), [v0.9.0](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.9.0), [v0.9.1](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.9.1). The release notes are thorough — this is the narrative around them.

## v0.8.2: The Bugs That Were Quietly Breaking Things

Two bugs. Both worse than I realised until I went looking.

`rmc` couldn't be found when the server was installed via `uvx` ([#52](https://github.com/SamMorrowDrums/remarkable-mcp/issues/52), [#78](https://github.com/SamMorrowDrums/remarkable-mcp/issues/78), [#80](https://github.com/SamMorrowDrums/remarkable-mcp/issues/80)). It lives in the venv's `bin/` directory but isn't on `PATH`, and the `FileNotFoundError` was being swallowed in a way that also bypassed the built-in v5/v6 fallback renderers. So `uvx` users had `rmc` rendering and handwriting OCR silently broken. [@ColinSha](https://github.com/ColinSha)'s [PR #79](https://github.com/SamMorrowDrums/remarkable-mcp/pull/79) had the right resolution approach (PATH → venv bin → bare name), and that shape landed in [#82](https://github.com/SamMorrowDrums/remarkable-mcp/pull/82).

The second one was more embarrassing. I had been treating reMarkable's `synced: false` as "archived" ([#65](https://github.com/SamMorrowDrums/remarkable-mcp/issues/65)). `synced` actually means "local changes pushed to cloud". 27 out of 385 docs on my test tablet were invisible to the MCP server for no good reason. Now only `parent == "trash"` hides things.

While I was in there I added a live-tablet integration suite (`--run-integration`) so this kind of thing fails loudly next time.

## v0.9.0: Re-Implementing Three Community PRs

Three people sent good PRs against the open issues. All three shipped in v0.9.0, re-implemented to fit the design I wanted to land on, with attribution.

I'll say the obvious thing first: re-implementing a PR feels worse than merging it. The reason I did it three times in one release is that each one had a design decision I wanted to own — SSH-only vs adding a Go `rmapi` dependency, response shapes for merged renders, how write-tool registration interacts with transports. The original PRs are linked in the release notes, in commit trailers, and below. The ideas are theirs.

### Retry and backoff for the cloud API

[@Giancarlo-therapy](https://github.com/Giancarlo-therapy) opened [PR #75](https://github.com/SamMorrowDrums/remarkable-mcp/pull/75) addressing [#29](https://github.com/SamMorrowDrums/remarkable-mcp/issues/29). Transient cloud blips were hard-failing tool calls and there was no reason for that. Shipped as [#83](https://github.com/SamMorrowDrums/remarkable-mcp/pull/83): every cloud HTTP call now goes through `_http_request_with_retry()`. Retries on `ConnectionError`, `Timeout`, and `429/500/502/503/504`. No 4xx retries — `401` token renewal stays the caller's job. Exponential backoff with full jitter (the AWS builders'-library pattern), capped at 20 seconds, honours `Retry-After`. Tunable via `REMARKABLE_RETRY_ATTEMPTS` and `REMARKABLE_RETRY_DELAY`. Each retry logs a warning so "it hung for a bit then worked" reports are debuggable.

### Merged PDF + annotation rendering

[@ColinSha](https://github.com/ColinSha)'s [PR #79](https://github.com/SamMorrowDrums/remarkable-mcp/pull/79) — the same PR that got the `rmc` resolution into v0.8.2 — also added something I'd been meaning to add for ages. An annotation on its own isn't useful; you need the page underneath.

Shipped as [#84](https://github.com/SamMorrowDrums/remarkable-mcp/pull/84): an opt-in `render_merged` parameter on `remarkable_image`. When `True` and the document has a source PDF, the PDF page is rasterized and the annotations are alpha-composited on top. The output canvas is the **union** of the PDF page bounds and the rmc content bounds, so user-added pages past the end of the PDF don't get clipped. Default off, no existing callers affected, merged output gets its own `.merged.png` resource URI. While verifying on a live tablet I also caught that the SSH `download()` path was missing `{uuid}.pdf` and `{uuid}.epub` files — fixed in the same PR.

### Opt-in write tools

[@McSchnizzle](https://github.com/McSchnizzle)'s [PR #70](https://github.com/SamMorrowDrums/remarkable-mcp/pull/70) was the big one — write support, addressing [#24](https://github.com/SamMorrowDrums/remarkable-mcp/issues/24). Shipped as [#85](https://github.com/SamMorrowDrums/remarkable-mcp/pull/85): five new tools.

| Tool | Transports |
|------|------------|
| `remarkable_upload` (PDF/EPUB) | SSH, USB web |
| `remarkable_mkdir` | SSH |
| `remarkable_move` | SSH |
| `remarkable_rename` | SSH |
| `remarkable_delete` | SSH |

Off by default. Enable with `REMARKABLE_ENABLE_WRITE=1` or `--write`. All five carry `ToolAnnotations(readOnlyHint=False)`, and `remarkable_delete` adds `destructiveHint=True`, so agent harnesses with write-blocking enabled never see them. The server `instructions` only mention the write tools when they're enabled. No Go `rmapi` dependency — everything goes through SSH and USB web.

## v0.9.1: What End-User Testing Caught

v0.9.0 shipped. Real testing immediately turned up three bugs. All three fixed and re-released within hours.

**Search was returning per-document `"not coroutine"` errors** ([#86](https://github.com/SamMorrowDrums/remarkable-mcp/pull/86)). `remarkable_search` was a sync function calling the async `remarkable_read` without `await`, then passing the returned coroutine to `json.loads`. The literal error string was *"the JSON object must be str, bytes or bytearray, not coroutine"*. The kind of bug you can only see when search is actually called against multiple documents. Now async, with a regression test.

**USB + write was registering tools that always errored** ([#87](https://github.com/SamMorrowDrums/remarkable-mcp/pull/87)). In `--usb --write` mode, all five write tools registered but four of them returned `ssh_required` at call time. Registration is now gated on the active transport: USB + write gets only `remarkable_upload`, SSH + write gets all five, cloud + write is a no-op.

**The server appeared to hang under parallel tool calls** ([#88](https://github.com/SamMorrowDrums/remarkable-mcp/pull/88)). This was the interesting one. FastMCP awaits async tool handlers directly on the event loop, but our handlers were doing blocking I/O — `subprocess.run` for SSH, `requests` HTTP, `pymupdf` and `cairosvg` rendering, `pytesseract` OCR, `zipfile` extraction — inside `async def`. A single slow call blocked every concurrent `call_tool` request until it finished. Fixed with a new `concurrency.run_blocking()` wrapper over `asyncio.to_thread`, every blocking site now `await`s through it, and `remarkable_browse` / `remarkable_recent` / `remarkable_status` converted from `def` to `async def` (FastMCP doesn't offload sync handlers either). Regression test runs two concurrent browses with a mocked 0.4s delay and asserts they actually overlap.

No tool signatures or response shapes changed across any of this.

## How It Was Built

Same pattern as last cycle. One Copilot CLI autopilot session per fix, on its own branch, regression test required before the PR opens, merged in dependency order. The async-blocking fix is a decent example: it touched almost every tool handler, but with a clear acceptance test (the concurrent-browse overlap assertion) it could be developed in parallel with the other two v0.9.1 fixes and merged without conflict.

## In the Forks

While I was looking through PRs I also went through the forks. A handful have substantial divergence worth calling out — different enough that they're effectively answering some of the open issues independently:

- **[vgmakeev/remarkable-myscript-mcp](https://github.com/vgmakeev/remarkable-myscript-mcp)** — a full MyScript OCR backend, with stroke-line grouping, parallel batching across CPU cores, smart image splitting, and an `EmbeddedResource` output format for Claude vision. A serious answer to [#25 (OCR providers)](https://github.com/SamMorrowDrums/remarkable-mcp/issues/25).
- **[sschimmel/remarkable-mcp](https://github.com/sschimmel/remarkable-mcp)** — OpenRouter and xAI OCR backends, plus a document-tree cache that avoids 25–35s cloud refetches per call, plus a `--fetch-notebook` CLI for batch consumers. Also #25, also touches [#28 (performance)](https://github.com/SamMorrowDrums/remarkable-mcp/issues/28).
- **[adaofeliz/remarkable-mcp](https://github.com/adaofeliz/remarkable-mcp)** — a shared document snapshot cache and parallelized cloud metadata fetch with bounded concurrency, with live integration tests and a Cloud Mode Architecture write-up in the README. Squarely at #28.
- **[zachattack323/remarkable-mcp](https://github.com/zachattack323/remarkable-mcp)** — a Cloud Run deployment entrypoint, with the FastMCP host/port/SSE-path plumbing needed to make that actually work behind a managed runtime.
- **[rsampaio/remarkable-mcp](https://github.com/rsampaio/remarkable-mcp)** — switches Google Vision auth from API key to Application Default Credentials, plus render/OCR quality tweaks from the SVG source. Also includes async fixes that overlap with the v0.9.1 work above — independently rediscovered.
- **[ghbryant/remarkable-mcp](https://github.com/ghbryant/remarkable-mcp)** — SSH reconnection on dropped connections. The kind of thing the upstream server probably should do.
- **[pschitte/remarkable-mcp](https://github.com/pschitte/remarkable-mcp)** — a Guix channel with package definitions. Different distribution angle.

And one that isn't a server improvement at all but is worth mentioning: **[travisparkerm/remarkable-mcp](https://github.com/travisparkerm/remarkable-mcp)** has been turned into "reMarkable Podcast" — a web app that pulls handwritten notes off your tablet, OCRs them with Google Vision, generates a podcast script with Claude in one of six personality styles, and produces an MP3 episode with ElevenLabs TTS. Google OAuth login, daily episode generation, voice matching. A nice example of remarkable-mcp being treated as a building block.

If anyone running one of these wants to upstream parts of it, please do. The MyScript backend and the cloud-tree cache in particular look like things the project would benefit from.

## What's Next

remarkable-mcp is very much a side project, and I struggle to give it the attention it deserves. So contributions and bug reports genuinely help — they're often the thing that turns "I'll get to it eventually" into a shipped release. This cycle is the clearest example of that so far.

The pattern from last time still holds: the [issues](https://github.com/SamMorrowDrums/remarkable-mcp/issues) that get engagement get prioritised. Write support (#24) and reliability (#29) both shipped this cycle because people brought concrete proposals. OCR providers (#25), enhanced search (#26), export (#27), and performance (#28) are still open. If you've got a use case for one of them, comment on the issue — or send a PR.

Thanks to [@Giancarlo-therapy](https://github.com/Giancarlo-therapy), [@ColinSha](https://github.com/ColinSha), and [@McSchnizzle](https://github.com/McSchnizzle).
