/*
Kmaps Solr Util to encaspulate solr query assembly logic

Usage:

        var util = new KmapsSolrUtil();
        var url = util.createBasicQuery(state);

    createBasicQuery(state) uses a populated "state" object and returns the appropriate url as a String.

 */
class KmapsSolrUtil {

    constructor(jq) {
        // check to make sure that jQuery is available
        if (typeof jQuery !== "function")
            $ = jQuery;

        if (typeof $ === "undefined") {
            throw("This libraries requires jQuery");
        }

        // this is the default state, state that is passed in overrides these values
        this.defaultState = {
            "solrUrl": "https://ss251856-us-east-1-aws.measuredsearch.com/solr/kmassets_dev/select",
            "mode": "input",
            "view": "Card",
            "sort": "Alpha",
            "type": "All",
            "page": 0,																			// Current page being shown
            "pageSize": 100,																	// Results per page
            "query": { 																		// Current query
                "text": "",																			// Search word
                "place": [],																			// Places
                "collection": [],																		// Collections
                "language": [],																		// Languages
                "feature": [],																			// Feature types
                "subject": [],																			// Subjects
                "term": [],																			// Terms
                "relationship": [],																	// Relationships
                "user": [],																			// Users
                "asset": [],																			// Assets
                "dateStart": "",
                "dateEnd": ""															// Beginning and ending dates
            }
        };

        // facet configs.  Not all are being used.
        this.facetJSON = {
            "asset_counts": {
                "limit": 100,
                "type": "terms",
                "field": "asset_type",
                "domain": {"excludeTags": "ast"}
            },
            "places": {
                "limit": 300,
                "type": "terms",
                "field": "kmapid",
                "prefix": "places"
            },
            "subjects": {
                "limit": 300,
                "type": "terms",
                "field": "kmapid",
                "prefix": "subjects"
            },
            "collection_title": {
                "limit": 300,
                "type": "terms",
                "field": "collection_title"
            },
            "asset_subtype": {
                "limit": 300,
                "type": "terms",
                "field": "asset_subtype",
                "facet": {
                    "parent_type": {
                        "limit": 1,
                        "type": "terms",
                        "field": "asset_type"
                    }
                }
            },
            "feature_types_ss": {
                "limit": 300,
                "type": "terms",
                "field": "feature_types_ss"
            },
            "node_user": {
                "limit": 300,
                "type": "terms",
                "field": "user_name_full_s"
            },
            "node_lang": {
                "limit": 300,
                "type": "terms",
                "field": "node_lang"
            }
        };

        console.log("construtced");

    }

    createBasicQuery(state) {
        state = $.extend(true, {}, this.defaultState, state);

        // create request object

        var searchstring = state.query.text || "";
        var page = state.page || 0;
        var pageSize = state.pageSize || 100;
        console.log (JSON.stringify(state));
        var starts = searchstring + "*";
        var search = "*" + searchstring + "*";
        var slashy = searchstring + "/";
         if ($.type(searchstring) === "undefined" || searchstring.length === 0 ) {
             searchstring = search = slashy = "*";
         }

        var req =
            {
                // search: tweak for scoping later
                "q": "(" +
                    " title:${xact}^100" +
                    " title:${slashy}^100" +
                    " names_txt:${xact}^90" +
                    " title:${starts}^80" +
                    " names_txt:${starts}^70" +
                    " title:${search}^10" +
                    " caption:${search}" +
                    " summary:${search}" +
                    " names_txt:${search}" +
                    ")",

                // search strings
                "xact": searchstring,
                "starts": starts,
                "search": search,
                "slashy": slashy,

                // generic settings (maybe tweak for efficiency later)
                "fl": "*",
                "wt": "json",

                // paging
                "start": page,
                "rows": pageSize,

                // facets
                "facet": "on",
                "json.facet": JSON.stringify(this.facetJSON),

                // highlighting
                "hl": "on",
                "hl.method": "unified",
                "hl.fl": "title,caption,summary,names_txt",
                "hl.fragsize": 0,
                "hl.tag.pre": "<mark>",
                "hl.tag.post": "</mark>",

                // debug settings  -- set both to false in production?
                "echoParams": "explicit",
                "indent": "true"
            };

        var baseurl = state.solrUrl;
        var params = new URLSearchParams(req);
        var url = new URL(baseurl + "?" + params.toString());
        return url;
    }
}