define(function(require, exports, module) {

    var Ratchet = require("ratchet/ratchet");
    var Actions = require("ratchet/actions");
    var OneTeam = require("oneteam");
    var $ = require("jquery");

    return Ratchet.Actions.register("delete-albums", Ratchet.AbstractAction.extend({

        defaultConfiguration: function()
        {
            var config = this.base();

            config.title = "Remove Albums(s)";
            config.iconClass = "glyphicon glyphicon-trash";

            return config;
        },

        execute: function(config, actionContext, callback)
        {
            this.doAction(actionContext, function(err, result) {
                callback(err, result);
            });
        },

        doAction: function(actionContext, callback)
        {
            var self = this;

            var body = "";
            body += "<p>Please confirm that you would like to delete the following albums:</p>";
            body += "<br/>";

            body += "<ul>";
            for (var i = 0; i < actionContext.data.length; i++)
            {
                var title = actionContext.data[i].title;
                if (!title) {
                    title = actionContext.data[i]._doc;
                }
                body += "<li>" + OneTeam.filterXss(title) + "</li>";
            }
            body += "</ul>";

            Ratchet.fadeModalConfirm("Delete these Albums?", body, "Delete", "btn-danger", function(div) {

                var df = function(x)
                {
                    if (x >= actionContext.data.length)
                    {
                        return callback();
                    }

                    OneTeam.projectBranch(actionContext, function() {

                        var documentId = actionContext.data[x].id;

                        this.readNode(documentId).del().then(function() {
                            df(x+1);
                        });
                    });
                };
                df(0);
            });

        }

    }));
});
