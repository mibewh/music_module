define(function(require, exports, module) {

    require('./music-albums-list.css');
    var html = require('./music-albums-list.html');

    var Empty = require('ratchet/dynamic/empty');
    var UI = require('ui');

    return UI.registerGadget('music-albums-list', Empty.extend({
        TEMPLATE: html,

        setup: function() {
            this.get("/projects/{projectId}/albums", this.index);
        },

        prepareModel: function(el, model, callback) {
            var branch = this.observable("branch").get();
            var project = this.observable("project").get();

            this.base(el, model, function() {
                branch.queryNodes({'_type': 'my:album'}).then(function() {
                    model.albums = this.asArray();
                    for (var i = 0; i < model.albums.length; i++) {
                        var album = model.albums[i];
                        album.imgUrl = "/preview/repository/" + album.getRepositoryId() + "/branch/" + album.getBranchId() + "/node/" + album.getId() + "/default?size=128&name=preview128&force=true";
                        album.artistUrl = "/#/projects/" + project._doc + "/documents/" + album.artist.id;
                        album.albumUrl = "/#/projects/" + project._doc + "/documents/" + album._doc;
                    }
                    callback();
                });
            });
        }



    }));


});
