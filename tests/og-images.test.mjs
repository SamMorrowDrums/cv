import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const script = fileURLToPath(new URL("../scripts/generate-og-images.mjs", import.meta.url));

function workspace(t) {
  const directory = mkdtempSync(join(tmpdir(), "cv-og-images-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function addPost(directory) {
  mkdirSync(join(directory, "_blog"));
  writeFileSync(
    join(directory, "_blog", "example.md"),
    '---\ntitle: "Example post"\ndate: "2000-01-01T00:00:00.000Z"\n---\n\nPost content.\n',
  );
}

function generate(directory) {
  const result = spawnSync(process.execPath, [script], {
    cwd: directory,
    encoding: "utf8",
    timeout: 60000,
  });
  assert.ifError(result.error);
  return result;
}

test("the generator writes both social image formats for posts and static pages", async (t) => {
  const directory = workspace(t);
  addPost(directory);
  const result = generate(directory);
  assert.equal(result.status, 0, result.stderr);

  for (const slug of ["example", "blog", "home"]) {
    for (const [suffix, height] of [["", 630], ["-square", 1200]]) {
      const image = await sharp(join(directory, "public", "og-images", `${slug}${suffix}.png`)).metadata();
      assert.equal(image.format, "png");
      assert.equal(image.width, 1200);
      assert.equal(image.height, height);
    }
  }
});

test("post-loading errors fail the generation command", (t) => {
  const result = generate(workspace(t));
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /Error generating OG images:/);
  assert.doesNotMatch(result.stdout, /generation complete|continuing with build/);
});

test("image-writing errors fail the generation command", (t) => {
  const directory = workspace(t);
  addPost(directory);
  mkdirSync(join(directory, "public", "og-images", "example.png"), { recursive: true });

  const result = generate(directory);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /EISDIR/);
  assert.doesNotMatch(result.stdout, /generation complete|continuing with build/);
});
