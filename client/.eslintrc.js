module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript',
    '@vue/standard'
  ],
  rules: {
  	'no-console': 0,
    'max-len': ['warn', { code: 120 }],
    'no-unused-vars': 'off',
    'quotes': 'off',
    'no-useless-return': 'off',
    'camelcase': 'off',
    'no-useless-escape': 'off'
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint']
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
