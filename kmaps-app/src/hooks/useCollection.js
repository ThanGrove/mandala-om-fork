import { useSolr } from './useSolr';
const QUERY_BASE = 'kmassets';

/**
 * Hook to get metadata about a collection. Does not return items in the collection
 * Takes an asset type, e.g. "images" or "audio-video", and the NID for the collection
 *
 * @param asset_type
 * @param nid
 * @returns {*}
 */

const useCollection = (asset_type, nid) => {
    const querySpecs = {
        index: 'assets',
        params: {
            q: `id:${nid}`,
            fq: ['asset_type:collections', `asset_subtype:${asset_type}`],
            rows: 1,
        },
    };
    const query_key = QUERY_BASE + '-' + asset_type + '-' + nid;

    return useSolr(query_key, querySpecs);
};

export default useCollection;
