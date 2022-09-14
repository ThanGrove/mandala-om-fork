import { useInfiniteQuery } from 'react-query';
import axios from 'axios';
import _ from 'lodash';
import jsonpAdapter from '../logic/axios-jsonp';
import { getSolrUrls, capitalize } from './utils';
import { getProject } from '../views/common/utils';
import { GetSessionID } from '../main/MandalaSession';

const solr_urls = getSolrUrls();

export function useInfiniteSearch(
    searchText = '',
    start = 0,
    rows = 0,
    facetType = 'all',
    facetLimit = 0,
    facetBuckets = false,
    filters = [],
    sortField,
    sortDirection,
    facetSearch = '',
    enabled = true
) {
    return useInfiniteQuery(
        [
            'search',
            {
                start,
                rows,
                facetType,
                facetLimit,
                facetBuckets,
                filters,
                sortField,
                sortDirection,
                facetSearch,
                searchText,
            },
        ],
        getSearchData,
        {
            enabled,
            getNextPageParam: (lastPage) => {
                // Get last Offset.
                const lastOffset = JSON.parse(
                    lastPage.responseHeader.params['json.facet']
                )[facetType].offset;

                // Get number of buckets for this facetType
                const numBuckets = lastPage.facets[facetType].numBuckets;

                // Set next offset
                let nextOffset = lastOffset + 100;
                if (nextOffset >= numBuckets) {
                    nextOffset = false;
                }

                return nextOffset;
            },
        }
    );
}

async function getSearchData({ queryKey, pageParam = 0 }) {
    const [
        // eslint-disable-next-line no-unused-vars
        _key,
        {
            start,
            rows,
            facetType,
            facetLimit,
            facetBuckets,
            filters,
            sortField,
            sortDirection,
            searchText,
            facetSearch,
        },
    ] = queryKey;

    let params = {
        fl: '*',
        wt: 'json',
        echoParams: 'explicit',
        indent: 'true',
        start: start,
        rows: rows,
        'json.facet': JSON.stringify(
            getJsonFacet(
                facetType,
                pageParam,
                facetLimit,
                facetBuckets,
                sortField,
                sortDirection,
                facetSearch
            )
        ),
    };

    const sid = GetSessionID();
    if (sid) {
        params.sid = sid;
    }

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

function getJsonFacet(
    facetType,
    offset,
    limit,
    buckets,
    sortField,
    sortDirection,
    facetSearch
) {
    return {
        ...((facetType === 'all' || facetType === 'asset_count') && {
            asset_count: {
                type: 'terms',
                field: 'asset_type',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                domain: { excludeTags: 'asset_type' },
                numBuckets: buckets,
                ...(facetSearch && {
                    domain: {
                        filter: `(asset_type:*${facetSearch}*)`,
                    },
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'related_subjects') && {
            related_subjects: {
                type: 'terms',
                field: 'kmapid_subjects_idfacet',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'related_places') && {
            related_places: {
                type: 'terms',
                field: 'kmapid_places_idfacet',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'related_terms') && {
            related_terms: {
                type: 'terms',
                field: 'kmapid_terms_idfacet',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'feature_types') && {
            feature_types: {
                type: 'terms',
                field: 'feature_types_idfacet',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'languages') && {
            languages: {
                type: 'terms',
                field: 'node_lang',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'collections') && {
            collections: {
                type: 'terms',
                field: 'collection_idfacet',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'node_user') && {
            node_user: {
                type: 'terms',
                field: 'node_user_full_s',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'creator') && {
            creator: {
                type: 'terms',
                field: 'creator',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'perspective') && {
            perspective: {
                type: 'terms',
                field: 'perspectives_ss',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
            },
        }),
        ...((facetType === 'all' || facetType === 'associated_subjects') && {
            associated_subjects: {
                type: 'terms',
                field: 'associated_subject_map_idfacet',
                limit,
                offset,
                sort: `${sortField} ${sortDirection}`,
                numBuckets: buckets,
                ...(facetSearch && {
                    prefix: capitalize(facetSearch),
                }),
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
                ? `(title:${xact}^100 title:${slashy}^100 title:${starts}^80 names_txt:${xact}^90 names_txt:${starts}^70)`
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
        const fqs = [
            'asset_type:(audio-video images texts visuals sources subjects places terms)',
            // 'asset_type:(audio-video images texts visuals sources subjects places collections) OR (asset_type:terms AND related_uid_ss:subjects-9315)',
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
