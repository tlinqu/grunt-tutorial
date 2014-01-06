/*global module:false*/
'use strict';
// The "wrapper" function
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
    var jsFiles = [
        {
            expand: true,
            cwd: 'app/js/',
            dest: '.tmp/js/',
            src: '**/*.js',
            ext: '.min.js'
        }
    ];

    // Project and task configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        meta: {
            name: "bla"
        },
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
            },
            prod: { files: jsFiles }
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
                    port: 9001
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
        },
        open: {
            server: {
                path: 'http://localhost:9000'
            },
            test: {
                path: 'http://localhost:9001/test'
            }
        },
        clean: {
            all: [
                '.tmp',
                '.grunt',
                'test/index.html',
                'build',
                '*.tar.gz'
            ]
        },
        copy: {
            release: {
                files: [
                    {
                        expand: true,
                        cwd: 'app',
                        dest: 'build',
                        src: ['*.html', 'js/**/*', 'images/**/*']
                    },
                    {
                        expand: true,
                        cwd: '.tmp',
                        dest: 'build',
                        src: ['styles/*']
                    }
                ]
            }
        },
        compress: {
            release: {
                options: {
                    archive: '<%= pkg.name %>-<%= pkg.version %>.tar.gz'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'build',
                        src: ['**/*']
                    }
                ]
            }
        },
        less: {
            dev: {
                options: { paths: ['assets/css'] },
                files: { '.tmp/styles/result.css': 'app/less/sample.less' }
            },
            prod: {
                options: {
                    paths: ['assets/css'],
                    cleancss: true
                },
                files: { '.tmp/styles/result.css': 'app/less/sample.less' }
            }
        },
        csslint: {
            options: { csslintrc: '.csslintrc' },
            strict: {
                options: { import: 2 },
                src: ['.tmp/styles/**/*.css']
            },
            lax: {
                options: { import: false },
                src: ['.tmp/styles/**/*.css']
            }
        },
        'git-describe': { me: {} }
    });

    // Alias Tasks
    grunt.registerTask('server', 'Run a server', [
        'jshint',
        'sass:dev',
        'csslint:strict',
        'connect:server',
        'open:server',
        'watch'
    ]);
    grunt.registerTask('test', 'Run tests in the console', [
        'jshint',
        'jasmine'
    ]);
    grunt.registerTask('test:browser', 'Run tests in a browser', [
        'jshint',
        'jasmine:shell:build',
        'connect:test',
        'open:test',
        'watch'
    ]);
    grunt.registerTask('release', 'Generates a release tarball', [
        'sass:prod',
        'csslint:strict',
        'test',
        'uglify:prod',
        'save-version',
        'copy:release',
        'compress:release'
    ]);
    // Default task.
    grunt.registerTask('default', ['jshint', 'nodeunit', 'concat', 'uglify']);
    // "Basic" Tasks
    grunt.registerTask('version', 'Shows version number', function () {
        var pkg = grunt.file.readJSON('package.json');
        console.log(pkg.name, pkg.version);
    });
    grunt.registerTask('foo', 'My "foo" task.', function () {
        // Log the property value. Returns null if the property is undefined.
        grunt.log.writeln('The meta.name property is: ' + grunt.config('meta.name'));
        // Also logs the property value. Returns null if the property is undefined.
        grunt.log.writeln('The meta.name property is: ' + grunt.config(['meta', 'name']));
    });
    // Custom Tasks
    grunt.registerTask('save-version', function () {
        grunt.event.once('git-describe', function (rev) {
            //grunt.log.writeln("Git Revision: " + rev);
            grunt.file.write('.tmp/version.json', JSON.stringify({
                version: grunt.config('pkg.version'),
                revision: rev[3],
                date: grunt.template.today()
            }));
        });
        grunt.task.run('git-describe');
    });

    [ // load plugins which provide necessary tasks.
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-jshint',
        'grunt-contrib-watch',
        'grunt-contrib-sass',
        'grunt-contrib-connect',
        'grunt-contrib-jasmine',
        'grunt-open',
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-contrib-compress',
        'grunt-contrib-less',
        'grunt-contrib-csslint',
        'grunt-git-describe'
    ].forEach(grunt.loadNpmTasks);
};
