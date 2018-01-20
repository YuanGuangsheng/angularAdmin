(function (r) {
    "use strict";

    var gulp = require('gulp'),
        less = require('gulp-less'),
        concat = require('gulp-concat'),
        rename = require('gulp-rename'),
        minifycss = require('gulp-minify-css'),
        uglify = require('gulp-uglify');

    gulp.task('build-less', function(){
        gulp.src('css/less/app.less')
            .pipe(less({ compress: false }))
            .on('error', function(e){console.log(e);} )
            .pipe(gulp.dest('css/'))
            .pipe(rename({ suffix: '.min' })) // 重命名app.css为 app.min.css
            .pipe(minifycss()) // 压缩css文件
            .pipe(gulp.dest('css/')); // 输出app.min.css
    });

    gulp.task('build-directives', function () {
        gulp.src('js/directives/*.js')
            .pipe(concat('directives.js'))//合并后的文件名
            .pipe(uglify())    //压缩
            .pipe(gulp.dest('js'));  //输出
    });

    gulp.task('build-services', function () {
        gulp.src('js/services/*.js')
            .pipe(concat('services.js'))//合并后的文件名
            .pipe(uglify())    //压缩
            .pipe(gulp.dest('js'));  //输出
    });

    gulp.task('develop', function() {
        gulp.watch('css/less/*.less', ['build-less']);
        gulp.watch('js/directives/*.js', ['build-directives']);
        gulp.watch('js/services/*.js', ['build-services']);
    });

})(require);

