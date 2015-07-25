module.exports = function (grunt) 
{
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        sourceMap: true
      },
      build: {
        src: './dist/vr-warp.js',
        dest: './dist/vr-warp.min.js'
      }
    },

    browserify: {
      build: {
        src: './src/warp.js',
        dest: './dist/vr-warp.js'
      }
    },

    jshint: {
      options: {
        browserify: true,
        camelcase: true,
        curly: false,
        ignores: [],
        immed: true,
        indent: 2,
        newcap: true,
        quotmark: 'single',
        maxlen: 80,
        globals: {
          console: true,
          document: true
        },
        // "Expected an assignment or function call and instead saw an 
        // expression."
        '-W030': true
      },
      all: [
        './Gruntfile.js',
        './test/**/*.js',
        './src/**/*.js'
      ],
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'browserify', 'uglify']);
};