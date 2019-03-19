module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            all: ['ventoJScore/**/**/*.js'],
            options: {
                globals: {
                    _: false,
                    $: false,
                    jasmine: false,
                    describe: false,
                    it: false,
                    expect: false,
                    beforeEach: false,
                    afterEach: false,
                    sinon: false
                },
                browser: true,
                devel: true
            }
        },
        testem: {
            unit: {
                options: {
                    framework: 'jasmin2',
                    launch_in_dev: ['PhantomJS'],
                    before_tests: 'grunt jshint',
                    serve_files: [
                        'node_modules/sinon/pkg/sinon.js',
                        'ventoJScore/**/**/*.js'
                    ],
                    watch_files: [
                        'ventoJScore/**/**/*.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-testem');
};