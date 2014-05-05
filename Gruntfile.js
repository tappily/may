module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt, {
    pattern: ['assemble', 'grunt-*'],
    scope: ['devDependencies']
  });

  grunt.initConfig({
    webfont: grunt.file.readYAML('src/data/webfont.yml'),
    pkg: grunt.file.readJSON('package.json'),
    assemble: {
      options: {
        assets: '<%= connect.site.options.base %>/assets',
        data: ['package.json', 'src/data/*.{yml,json}'],
        helpers: 'src/templates/helpers/helper-*.js',
        layoutdir: 'src/templates/layouts',
        partials: [
          'src/templates/partials/*.hbs',
          'src/templates/layouts/*.hbs'],
        layout: 'default.hbs',
        flatten: true
      },
      indices: {
        options: {
          data: ['src/data/index/*.{yml,json}'],
          layout: 'index.hbs'
        },
        src: ['src/templates/site/*.hbs'],
        dest: '<%= connect.site.options.base %>/'
      },
      products: {
        options: {
          data: ['src/data/products/*.{yml,json}'],
          layout: 'product.hbs'
        },
        src: ['src/templates/site/products/*.hbs'],
        dest: '<%= connect.site.options.base %>/products/'
      },
      inputs: {
        options: {
          data: ['src/data/input/*.{yml,json}'],
          layout: 'input.hbs'
        },
        src: ['src/templates/site/inputs/*.hbs'],
        dest: '<%= connect.site.options.base %>/inputs/'
      },
      articles: {
        options: {
          data: ['src/data/article/*.{yml,json}'],
          layout: 'article.hbs'
        },
        src: ['src/templates/site/articles/*.hbs'],
        dest: '<%= connect.site.options.base %>/articles/'
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
        src: '<%= assemble.options.assets %>/css/*.css'
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
        files: [
          {
            expand: true,
            cwd: 'src/assets',
            src: ['**/*'],
            dest: '<%= connect.site.options.base %>/assets/',
            filter: 'isFile'
          }
        ]
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
      configurations: ['Gruntfile.js', 'bower.json', 'package.json'],
      sources: ['src/**/*.js']
    },
    less: {
      site: {
        options: {
          sourceMap: true,
          outputSourceFiles: true,
          modifyVars: {
            font: '<%= webfont.typekit.faces.0.family %>'
          }
        },
        files: [
          {
            expand: true,
            cwd: 'src/less/site',
            src: ['**/!(_)*.less'],
            dest: '<%= assemble.options.assets %>/css/',
            ext: '.css'
          }
        ]
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
        tasks: ['newer:jshint', 'assemble']
      },
      less: {
        files: 'src/**/*.less',
        tasks: ['less:site', 'newer:autoprefixer:site', 'newer:csslint:site']
      },
      template: {
        files: 'src/templates/**/*.{js,hbs}',
        tasks: ['assemble']
      }
    }
  });

  grunt.registerTask('default', [ 'test' ]);
  grunt.registerTask('test', ['clean', 'jshint', 'less', 'autoprefixer', 'csslint']);
  grunt.registerTask('build', ['clean', 'jshint', 'less', 'autoprefixer:dist', 'csslint:dist']);
  grunt.registerTask('site', ['clean', 'jshint', 'less:site', 'autoprefixer:site', 'csslint:site', 'assemble', 'copy:assets']);
  grunt.registerTask('deploy', ['site', 'gh-pages']);
  grunt.registerTask('live', ['site', 'connect:site', 'watch']);
};