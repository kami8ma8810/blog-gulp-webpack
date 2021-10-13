// gulpコマンドの省略
const { src, dest, watch, lastRun, series, parallel } = require('gulp');

// EJS
const fs = require('fs'); //Node.jsでファイルを操作するための公式モジュール
const htmlMin = require('gulp-htmlmin');
const prettify = require('gulp-prettify');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

// Sass
const sass = require('gulp-dart-sass');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postCss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cssNano = require('gulp-cssnano');

// JavaScript
const babel = require('gulp-babel');
const terser = require('gulp-terser'); //ES6(ES2015)の圧縮に対応

// 画像圧縮
const imageMin = require('gulp-imagemin');
const pngQuant = require('imagemin-pngquant');
const mozJpeg = require('imagemin-mozjpeg');
const svgo = require('gulp-svgo');
const webp = require('gulp-webp'); //webpに変換

// ブラウザ同期
const browserSync = require('browser-sync').create();

// 削除
const clean = require('gulp-clean');

//パス設定
const paths = {
  ejs: {
    src: ['./src/ejs/**/*.ejs', '!./src/ejs/**/_*.ejs'],
    dist: './public/',
    watch: './src/ejs/**/*.ejs',
  },
  styles: {
    src: './src/scss/**/*.scss',
    copy: './src/css/vendors/*.css',
    dist: './public/assets/css/',
    distCopy: './public/assets/css/vendors/',
  },
  scripts: {
    src: ['./src/js/**/*.js', '!./src/js/**/vendors/*.js'], //外部のライブラリファイルはコンパイルしない
    copy: './src/js/**/vendors/*.js',
    dist: './public/assets/js/',
  },
  images: {
    src: './src/images/**/*.{jpg,jpeg,png,gif,svg}',
    srcWebp: './src/images/**/*.{jpg,jpeg,png}',
    dist: './public/assets/images/',
    distWebp: './public/assets/images/webp/',
  },
  fonts: {
    src: './src/fonts/**/*.{off,ttf,woff,woff2}',
    dist: './public/assets/fonts/',
  },
  clean: {
    all: './public/',
    assets: ['./public/assets/css/', './public/assets/js/'],
    html: './public/!(assets)**',
    css: './public/assets/css/',
    js: './public/assets/js/',
    images: './public/assets/images/',
    fonts: './public/assets/fonts/',
  },
};

// ejsコンパイル
const ejsCompile = () => {
  // ejsの設定を読み込む
  const data = JSON.parse(fs.readFileSync('./ejs-config.json'));
  return src(paths.ejs.src)
    .pipe(
      plumber({
        // エラーがあっても処理を止めない
        errorHandler: notify.onError('Error: <%= error.message %>'),
      })
    )
    .pipe(ejs(data)) //ejsをまとめる
    .pipe(
      rename({
        extname: '.html',
      })
    )
    .pipe(
      htmlMin({
        //圧縮時のオプション
        removeComments: true, //コメントを削除
        collapseWhitespace: true, //余白を詰める
        collapseInlineTagWhitespace: true, //inline要素のスペース削除（spanタグ同士の改行などを詰める
        preserveLineBreaks: true, //タグ間の余白を詰める
        /*
         *オプション参照：https://github.com/kangax/html-minifier
         */
      })
    )
    .pipe(
      prettify({
        //整形
        indent_with_tabs: true, //スペースではなくタブを使用
        indent_size: 2,
      })
    )
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, '$1'))
    .pipe(dest(paths.ejs.dist))
    .pipe(browserSync.stream()); //変更があった所のみコンパイル
};

// Sassコンパイル
const sassCompile = () => {
  return (
    src(paths.styles.src, {
      // ソースマップの出力の有無
      sourcemaps: true,
    })
      .pipe(
        plumber({
          // エラーがあっても処理を止めない
          errorHandler: notify.onError('Error: <%= error.message %>'),
        })
      )
      // scss→cssコンパイル
      .pipe(
        sass({
          //出力時の形式（下記詳細）
          /*
           *https://utano.jp/entry/2018/02/hello-sass-output-style/
           */
          outputStyle: 'compressed',
        }).on('error', sass.logError)
      )
      .pipe(
        postCss([
          autoprefixer({
            //ベンダープレフィックス追加※設定はpackage.jsonに記述
            cascade: false, // プロパティのインデントを整形しない
            grid: 'autoplace', // IE11のgrid対応
          }),
        ])
      )
      //メディアクエリをまとめる
      .pipe(gcmq())
      //圧縮
      .pipe(cssNano())
      .pipe(
        dest(paths.styles.dist, {
          // ソースマップを出力する場合のパス
          sourcemaps: './map',
        })
      )
      //変更があった所のみコンパイル
      .pipe(browserSync.stream())
  );
};

// JavaScriptコンパイル
const jsCompile = () => {
  return src(paths.scripts.src)
    .pipe(
      plumber({
        // エラーがあっても処理を止めない
        errorHandler: notify.onError('Error: <%= error.message %>'),
      })
    )
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(terser()) //圧縮
    .pipe(dest(paths.scripts.dist));
};

