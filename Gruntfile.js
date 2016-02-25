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
                    cwd: 'css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'css',
                    ext: '.min.css'
                }]
            }
        },
        uglify: {
            target: {
                options: {
                    report: 'gzip'
                },
                files: [{
                    expand: true,
                    cwd: 'js',
                    src: [
                        'links-common.js',
                        'lroundups.js',
                        '!*.min.js'
                    ],
                    dest: 'js',
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

    // Default task(s).
    grunt.registerTask('default', ['watch']);
}