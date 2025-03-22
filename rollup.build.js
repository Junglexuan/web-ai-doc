/* eslint-disable no-console */
import path from 'path';
import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import chalk from 'chalk';
import less from 'rollup-plugin-less';

const tag = process.env.NODE_TAG || process.env.NODE_ENV;

function createConfig(inputFile, outputFile, format, externals, aliasEntries) {
  const cfg = {
    es6: {
      output: [
        {file: outputFile, format},
        //{file: `dist/${outputFile}${fileName}_cjs.js`, format: 'cjs'},
      ],
      mainFields: ['module', 'main'],
    },
  };
  const env = cfg[tag];
  const extensions = ['.js', '.ts', '.tsx'];
  const pkgResult = {include: {}, external: {}};

  const config = {
    input: inputFile,
    output: env.output,
    external: (id) => {
      const hit = externals.some((mod) => mod === id || id.startsWith(`${mod}/`));
      if (hit) {
        if (!pkgResult.external[id]) {
          pkgResult.external[id] = true;
          console.warn(chalk.red('external: '), id);
        }
      } else if (!pkgResult.include[id]) {
        pkgResult.include[id] = true;
        console.warn(chalk.green('include: '), id);
      }
      return hit;
    },
    plugins: [
      aliasEntries &&
        alias({
          entries: aliasEntries,
        }),
      process.env.NODE_ENV === 'production' && replace({'process.env.NODE_ENV': '"production"'}),
      resolve({extensions, mainFields: env.mainFields}),
      babel({
        exclude: 'node_modules/**',
        extensions,
        babelHelpers: 'runtime',
        skipPreflightCheck: true,
        // externalHelpers: true,
      }),
      less({output: 'dist/index.css'}),
      commonjs(),
    ].filter(Boolean),
  };
  return config;
}

export default function (root, inputFiles, aliasEntries) {
  // const libsDir = path.resolve(root, './src/lib/');
  // if (fs.existsSync(libsDir)) {
  //   const libs = fs.readdirSync(libsDir);
  //   libs.forEach((item) => {
  //     inputFiles.push(`src/lib/${item}/`);
  //   });
  // }
  // console.log(inputFiles);
  const pkg = require(path.resolve(root, './package.json'));
  const externals = Object.keys(pkg.externals ? pkg.externals : {...pkg.dependencies, ...pkg.peerDependencies});
  return Object.keys(inputFiles).map((inputPath) => {
    const outputPath = inputFiles[inputPath];
    const format = outputPath.endsWith('.cjs.js') ? 'cjs' : 'esm';
    return createConfig(path.resolve(root, inputPath), path.resolve(root, outputPath), format, externals, aliasEntries);
  });
}
