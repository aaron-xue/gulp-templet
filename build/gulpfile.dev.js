var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer'); // 处理css中浏览器兼容的前缀  
var sass = require('gulp-sass'); //sass
var jshint = require('gulp-jshint'); //js检查 ==> npm install --save-dev jshint gulp-jshint（.jshintrc：https://my.oschina.net/wjj328938669/blog/637433?p=1）
var imagemin = require('gulp-imagemin'); //图片压缩 
var browserSync = require('browser-sync').create();
var proxyMiddleware = require('http-proxy-middleware');//接口代理中间件
var runSequence = require('run-sequence');//同步执行任务
var fileinclude = require('gulp-file-include')
var reload = browserSync.reload;
var Config = require('./gulpfile.config.js');
//======= gulp dev 开发环境下 ===============
function dev() {
    /** 
     * HTML处理 
     */
    gulp.task('html:dev', function () {
        return gulp.src(Config.html.src)
            .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
            .pipe(gulp.dest(Config.html.dist))
            .pipe(reload({
                stream: true
            }));
    });
    /** 
     * assets文件夹下的所有文件处理 
     */
    gulp.task('assets:dev', function () {
        return gulp.src(Config.assets.src).pipe(gulp.dest(Config.assets.dist)).pipe(reload({
            stream: true
        }));
    });
    /** 
     * CSS样式处理 
     */
    gulp.task('css:dev', function () {
        return gulp.src(Config.css.src).pipe(gulp.dest(Config.css.dist)).pipe(reload({
            stream: true
        }));
    });
    /** 
     * SASS样式处理 
     */
    gulp.task('sass:dev', function () {
        return gulp.src(Config.sass.src).pipe(sass()).pipe(autoprefixer('last 2 version')).pipe(gulp.dest(Config.sass.dist))
            .pipe(gulp.dest('rev/css')).pipe(reload({
                stream: true
            }));
    });
    /** 
     * js处理 
     */
    gulp.task('js:dev', function () {
        return gulp.src(Config.js.src).pipe(jshint('.jshintrc')).pipe(jshint.reporter('default')).pipe(gulp.dest(Config.js.dist))
            .pipe(gulp.dest('rev/js')).pipe(reload({
                stream: true
            }));
    });
    /** 
     * 图片处理 
     */
    gulp.task('images:dev', function () {
        return gulp.src(Config.img.src).pipe(imagemin({
            optimizationLevel: 3
            , progressive: true
            , interlaced: true
        })).pipe(gulp.dest(Config.img.dist))
            .pipe(gulp.dest('rev/images')).pipe(reload({
                stream: true
            }));
    });
    /**
     * 字体处理
     */
    gulp.task('font:dev', function () {
        return gulp.src(Config.font.src).pipe(gulp.dest(Config.font.dist)).pipe(reload({
            stream: true
        }));
    });
    var middleware = proxyMiddleware('/api', {
        target: 'https://stage.shenzhoubb.com',
        changeOrigin: true,
        // pathRewrite: {
        // '^/api': ''
        // },
        logLevel: 'debug'
    });
    gulp.task('watch', function () {
        browserSync.init({
            host:'10.129.214.65',
            port:'8088',
            server: {
                baseDir: Config.dist
            }
            , notify: false,
            middleware: middleware
        });
        // Watch .html files  
        gulp.watch(Config.html.src, ['html:dev']);
        // Watch .css files  
        gulp.watch(Config.css.src, ['css:dev']);
        // Watch .scss files  
        gulp.watch(Config.sass.src, ['sass:dev']);
        // Watch assets files  
        gulp.watch(Config.assets.src, ['assets:dev']);
        // Watch .js files  
        gulp.watch(Config.js.src, ['js:dev']);
        // Watch image files  
        gulp.watch(Config.img.src, ['images:dev']);
    });
    gulp.task('dev', function (cb) {
        return runSequence(['images:dev', 'css:dev', 'sass:dev', 'js:dev', 'assets:dev', 'font:dev'], ['html:dev'], 'watch', cb)
    });
}
//======= gulp dev 开发环境下 ===============
module.exports = dev;