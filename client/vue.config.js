const path = require("path")
const webpack = require("webpack")

module.exports = {
  configureWebpack: {
    devtool: 'eval-source-map',
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
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
  publicPath: process.env.VUE_APP_PATH,
  devServer: {
    proxy: {
      // this is needed to prevent a CORS error when running locally
      '/local-keycloak-config-url/*': {
        target: 'https://dev.bcregistry.ca/namerequest/config/kc/',
        pathRewrite: {
          '/local-keycloak-config-url': ''
        }
      }
    }
  }
}
