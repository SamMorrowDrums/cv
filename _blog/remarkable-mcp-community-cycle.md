---
title: "remarkable-mcp: A Community Release Cycle"
date: '2026-05-18T00:00:00.000Z'
slug: 'remarkable-mcp-community-cycle'
---

When I [first wrote about remarkable-mcp](/blog/building-an-mcp-server-for-remarkable), I closed by saying the [GitHub issues](https://github.com/SamMorrowDrums/remarkable-mcp/issues) tracked future plans: write support, more OCR providers, semantic search, export. The interesting thing is what happened next. The community didn't just comment on issues, they sent pull requests. This release cycle — [v0.8.2](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.8.2), [v0.9.0](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.9.0), [v0.9.1](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.9.1) — is largely their work.

## Issues as a Prioritisation Signal

I opened six discussion issues after the first article: [#24 write support](https://github.com/SamMorrowDrums/remarkable-mcp/issues/24), [#25 OCR providers](https://github.com/SamMorrowDrums/remarkable-mcp/issues/25), [#26 enhanced search](https://github.com/SamMorrowDrums/remarkable-mcp/issues/26), [#27 export](https://github.com/SamMorrowDrums/remarkable-mcp/issues/27), [#28 performance](https://github.com/SamMorrowDrums/remarkable-mcp/issues/28), [#29 reliability](https://github.com/SamMorrowDrums/remarkable-mcp/issues/29). The plan was simple: whichever ones got engagement got prioritised.

That's exactly how it played out. Write support (#24) and reliability (#29) both attracted concrete proposals — and both shipped in v0.9.0. The others are still open, still useful as conversation, but without that pull from users they stay on the backlog. If you've ever wondered whether opening an issue actually does anything on a small project, here's a working example: yes, it does, and a PR does a lot more.

## v0.8.2: Bug Fix Cleanup

Before the big release, a maintenance one. Two bugs were quietly making the server worse than it should have been:

- **`rmc` binary not found via `uvx`** ([#52](https://github.com/SamMorrowDrums/remarkable-mcp/issues/52), [#78](https://github.com/SamMorrowDrums/remarkable-mcp/issues/78), [#80](https://github.com/SamMorrowDrums/remarkable-mcp/issues/80)) — the `rmc` binary lives in the venv's `bin/` directory when installed via `uvx`, and a bare `subprocess.run(["rmc", ...])` couldn't find it. Worse, the `FileNotFoundError` was being caught in a way that also bypassed the built-in v5/v6 fallback renderers. So `uvx` users had both `rmc` rendering and handwriting OCR silently broken. **[@ColinSha](https://github.com/ColinSha)**'s [PR #79](https://github.com/SamMorrowDrums/remarkable-mcp/pull/79) had the right resolution approach, and that landed as part of [#82](https://github.com/SamMorrowDrums/remarkable-mcp/pull/82).
- **Chrome-extension synced docs hidden** ([#65](https://github.com/SamMorrowDrums/remarkable-mcp/issues/65)) — I had been treating `synced: false` as "archived", but `synced` actually means "local changes pushed to cloud". 27 out of 385 docs on my test tablet were invisible. Now only `parent == "trash"` hides things.

The release also added a live-tablet integration test suite (`--run-integration`) and absorbed a stack of Dependabot bumps. Full details in the [v0.8.2 notes](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.8.2).

## v0.9.0: Three Community PRs, Re-Implemented

The headline release. Three external contributors put real work into this server, and v0.9.0 ships their ideas with attribution.

### Retry + backoff for the cloud API

**[@Giancarlo-therapy](https://github.com/Giancarlo-therapy)** opened [PR #75](https://github.com/SamMorrowDrums/remarkable-mcp/pull/75) addressing issue [#29](https://github.com/SamMorrowDrums/remarkable-mcp/issues/29) — transient cloud blips were hard-failing tool calls. The shipped version ([#83](https://github.com/SamMorrowDrums/remarkable-mcp/pull/83)) routes every cloud HTTP call through `_http_request_with_retry()` with:

- Retries on `ConnectionError`, `Timeout`, and `429/500/502/503/504`. No 4xx retries — `401` token renewal stays the caller's job.
- Exponential backoff with full jitter (the AWS builders'-library pattern), capped at 20s per sleep, honouring `Retry-After`.
- Config via `REMARKABLE_RETRY_ATTEMPTS` (default `3`) and `REMARKABLE_RETRY_DELAY` (default `2.0s`).
- Each retry logs a warning so the "it hung for a bit then worked" reports are debuggable.

### Merged PDF + annotation rendering

**[@ColinSha](https://github.com/ColinSha)**'s [PR #79](https://github.com/SamMorrowDrums/remarkable-mcp/pull/79) (the same PR that provided the `rmc` resolution fix in v0.8.2) tackled something I'd wanted for ages: making MCP clients see what the user actually sees on the device. Annotations on a PDF aren't useful in isolation — they need the page underneath.

Shipped as [#84](https://github.com/SamMorrowDrums/remarkable-mcp/pull/84): an opt-in `render_merged` parameter on `remarkable_image`. When `True` and the document has a source PDF, the PDF page is rasterized and annotations are alpha-composited on top. Output canvas is the **union** of (PDF page bounds, rmc content bounds), so reMarkable's "added pages" past the PDF end aren't clipped. Default off, existing callers see no change, merged output gets its own `.merged.png` resource URI. While verifying on a live tablet I also caught that the SSH `download()` path was missing `{uuid}.pdf` and `{uuid}.epub` files — fixed in the same PR.

### Opt-in write tools

**[@McSchnizzle](https://github.com/McSchnizzle)**'s [PR #70](https://github.com/SamMorrowDrums/remarkable-mcp/pull/70) addressed [#24](https://github.com/SamMorrowDrums/remarkable-mcp/issues/24) directly: write support. Shipped as [#85](https://github.com/SamMorrowDrums/remarkable-mcp/pull/85), five new tools:

| Tool | Transports |
|------|------------|
| `remarkable_upload` (PDF/EPUB) | SSH, USB web |
| `remarkable_mkdir` | SSH |
| `remarkable_move` | SSH |
| `remarkable_rename` | SSH |
| `remarkable_delete` | SSH |

Off by default. Enable with `REMARKABLE_ENABLE_WRITE=1` or `--write`. Implemented purely via SSH/USB web (no Go `rmapi` dependency), then `upload` was extended to USB web as well. All five carry `ToolAnnotations(readOnlyHint=False)` and `remarkable_delete` additionally `destructiveHint=True`, so write-blocked agent harnesses correctly never see them. Server `instructions` only mention write tools when they're actually enabled.

### Why re-implement instead of merging directly

Worth a sentence on this, because it could otherwise read as ungenerous. All three PRs were good. The reason I re-implemented rather than merged is design surface: I wanted SSH-only (no Go `rmapi` dependency), I wanted write-tool registration to be transport-aware not just env-var-aware, I wanted the merged-rendering output shape to be additive rather than mutating existing responses. Re-implementing let me own those choices without losing the original credit — the PR descriptions, commit trailers, and release notes all point back at the people who did the original work. Five new tools, four bug fixes, four CVE bumps. [Full v0.9.0 notes here.](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.9.0)

## v0.9.1: The Honest Post-Release Bug Fix

v0.9.0 shipped. End-user testing immediately surfaced three bugs. All three fixed and re-released within hours as [v0.9.1](https://github.com/SamMorrowDrums/remarkable-mcp/releases/tag/v0.9.1):

1. **`remarkable_search` returned `"not coroutine"` errors per document** ([#86](https://github.com/SamMorrowDrums/remarkable-mcp/pull/86)). A sync function was calling the async `remarkable_read` without `await` and passing the returned coroutine to `json.loads`. Literal error string: *"the JSON object must be str, bytes or bytearray, not coroutine"*. The kind of bug you don't catch until search is called with multiple results. Now `async`, with a regression test.
2. **USB + write registered SSH-only tools that always errored** ([#87](https://github.com/SamMorrowDrums/remarkable-mcp/pull/87)). With `--usb --write`, all five write tools registered but four of them returned `ssh_required` at call time — polluting tool lists and confusing agents. Registration is now gated on the active transport: USB + write gets only `remarkable_upload`, SSH + write gets all five, cloud + write is a no-op.
3. **Server appeared to hang under parallel tool calls** ([#88](https://github.com/SamMorrowDrums/remarkable-mcp/pull/88)). The interesting one. FastMCP awaits async tool handlers directly on the asyncio event loop, but our handlers were doing blocking I/O — `subprocess.run` for SSH, `requests` HTTP, `pymupdf` / `cairosvg` rendering, `pytesseract` OCR, `zipfile` extraction — inside `async def`. A single slow call blocked every concurrent `call_tool` until it finished. Fixed with a new `remarkable_mcp/concurrency.py` exposing `run_blocking()` over `asyncio.to_thread`, every blocking call site now `await run_blocking(...)`, and `remarkable_browse` / `remarkable_recent` / `remarkable_status` converted from `def` → `async def` (FastMCP doesn't offload sync handlers either). Regression test runs two concurrent browses with a mocked 0.4s delay and asserts they actually overlap.

This is what fast iteration on a small project looks like. The integration tests caught what could be caught with mocks; live tablets caught the rest. No tool signatures or response shapes changed.

## How it Got Built

Same workflow as last cycle, refined. The three v0.9.0 features and the three v0.9.1 bug fixes were each run as a parallel Copilot CLI autopilot session — one branch per fix, regression tests required before a PR opened, merged in dependency order. The async-bug fix is a good example: it touched almost every tool handler, but because it was scoped to a single session with a clear acceptance test (the concurrent-browse overlap test), it could be developed in parallel with the other two v0.9.1 fixes and merged without conflict.

The pattern that keeps holding up: small server, tight scope, real users, tests gate everything. The AI assistance is a force multiplier on top of that, not a substitute for it.

## Thanks

Genuine thanks to [@Giancarlo-therapy](https://github.com/Giancarlo-therapy), [@ColinSha](https://github.com/ColinSha), and [@McSchnizzle](https://github.com/McSchnizzle). Three thoughtful PRs, three issues moved from "open with comments" to "shipped and used". If you're running into something on the [issues page](https://github.com/SamMorrowDrums/remarkable-mcp/issues) — or just want a feature — open one, or better, send a PR. This release shows it works.
