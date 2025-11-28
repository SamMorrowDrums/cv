---
title: "LastMile AI Silsila Sessions: MCP at Hyperscale"
date: '2025-11-24T00:00:00.000Z'
slug: 'lastmile-ai-silsila-sessions-mcp-at-scale'
---

<p><iframe allow="monetization" class="embedly-embed" src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2F0d9TR91iLx0%3Ffeature%3Doembed&amp;display_name=YouTube&amp;url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D0d9TR91iLx0&amp;image=https%3A%2F%2Fi.ytimg.com%2Fvi%2F0d9TR91iLx0%2Fhqdefault.jpg&amp;key=d932fa08bf1f47efbbe54cb3d746839f&amp;type=text%2Fhtml&amp;schema=youtube" width="640" height="360" scrolling="no" title="LastMile AI Silsila Sessions: MCP at Hyperscale video" frameborder="0" allowfullscreen="true"></iframe></p>

I had the pleasure of joining the [LastMile AI](https://lastmileai.dev/) Silsila Sessions this week, where we went deep on what it really takes to make MCP agents production-ready. The session brought together some fantastic speakers to discuss the core challenges of building secure, scalable agent systems.

## The Panel

- **Sam Morrow (GitHub)** — I broke down what it really looks like to run an MCP server at scale, from tool bloat to evals to security surprises.
- **Tobin South (WorkOS)** — Unpacked the practical realities of OAuth, agent identity, and enterprise-grade authentication.
- **Sarmad Qadri (LastMile AI)** — Shared upcoming MCP spec updates and how they unlock more advanced agent behaviors.

## Key Takeaways

One of my main points during the session was around the tradeoffs between atomic tools and higher-level workflow tools:

> "Atomic tools give you flexibility, but too many create context bloat and tool confusion — workflow-style tools are where agents really shine."

This is something we've learned firsthand running MCP at hyperscale at GitHub. When you're operating at this level, the design decisions around tool granularity become critical. Too many fine-grained tools and you overwhelm the model with choices; too few and you lose the flexibility that makes agents powerful.

We also discussed:
- Running MCP at hyperscale and the unique challenges that come with it
- OAuth and agent identity in enterprise contexts
- Upcoming MCP spec changes that open the door to long-running workflows and smarter agents

Huge thanks to [LastMile AI](https://lastmileai.dev/) for hosting, and to everyone who joined live. These conversations are invaluable for pushing the MCP ecosystem forward.
