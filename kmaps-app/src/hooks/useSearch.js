import { useQuery } from 'react-query';
import axios from 'axios';
import slugify from 'slugify';
import _ from 'lodash';
import jsonpAdapter from '../logic/axios-jsonp';
import { getSolrUrls } from './utils';
import { getProject } from '../views/common/utils';

const solr_urls = getSolrUrls();

export function useSearch(
    searchText = '',
    start = 0,
    rows = 0,
    facetType = 'all',
    facetOffset = 0,
    facetLimit = 0,
    facetBuckets = false,
    filters = [],
    enabled = true
) {
    return useQuery(
        [
            'search',
            start,
            rows,
            facetType,
            facetOffset,
            facetLimit,
            facetBuckets,
            filters,
            slugify(searchText),
        ],
        () =>
            getSearchData(
                searchText,
                start,
                rows,
                facetType,
                facetOffset,
                facetLimit,
                facetBuckets,
                filters
            ),
        { keepPreviousData: true, enabled }
    );
}

async function getSearchData(
    searchText,
    start,
    rows,
    facetType,
    facetOffset,
    facetLimit,
    facetBuckets,
    filters
) {
    let params = {
        fl: '*',
        wt: 'json',
        echoParams: 'explicit',
        indent: 'true',
        start: start,
        rows: rows,
        'json.facet': JSON.stringify(
            getJsonFacet(facetType, facetOffset, facetLimit, facetBuckets)
        ),
    };

    const queryParams = constructTextQuery(searchText);
    const filterParams = constructFilters(filters);

    params = { ...params, ...queryParams, ...filterParams };

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: solr_urls.assets,
        params: params,
    };

    const { data } = await axios.request(request);

    return data;
}

