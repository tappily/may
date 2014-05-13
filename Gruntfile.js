module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt, {
    pattern: ['assemble', 'grunt-*'],
    scope: ['devDependencies']
  });

  grunt.initConfig({
    webfont: grunt.file.readYAML('src/data/webfont.yml'),
    pkg: grunt.file.readJSON('package.json'),
    'assemble-products': {
      targets: ['ai', 'ps', 'foo']
    },
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
          data: ['src/data/product/*.{yml,json}'],
          layout: 'product.hbs'
        },
        src: ['src/templates/site/products/*.hbs'],
        dest: '<%= connect.site.options.base %>/products/'
      },
      tasks: {
        options: {
          data: ['src/data/tasks/*.{yml,json}'],
          layout: 'task.hbs'
        },
        src: ['src/templates/site/tasks/*.hbs'],
        dest: '<%= connect.site.options.base %>/tasks/'
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
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['site']
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

  grunt.task.registerMultiTask('assemble-products', 'Multi assembly', function() {
    var tasks = [];

    this.data.forEach(function(l) {
      grunt.log.writeln('creating configuration for product', l);

      var taskName = 'assemble.' + l;

      grunt.config.set(taskName, {
        options: {
          data: ['src/data/*.{yml,json}',
                'src/data/product/*.{yml,json}',
                'src/data/product/'+ l + '/*.{yml,json}'],
          layout: 'product.hbs'
        },
        src: 'src/templates/site/products/*.hbs',
        dest: '<%= connect.site.options.base %>/products/' + l + '/'
      });

      tasks.push(taskName.replace('.', ':'));
    });

    grunt.task.run(tasks);
  });

  grunt.task.registerTask('default', [ 'test' ]);
  grunt.task.registerTask('test', ['clean', 'jshint', 'less', 'autoprefixer', 'csslint']);
  grunt.task.registerTask('build', ['clean', 'jshint', 'less', 'autoprefixer:dist', 'csslint:dist']);
  grunt.task.registerTask('site', ['clean', 'jshint', 'less:site', 'autoprefixer:site', 'csslint:site', 'assemble', 'copy:assets']);
  grunt.task.registerTask('deploy', ['site', 'gh-pages']);
  grunt.task.registerTask('live', ['site', 'connect:site', 'watch']);
};