var gulp = require('gulp'),
    less = require('gulp-less');
// var replace = require('gulp-replace');

gulp.task('youdao', function () {
    //编译src目录下的所有less文件
    //除了reset.less和test.less（**匹配src/less的0个或多个子文件夹）
    gulp.src(['dev/*.less'])
        .pipe(less())
        // .pipe(replace(/([^"]*\.png)/g, 'chrome-extension://__MSG_@@extension_id__/$1'))
        .pipe(gulp.dest('src/'));
});

gulp.task('watch', function () {
    gulp.watch('dev/*.less', ['youdao']);
});