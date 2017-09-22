var gulp = require('gulp');
var concat = require('gulp-concat');
var refresh = require('gulp-livereload');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var embedlr = require('gulp-embedlr');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var browserSync = require('browser-sync').create();
//var del = require('del');

var dev = (process.env.NODE_ENV || 'development').trim() == 'development';

gulp.task('default', ['build']);

var ps = ['js', 'html', 'css', 'fonts'];
var ts = ['html', 'serve', 'fonts'];
if (argv.single) ts = ps;

gulp.task('build', ts);

gulp.task('js', function() {
    //return gulp.src(['src/js/login.js'])
    //    .pipe(webpackStream(require('./webpack.config.js'), webpack))
        //.pipe(gulp.dest('build/js'))
        //.pipe(gulpif(!argv.single, browserSync.stream()/*refresh()*/))
});
gulp.task('js-watch',/* ['js'],*/ function (done) {
    webpack(require('./webpack.config.js'), function(err, stats) {
        browserSync.reload();
        done();
    });
    //browserSync.reload();
    //done();
});
gulp.task('css1', function() {
    gulp.src(['src/css/style.*css'])
        .pipe(sass(argv.single ? {
            outputStyle: 'compressed'
        } : {}).on('error', sass.logError))
        //.pipe(concat('login.css'))
        //.pipe(cleanCSS())
        .pipe(gulp.dest('build/css'))
        .pipe(gulpif(!argv.single, browserSync.stream()/*refresh()*/));
});

gulp.task('html', function() {
    return gulp.src("src/*.html")
        /*.pipe(gulpif(dev, embedlr({
            port: 35729,
            src: "' +'http://' + (location.hostname || 'localhost') + ':" + 35729 + "/livereload.js?snipver=1"
        })))*/
        .pipe(gulp.dest('build/'))
        //.pipe(gulpif(!argv.single, refresh()))
});
gulp.task('html-watch', ['html'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('fonts', function() {
    gulp.src("src/fonts/**").pipe(gulp.dest('build/fonts'));
    gulp.src("src/img/**").pipe(gulp.dest('build/img'));
});
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    });
    gulp.watch('src/js/**', ['js-watch']);
    gulp.watch('src/css/**', ['css1']);
    gulp.watch('src/*.html', ['html-watch']);
})
/*gulp.task('watch', function() {
    refresh.listen();
});*/