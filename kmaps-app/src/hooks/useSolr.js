import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import jsonpAdapter from '../logic/axios-jsonp';
import { getSolrUrls } from './utils';

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
const getSolrData = async (query) => {
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

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: solrurls[query.index],
        params: myparams,
    };
    // console.log('solr request', request);
    const { data } = await axios.request(request);
    let retdata = data && data.response ? data.response : data;
    if (data.facets) {
        retdata['facets'] = data.facets;
    }
    return retdata;
};

/**
 * UseSolr : a generalized form of useKmap to make customized queries to the solr index
 *
 * @param qkey
 * @param queryobj
 * @returns {any}
 */
export function useSolr(qkey, queryobj, byPass = false) {
    // console.log("useSolr: qkey = ", qkey, " queryobj = ", queryobj);
    // split qkey by '-' and pass array as key
    return useQuery(qkey.split('-'), () => getSolrData(queryobj), {
        enabled: !byPass,
    });
}
