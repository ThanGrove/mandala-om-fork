import React, { useEffect, useState } from 'react';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { FeatureCollection } from '../common/FeatureCollection';
import { getProject } from '../common/utils';
import { SAProjectName } from '../common/utilcomponents';
import { useParams } from 'react-router';
import { Dropdown } from 'react-bootstrap';
import { Redirect, useHistory } from 'react-router-dom';

export function CollectionsHome(props) {
    const { asset_type, view_mode } = useParams(); // retrieve parameters from route. (See ContentMain.js)
    const history = useHistory();
    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    const filters = [
        'all types',
        'audio-video',
        'images',
        'sources',
        'texts',
        'visuals',
    ];

    let collFilter = filters?.indexOf(asset_type) || 0;

    let querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:collections`,
            sort: 'title_sort_s asc',
            start: startRow,
            rows: pageSize,
        },
    };
    if (collFilter && collFilter > 0) {
        querySpecs['params']['fq'] = `asset_subtype:${filters[collFilter]}`;
    }
    console.log('qs', querySpecs);
    const {
        isLoading: isCollsLoading,
        data: collsData,
        isError: isCollsError,
        error: collsError,
    } = useSolr(
        ['all-collections', collFilter, pageSize, startRow],
        querySpecs,
        false,
        true
    );

    const numFound = collsData?.numFound ? collsData?.numFound : 0;
    const hasMore =
        collsData?.numFound && (pageNum + 1) * pageSize < collsData.numFound;
    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize, collFilter]);

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

    const myfunct = (ev) => {
        const val = ev.target.options[ev.target.options.selectedIndex].value;
        let newpath = `/collections/all/${view_mode}`;
        if (val > 0) {
            newpath = `/${filters[val]}` + newpath;
        }
        history.push(newpath);
    };

    return (
        <div>
            <h1>All Collections</h1>
            <p>
                This page now shows all the asset collections and subcollections
                for the {mscope} project.
            </p>
            <p>
                <label className="font-weight-bold pr-3">
                    Show collections of:{' '}
                </label>
                <select onChange={myfunct}>
                    {filters.map((f, fi) => {
                        const selval = fi == collFilter ? true : false;
                        return (
                            <option
                                key={`collview-${fi}`}
                                value={fi}
                                selected={selval}
                            >
                                {f}
                            </option>
                        );
                    })}
                </select>
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
