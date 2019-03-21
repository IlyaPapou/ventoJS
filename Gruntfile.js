module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            all: [
                'src/**/*.js',
                'test/**/*.js'
            ],
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
                    launch_in_dev: ['phantomjs', 'chrome'],
                    launch_in_ci: ['phantomjs', 'chrome'],
                    before_tests: 'grunt jshint',
                    serve_files: [
                        'node_modules/jquery/dist/jquery.min.js',
                        'node_modules/lodash/index.js',
                        'node_modules/sinon/pkg/sinon.js',
                        'src/**/*.js',
                        'test/**/*.js'
                    ],
                    watch_files: [
                        'src/**/*.js',
                        'test/**/*.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-testem');
    grunt.registerTask('default', ['testem:run:unit']);
};