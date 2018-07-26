define(function(require, exports, module) {

    require('./music-artists-list.css');
    var html = require('./music-artists-list.html');

    var Empty = require('ratchet/dynamic/empty');
    var UI = require('ui');

    return UI.registerGadget('music-artists-list', Empty.extend({
        TEMPLATE: html,

        setup: function() {
            this.get("/projects/{projectId}/artists", this.index);
        },

        prepareModel: function(el, model, callback) {
            var branch = this.observable("branch").get();
            var project = this.observable("project").get();

            this.base(el, model, function() {
                branch.queryNodes({'_type': 'my:artist'}).then(function() {
                    var artists = this.asArray();
                    artists.forEach(function(artist) {
                        artist.url = "/#/projects/" + project._doc + "/documents/" + artist._doc;
                    });
                    return artists;
                }).then(function(artists) {
                    // Query for artist's albums
                    var resSet = this;
                    artists.forEach(function(artist) {
                        resSet.subchain(artist).find({
                            'traverse': {
                                'associations': {
                                    'my:written_by': 'INCOMING'
                                },
                                'depth': 1,
                                'types': ['my:album']
                            }
                        }).then(function() {
                            artist.albums = this.asArray();
                            artist.albums.forEach(function(album) {
                                album.url = "/#/projects/" + project._doc + "/documents/" + album._doc;
                            });
                        });
                    });
                    return artists;
                }).then(function(artists) {
                    model.artists = artists;
                    console.log(artists);
                    callback();
                });
            });
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback) {
            var self = this;

        }
    }));
});
