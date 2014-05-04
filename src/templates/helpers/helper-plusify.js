module.exports.register = function (Handlebars)  {
  'use strict';

  Handlebars.registerHelper('plusify', function (str)  {
      return  str.split(' ').join('+');
  });
};