module.exports = function(grunt) {
    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    // Find what the current directory is
    var path = process.cwd();

    var CSS_LESS_FILES = {
        'assets/css/style.css': 'less/style.less',
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        less: {
            development: {
                options: {
                    paths: ['less'],
                    sourceMap: false,
                    outputSourceFiles: true,
                    sourceMapBasepath: path,
                },
                files: CSS_LESS_FILES
            },
        },

        cssmin: {
            target: {
                options: {
                    report: 'gzip'
                },
                files: [{
                    expand: true,
                    cwd: 'assets/css',
                    src: ['assets/css/*.css', '!assets/css/*.min.css'],
                    dest: 'assets/css',
                    ext: '.min.css'
                }]
            }
        },

        concat_css: {
          all: {
            src: [
              "assets/vendor/chosen/chosen.css",
              "assets/css/style.min.css"
            ],
            dest: "assets/css/styles-combined.min.css"
          }
        },

        concat: {
          options: {
            separator: ';',
          },
          home: {
            src: [
              'assets/vendor/gsap/src/minified/TweenMax.min.js',
              'assets/vendor/scrollmagic/scrollmagic/minified/ScrollMagic.min.js',
              'assets/vendor/scrollmagic/scrollmagic/minified/plugins/debug.addIndicators.min.js',
              'assets/vendor/scrollmagic/scrollmagic/minified/plugins/animation.gsap.min.js',
              'assets/js/home.min.js'
            ],
            dest: 'assets/js/homepage-libs.min.js',
          },
          data: {
            src: [
              'assets/data/cases.min.js',
              'assets/data/officers.min.js'
            ],
            dest: 'assets/data/combined.min.js',
          },
          libs: {
            src: [
              'assets/vendor/jquery/dist/jquery.min.js',
              'assets/vendor/underscore/underscore.js',
              'assets/vendor/backbone/backbone.js',
            ],
            dest: 'assets/js/libraries.min.js'
          },
          search: {
            src: [
              'assets/vendor/chosen/chosen.jquery.js',
              'assets/vendor/typeahead.js/dist/typeahead.bundle.min.js',
              'assets/vendor/jquery-serialize-object/dist/jquery.serialize-object.min.js',
              'assets/js/search.min.js'
            ],
            dest: 'assets/js/search-libs.min.js'
          }
        },

        uglify: {
            target: {
                options: {
                    report: 'gzip'
                },
                files: [{
                    expand: true,
                    cwd: '.',
                    src: [
                        'assets/js/home.js',
                        'assets/data/cases.js',
                        'assets/data/officers.js',
                        'assets/js/search.js',
                        '!*.min.js'
                    ],
                    dest: '.',
                    ext: '.min.js'
                }]
            }
        },

        watch: {
            less: {
                files: [
                    'less/**/*.less',
                ],
                tasks: [
                    'less:development',
                    'uglify',
                    'cssmin'
                ]
            },
        }
    });

    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

    grunt.registerTask('build', 'Build all asset files', [
      'less',
      'cssmin',
      'concat_css',
      'uglify',
      'concat'
    ]);

    // Default task(s).
    grunt.registerTask('default', ['watch']);
}
