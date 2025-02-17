import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { encodeDelimitedArray, decodeDelimitedArray } from 'use-query-params';
/**
 * A function to get the proper Solr base URL for the current environment.
 * Returns an object with both an assets and a terms property that contains the base url to that index
 * for the given environment. Uses environment variables set by .env files for each environment
 * @returns {{assets: string, terms: string}}
 */
export function getSolrUrls() {
    return {
        assets: process.env.REACT_APP_SOLR_KMASSETS + '/select',
        terms: process.env.REACT_APP_SOLR_KMTERMS + '/select',
    };
}

function unPackRelatedData(res, kmapid, type, start, rows) {
    // console.log('unpacking asset_counts: ', res.data.facets);
    if (res == null) {
        return {};
    }

    const buckets = res.facets.asset_counts.buckets;

    let asset_counts = {
        all: { count: 0, docs: res.response.docs },
    };
    buckets.forEach((x) => {
        // Picture duplicated image in solr buckets
        if (x.val !== 'picture') {
            asset_counts[x.val] = { count: x.count, docs: [] };
            asset_counts['all'].count += x.count;
        }
    });

    //console.log("unpacking assets: ", res.data.response.docs);
    const docs = res.response.docs;

    docs.forEach((x) => {
        const y = cleanAssetData(x);
        asset_counts[x.asset_type].docs.push(y);
    });

    //Add a hasMore boolean which checks if there is more data to fetch
    const page = Math.ceil(start / rows) + 1; // Start is row/item number divide by rows/items per page to get page
    const current_last_row = page * rows; // Muliply page by rows/items per page to get current_last_row;
    const hasMore = asset_counts[type]?.count > current_last_row ? true : false;

    return {
        uid: kmapid,
        start: start,
        rows: rows,
        type: type,
        stateKey: [kmapid, type, start, rows].join('/'),
        hasMore,
        assets: asset_counts,
    };
}

export const useUnPackedMemoized = (res, kmapid, type, start, rows) => {
    return useMemo(
        () => unPackRelatedData(res, kmapid, type, start, rows),
        [res, kmapid, type, start, rows]
    );
};

function cleanAssetData(data) {
    // TODO: refactor this grunginess

    const asset_type = data.asset_type;

    // Set the image path to account for standalone apps
    const img_path =
        process.env.REACT_APP_STANDALONE === 'standalone'
            ? '/wp-content/uploads/gradient.jpg'
            : process.env.PUBLIC_URL + '/img/gradient.jpg';

    //console.log("cleanAssetData ", asset_type);

    switch (asset_type) {
        case 'texts':
        case 'sources':
        case 'subjects':
        case 'places':
        case 'terms':
        case 'collections':
            data.url_large = img_path;
            data.url_thumb = img_path;
            data.url_thumb_height = 100.0;
            data.url_thumb_width = 150.0;
            break;
        case 'images':
            data.url_large = deriveImageUrl(data.url_thumb, 1200);
            break;
        default:
            break;
    }

    //console.log("clean thumb = ", data.url_thumb);
    //console.log("returning clean: ", data);
    return data;
}

function deriveImageUrl(url_thumb, size) {
    //console.log("deriveImageUrl: ", url_thumb);
    const url_large = url_thumb
        .toString()
        .replace('200,200', size + ',' + size);
    //console.log("deriveImageUrl: large = ", url_large);
    return url_large;
}

/**
A custom hook that builds on useLocation to parse the query string. */
export function useQuery() {
    return new URLSearchParams(useLocation().search);
}

/**
 * Custom Param to use with use-query-params which encodes and decodes
 * an array of objects.
 */
export const ArrayOfObjectsParam = {
    encode: (array) => {
        if (array == null) {
            return array;
        }

        return encodeDelimitedArray(
            array.map((el) => {
                return `id.${el.id}__lb.${el.label}__op.${el.operator}`;
            }),
            ','
        );
    },
    decode: (input) => {
        const arrayStr = decodeDelimitedArray(input, ',') ?? [];
        return arrayStr.map((el) => {
            return el.split('__').reduce((accum, curr) => {
                const [firstTwoChars, currentValue] = curr.split('.');
                switch (firstTwoChars) {
                    case 'id':
                        let idStrArray = currentValue.split(':');
                        accum['id'] = currentValue;
                        accum['field'] = idStrArray[0];
                        accum['match'] = idStrArray[1];
                        break;
                    case 'lb':
                        accum['label'] = currentValue;
                        break;
                    case 'op':
                        accum['operator'] = currentValue;
                        break;
                    default:
                        break;
                }
                return accum;
            }, {});
        });
    },
};

/**
 * Capitalize function since one is not provided by JS.
 */
export const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export const mergeFilters = (arr1, arr2) => {
    console.log({ arr1, arr2 });
    const temp = [];
    const duplicateIds = [];
    arr1.forEach((x) => {
        arr2.forEach((y) => {
            if (x.id === y.id) {
                temp.push({ ...x, ...y });
                duplicateIds.push(x.id);
            }
        });
    });
    const filteredArray = [...arr1, ...arr2].filter((item) => {
        if (duplicateIds.includes(item.id)) {
            return false;
        }
        return true;
    });
    const newArray = [...filteredArray, ...temp];
    console.log({ newArray });
    return newArray;
};
