import React, { useEffect, useState } from 'react';
import { useSolr } from '../../hooks/useSolr';
import { FeatureCollection } from './FeatureCollection';
import MandalaSkeleton from './MandalaSkeleton';
import { useHistory, useLocation, useParams } from 'react-router';
import {
    CollectionFilterField,
    CollectionSortModeSelector,
} from '../Collections/CollectionsViewer';
import $ from 'jquery';

export function AssetHomeCollection(props) {
    const { view_mode } = useParams(); // retrieve parameters from route. (See ContentMain.js)
    const asset_type = props?.asset_type;

    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(100);

    // Set up sort mode state
    const DEFAULT_SORTMODE = 'title_sort_s asc';
    const [sortMode, setSortMode] = useState(DEFAULT_SORTMODE);
    const [filterStr, setFilter] = useState('');

    let wait_to = false;
    const waitFilter = (e) => {
        const filter_val = `title:*${$(e.target).val()}*`;
        if (wait_to) {
            clearTimeout(wait_to);
        }
        wait_to = setTimeout(() => setFilter(filter_val), 500);
    };

    const sorter = (
        <>
            <CollectionSortModeSelector
                setSort={setSortMode}
                sortMode={sortMode}
                assetType={asset_type}
            />
            <CollectionFilterField onchange={waitFilter} val={filterStr} />
        </>
    );

    const query = {
        index: 'assets',
        params: {
            q: `asset_type: ${asset_type} AND -asset_subtype:page`,
            sort: sortMode,
            start: startRow,
            rows: pageSize,
        },
    };
    if (filterStr?.length > 0) {
        query['params']['fq'] = filterStr;
    }
    const querykey = [
        'asset',
        asset_type,
        'all',
        sortMode,
        pageSize,
        pageNum,
        filterStr,
    ];
    const {
        isLoading: isAssetsLoading,
        data: assets,
        isError: isAssetsError,
        error: assetsError,
    } = useSolr(querykey, query, false, true);

    const numFound = assets?.numFound ? assets?.numFound : 0;

    const hasMore =
        assets?.numFound && (pageNum + 1) * pageSize < assets.numFound;

    // Use Effect for when page num or size change
    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum]);

    useEffect(() => {
        const newPage = Math.ceil(startRow / pageSize);
        setPageNum(newPage);
    }, [pageSize]);

    // Reset pagination on change in sort order
    useEffect(() => {
        //console.log('Sort  mode changed: ', sortMode);
        setPageNum(0);
    }, [sortMode]);

    if (isAssetsError) {
        console.error(assetsError);
        return <p>An error occurred in searching for these assets!</p>;
    }
    if (isAssetsLoading) {
        return <MandalaSkeleton />;
    }

    const my_docs = assets?.docs ? assets.docs : [];

    return (
        <div>
            <FeatureCollection
                docs={my_docs}
                assetCount={numFound}
                page={pageNum}
                setPage={setPageNum}
                perPage={pageSize}
                setPerPage={setPageSize}
                viewMode={view_mode}
                inline={false}
                hasMore={hasMore}
                className={'c-collection__items'}
                sorter={sorter}
                isLoading={isAssetsLoading}
            />
        </div>
    );
}

export default AssetHomeCollection;
