module.exports = function(grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt, {
    pattern: ['assemble', 'grunt-*'],
    scope: ['devDependencies']
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    assemble: {
      options: {
        assets: '<%= connect.site.options.base %>/assets',
        data: ['package.json', 'src/data/*.{yml,json}'],
        helpers: 'src/templates/helpers/helper-*.js',
        layoutdir: 'src/templates/layouts',
        partials: 'src/templates/partials/*.hbs',
        layout: 'default.hbs',
        flatten: true
      },
      site: {
        src: ['src/templates/site/*.hbs'],
        dest: '<%= connect.site.options.base %>/'
      }
    },
    autoprefixer: {
      dist: {
        expand: true,
        flatten: true,
        src: 'tmp/css/*.css',
        dest: 'dist/css/'
      },
      site: {
        expand: true,
        flatten: true,
        src: 'tmp/css/*.css',
        dest: '<%= assemble.options.assets %>/css/'
      }
    },
    clean: {
      temp: ['tmp'],
      dist: ['dist']
    },
    connect: {
      options: {
        hostname: grunt.option('connect-hostname') || 'localhost',
        port: 9000
      },
      site: {
        options: {
          base: 'tmp/assemble/<%= pkg.name %>',
          livereload: true,
          open: true
        }
      }
    },
    copy: {
      assets: {
        files: [{
          expand: true,
          cwd: 'src/assets',
          src: ['**/*'],
          dest: '<%= connect.site.options.base %>/assets/',
          filter: 'isFile'
        }]
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc',
        formatters: [
          { id: 'junit-xml', dest: 'tmp/report/csslint_junit.xml'},
          { id: 'csslint-xml', dest: 'tmp/report/csslint.xml'}
        ]
      },
      site: {
        src: ['<%= autoprefixer.site.dest %>*.css']
      },
      dist: {
        src: ['<%= autoprefixer.dist.dest %>*.css']
      }
    },
    'gh-pages': {
      options: {
        base: '<%= connect.site.options.base %>'
      },
      src: '**/*'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      configurations: ['Gruntfile.js','bower.json','package.json'],
      sources: ['src/js/**/*.js']
    },
    less: {
      files: {
        expand: true,
        cwd: 'src/less',
        src: ['*.less'],
        dest: 'tmp/css/',
        ext: '.css'
      }
    },
    newer: {},
    release: {},
    watch: {
      options: {
        livereload: true
      },
      asset: {
        files: ['src/assets/**/*'],
        tasks: ['newer:copy:assets']
      },
      js: {
        files: ['src/js/**/*.js', './*.js'],
        tasks: ['newer:jshint']
      },
      json: {
        files: ['src/data/**/*'],
        tasks: ['newer:jshint', 'assemble:site']
      },
      less: {
        files: 'src/**/*.less',
        tasks: ['less', 'newer:autoprefixer:site', 'newer:csslint:site']
      },
      template: {
        files: 'src/templates/**/*.{js,hbs}',
        tasks: ['assemble:site']
      }
    }
  });

  grunt.registerTask('default', [ 'test' ]);
  grunt.registerTask('test', ['clean', 'jshint', 'less', 'autoprefixer', 'csslint']);
  grunt.registerTask('build', ['clean', 'jshint', 'less', 'autoprefixer:dist', 'csslint:dist']);
  grunt.registerTask('site', ['clean', 'jshint', 'less', 'autoprefixer:site', 'csslint:site', 'assemble:site', 'copy:assets']);
  grunt.registerTask('deploy', ['site', 'gh-pages']);
  grunt.registerTask('live', ['site', 'connect:site', 'watch']);
};