define(function(require) {
    require('./gadgets/music-albums-list/music-albums-list.js');
    require('./gadgets/music-albums-doclist/music-albums-doclist.js');
    require('./gadgets/music-artists-list/music-artists-list.js');
    require('./actions/music/create-album.js')
    require('./actions/music/delete-albums.js')
    var hbs = require('handlebars');
    hbs.registerHelper('each_group', function(every, context, options) {
        var out = "", subcontext = [], i;
        if (context && context.length > 0) {
            for (i = 0; i < context.length; i++) {
                if (i > 0 && i % every === 0) {
                    out += options.fn(subcontext);
                    subcontext = [];
                }
                subcontext.push(context[i]);
            }
            out += options.fn(subcontext);
        }
        return out;
    });
});
