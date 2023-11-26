import * as vite from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

import { fileURLToPath } from "node:url";
import { rm, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, join, basename } from "path";
import { spawnSync } from "child_process";

import { unified } from "unified";
import markdown from "remark-parse";
import math from "remark-math";
import katex from "rehype-katex";
import stringify from "rehype-stringify";
import remark2rehype from "remark-rehype";
import raw from "rehype-raw";
import highlight from "remark-syntax-highlight";
import pintora from "./remark-pintora.js";
import AtoH from "ansi-to-html";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const atoh = new AtoH({
  fg: "var(--color__code--text)",
  bg: "var(--color__code--background)",
  newline: false,
  escapeXML: true,
  colors: [
    "var(--color__code--black)",
    "var(--color__code--red)",
    "var(--color__code--green)",
    "var(--color__code--yellow)",
    "var(--color__code--blue)",
    "var(--color__code--magenta)",
    "var(--color__code--cyan)",
    "var(--color__code--white)",
    "var(--color__code--brblack)",
    "var(--color__code--brred)",
    "var(--color__code--brgreen)",
    "var(--color__code--bryellow)",
    "var(--color__code--brblue)",
    "var(--color__code--brmagenta)",
    "var(--color__code--brcyan)",
    "var(--color__code--brwhite)",
  ],
});

const noteParser = unified()
  .use(markdown)
  .use(math)
  .use(pintora)
  .use(highlight, {
    highlight: (code, language) => {
      const { stdout, stderr } = spawnSync("syncat", ["-l", language], {
        stdio: ["pipe", "pipe", "inherit"],
        input: code,
        encoding: "UTF-8",
      });
      if (stderr) {
        console.warn("Running syncat failed:", stderr);
      }
      return (stdout ? atoh.toHtml(stdout) : code)
        .replace(/\{/g, "&#123;")
        .replace(/\}/g, "&#125;")
        .trim();
    },
  })
  .use(remark2rehype, { allowDangerousHtml: true })
  .use(raw)
  .use(katex)
  .use(stringify);

const { NOTES_DIR } = process.env;

await rm(join(__dirname, "../public"), { recursive: true, force: true });
await mkdir(join(__dirname, "../public/note"), { recursive: true });
for (const path of await readdir(NOTES_DIR)) {
  console.log(`Compling note: ${path}`);
  const note = await readFile(join(NOTES_DIR, path));
  const { value } = await noteParser.process(note);
  await writeFile(
    resolve(__dirname, "../public/note", `${basename(path, ".md")}.html`),
    value
  );
}

await vite.build(
  vite.defineConfig({
    plugins: [svelte()],
    publicDir: resolve(__dirname, "../public"),
    rollupDedupe: ["svelte"],
    root: resolve(__dirname, "../src"),
    build: {
      outDir: resolve(__dirname, "../dist"),
      emptyOutDir: true,
      copyPublicDir: true,
      rollupOptions: {
        input: resolve(__dirname, "../src/index.html"),
      },
    },
  })
);
