import React, { useEffect } from 'react';
import { useSolr } from '../../hooks/useSolr';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { FeatureCollection } from '../common/FeatureCollection';
import { getProject } from '../common/utils';
import { SAProjectName } from '../common/utilcomponents';

export function CollectionsHome(props) {
    const querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:collections`,
            sort: 'title_sort_s asc',
            rows: 1000,
        },
    };
    const {
        isLoading: isCollsLoading,
        data: collsData,
        isError: isCollsError,
        error: collsError,
    } = useSolr('all-collections', querySpecs, false, true);

    let mscope = 'all of Mandala';
    const current_project = getProject();
    if (current_project) {
        mscope = <SAProjectName pid={current_project} />;
    }

    if (isCollsLoading) {
        return <MandalaSkeleton />;
    }

    if (isCollsError) {
        console.log('Error loading all collections: ', collsError);
    }

    return (
        <div>
            <h1>All Collections</h1>
            <p>
                This page shows all the asset collections and subcollections for
                the {mscope} project:
            </p>
            <FeatureCollection docs={collsData.docs} />
        </div>
    );
}

export default CollectionsHome;
