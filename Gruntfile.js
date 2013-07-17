'use strict';
var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
};

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                'Gruntfile.js',
                'src/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            all: {
                files: ['<%= jshint.all %>'],
                tasks: ['jshint:all'],
                options: {
                    interrupt: true
                }
            }
        },
        less: {
            dev: {
                options: {
                    yuicompress: false
                },
                files: {
                    'app.css': 'src/less/app.less'
                }
            }
        },
        connect: {
            livereload: {
                keepalive: true,
                options: {
                    port: 8000,
                    middleware: function(connect, options) {
                        return [lrSnippet, folderMount(connect, '../')];
                    }
                }
            },
            forever: {
                keepalive: true,
                options: {
                    port: 5000,
                    middleware: function(connect, options) {
                        return [lrSnippet, folderMount(connect, '.')];
                    }
                }
            }
        },
        karma: {
            options: {
                configFile: './config/karma.conf.js',
                runnerPort: 9999,
                reporters: ['dots'],
                colors: true
            },
            e2e: {
                configFile: './config/karma-e2e.conf.js',
                singleRun: true,
                autoWatch: true
            },
            e2elive: {
                configFile: './config/karma-e2e.conf.js',
            },
            unit: {
                singleRun: true
            },
            dev: {
                autoWatch: true,
                browsers: ['Chrome']
            }
        },
        regarde: {
            html: {
                files: ['./index.html', './src/templates/*.html'],
                tasks: ['livereload']
            },
            less: {
                files: ['./less/**/*.less', './src/less/*.less'],
                tasks: ['less:dev', 'livereload']
            },
            js: {
                files: ['Gruntfile.js', './src/directives/*.js'],
                tasks: ['livereload']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-livereload');

    grunt.registerTask('hint', ['watch:all']);
    grunt.registerTask('live', ['livereload-start', 'connect:livereload', 'regarde']);
};
