import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useSolr } from '../hooks/useSolr';
import MandalaSkeleton from './common/MandalaSkeleton';
import { FeatureCollection } from './common/FeatureCollection';

export function ResourcesHome(props) {
    const { view_mode } = useParams();
    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(50);

    const q = {
        index: 'assets',
        params: {
            q: 'asset_type:*',
            rows: pageSize,
            start: startRow,
            sort: 'title_latin_sort ASC',
        },
    };

    const {
        isLoading: isResourcesLoading,
        data: resourcesData,
        isError: isResroucesError,
        error: resourcesError,
    } = useSolr('resources-all', q);

    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    if (isResourcesLoading) {
        return <MandalaSkeleton />;
    }

    const numFound = resourcesData?.numFound;
    const hasMore = numFound && (pageNum + 1) * pageSize < numFound;

    const pager = {
        numFound: numFound,
        getMaxPage: () => {
            return Math.floor(pager.numFound / pager.getPageSize());
        },
        getPage: () => {
            return pageNum;
        },
        setPage: (pg) => {
            pg = parseInt(pg);
            if (!isNaN(pg) && pg > -1 && pg <= pager.getMaxPage()) {
                setPageNum(pg);
                pager.pgnum = pg;
            }
        },
        setPageSize: (size) => {
            size = parseInt(size);
            if (!isNaN(size) && size > 0 && size < 101) {
                setPageSize(size);
                pager.pgsize = size;
            }
        },
        getPageSize: () => {
            return pageSize;
        },
        nextPage: () => {
            pager.setPage(pager.getPage() + 1);
        },
        prevPage: () => {
            pager.setPage(pager.getPage() - 1);
        },
        lastPage: () => {
            pager.setPage(pager.getMaxPage());
        },
        firstPage: () => {
            pager.setPage(0);
        },
    };

    return (
        <div className="places-home">
            <h1>All Resources</h1>
            <p>This page now shows all resources in this project.</p>

            <FeatureCollection
                docs={resourcesData?.docs}
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

export default ResourcesHome;
