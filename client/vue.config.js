const path = require("path")

module.exports = {
  configureWebpack: {
    devtool: 'eval-source-map'
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "~@/sass/theme.sass"`,
      },
    },
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'sass',
      patterns: '~@/sass/theme.sass'
    }
  },
  transpileDependencies: [
    'vuetify',
    'vuex-module-decorators'
  ]
}
