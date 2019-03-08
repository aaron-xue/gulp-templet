var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer'); // 处理css中浏览器兼容的前缀  
var cssnano = require('gulp-cssnano'); // css的层级压缩合并
var sass = require('gulp-sass'); //sass
var jshint = require('gulp-jshint'); //js检查 ==> npm install --save-dev jshint gulp-jshint（.jshintrc：https://my.oschina.net/wjj328938669/blog/637433?p=1）  
var uglify = require('gulp-uglify'); //js压缩  
var concat = require('gulp-concat'); //合并文件  
var imagemin = require('gulp-imagemin'); //图片压缩 
var htmlmin = require('gulp-htmlmin');//html压缩
var runSequence = require('run-sequence');//同步执行任务
var modifyCssUrls = require('gulp-modify-css-urls');
var Config = require('./gulpfile.config.js');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var preprocess = require("gulp-preprocess");//多域名环境配置
var minimist = require('minimist') // 命令行解析工具
var fileinclude = require('gulp-file-include')

//======= gulp build 打包资源 ===============
var minimistOptions = {
    default: {
        host: 'test'
    }
}
var options = minimist(process.argv.slice(2), minimistOptions)
var perprocessSet = function () {
    return preprocess({
        context: {
            HOST_ENV: options.host          //prod,test
        }
    })
}

function prod() {
    /** 
     * HTML处理 
     */
    gulp.task('html', function () {
        return gulp.src(['rev/**/*.json', Config.html.src])
            .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
            .pipe(perprocessSet())
            .pipe(revCollector())
            .pipe(htmlmin({ collapseWhitespace: true }))      //处理html文档多余的空白区域
            .pipe(gulp.dest(Config.html.dist));

    });
    gulp.task('revCollectorCss', function () {
        gulp.src(['rev/**/*.json', './dist/css/**/*.css'])
            .pipe(revCollector())
            .pipe(gulp.dest(Config.sass.dist));
    });
    /** 
     * assets文件夹下的所有文件处理 
     */
    gulp.task('assets', function () {
        return gulp.src(Config.assets.src).pipe(gulp.dest(Config.assets.dist));
    });
    /** 
     * CSS样式处理 
     */
    gulp.task('css', function () {
        return gulp.src(Config.css.src).pipe(autoprefixer('last 2 version')).pipe(cssnano()) //执行压缩  
            .pipe(gulp.dest(Config.css.dist));
    });
    /** 
     * SASS样式处理 
     */
    gulp.task('sass', function () {
        return gulp.src(Config.sass.src).pipe(autoprefixer('last 2 version')).pipe(sass())//rename压缩后的文件名  
            .pipe(modifyCssUrls({
                modify: function (url, filePath) {
                    if (url.indexOf('fonts') != -1 || url.indexOf('images') != -1) {
                        return url.substring(3)
                    } else {
                        return url
                    }
                }
            }))
            .pipe(cssnano()) //执行压缩  
            .pipe(rev())
            .pipe(gulp.dest(Config.sass.dist)).pipe(rev.manifest())
            .pipe(gulp.dest('rev/css'));
    });
    /** 
     * js处理 
     */
    gulp.task('js', function () {
        return gulp.src(Config.js.src).pipe(perprocessSet()).pipe(jshint('.jshintrc')).pipe(jshint.reporter('default'))
            .pipe(uglify()).pipe(rev()).pipe(gulp.dest(Config.js.dist)).pipe(rev.manifest())
            .pipe(gulp.dest('rev/js'));
    });
    /** 
     * 合并所有js文件并做压缩处理 
     */
    gulp.task('js-concat', function () {
        return gulp.src(Config.js.src).pipe(jshint('.jshintrc')).pipe(jshint.reporter('default')).pipe(concat(Config.js.build_name)).pipe(gulp.dest(Config.js.dist)).pipe(uglify()).on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        }).pipe(gulp.dest(Config.js.dist));
    });
    /** 
     * 图片处理 
     */
    gulp.task('images', function () {
        return gulp.src(Config.img.src).pipe(imagemin({
            optimizationLevel: 3
            , progressive: true
            , interlaced: true
        })).pipe(rev()).pipe(gulp.dest(Config.img.dist)).pipe(rev.manifest())
            .pipe(gulp.dest('rev/images'));
    });
    /**
     * 字体处理
     */
    gulp.task('font:dev', function () {
        return gulp.src(Config.font.src).pipe(gulp.dest(Config.font.dist)).pipe(reload({
            stream: true
        }));
    });

    gulp.task('build', function (cb) {
        return runSequence(['css', 'sass', 'js', 'assets', 'images', 'font:dev'], ['html', 'revCollectorCss'], cb)
    });
}
module.exports = prod;