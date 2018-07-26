define(function(require, exports, module) {

    var Rathet = require('ratchet/ratchet');
    var OneTeam = require('oneteam');
    var $ = require('jquery');

    return Ratchet.Actions.register('create-album', Ratchet.AbstractUIAction.extend({

        execute: function(config, actionContext, callback) {
            this.doAction(actionContext, function(err, result) {
                callback(err, result)
            });
        },

        doAction: function(actionContext, callback) {
            var self = this

            Ratchet.fadeModal({
                "title": "Create an Album",
                "cancel": true
            }, function(div, renderCallback) {
                // body
                $(div).find(".modal-body").html("");
                $(div).find(".modal-body").append("<div class='form'></div>");
                $(div).find('.modal-footer').append("<button class='btn btn-primary pull-right create'>Create</button>");

                var artistSource = function(callback) {

                    OneTeam.projectBranch(actionContext, function() {
                        this.queryNodes({'_type': 'my:artist'}).then(function() {
                            var artists = this.asArray().map(function(artist) {
                                return {"text": artist.title, "value": artist.title + "\\" + artist._doc};
                            });
                            callback(artists);
                        })
                    });
                };

                var albumSource = function(callback) {
                    var api_key = "5985a9f09b144e0fa7e187799948c397"; // Probably want to move this serverside for any real app
                    var method = "artist.gettopalbums";
                    var limit = 10;
                    var autocorrect = 1;
                    var format = "json"
                    var url = "http://ws.audioscrobbler.com/2.0/";
                    var obs = this.observable('/artist').get();
                    if (obs) {
                        var artist = obs.split("\\")[0];
                        // console.log(artist);
                        $.get(url, {method, artist, limit, api_key, autocorrect, format}).done(function(data) {
                            var albums = data.topalbums.album.map(function(album) {
                                var img = album.image[album.image.length-1]['#text']; // Get the biggest image
                                return {"value": album.name + "\\" + img, "text": album.name};
                            });
                            callback(albums);
                        }).fail(function() {
                            callback([]);
                        });
                    }
                    else {
                        callback([]);
                    }
                };

                var c = {
                    "data": {
                    },
                    "schema": {
                        "type": "object",
                        "properties": {
                            "artist": {
                                "type": "string",
                                "enum": [],
                                "required": true
                            },
                            "album": {
                                "type": "string",
                                "enum": [],
                                "required": true
                            },
                            "rating": {
                                "type": "number"
                            },
                            "body": {
                                "type": "string"
                            }
                        }
                    },
                    "options": {
                        "fields": {
                            "artist": {
                                "id": "artistField",
                                "type": "select",
                                "label": "Artist",
                                "dataSource": artistSource,
                                "emptySelectFirst": true
                            },
                            "album": {
                                "id": "albumField",
                                "type": "select",
                                "label": "Album",
                                "dataSource": albumSource
                            },
                            "rating": {
                                "type": "integer",
                                "label": "Rating"
                            },
                            "body": {
                                "type": "summernote",
                                "label": "Body"
                            }
                        },
                        "focus": "artist"
                    }
                };
                c.postRender = function(control) {
                    control.childrenByPropertyId['album'].refresh();
                    control.childrenByPropertyId['artist'].on('change', function() {
                        control.childrenByPropertyId['album'].refresh();
                    });
                    // control.childrenByPropertyId['album'].subscribe(control.childrenByPropertyId['artist'], function(val) {
                    //     this.refresh();
                    // });
                    OneTeam.bindFormChildEnterClick(control, $(div).find(".create"));
                    // create button
                    $(div).find('.create').click(function() {

                        OneTeam.processFormAction(control, div, function(object) {
                            self.addAlbum(actionContext, object, function() {
                                callback();
                            });
                        });

                    });

                    renderCallback(function() {

                        // TODO: anything?

                    });
                };

                var _form = $(div).find(".form");
                OneTeam.formCreate(_form, c);
            });

        },

        addAlbum: function(actionContext, object, callback) {
            var self = this;
            var artistId = object.artist.split("\\")[1];
            var albumName, albumUrl;
            [albumName, albumUrl] = object.album.split("\\");
            var rating = object.rating;
            var body = object.body;
            // // create project
            self.block("Creating your album...", function() {

                // list the definitions on the branch
                OneTeam.projectBranch(actionContext, function(branch) {

                    Chain(branch).readNode(artistId).then(function() {
                        album = {
                            "_type": "my:album",
                            "title": albumName,
                            "artUrl": albumUrl
                        };

                        if(rating) {
                            album.rating = rating;
                        }

                        if(body) {
                            album.body = body;
                        }

                        album.artist = {
                            "ref": this.ref()
                        };

                        this.then(function() {
                            this.subchain(branch).createNode(album).then(function() {
                                self.unblock(function() {
                                    callback();
                                });
                            });
                        });
                    });

                });
            });
        }

    }));
});
