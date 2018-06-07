// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: require('./dev.env'),
    port: 7070,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
        // '/api':{//用于mock
        //   target: 'http://localhost:7071',
        //   changeOrigin:true,
        //   secure: false,
        //   pathRewrite:{
        //       '^/account':''
        //   }
        // },
        '/preview': {// 活动模板预览功能
            target: 'http://localhost:7071',
            changeOrigin:true,
            pathRewrite:{
                '^/preview':'/preview'
            }
        },
        '/temp': {
            target: 'http://localhost:7071',
            changeOrigin:true,// 本地虚拟一个服务器代发你的请求
            pathRewrite:{
            '^/temp':'/temp'
            }
        },
        '/activity': {
            target: 'http://localhost:7071',
            changeOrigin:true,// 本地虚拟一个服务器代发你的请求
            pathRewrite:{
            '^/activity':'/activity'
            }
        },
        '/detail': {
            target: 'http://localhost:7071/images/',
            changeOrigin:true,// 本地虚拟一个服务器代发你的请求
            pathRewrite:{
            '^/detail':''
            }
        },
        '/api': {
            target: 'http://localhost:7071',
            changeOrigin:true,// 本地虚拟一个服务器代发你的请求
            pathRewrite:{
            '^/api':'/api'
            }
        }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
