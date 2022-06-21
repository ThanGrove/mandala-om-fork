import React, { useEffect, useState } from 'react';
import useStatus from '../hooks/useStatus';
import { useSolr } from '../hooks/useSolr';
import { FeaturePager } from './common/FeaturePager/FeaturePager';
import { FeatureCollection } from './common/FeatureCollection';
import MandalaSkeleton from './common/MandalaSkeleton';
import { useParams } from 'react-router';
import './Kmaps/kmaps_shared.scss';
import { getProject } from './common/utils';

export function SubjectsHome(props) {
    const { view_mode } = useParams();
    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(50);

    const proj = getProject() || '*';
    const q = {
        index: 'assets',
        params: {
            q: 'asset_type:subjects',
            fq: `projects_ss:${proj}`,
            rows: pageSize,
            start: startRow,
            sort: 'title_latin_sort ASC',
        },
    };

    const {
        isLoading: isSubjLoading,
        data: subjdata,
        isError: isSubjError,
        error: subjError,
    } = useSolr(['all-subjects', 'latin-sort', pageSize, startRow, pageNum], q);

    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    if (isSubjLoading) {
        return <MandalaSkeleton />;
    }

    const numFound = subjdata?.numFound;
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
        <div className="subjects-home">
            <h1>Subjects</h1>
            <FeatureCollection
                docs={subjdata?.docs}
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

export default SubjectsHome;
