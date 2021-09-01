import React, { useEffect, useState } from 'react';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { FeatureCollection } from '../common/FeatureCollection';
import { getProject } from '../common/utils';
import { SAProjectName } from '../common/utilcomponents';
import { useParams } from 'react-router';

export function CollectionsHome(props) {
    const { view_mode } = useParams(); // retrieve parameters from route. (See ContentMain.js)
    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    const querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:collections`,
            sort: 'title_sort_s asc',
            start: startRow,
            rows: pageSize,
        },
    };
    const {
        isLoading: isCollsLoading,
        data: collsData,
        isError: isCollsError,
        error: collsError,
    } = useSolr(
        `all-collections-${pageSize}-${startRow}`,
        querySpecs,
        false,
        true
    );

    const numFound = collsData?.numFound ? collsData?.numFound : 0;
    const hasMore =
        collsData?.numFound && (pageNum + 1) * pageSize < collsData.numFound;
    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    let mscope = 'complete Mandala';
    const current_project = getProject();
    if (current_project) {
        mscope = <SAProjectName pid={current_project} />;
    }

    if (isCollsLoading) {
        return <MandalaSkeleton />;
    }

    if (isCollsError) {
        console.log('Error loading all collections: ', collsError);
        collsData.docs = [];
        collsData.numFound = 0;
    }

    return (
        <div>
            <h1>All Collections</h1>
            <p>
                This page now shows all the asset collections and subcollections
                for the {mscope} project:
            </p>
            <FeatureCollection
                docs={collsData.docs}
                assetCount={numFound}
                viewMode={view_mode}
                page={pageNum}
                setPage={setPageNum}
                perPage={pageSize}
                setPerPage={setPageSize}
                isPreviousData={false}
                hasMore={hasMore}
            />
        </div>
    );
}

export default CollectionsHome;
