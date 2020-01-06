module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFiles: ['<rootDir>/tests/unit/setup.ts'],
  notify: true,
  notifyMode: 'always',
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
}
