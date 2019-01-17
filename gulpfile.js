var gulp = require('gulp');

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
                        ],
      stripPrefix: rootDir
    }, callback);
  });

//   swPrecache.write(`${rootDir}/sw.js`, {
//     staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff,json}'],
//     stripPrefix: rootDir
//   }, callback);
// });