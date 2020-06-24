const path = require("path")

module.exports = {
  configureWebpack: {
    devtool: 'eval-source-map',
    devServer: {
      hot: true
    },
    resolve: {
      extensions: ['.ts', '.js', '.json', '.vue']
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'sass',
      patterns: [path.resolve(__dirname, "./src/sass/theme.sass")]
    }
  },
  transpileDependencies: [
    'vuetify',
    'vuex-module-decorators'
  ],
  publicPath: '/namerequest'
}
