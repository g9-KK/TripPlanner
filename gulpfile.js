var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var tsb = require('gulp-tsb');


// run nodemon on server file changes
gulp.task('nodemon', function(cb) {
    var started = false;

    return nodemon({
        script: 'src/www.js',
        watch: ['src/*.js']
    }).on('start', function() {
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function onRestart() {
        setTimeout(function reload() {
            browserSync.reload({
                stream: false
            });
        }, 500); // browserSync reload delay
    });
});


gulp.task('build:server', function() {
    return gulp.src(['src/**/*.ts'])
        .pipe(tsb.create('tsconfig.json')())
        .pipe(gulp.dest('src'));
});

gulp.task('build:test', ['build:server'], function() {
    return gulp.src(['spec/**/*.ts'])
        .pipe(tsb.create('tsconfig.json')())
        .pipe(gulp.dest('spec'));
});

// watch for any TypeScript or LESS file changes
// if a file change is detected, run the TypeScript or LESS compile gulp tasks
gulp.task('build:server:watch', ['build:server'], function() {
    gulp.watch('src/**/*.ts', ['build']);
});

gulp.task('build', ['build:server']);
gulp.task('default', ['build:server']);