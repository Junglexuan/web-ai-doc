const tag = process.env.NODE_TAG || process.env.NODE_ENV;
const cfg = {
  es6: {module: 'esm', targets: {chrome: 80}},
  es5: {module: 'cjs', targets: {chrome: 80}},
};
const env = cfg[tag];

module.exports = (ui, presets = []) => {
  return {
    presets: [['@elux', {...env, decoratorsLegacy: true, ui, presets, rootImport: {rootPathPrefix: 'src/', rootPathSuffix: './src/'}}]],
    ignore: ['**/*.d.ts'],
    comments: false,
  };
};
