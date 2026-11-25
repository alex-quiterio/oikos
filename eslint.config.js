import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const LAYERS = ['domain', 'application', 'infrastructure', 'presentation'];

/** Import hygiene for every file: aliases at most two segments deep, relative paths only within the current folder. */
const hygiene = [
  {
    regex: `^@(${LAYERS.join('|')})/[^/]+/[^/]+/`,
    message: 'Import through a barrel: alias plus at most two segments.',
  },
  { regex: '^\\.\\./', message: 'Never import from a parent folder. Use an @layer alias.' },
  {
    regex: '^\\./[^/]+/',
    message: 'Relative imports only reach the current folder. Use an @layer alias for subfolders.',
  },
];

/** Layers only import inward: presentation -> application -> domain, infrastructure -> application -> domain. */
const forbid = (...layers) => [
  ...hygiene,
  ...layers.map(l => ({ regex: `^@${l}(/|$)`, message: `This layer must not import from ${l}.` })),
];
const rule = patterns => ({ 'no-restricted-imports': ['error', { patterns }] });

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue,js}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      ...rule(hygiene),
    },
  },
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  { files: ['src/domain/**'], rules: rule(forbid('application', 'infrastructure', 'presentation')) },
  { files: ['src/application/**'], rules: rule(forbid('infrastructure', 'presentation')) },
  { files: ['src/infrastructure/**'], rules: rule(forbid('presentation')) },
  prettier,
);
