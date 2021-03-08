const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const appName = JSON.parse(packageJson).appName
const appVersion = JSON.parse(packageJson).version
const sbcName = JSON.parse(packageJson).sbcName
const sbcVersion = JSON.parse(packageJson).dependencies['sbc-common-components']
const aboutText1 = (appName && appVersion) ? `${appName} v${appVersion}` : ''
const aboutText2 = (sbcName && sbcVersion) ? `${sbcName} v${sbcVersion}` : ''

module.exports = {
  configureWebpack: {
    devtool: 'eval-source-map',
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.DefinePlugin({
        'process.env': {
          ABOUT_TEXT:
            (aboutText1 && aboutText2) ? `"${aboutText1}<br>${aboutText2}"`
              : aboutText1 ? `"${aboutText1}"`
                : aboutText2 ? `"${aboutText2}"`
                  : ''
        }
      })
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
      patterns: [path.resolve(__dirname, './src/sass/theme.sass')]
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
