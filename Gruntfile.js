module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['src/**/*.js', 'test/**/*.js'],
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
          sinon: false,
        },
        browser: true,
        devel: true,
      },
    },
    karma: {
      unit: {
        options: {
          frameworks: ['jasmine'],
          files: ['src/**/*.js', 'test/**/*_spec.js'],
          preprocessors: {
            'test/**/*.js': ['jshint'],
            'src/**/*.js': ['jshint'],
          },
          browsers: ['PhantomJS'],
          browserify: {
            debug: true,
            bundleDelay: 2000, // Fixes "reload" error messages, YMMV!
          },
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('test', ['jshint', 'karma']);
  grunt.registerTask('check', ['jshint']);
};
