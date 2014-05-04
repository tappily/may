module.exports.register = function (Handlebars)  {
  'use strict';

  Handlebars.registerHelper('html-supports', function (context, options)  {
    var html = '';

    if(context.ie) {
      for(var i = 0, c, j=context.ie.length; i<j; i++) {
        c = context.ie[i];
        html += '<!--[if IE '+ c + ' ]>'+ options.fn(this).replace('>', ' ' + 'class="ie-'+ c +'">') + '<![endif]-->\n';
      }
      html += '<!--[if (gt IE '+ c +')|!(IE)]><!-->' + options.fn(this) + '<!--<![endif]-->';
    }

    return new Handlebars.SafeString(html);
  });
};
