const path = require('path');

module.exports = {
  extends: '../.eslintrc.cjs',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: path.resolve(__dirname, 'tsconfig.json'),
    jsx: true,
    useJSXTextNode: true,
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc.cjs'],
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      rules: {
        'astro/no-conflict-set-directives': 'error',
        'astro/no-deprecated-astro-canonicalurl': 'error',
        'astro/no-deprecated-astro-fetchcontent': 'error',
        'astro/no-deprecated-astro-resolve': 'error',
        'astro/no-unused-define-vars-in-style': 'error',
        'astro/valid-compile': 'error',
        'astro/no-set-text-directive': 'error',
        'astro/no-unused-css-selector': 'error',
        'astro/no-set-html-directive': 'error',

        // Astro - a11y rules
        'astro/jsx-a11y/alt-text': 'error',
        'astro/jsx-a11y/anchor-ambiguous-text': 'error',
        'astro/jsx-a11y/anchor-has-content': 'error',
        'astro/jsx-a11y/anchor-is-valid': 'error',
        'astro/jsx-a11y/aria-activedescendant-has-tabindex': 'error',
        'astro/jsx-a11y/aria-props': 'error',
        'astro/jsx-a11y/aria-proptypes': 'error',
        'astro/jsx-a11y/aria-role': 'error',
        'astro/jsx-a11y/aria-unsupported-elements': 'error',
        'astro/jsx-a11y/autocomplete-valid': 'error',
        'astro/jsx-a11y/click-events-have-key-events': 'error',
        'astro/jsx-a11y/control-has-associated-label': 'error',
        'astro/jsx-a11y/heading-has-content': 'error',
        'astro/jsx-a11y/html-has-lang': 'error',
        'astro/jsx-a11y/iframe-has-title': 'error',
        'astro/jsx-a11y/img-redundant-alt': 'error',
        'astro/jsx-a11y/interactive-supports-focus': 'error',
        'astro/jsx-a11y/label-has-associated-control': 'error',
        'astro/jsx-a11y/lang': 'error',
        'astro/jsx-a11y/media-has-caption': 'error',
        'astro/jsx-a11y/mouse-events-have-key-events': 'error',
        'astro/jsx-a11y/no-access-key': 'error',
        'astro/jsx-a11y/no-aria-hidden-on-focusable': 'error',
        'astro/jsx-a11y/no-autofocus': 'error',
        'astro/jsx-a11y/no-distracting-elements': 'error',
        'astro/jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
        'astro/jsx-a11y/no-noninteractive-element-interactions': 'error',
        'astro/jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
        'astro/jsx-a11y/no-noninteractive-tabindex': 'error',
        'astro/jsx-a11y/no-redundant-roles': 'error',
        'astro/jsx-a11y/no-static-element-interactions': 'error',
        'astro/jsx-a11y/prefer-tag-over-role': 'error',
        'astro/jsx-a11y/role-has-required-aria-props': 'error',
        'astro/jsx-a11y/role-supports-aria-props': 'error',
        'astro/jsx-a11y/scope': 'error',
        'astro/jsx-a11y/tabindex-no-positive': 'error',
      },
    },
  ],
};