function getJsonFacet(facetType, offset, limit, buckets) {
    return {
        ...((facetType === 'all' || facetType === 'asset_count') && {
            asset_count: {
                type: 'terms',
                field: 'asset_type',
                limit,
                offset,
                //sort: ff['asset_type']?.sort || 'count desc',
                domain: { excludeTags: 'asset_type' },
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'related_subjects') && {
            related_subjects: {
                type: 'terms',
                field: 'kmapid_subjects_idfacet',
                limit,
                offset,
                //sort: ff['subjects']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'related_places') && {
            related_places: {
                type: 'terms',
                field: 'kmapid_places_idfacet',
                limit,
                offset,
                //sort: ff['places']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'related_terms') && {
            related_terms: {
                type: 'terms',
                field: 'kmapid_terms_idfacet',
                limit,
                offset,
                //sort: ff['terms']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'feature_types') && {
            feature_types: {
                type: 'terms',
                field: 'feature_types_idfacet',
                limit,
                offset,
                //sort: ff['feature_types']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'languages') && {
            languages: {
                type: 'terms',
                field: 'node_lang',
                limit,
                offset,
                //sort: ff['languages']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'collections') && {
            collections: {
                type: 'terms',
                field: 'collection_idfacet',
                limit,
                offset,
                //sort: ff['collections']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'node_user') && {
            node_user: {
                type: 'terms',
                field: 'node_user_full_s',
                limit,
                offset,
                //sort: ff['user']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'creator') && {
            creator: {
                type: 'terms',
                field: 'creator',
                limit,
                offset,
                //sort: ff['creator']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'perspective') && {
            perspective: {
                type: 'terms',
                field: 'perspectives_ss',
                limit,
                offset,
                //sort: ff['perspective']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
        ...((facetType === 'all' || facetType === 'associated_subjects') && {
            associated_subjects: {
                type: 'terms',
                field: 'associated_subject_map_idfacet',
                limit,
                offset,
                //sort: ff['associated_subjects']?.sort || 'count desc',
                numBuckets: buckets,
            },
        }),
    };
}

// TODO: Refactor: parameterize basic_req to select which fields to search.
function constructTextQuery(searchString) {
    let searchstring = escapeSearchString(searchString || '');

    // console.log (JSON.stringify(state));
    let starts = searchstring.length ? searchstring + '*' : '*';
    let search = searchstring.length ? '*' + searchstring + '*' : '*';
    let slashy = searchstring + '/';
    if (!searchString || searchstring.length === 0) {
        searchstring = search = slashy = '*';
    }
    let xact = searchstring;

    const basic_req = {
        // search: tweak for scoping later
        q:
            searchstring !== '*'
                ? `text:${xact} OR (title:${xact}^100 title:${slashy}^100 title:${starts}^80 names_txt:${xact}^90 names_txt:${starts}^70)`
                : `*:*`,
        xact,
        starts,
        search,
        slashy,
    };

    return basic_req;
}

function constructFilters(filters) {
    // If no filters are passed then we return the all the assets.
    if (_.isEmpty(filters)) {
        // filter out grouping terms (letters, 9311, and phrases, 9314, 9667 - English letters) for terms trees,
        // const xrelated = ['subjects-9311', 'subjects-9314', 'subjects-9667']; Old way was filtering out "bad" subjects
        // '-related_uid_ss:(' + xrelated.join(' OR ') + ')',
        const fqs = [
            'asset_type:(audio-video images texts visuals sources subjects places terms)', // filter out old unused asset types
            'related_uid_ss:subjects-9315', // filter for "expressions"
        ];
        // Added by Than for project filtering
        const projid = getProject();
        if (projid) {
            fqs.push(`projects_ss:${projid}`);
        }
        return {
            fq: fqs,
        };
    }

    // console.log('constructFilters: received filters: ', filters);
    const hashedFilters = arrayToHash(filters, 'field');
    // console.log('constructFilters: sorted filters = ', hashedFilters);

    const facets = Object.keys(hashedFilters);
    // console.log('constructFilters: keys = ', facets);

    let fq_list = [];

    function constructFQs(facetData, fieldName) {
        let fq_list = [];
        let not_list = [];
        let and_list = [];
        let or_list = [];

        facetData.forEach((f) => {
            if (f.operator === 'NOT') {
                not_list.push(
                    '(*:* AND -' + fieldName + ':("' + f.match + '"))'
                );
            } else if (f.operator === 'AND') {
                and_list.push(
                    '(*:* AND ' + fieldName + ':("' + f.match + '"))'
                );
            } else {
                /* OR default case */
                or_list.push('(*:* OR ' + fieldName + ':("' + f.match + '"))');
            }
        });

        const or_clause =
            '{!tag=' +
            fieldName +
            '}' +
            fieldName +
            ':' +
            '(' +
            or_list.join(' ') +
            ')';

        // TODO: does the order matter?
        if (or_list.length) fq_list.push(or_clause);
        if (and_list.length) fq_list.push(...and_list);
        if (not_list.length) fq_list.push(...not_list);

        // console.log('constructFQs returning: ', fq_list);
        return fq_list;
    }

    // TODO: Refactor so that facets can be added via configuration.
    facets.forEach((facet) => {
        const facetData = hashedFilters[facet];
        let fqs = [];
        // console.log('constructFilters:\tfacet ' + facet + ' = ', facetData);
        switch (facet) {
            case 'asset_type':
                fqs = constructFQs(facetData, 'asset_type');
                fq_list.push(...fqs);
                break;
            case 'subjects':
                fqs = constructFQs(facetData, 'kmapid');
                fq_list.push(...fqs);
                break;
            case 'places':
                fqs = constructFQs(facetData, 'kmapid');
                fq_list.push(...fqs);
                break;
            case 'terms':
                fqs = constructFQs(facetData, 'kmapid');
                fq_list.push(...fqs);
                break;
            case 'languages':
                fqs = constructFQs(facetData, 'language');
                fq_list.push(...fqs);
                break;
            case 'feature_types':
                fqs = constructFQs(facetData, 'kmapid');
                fq_list.push(...fqs);
                break;
            case 'users':
                fqs = constructFQs(facetData, 'node_user_full_s');
                fq_list.push(...fqs);
                break;
            case 'creator':
                fqs = constructFQs(facetData, 'creator');
                fq_list.push(...fqs);
                break;
            case 'collections':
                fqs = constructFQs(facetData, 'collection_uid_s');
                fq_list.push(...fqs);
                break;
            case 'perspective':
                fqs = constructFQs(facetData, 'perspectives_ss');
                fq_list.push(...fqs);
                break;
            case 'associated_subjects':
                fqs = constructFQs(facetData, 'associated_subject_map_idfacet');
                fq_list.push(...fqs);
                break;
            default:
                console.error('UNHANDLED FACET TYPE: ' + facet);
                break;
        }
    });

    // Added by Than for project filtering
    const projid = getProject();
    if (projid) {
        fq_list.push(`projects_ss:${projid}`);
    }

    // console.log('RETURNING FQ_LIST = ', fq_list);
    return { fq: fq_list };
}

function arrayToHash(array, keyField) {
    // console.log('received: ', array);
    if (!array) {
        array = [];
    }
    return array.reduce((collector, item) => {
        const key = item[keyField] || 'unknown key';
        if (!collector[key]) {
            collector[key] = [];
        }
        collector[key].push(item);
        return collector;
    }, {});
}

function escapeSearchString(str) {
    str = str.replace(/ /g, '\\ '); // escape spaces
    str = str.replace('(', '\\(');
    str = str.replace(')', '\\)');
    str = str.replace(':', '\\:');
    str = str.replace('+', '\\+');
    str = str.replace('-', '\\-');
    str = str.replace('"', '\\"');
    str = str.replace('?', '\\?');
    return str;
}
