//import path from 'path';
const path = require('path')
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

const srcPath = path.resolve(__dirname, 'src');
const buildPath = path.resolve(__dirname, 'dist');

const config = {
  context: srcPath,
  entry: {
    mine: './index.js',
    boo: './scream/boo.js'
  },
  output: {
    path: buildPath,
    filename: '[name].bundle.js' // todo: on production: [name].[chunkhash]
  },
  devServer: {
    hot: true,
    inline: true,
    contentBase: './src/',
    host: '0.0.0.0',
    publicPath: '/',
    stats: {
      assets: false,
      colors: true,
      chunkModules: false,
      version: false,
      hash: false,
      timings: false,
      chunks: true,
      chunkModules: false,
      modules: false
    }
  },
  devtool: isProduction ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          plugins: [
            'add-module-exports',
            'transform-decorators-legacy',
            'transform-class-properties',
            'transform-object-rest-spread',
            ['transform-runtime', {helpers: false, polyfill: false, regenerator: true}]
          ]
        }
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'raw-loader',
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'glslify-loader',
      },
      {
        test: /\.html$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'file-loader?name=[name].[ext]'
      }
    ]
  },
  plugins: pluginsList(isProduction),
  resolve: {
    symlinks: false,
    modules: [path.resolve('node_modules')]
  }
};

function pluginsList(prod) {
  const plugins = [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor'],
        chunks: ['app'],
        minChunks: function (module) {
          return isExternal(module)
        }
      }),
      new webpack.NamedModulesPlugin(),
      // multiple entrypoints
      // /
      new HtmlWebpackPlugin({
        title: "React+Redux & threejs",
        filename: 'index.html',
        template: path.resolve(srcPath, 'index.ejs'),
        hash: true,
        chunks: ['mine']
      }),
      // /boo
      new HtmlWebpackPlugin({
        title: "Booo!",
        inject: 'head',
        filename: 'boo/index.html',
        template: path.resolve(srcPath, 'index.ejs'),
        hash: true,
        chunks: ['boo']
      }),
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 1024,
        minRatio: 0.8
      })
  ];
  if(prod) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true
      }),
      new webpack.optimize.UglifyJsPlugin()
    )
  } else {
    plugins.push(
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    )
  }
  return plugins;
}

function isExternal(module) {
  const userRequest = module.userRequest;

  if (typeof userRequest !== 'string') {
    return false
  }

  return userRequest.indexOf('bower_components') >= 0 ||
         userRequest.indexOf('node_modules') >= 0 ||
         userRequest.indexOf('libraries') >= 0;
}

export {
  config as default
};
