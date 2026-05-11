const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const baseOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  external: ['vscode'],
  outfile: 'dist/extension.js',
  sourcemap: !production,
  minify: production,
};

if (watch) {
  esbuild.context(baseOptions).then((ctx) => ctx.watch()).catch(() => process.exit(1));
} else {
  esbuild.build(baseOptions).catch(() => process.exit(1));
}
