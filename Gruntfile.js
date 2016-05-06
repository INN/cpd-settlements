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
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['assets/css/*.css', '!assets/css/*.min.css'],
                    dest: '.',
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
        },

        shell: {
          execOptions: {
            maxBuffer: 200*1024*1024
          },
          render_components: {
            command: [
              './render_json.py',
              './render_includes.py',
            ].join('&&'),
            options: {
              stdout: true
            }
          },
          prep_officer_data: {
            command: [
              'python -c',
              '"from lib.prep_officer_data import prep_officer_data; prep_officer_data()"'
            ].join(' '),
            options: {
              stdout: true
            }
          },
          get_data: {
            command: './get_data.py',
            options: {
              stdout: true
            }
          },
          check_boundary_service: {
            command: [
              'python -c',
              '"from lib.check_boundary_service import check_boundary_service; check_boundary_service()"'
            ].join(' '),
            options: {
              stdout: true
            }
          }
        }
    });

    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

    grunt.registerTask('build', 'Build all asset files', [
      'shell:render_components',
      'less',
      'cssmin',
      'concat_css',
      'uglify',
      'concat'
    ]);

    grunt.registerTask('render_components',
      'Render includes and json to files', [
      'shell:render_components'
    ]);

    grunt.registerTask('prep_officer_data',
      'Prep officer data and render a new data/officers.json file', [
      'shell:prep_officer_data'
    ]);

    grunt.registerTask('get_data',
      'Pull data from Google and run the entire prep process including prep_officer_data and render_components.', [
      'shell:check_boundary_service',
      'shell:prep_officer_data'
    ]);

    // Default task(s).
    grunt.registerTask('default', ['watch']);
}
