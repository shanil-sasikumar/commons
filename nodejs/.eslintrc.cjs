module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:astro/recommended',
    'prettier',
  ],
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
  },
  plugins: ['@typescript-eslint', 'prettier', 'astro'],
  rules: {
    'no-var': 'error',

    // Typescript-eslint
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-check': false,
        minimumDescriptionLength: 5,
      },
    ],
    '@typescript-eslint/ban-tslint-comment': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Object: 'Use {} instead.',
          String: { message: "Use 'string' instead.", fixWith: 'string' },
          Number: { message: "Use 'number' instead.", fixWith: 'number' },
          Boolean: {
            message: "Use 'boolean' instead.",
            fixWith: 'boolean',
          },
        },
        extendDefaults: false,
      },
    ],
    '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow-as-parameter',
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          accessors: 'explicit',
          constructors: 'no-public',
          methods: 'explicit',
          properties: 'off',
          parameterProperties: 'explicit',
        },
      },
    ],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          'public-static-field',
          'protected-static-field',
          'private-static-field',
          'public-instance-field',
          'protected-instance-field',
          'private-instance-field',
          'public-constructor',
          'protected-constructor',
          'private-constructor',
          'public-instance-method',
          'protected-instance-method',
          'private-instance-method',
          'public-static-method',
          'protected-static-method',
          'private-static-method',
        ],
      },
    ],
    '@typescript-eslint/method-signature-style': ['error', 'property'],
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/restrict-template-expressions': ['error', { allowBoolean: true }],
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      { allowString: false, allowNumber: false },
    ],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
  },
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