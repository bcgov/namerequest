const path = require("path")

module.exports = {
  configureWebpack: {
    devtool: 'eval-source-map',
    devServer: {
      hot: true
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.vue', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: ['postcss-loader']
        }
      ]
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
  publicPath: '/namerequest',
  devServer: {
    proxy: {
      // this is needed to prevent a CORS error when running locally
      '/local-keycloak-config-url/*': {
        target: 'https://namerequest-dev.pathfinder.gov.bc.ca/namerequest/keycloak/',
        pathRewrite: {
          '/local-keycloak-config-url': ''
        }
      }
    }
  }
}
