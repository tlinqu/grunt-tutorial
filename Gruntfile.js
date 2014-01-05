/*global module:false*/
'use strict';
module.exports = function (grunt) {

    var sassFiles = [
        {
            expand: true,
            cwd: 'app/sass/',
            dest: '.tmp/styles/',
            src: '**/*.{sass,scss}',
            ext: '.css'
        }
    ];

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['lib/**/*.js', 'test/**/*.js']
            },
            all: {
                src: ['Gruntfile.js', 'app/js/**/*.js', '!app/js/vendor/**/*.js', 'test/**/*.js']
            }
        },
        nodeunit: {
            files: ['test/**/*_test.js']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'nodeunit']
            },
            sass: {
                files: ['app/sass/*.{sass,scss}'],
                tasks: ['sass:dev']
            }
        },
        sass: {
            options: {
                cacheLocation: '.tmp/.sass-cache'
            },
            dev: {
                options: {
                    style: 'expanded',
                    lineComments: true
                },
                files: sassFiles
            },
            prod: {
                options: {
                    style: 'compressed'
                },
                files: sassFiles
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    keepalive: true,
                    middleware: function (connect) {
                        var path = require('path');
                        return [
                            connect.static(path.resolve('app')),
                            connect.static(path.resolve('.tmp')) // main.css in .tmp folder, installed on the server http://localhost:9000/styles/main.css
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    keepalive: true
                }
            }
        },
        jasmine: {
            shell: {
                options: {
                    specs: ['test/specs/**/*_spec.js'],
                    vendor: ['app/js/vendor/**/*.js'],
                    outfile: 'test/index.html'
                },
                src: ['app/js/**/*.js', '!app/js/vendor/**/*.js']
            }
        }
    });

    [ // load plugins which provide necessary tasks.
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-nodeunit',
        'grunt-contrib-jshint',
        'grunt-contrib-watch',
        'grunt-contrib-sass',
        'grunt-contrib-connect',
        'grunt-contrib-jasmine'
    ].forEach(grunt.loadNpmTasks);

    // Default task.
    grunt.registerTask('default', ['jshint', 'nodeunit', 'concat', 'uglify']);

};
