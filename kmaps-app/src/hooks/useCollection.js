import { useSolr } from './useSolr';
const QUERY_BASE = 'kmassets';

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

    //console.log('useCollection: querySpecs = ', querySpecs);

    return useSolr(query_key, querySpecs);
};

export default useCollection;
