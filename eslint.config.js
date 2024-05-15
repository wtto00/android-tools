import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['**/spec/coverage/**/*', '**/dist/**/*'] },
  { languageOptions: { globals: globals.node } },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  { ...pluginJs.configs.recommended },

  ...tseslint.config({
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: { parserOptions: { project: true } }
  })
];
