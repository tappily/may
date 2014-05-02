module.exports.register = function (Handlebars)  {
    Handlebars.registerHelper('plusify', function (str)  {
        return  str.split(' ').join('+');
    });
};