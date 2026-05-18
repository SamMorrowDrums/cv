---
title: "remarkable-mcp Update"
date: '2026-05-18T00:00:00.000Z'
slug: 'remarkable-mcp-update'
---

Quick update on [remarkable-mcp](https://github.com/SamMorrowDrums/remarkable-mcp) since [the original post](/blog/building-an-mcp-server-for-remarkable). [Latest release is here](https://github.com/SamMorrowDrums/remarkable-mcp/releases/latest). The headline is that most of what landed came from other people, three community PRs from [@Giancarlo-therapy](https://github.com/Giancarlo-therapy), [@ColinSha](https://github.com/ColinSha), and [@McSchnizzle](https://github.com/McSchnizzle) shipped this cycle, with attribution. Re-implemented rather than merged because I didn't have the review bandwidth, not a policy, just what happened this time. The ideas are theirs.

## Write Support

The biggest functional change. [@McSchnizzle](https://github.com/McSchnizzle)'s [PR #70](https://github.com/SamMorrowDrums/remarkable-mcp/pull/70) addressed [#24](https://github.com/SamMorrowDrums/remarkable-mcp/issues/24) and landed as five new tools:

| Tool | Transports |
|------|------------|
| `remarkable_upload` (PDF/EPUB) | SSH, USB web |
| `remarkable_mkdir` | SSH |
| `remarkable_move` | SSH |
| `remarkable_rename` | SSH |
| `remarkable_delete` | SSH |

Off by default. Enable with `REMARKABLE_ENABLE_WRITE=1` or `--write`. All five carry `ToolAnnotations(readOnlyHint=False)`, and `remarkable_delete` adds `destructiveHint=True`, so agent harnesses with write-blocking enabled never see them. The server `instructions` only mention the write tools when they're enabled, and registration is gated on the active transport: USB + write gets only `remarkable_upload`, SSH + write gets all five, cloud + write is a no-op. No Go `rmapi` dependency, everything goes through SSH and USB web.

## Seeing What the User Sees

[@ColinSha](https://github.com/ColinSha)'s [PR #79](https://github.com/SamMorrowDrums/remarkable-mcp/pull/79) added something I'd been meaning to do for ages: rendering annotations on top of the PDF page underneath. An annotation in isolation isn't useful; you need the page it's pointing at.

`remarkable_image` now has an opt-in `render_merged` parameter. When `True` and the document has a source PDF, the PDF page is rasterised and the annotations are alpha-composited on top. The output canvas is the **union** of the PDF page bounds and the rmc content bounds, so user-added pages past the end of the PDF don't get clipped. Default off, existing callers unaffected, merged output gets its own `.merged.png` resource URI. While verifying on a live tablet I also caught that SSH `download()` was missing `{uuid}.pdf` and `{uuid}.epub` files, fixed in the same change.

## Reliability

[@Giancarlo-therapy](https://github.com/Giancarlo-therapy)'s [PR #75](https://github.com/SamMorrowDrums/remarkable-mcp/pull/75) addressed [#29](https://github.com/SamMorrowDrums/remarkable-mcp/issues/29). Every reMarkable Cloud HTTP call now goes through `_http_request_with_retry()`. Retries on `ConnectionError`, `Timeout`, and `429/500/502/503/504`. No 4xx retries, `401` token renewal stays the caller's job. Exponential backoff with full jitter (the AWS builders'-library pattern), capped at 20s per sleep, honours `Retry-After`. Tunable via `REMARKABLE_RETRY_ATTEMPTS` and `REMARKABLE_RETRY_DELAY`. Each retry logs a warning so "it hung for a bit then worked" reports are debuggable.

Two related bugs also got fixed along the way:

- **`rmc` couldn't be found when installed via `uvx`**. The binary lives in the venv's `bin/` directory and wasn't on `PATH`, and the `FileNotFoundError` was bypassing the v5/v6 fallback renderers entirely. Silently broke handwriting OCR for `uvx` users. Resolved by walking PATH → venv bin → bare name (approach from [@ColinSha](https://github.com/ColinSha)'s PR).
- **27 of 385 docs on my test tablet were invisible**. I'd been treating `synced: false` as "archived", but `synced` actually means "local changes pushed to cloud". Now only `parent == "trash"` hides documents.

A live-tablet integration suite (`--run-integration`) was added so this kind of thing fails loudly next time.

## Concurrency Under Load

A few async bugs surfaced once people started actually parallelising tool calls. The most interesting one: FastMCP awaits async tool handlers directly on the event loop, but our handlers were doing blocking I/O, `subprocess.run` for SSH, `requests` HTTP, `pymupdf` and `cairosvg` rendering, `pytesseract` OCR, `zipfile` extraction, inside `async def`. A single slow call blocked every concurrent `call_tool` request until it finished. Fixed with a new `concurrency.run_blocking()` wrapper over `asyncio.to_thread`, every blocking site now `await`s through it, and `remarkable_browse` / `remarkable_recent` / `remarkable_status` converted from sync to `async def` (FastMCP doesn't offload sync handlers either). Regression test runs two concurrent browses with a mocked 0.4s delay and asserts they actually overlap.

Also fixed: `remarkable_search` was a sync function calling the async `remarkable_read` without `await`, then passing the returned coroutine to `json.loads`. Literal error string was *"the JSON object must be str, bytes or bytearray, not coroutine"*. Now async, with a regression test.

No tool signatures or response shapes changed across any of this.

## In the Forks

While I was looking through PRs I also went through the forks. A handful have substantial divergence worth calling out, different enough that they're effectively answering some of the open issues independently:

- **[vgmakeev/remarkable-myscript-mcp](https://github.com/vgmakeev/remarkable-myscript-mcp)**: a full MyScript OCR backend, with stroke-line grouping, parallel batching across CPU cores, smart image splitting, and an `EmbeddedResource` output format for Claude vision. A serious answer to [#25 (OCR providers)](https://github.com/SamMorrowDrums/remarkable-mcp/issues/25).
- **[sschimmel/remarkable-mcp](https://github.com/sschimmel/remarkable-mcp)**: OpenRouter and xAI OCR backends, plus a document-tree cache that avoids 25–35s cloud refetches per call, plus a `--fetch-notebook` CLI for batch consumers. Also #25, also touches [#28 (performance)](https://github.com/SamMorrowDrums/remarkable-mcp/issues/28).
- **[adaofeliz/remarkable-mcp](https://github.com/adaofeliz/remarkable-mcp)**: a shared document snapshot cache and parallelised cloud metadata fetch with bounded concurrency, with live integration tests and a Cloud Mode Architecture write-up in the README. Squarely at #28.
- **[zachattack323/remarkable-mcp](https://github.com/zachattack323/remarkable-mcp)**: a Cloud Run deployment entrypoint, with the FastMCP host/port/SSE-path plumbing needed to make that actually work behind a managed runtime.
- **[rsampaio/remarkable-mcp](https://github.com/rsampaio/remarkable-mcp)**: switches Google Vision auth from API key to Application Default Credentials, plus render/OCR quality tweaks from the SVG source. Also includes async fixes that overlap with the concurrency work above, independently rediscovered.
- **[ghbryant/remarkable-mcp](https://github.com/ghbryant/remarkable-mcp)**: SSH reconnection on dropped connections. The kind of thing the upstream server probably should do.
- **[pschitte/remarkable-mcp](https://github.com/pschitte/remarkable-mcp)**: a Guix channel with package definitions. Different distribution angle.

And one that isn't a server improvement at all but is worth mentioning: **[travisparkerm/remarkable-mcp](https://github.com/travisparkerm/remarkable-mcp)** has been turned into "reMarkable Podcast": a web app that pulls handwritten notes off your tablet, OCRs them with Google Vision, generates a podcast script with Claude in one of six personality styles, and produces an MP3 episode with ElevenLabs TTS. Google OAuth login, daily episode generation, voice matching. A nice example of remarkable-mcp being treated as a building block.

Honestly, going through these is one of my favourite parts of running a small project. People building real things for themselves, a podcast generator, a Cloud Run deployment, a MyScript OCR backend for their own handwriting, is the actual spirit of open source, and more rewarding than any star count. If you're running a fork, I'd love to hear about it. And if there's anything in yours that would help the upstream server, please do open a PR, the MyScript backend and the cloud-tree cache in particular look like things the project would benefit from.

This is also why the project is MIT-licensed. I don't want compensation or restrictions, I want people to run free with it. No policy on PRs either, I'll happily merge them when the bandwidth lines up. This cycle is just the honest example of what happens when it doesn't: if a PR or a fork has something I want upstream and I can't get round to the proper review loop, I may end up re-implementing it to make sure my specific requirements are in there. Not the preference, just the fallback. Same energy from both directions.

## Install

[Latest release](https://github.com/SamMorrowDrums/remarkable-mcp/releases/latest) is on [PyPI](https://pypi.org/project/remarkable-mcp/). The setup hasn't changed since the original post, see the [SSH Setup Guide](https://github.com/SamMorrowDrums/remarkable-mcp/blob/main/docs/ssh-setup.md) for enabling developer mode on the tablet.

SSH mode with write support enabled, for `.vscode/mcp.json`:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "google-vision-key",
      "description": "Google Vision API Key",
      "password": true
    }
  ],
  "servers": {
    "remarkable": {
      "command": "uvx",
      "args": ["remarkable-mcp", "--ssh", "--write"],
      "env": {
        "GOOGLE_VISION_API_KEY": "${input:google-vision-key}"
      }
    }
  }
}
```

Drop `--write` for read-only. Cloud-mode setup is unchanged from the [original post](/blog/building-an-mcp-server-for-remarkable). The [Quick Install badges](https://github.com/SamMorrowDrums/remarkable-mcp) in the README handle VS Code configuration automatically.

## What's Next

remarkable-mcp is very much a side project, and I struggle to give it the attention it deserves. So contributions and bug reports genuinely help, they're often the thing that turns "I'll get to it eventually" into a shipped release. This cycle is the clearest example of that so far.

The pattern from last time still holds: the [issues](https://github.com/SamMorrowDrums/remarkable-mcp/issues) that get engagement get prioritised. Write support (#24) and reliability (#29) both shipped this cycle because people brought concrete proposals. OCR providers (#25), enhanced search (#26), export (#27), and performance (#28) are still open. If you've got a use case for one of them, comment on the issue, or send a PR.

Thanks again to [@Giancarlo-therapy](https://github.com/Giancarlo-therapy), [@ColinSha](https://github.com/ColinSha), and [@McSchnizzle](https://github.com/McSchnizzle).
