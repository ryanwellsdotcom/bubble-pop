var gulp = require('gulp'),
  del = require('del'),
  plugins = require('gulp-load-plugins')(), // load required plugins that are listed within the package.json dependencies
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload,

  // configure folder structure for your project
  modulesDir = 'node_modules/', // NPM plugins/modules parent directory
  assetsDir = 'src/', // parent asset development directory
  assetsStylesDir = assetsDir + 'scss/', // Sass development directory
  assetsScriptsDir = assetsDir + 'js/', // JavaScript development directory
  distDir = 'dist/', // parent output directory
  distStylesDir = distDir + 'css/', // minified CSS output directory
  distScriptsDir = distDir + 'js/', // minified JavaScript output directory

  // include scss files to concatinate in desired order
  vendorCssFiles = [
    modulesDir + '/reset-css/sass/_reset.scss'
  ],
  customCssFiles = [
    assetsStylesDir + 'main.scss' // this will include partials
  ],

  // include javascript files to concatinate in desired order
  vendorScriptsFiles = [],
  customScriptsFiles = assetsScriptsDir + 'app.js';

// ---------------------------------------------------------------------------------------------------

gulp.task('vendor-styles', ['clean:styles'], function () {
  'use strict';
  return gulp.src(vendorCssFiles)
    .pipe(plugins.concat('vendor.css'))
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(distStylesDir));
});

gulp.task('custom-styles', ['vendor-styles'], function () {
  'use strict';
  return gulp.src(customCssFiles)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      outputStyle: 'compressed'
    }).on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer({
      browsers: ['> 0%']
    }))
    .pipe(plugins.concat('main.css'))
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(distStylesDir));
});

gulp.task('vendor-scripts', ['clean:scripts'], function () {
  return gulp.src(vendorScriptsFiles)
    .pipe(plugins.concat('vendor.js'))
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(distScriptsDir));
});

gulp.task('custom-scripts', ['vendor-scripts'], function () {
  return gulp.src(customScriptsFiles)
    //.pipe(plugins.sourcemaps.init())
    .pipe(plugins.stripDebug())
    .pipe(plugins.babel({
      presets: [
        'es2015'
      ]
    }))
    .pipe(plugins.concat('main.js'))
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    //.pipe(plugins.ignore.exclude(["**/*.map"]))
    .pipe(plugins.uglify())
    //.pipe(plugins.sourcemaps.write('.')) 
    .pipe(gulp.dest(distScriptsDir))
    .pipe(reload({
      stream: true
    }))
    .pipe(plugins.notify({
      message: 'JavaScript complete',
      onLast: true
    }));
});

gulp.task('clean:styles', function () {
  return del(distStylesDir + '*');
});
gulp.task('clean:scripts', function () {
  return del(distScriptsDir + '*');
});

gulp.task('watch', function () {
  gulp.watch(assetsStylesDir + '**/*.scss', ['vendor-styles', 'custom-styles']);
  gulp.watch(assetsScriptsDir + '**/*.js', ['vendor-scripts', 'custom-scripts']);

  browserSync.init({
    server: {
      baseDir: './'
    },
    open: true,
    online: true,
    ui: false,
    notify: false,
    watchOptions: {
      ignoreInitial: true,
      ignored: modulesDir
    }
  });

  gulp.watch(['**/*.{html,php,inc,info,css}']).on('change', reload);
});