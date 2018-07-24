define(function(require, exports, module) {

    require("./music-albums-doclist.css");

    var Ratchet = require("ratchet/web");
    var DocList = require("ratchet/dynamic/doclist");
    var OneTeam = require("oneteam");

    return Ratchet.GadgetRegistry.register("music-albums-doclist", DocList.extend({

        /**
         * @override
         */
        configureDefault: function()
        {
            // call this first
            this.base();

            // now add in our custom configuration
            this.config({
                "observables": {
                    "query": "albums_query",
                    "sort": "albums_sort",
                    "sortDirection": "albums_sortDirection",
                    "searchTerm": "albums_searchTerm",
                    "selectedItems": "albums_selectedItems"
                }
            });
        },

        entityTypes: function()
        {
            return {
                "plural": "albums",
                "singular": "album"
            }
        },

        setup: function()
        {
            this.base();

            this.get("/projects/{projectId}/albumslist", this.index);
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            if (!pagination.sort)
            {
                pagination.sort = {
                    "title": 1
                };
            }

            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, ["title"]);
            }

            query._type = "my:album";

            OneTeam.projectBranch(self, function() {
                this.queryNodes(query, pagination).then(function() {
                    callback(this);
                });
            });
        },

        linkUri: function(row)
        {
            var self = this;

            var project = self.observable("project").get();

            return OneTeam.linkUri(this, row);

            // return "/#/projects/" + project._doc + "/tags/" + row.tag;
        },

        iconUri: function(row)
        {
            return OneTeam.iconUriForNode(row);
        },

        columnValue: function(row, item, model, el)
        {
            var self = this;

            var project = self.observable("project").get();

            var value = this.base(row, item);

            if (item.key == "titleDescription")
            {
                // var primarySummary = OneTeam.buildPrimaryNodeSummary(row, false, project);
                var expandedSummary = OneTeam.buildNodeSummary(row, false, project);

                // var expanded = self.isTogglerActive(row._doc);

                var title = row.title;

                value = OneTeam.listTitleDescription(el, row, self.linkUri(row), title, false, expandedSummary);
            }

            return value;
        }

    }));

});
