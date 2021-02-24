module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
      babelConfig: true
    }
  },
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFiles: ['<rootDir>/tests/unit/setup.ts'],
  // notify: true,
  // notifyMode: 'always',
  transformIgnorePatterns: []
}
