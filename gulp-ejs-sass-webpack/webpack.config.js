// Node.js に組み込まれているモジュール。出力先などの指定をするために利用する。
const path = require('path');
// JavaScritpt を圧縮するプラグイン
const TerserPlugin = require('terser-webpack-plugin');
// webpack利用
const Webpack = require('webpack');

module.exports = {
  // モードの設定
  mode: 'production',
  // エントリーポイントの設定
  entry: {
    index: './src/js/index.js',
    // app: './src/js/app.js',
  },
  // 出力の設定
  output: {
    // 出力先のパス（絶対パスを指定しないとエラーが出るので注意）
    // `__dirname + public`のように書くと、OS によって
    // パスが異なってしまうことがあるので、必ず`path`モジュールを利用する。
    path: path.resolve(__dirname, 'public/assets/js'),
    // 出力するファイル名
    // [name] には entry に指定した名前が入る
    // このサンプルでは、entry に index と app を指定しているため、
    // index.bundle.js と app.bundle.js が出力される
    filename: '[name].bundle.js',
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       // include: path.resolve(__dirname, './src/js'),
  //       exclude: path.resolve(__dirname, './src/js/libs/barba-gsap.js'),
  //       use: [
  //         {
  //           loader: 'babel-loader',
  //           options: {
  //             presets: ['@babel/preset-env'],
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
  plugins: [
    // まとめてインポートする
    new Webpack.ProvidePlugin({
      // jQuery: 'jquery',
      // $: 'jquery',
      // gsap: 'gsap',
      // barba: '@barba/core',
    }),
  ],
  optimization: {
    splitChunks: {
      // 共通モジュールとして分割する対象。以下の値を指定できる。
      // initial: 静的にインポートしているモジュール、async: 動的（ダイナミック）にインポートしているモジュール、all: すべて
      // node_modules 配下のモジュールをバンドル対象とする（webpack5では all 推奨
      chunks: 'all',
      minSize: 0,
      minChunks: 1,
      cacheGroups: {
        // プロパティ名の vendors は任意
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          // 今回は 'vendor' で、output.filename が '[name].bundle.js' のため、 vendor.bundle.js が出力される。
          name: 'vendors',
        },
        default: false,
      },
    },
    // JavaScritpt を圧縮する
    minimizer: [
      new TerserPlugin({
        // ライブラリのライセンスコメントなどを抽出した「xxx.LICENSE.txt」のようなファイルが出力されないようにする
        extractComments: false,
      }),
    ],
  },
};
