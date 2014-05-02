module.exports.register = function (Handlebars)  {
  Handlebars.registerHelper('detect-html', function (context, options)  {
    var out = "";
    for(var i = 0, c, j=context.length; i<j; i++) {
      c = context[i];
      out = out + '<!--[if IE '+ c + ' ]>'+ options.fn(this).replace('>', ' ' + 'class="ie-'+ c +'">') + '<![endif]-->\n';
    }
    return new Handlebars.SafeString(out + '<!--[if (gt IE '+ c +')|!(IE)]><!-->' + options.fn(this) + '<!--<![endif]-->');
  });
};