// 画像圧縮
const imagesCompress = () => {
  return src(paths.images.src, {
    since: lastRun(imagesCompress),
  })
    .pipe(
      plumber({
        // エラーがあっても処理を止めない
        errorHandler: notify.onError('Error: <%= error.message %>'),
      })
    )
    .pipe(
      imageMin(
        [
          mozJpeg({
            quality: 80, //画質
          }),
          pngQuant(
            [0.6, 0.8] //画質の最小,最大
          ),
        ],
        {
          verbose: true, //メタ情報削除
        }
      )
    )
    .pipe(
      svgo({
        plugins: [
          {
            removeViewbox: false, //フォトショやイラレで書きだされるviewboxを消すかどうか※表示崩れの原因になるのでfalse推奨。以降はお好みで。
          },
          {
            removeMetadata: false, //<metadata>を削除するかどうか
          },
          {
            convertColors: false, //rgbをhexに変換、または#ffffffを#fffに変換するかどうか
          },
          {
            removeUnknownsAndDefaults: false, //不明なコンテンツや属性を削除するかどうか
          },
          {
            convertShapeToPath: false, //コードが短くなる場合だけ<path>に変換するかどうか
          },
          {
            collapseGroups: false, //重複や不要な`<g>`タグを削除するかどうか
          },
          {
            cleanupIDs: false, //SVG内に<style>や<script>がなければidを削除するかどうか
          },
          // {
          //   mergePaths: false,//複数のPathを一つに統合
          // },
        ],
      })
    )
    .pipe(dest(paths.images.dist));
};

// webp変換
// ※案件によってはIE対応が必要なので、混在しないように別フォルダに出力しています。
const webpConvert = () => {
  return src(paths.images.srcWebp, {
    since: lastRun(webpConvert),
  })
    .pipe(
      plumber({
        // エラーがあっても処理を止めない
        errorHandler: notify.onError('Error: <%= error.message %>'),
      })
    )
    .pipe(webp())
    .pipe(dest(paths.images.distWebp));
};

// CSSファイルコピー（vendorsフォルダの中身はコンパイルしない
const cssCopy = () => {
  return src(paths.styles.copy).pipe(dest(paths.styles.distCopy));
};

// JSファイルコピー（vendorsフォルダの中身はコンパイルしない
const jsCopy = () => {
  return src(paths.scripts.copy).pipe(dest(paths.scripts.dist));
};

// fontコピー（何もせずにコピーする
const fontsCopy = () => {
  return src(paths.fonts.src).pipe(dest(paths.fonts.dist));
};

// ローカルサーバー起動
const browserSyncFunc = (done) => {
  browserSync.init({
    //デフォルトの connected のメッセージ非表示
    notify: false,
    server: {
      baseDir: './',
    },
    startPath: './public/index.html',
    reloadOnRestart: true,
  });
  done();
};

// ブラウザ自動リロード
const browserReloadFunc = (done) => {
  browserSync.reload();
  done();
};

// ファイル削除
// -----------------------
// public 内をすべて削除
function cleanAll(done) {
  src(paths.clean.all, { read: false }).pipe(clean());
  done();
}
// HTML フォルダ、ファイルのみ削除（ assets 以外削除）
function cleanHtml(done) {
  src(paths.clean.html, { read: false }).pipe(clean());
  done();
}
//public 内の CSS と JS を削除
function cleanCssJs(done) {
  src(paths.clean.assets, { read: false }).pipe(clean());
  done();
}
//public 内の画像を削除
function cleanImages(done) {
  src(paths.clean.images, { read: false }).pipe(clean());
  done();
}
//public 内の fonts を削除
// function cleanFonts(done) {
//   src(paths.clean.fonts, { read: false }).pipe(clean());
//   done();
// }

// ファイル監視
const watchFiles = () => {
  watch(paths.ejs.watch, series(ejsCompile, browserReloadFunc));
  watch(paths.styles.src, series(sassCompile));
  watch(paths.styles.copy, series(cssCopy));
  watch(paths.scripts.src, series(jsCompile, browserReloadFunc));
  watch(paths.scripts.copy, series(jsCopy, browserReloadFunc));
  watch(
    paths.images.src,
    series(imagesCompress, webpConvert, browserReloadFunc)
  );
  watch(paths.fonts.src, series(fontsCopy, browserReloadFunc));
};

// npx gulp のコマンドで実行される処理
exports.default = series(
  parallel(
    ejsCompile,
    sassCompile,
    cssCopy,
    jsCompile,
    jsCopy,
    imagesCompress,
    webpConvert,
    fontsCopy
  ),
  parallel(watchFiles, browserSyncFunc)
);

// その他のコマンド 例： npx gulp cleanAll の形で入力
exports.cleanAll = series(cleanAll);
exports.cleanExcludeHtml = series(cleanHtml); //assets以外削除
exports.cleanCssJs = series(cleanCssJs);
exports.cleanImages = series(cleanImages);
