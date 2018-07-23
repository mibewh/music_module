define(function(require, exports, module) {

    require('./music-albums-list.css');
    var html = require('./music-albums-list.html');

    var Empty = require('ratchet/dynamic/empty');
    var UI = require('ui');

    return UI.registerGadget('music-albums-list', Empty.extend({
        TEMPLATE: html,

        setup: function() {
            this.get("/projects/{projectId}/products", this.index);
        },

        prepareModel: function(el, model, callback) {
            var branch = this.observable("branch").get();

            this.base(el, model, function() {
                branch.queryNodes({'_type': 'my:album'}).then(function() {
                    model.albums = this.asArray();
                    model.albums.map(function(album) {
                        
                    });
                });
            });
        },





    }));


});
