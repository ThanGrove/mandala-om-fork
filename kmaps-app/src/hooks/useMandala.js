import { useQuery } from 'react-query';
import jsonpAdapter from '../logic/axios-jsonp';
import axios from 'axios';
import { GetSessionID } from '../main/MandalaSession';

const QUERY_KEY = 'mndlapi';

/**
 * Function to do an Axios request for a JSON API using jsonp.
 *
 * @param _
 * @param query
 * @returns {Promise<boolean|*>}
 */
const getMandalaAPI = async (query) => {
    // console.log('query is:', query);
    if (query === '') {
        return false;
    }
    if (query.substring(0, 2) == '//') {
        query = 'https:' + query;
    }
    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'callback',
        url: query,
    };
    const { data } = await axios.request(request);
    const retdata = data && data.response ? data.response : data;
    return retdata;
};

/**
 * UseMandala is a hook to call Mandala node data apis in JSON.
 * It takes a solr object returned by the useAsset() hook which queries SOLR for a single asset's record.
 * It uses the useQuery enabled setting to wait for useAsset to return the JSON object from the SOLR qurey.
 * It takes the url_json field from that solr record and uses that to call the API.
 * In AV, the API call ends with `.json`. So it replaces this with `.jsonp?callback=mdldata`.
 * And with that and the useQuery() hook calls the getMandalaAPI() function above.
 * The axios jsonp request assumes the callback parameter name in the url is `callback`.
 *
 * Than Grove, Aug. 26, 2020
 *
 * @param solrobj
 * @returns {unknown}
 */
const useMandala = (solrobj) => {
    // Get Solr Doc Object or first one from list
    let solrdoc = null;
    if (solrobj?.url_json) {
        solrdoc = solrobj;
    } else if (solrobj?.docs?.length > 0) {
        solrdoc = solrobj.docs[0];
    }
    let json_url = solrdoc?.url_json;
    /*
    if (json_url?.includes('mandala') && !json_url?.startsWith('https')) {
        json_url = json_url.replace('http', 'https');
    }*/
    json_url = json_url?.replace(/https?:/, '');
    const asset_type = solrdoc?.asset_type;

    // Special app adjustments
    if (asset_type === 'audio-video' && json_url) {
        json_url += 'p'; // av mandala has a .jsonp api endpoint for jsonp
    }
    // Get UID for Query Key
    const uid = solrdoc?.uid ? solrdoc.uid : 'unknown';
    return useQuery([QUERY_KEY, uid], () => getMandalaAPI(json_url), {
        enabled: !!solrdoc?.id,
    });
};

export default useMandala;
