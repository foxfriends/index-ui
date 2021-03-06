const { readFile } = require('fs/promises');
const { isAbsolute, join } = require('path');
const { spawnSync } = require('child_process');

const Koa = require('koa');
const serve = require('koa-static');
const mount = require('koa-mount');
const send = require('koa-send');

const unified = require('unified');
const markdown = require('remark-parse');
const math = require('remark-math');
const katex = require('rehype-katex');
const stringify = require('rehype-stringify');
const remark2rehype = require('remark-rehype');
const raw = require('rehype-raw');
const highlight = require('remark-syntax-highlight');
const AtoH = require('ansi-to-html');

const atoh = new AtoH({
  fg: 'var(--color__code--text)',
  bg: 'var(--color__code--background)',
  newline: false,
  escapeXML: true,
  colors: [
    'var(--color__code--black)',
    'var(--color__code--red)',
    'var(--color__code--green)',
    'var(--color__code--yellow)',
    'var(--color__code--blue)',
    'var(--color__code--magenta)',
    'var(--color__code--cyan)',
    'var(--color__code--white)',
    'var(--color__code--brblack)',
    'var(--color__code--brred)',
    'var(--color__code--brgreen)',
    'var(--color__code--bryellow)',
    'var(--color__code--brblue)',
    'var(--color__code--brmagenta)',
    'var(--color__code--brcyan)',
    'var(--color__code--brwhite)',
  ],
});

const noteParser = unified()
  .use(markdown)
  .use(math)
  .use(highlight, {
    highlight: (code, language) => {
      const { stdout, stderr } = spawnSync('syncat', ['-l', language], {
        stdio: ['pipe', 'pipe', 'inherit'],
        input: code,
        encoding: 'UTF-8',
      });
      if (stderr) {
        console.warn('Running syncat failed:', stderr);
      }
      return (stdout ? atoh.toHtml(stdout) : code)
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;')
        .trim();
    },
  })
  .use(remark2rehype, { allowDangerousHtml: true })
  .use(raw)
  .use(katex)
  .use(stringify)

const { DIST_DIR, NOTES_DIR, PORT = 3000 } = process.env;

if (!NOTES_DIR || !isAbsolute(NOTES_DIR)) {
  throw new TypeError('Environment variable NOTES_DIR must be an absolute path to the notes');
}

const app = new Koa();

app.use(mount('/note', async (ctx, next) => {
  const path = join(NOTES_DIR, ctx.path);
  console.log('Retrieving note', path);
  // prevent reaching above the root of NOTES_DIR
  if (!path.startsWith(NOTES_DIR)) { return next(); }
  try {
    const note = await readFile(path);
    const { contents } = await noteParser.process(note);
    ctx.body = contents;
    ctx.type = 'text/html';
    ctx.status = 200;
  } catch (error) {
    console.error(error);
    ctx.status = 404;
  }
}));
app.use(serve(DIST_DIR));
app.use((ctx) => send(ctx, 'index.html', { root: DIST_DIR }));

app.listen(PORT);
console.log(`Listening on ${PORT}`);
