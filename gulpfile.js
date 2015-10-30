var gulp = require('gulp');
var del = require('del');
var $ = require('gulp-load-plugins')();

gulp.task('clean', function(cb) {
  del('build/**/*.*', cb);
});

gulp.task('build', function() {
  return gulp.src(['lib/**/*.js'])
    .pipe($.jscs())
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['babel-preset-es2015']
    }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['clean', 'build']);
