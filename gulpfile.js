var gulp = require('gulp');
const webp = require('gulp-webp');

/// Generate the service worker with sw-precache
gulp.task('generate-service-worker', function(callback) {
    var swPrecache = require('sw-precache');
    var rootDir = '.';
  
    swPrecache.write(`${rootDir}/sw.js`, {
      staticFileGlobs: ['css/**/*',
                        'img/**/*',
                        'js/**/*',
                        'index.html',
                        'restaurant.html',
                        'sw.js',
                        'data/**/*'
                        ],
      stripPrefix: rootDir
    }, callback);
  });

//   swPrecache.write(`${rootDir}/sw.js`, {
//     staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff,json}'],
//     stripPrefix: rootDir
//   }, callback);
// });

gulp.task('towebp', () =>
    gulp.src('img/images/*')
        .pipe(webp())
        .pipe(gulp.dest('img/webp/'))
);