import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import jsonpAdapter from '../logic/axios-jsonp';
import { getSolrUrls } from './utils';
import { getProject } from '../views/common/utils';
import { GetSessionID } from '../main/MandalaSession';

const solrurls = getSolrUrls();

/**
 * A async function to perform a solr query provided a query object. The query object needs to have the following properties:
 *      index: (assets|terms),
 *      params: name-value pairs for params for the query
 * For an example, see the useAsset hook
 *
 * @param _
 * @param query
 * @returns {Promise<any>}
 */
const getSolrData = async (query, filtered) => {
    if (!(query.index in solrurls) || !query.params) {
        console.warn(
            'The query object sent to useSolr() did not have proper index or params values: ',
            query
        );
        return false;
    }

    let myparams = query.params;
    if (!('wt' in myparams)) {
        myparams['wt'] = 'json';
    }

    // Filter by project if filtered boolean is true
    const project = getProject();
    if (query.index === 'assets' && filtered && project) {
        let q = myparams['q'];
        if (!q.includes('projects_ss:')) {
            q += ` AND projects_ss:${project}`;
        }
        myparams['q'] = q;
    }

    // Add Session param if exists
    const sess = GetSessionID();
    if (sess) {
        myparams['sid'] = sess;
        console.log(myparams);
    }
    // Make request
    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: solrurls[query.index],
        params: myparams,
    };
    const { data } = await axios.request(request);
    let retdata = data && data.response ? data.response : data;
    if (data?.facet_counts?.facet_fields) {
        retdata['facets'] = processFacets(data.facet_counts.facet_fields);
    }
    return retdata;
};

/**
 * Parses facets from an array of key/value alternating (SOLR format) to JS Object with key/value pairs.
 * @param facetdata
 * @returns {{}}
 */
function processFacets(facetdata) {
    const fkeys = Object.keys(facetdata); // List of facets in data
    const parsed_facets = {}; // Return object of parsed facets
    fkeys.map((fky, i) => {
        const fvals = facetdata[fky];
        const newfvals = {};
        for (let n = 0; n < fvals.length; n += 2) {
            newfvals[fvals[n]] = fvals[n + 1];
        }
        parsed_facets[fky] = newfvals;
    });
    return parsed_facets;
}

/**
 * UseSolr : a generalized form of useKmap to make customized queries to the solr index.
 * Should be passed an unique query key and a query object with parameter names and values, plus an
 * "index" property, set to "assets" or "terms" as defined in utils.js/getSolrUrls()
 * TODO: Possibly make more robust by allowing a filter callback to be sent in call
 *
 * @param qkey : {any} a unique array of values, object, or string identifying this query for caching
 * @param queryobj {Object} : with two properties — "index": (assets|terms) and "params": name-value pairs for params for the query
 * @param byPass {boolean} : (optional) whether to byPass or not (set to true if it depends on another query, i.e. send that query's isLoading value)
 * @returns {any}
 */
export function useSolr(qkey, queryobj, byPass = false, filtered = false) {
    // console.log("useSolr: qkey = ", qkey, " queryobj = ", queryobj);
    // split qkey by '-' and pass array as key
    if (typeof qkey === 'string') {
        qkey = qkey.split('-');
    }
    return useQuery(qkey, () => getSolrData(queryobj, filtered), {
        enabled: !byPass,
    });
}
