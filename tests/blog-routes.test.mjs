import test from "node:test";
import assert from "node:assert/strict";

import { getPublishedBlogPostSlugs } from "../lib/api.mjs";

test("future-dated posts are absent from generated blog routes", () => {
  const slugs = getPublishedBlogPostSlugs(new Date("2026-05-19T12:00:00.000Z"));

  assert.ok(!slugs.includes("progressive-discovery-in-mcp-part-2"));
});

test("published posts are present in generated blog routes", () => {
  const slugs = getPublishedBlogPostSlugs(new Date("2026-05-19T12:00:00.000Z"));

  assert.ok(slugs.includes("progressive-discovery-in-mcp-part-1"));
});

test("Part 5 is absent from routes during the current 2026 build date", () => {
  const slugs = getPublishedBlogPostSlugs(new Date("2026-09-15T12:00:00.000Z"));

  assert.ok(!slugs.includes("progressive-discovery-in-mcp-part-5"));
});
