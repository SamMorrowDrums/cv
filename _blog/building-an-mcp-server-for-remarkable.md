---
title: "Building an MCP Server for reMarkable"
date: '2025-11-28T00:00:00.000Z'
slug: 'building-an-mcp-server-for-remarkable'
---

I've been using [reMarkable](https://remarkable.com/) tablets since 2021. They're excellent for capturing notes, annotating PDFs, and generally keeping your focus where it should be. But getting content back out has always been a friction point, and I finally got annoyed enough to do something about it.

I built an [MCP](https://modelcontextprotocol.io/) server that lets AI assistants read your reMarkable documents directly. What started as a weekend project turned into something genuinely useful.

## Why I Built This

I've been gradually building up an [Obsidian](https://obsidian.md/)-based second brain for my MCP R&D work. It's where I index ideas, draft articles, prepare conference talks, and collect academic papers. The system works well for digital content, but my reMarkable had years of handwritten notes that weren't part of it. Conference notes, research annotations, talk outlines, margin notes on PDFs, ideas and TODO lists. All that knowledge was trapped on the device, invisible to my Obsidian vault and not accessible for AI agents either.

reMarkable does offer ways to export content and get OCR through their cloud service. But somehow I never actually did it. The friction of manual export, one document at a time, meant those notes just sat there accumulating.

Two things inspired me to finally solve this. First, my day job. I build the [GitHub MCP Server](https://github.com/github/github-mcp-server), so I spend a lot of time thinking about MCP tool design. Second, [Scrybble Sync](https://scrybble.ink/), which syncs reMarkable to Obsidian. Scrybble showed me what was possible, but I wanted something that worked directly with AI assistants rather than as a sync tool.

So I built remarkable-mcp. Within a day, I had completely indexed everything from my reMarkable. Hundreds of documents spanning years of notes. Ideas I'd forgotten about resurfaced. Connections I'd missed became obvious. My handwritten notes were no longer lost; they were searchable, queryable, and integrated into my knowledge system. Sometimes you need to build the tool that finally makes you do the thing you've been putting off.

## SSH Mode is the Way

My first version used the reMarkable Cloud API. It worked, but felt sluggish. Then I pivoted to using SSH to connect directly to the tablet over USB, and the difference is dramatic (the cloud APIs were just not built to support my use-cases although the MCP Server still supports it). Fortunately, I already had developer mode enabled on my tablet so it was very straightforward to get going.

Connecting via USB and SSH gives you direct filesystem access. No cloud roundtrip, no subscription gatekeeping for basic functionality. The tablet becomes a local device you can query instantly. The [reMarkable guide](https://remarkable.guide/guide/access/ssh.html) has excellent documentation on enabling developer mode.

I should note that I actually enjoy reMarkable Connect. I have both a Paper Pro Move for when I'm out of the house and a Paper Pro for reading academic papers, and cloud sync across devices is genuinely useful. I just think basic programmatic access to your own documents should be available to all owners, not just subscribers. SSH mode makes that possible.

## Five Tools, Not Fifty

The reMarkable API has dozens of endpoints. I could have exposed them all as tools. Instead, I shipped five [MCP tools](https://modelcontextprotocol.io/docs/concepts/tools):

| Tool | Purpose |
|------|---------|
| `remarkable_read` | Extract text from any document |
| `remarkable_browse` | Navigate folders or search by name |
| `remarkable_search` | Search content across multiple docs |
| `remarkable_recent` | See what you've worked on lately |
| `remarkable_status` | Check connection health |

That's it. These five cover maybe 95% of what you'd actually want to do. The constraint forced better design decisions. Each tool is deeply capable rather than superficially complete.

This approach comes from [our research on the GitHub MCP Server](https://github.blog/engineering/copilot/how-were-making-github-copilot-smarter-with-fewer-tools/). We found that having too many tools actually decreased resolution rates by 2-5%. Models get confused when they have dozens of similar-looking options. Fewer, more capable tools perform better.

## Native Text Extraction

Something most people don't know: reMarkable tablets running v3+ software store typed text in a structured format. If you use the Type Folio keyboard or the on-screen keyboard, that text is stored as data, not pixels.

The [`rmscene`](https://github.com/ricklupton/rmscene) library can parse it directly. This means instant text extraction for Type Folio documents, typed annotations on PDFs, quick notes, and any typed content in notebooks. No OCR needed, no delay, no cost.

For handwritten content, you'll need OCR.

## Handwriting OCR

I originally used Tesseract for OCR. It's free, offline, and works great for printed text. For handwriting? Pretty terrible unless you write like a font. My handwriting is atrocious, so bad my 10-month-old daughter probably writes better than I do, so Tesseract was essentially useless for my notes.

Google Cloud Vision is a different story. Their handwriting recognition is genuinely impressive. My scrawled meeting notes become readable text. The service offers 1,000 free requests per month, then costs about $1.50 per 1,000 images. That's reasonable for actual use.

The server supports both: Google Vision for quality, Tesseract as an offline fallback.

## Response Design

David Cramer's [work on MCP tool design](https://cra.mr/subagents-with-mcp) influenced how I think about responses. Every tool response includes a `_hint` field suggesting logical next steps:

```json
{
  "documents": [
    {"name": "Meeting Notes", "path": "/Work/Meeting Notes"}
  ],
  "_hint": "Found 1 document. To read: remarkable_read('Meeting Notes')."
}
```

This matters more than you'd think. AI models work better when responses guide them toward sensible follow-up actions. Errors don't just say "failed," they explain what went wrong and suggest fixes:

```json
{
  "_error": {
    "type": "document_not_found",
    "message": "Document 'Meting Notes' not found",
    "suggestion": "Did you mean: 'Meeting Notes'?",
    "did_you_mean": ["Meeting Notes", "Meeting Notes 2"]
  }
}
```

## Root Path Filtering

Sometimes you don't want an agent accessing all your documents, so I added: `REMARKABLE_ROOT_PATH`. Set it to a folder e.g. `/Work` and the AI only sees your work documents. Set it to `/Journals` and it only accesses your journals. Whatever you need.

```json
{
  "env": {
    "REMARKABLE_ROOT_PATH": "/Work"
  }
}
```

This is useful for privacy (limiting AI access to specific folders), for focus (pinning to a project folder during deep work), and for context (different configs for different AI workflows). When configured, all paths are relative to the root. Browsing `/` shows the contents of `/Work`. Documents outside the provided root simply don't exist to the AI.

## MCP Resources

Beyond tools, MCP supports [Resources](https://modelcontextprotocol.io/docs/concepts/resources), which are data the AI can access directly without tool calls. Every document registers as a resource:

```
remarkable:///Meeting%20Notes.txt
remarkable:///Work/Project/Report.txt
```

In SSH mode, you also get raw file access (which provides the full text of the PDF or EPUB):

```
remarkableraw:///Research%20Paper.pdf
remarkableraw:///Books/Deep%20Work.epub
```

These appear in VS Code's MCP resource panel, letting you attach documents directly to conversations.

## Technical Stack

- **[FastMCP](https://github.com/jlowin/fastmcp)** for the [MCP server](https://modelcontextprotocol.io/docs/concepts/servers) framework
- **rmscene** for native .rm file parsing (typed text, no OCR)
- **PyMuPDF** for PDF text extraction
- **[Google Cloud Vision](https://cloud.google.com/vision)** for handwriting OCR
- **Paramiko** for SSH transport

The codebase is modular: separate files for tools, resources, API interactions, and extraction logic. Makes testing easier and keeps the mental model clean.

## What I Learned

**Design for intent, not capability.** Users don't want to "call the document metadata endpoint." They want to "find my notes from last week."

**SSH beats cloud for local devices.** Direct access is faster, works offline, and doesn't require subscriptions for basic functionality.

**Guide the next action.** Response hints aren't hand-holding. They're context that helps AI models make better decisions.

**Good OCR is worth paying for.** Tesseract is fine for printed text. For handwriting, Google Vision is transformatively better.

**Constraints improve design.** Limiting to five tools forced me to make each one deeply capable.

## Try It

The package is available on [PyPI](https://pypi.org/project/remarkable-mcp/).

### SSH Mode (Recommended)

See the [SSH Setup Guide](https://github.com/SamMorrowDrums/remarkable-mcp/blob/main/docs/ssh-setup.md) for enabling developer mode on your tablet.

Add to your `.vscode/mcp.json` or similar:

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
      "args": ["remarkable-mcp", "--ssh"],
      "env": {
        "GOOGLE_VISION_API_KEY": "${input:google-vision-key}"
      }
    }
  }
}
```

### Cloud Mode

1. Visit [my.remarkable.com/device/desktop/connect](https://my.remarkable.com/device/desktop/connect) to get a one-time code
2. Convert it to a token:

```bash
uvx remarkable-mcp --register YOUR_CODE
```

3. Add to your `.vscode/mcp.json`:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "remarkable-token",
      "description": "reMarkable API Token",
      "password": true
    },
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
      "args": ["remarkable-mcp"],
      "env": {
        "REMARKABLE_TOKEN": "${input:remarkable-token}",
        "GOOGLE_VISION_API_KEY": "${input:google-vision-key}"
      }
    }
  }
}
```

The [Quick Install badges](https://github.com/SamMorrowDrums/remarkable-mcp) in the README handle VS Code configuration automatically.

## What's Next

The [GitHub issues](https://github.com/SamMorrowDrums/remarkable-mcp/issues) track future plans: write support, more OCR providers, semantic search, and export features. But for now, the core experience is solid. Your reMarkable as a queryable second brain. If you encounter any problems, that's the best place to file them.
