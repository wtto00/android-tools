module.exports = {
  '*': ['prettier --write --ignore-unknown'],
  '*.{js,mjs,cjs,ts,mts}': ['eslint --cache --fix'],
  '*.{ts,mts,tsx}': [() => 'npm run tscheck']
};
