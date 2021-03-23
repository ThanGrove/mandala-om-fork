import React, { useState } from 'react';
import { useParams, useRouteMatch, Redirect } from 'react-router-dom';
import { FeatureCollection } from './FeatureCollection';
import { useKmapRelated } from '../../hooks/useKmapRelated';
import { useUnPackedMemoized } from '../../hooks/utils';
import { queryID } from '../../views/common/utils';

// Special case of the FeatureGallery
export default function RelatedsGallery({ baseType }) {
    let { id, relatedType: type, definitionID, viewMode } = useParams(); // USES PARAMS from React Router  Refactor?
    definitionID = definitionID ?? 'noDefID';
    let { path } = useRouteMatch();
    const [perPage, setPerPage] = useState(100);
    const [page, setPage] = useState(0); // Start will always be page * perPage
    const {
        isLoading: isRelatedLoading,
        data: relatedData,
        isError: isRelatedError,
        error: relatedError,
        isPreviousData,
    } = useKmapRelated(
        queryID(baseType, id),
        type,
        page,
        perPage,
        definitionID
    );
    const kmapsRelated = useUnPackedMemoized(
        relatedData,
        queryID(baseType, id),
        type,
        page,
        perPage
    );

    if (isRelatedLoading) {
        return <span>Relateds Gallery Skeleton</span>;
    }

    if (isRelatedError) {
        return <span>Relateds Gallery Error: {relatedError.message}</span>;
    }

    const allAssets = kmapsRelated?.assets;
    const assets = allAssets ? allAssets[type] : null;
    const docs = assets?.docs;
    if (!viewMode) {
        const listTypes = ['places', 'sources', 'subjects', 'texts'];
        let calcViewMode = 'deck';
        if (listTypes.includes(type)) {
            calcViewMode = 'list';
        } else if (type === 'images') {
            calcViewMode = 'gallery';
        }
        let newpath = path
            .replace(':id', id)
            .replace(':relatedType', type)
            .replace(':viewMode', calcViewMode);
        // When path doesn't have a view mode, use default (calc)
        if (!newpath.includes(calcViewMode)) {
            newpath += '/' + calcViewMode;
        }
        return <Redirect to={newpath} />;
    }
    // Give a nice title.
    const title = type !== 'all' ? `Related ${type}` : 'All Related Items';
    return (
        <FeatureCollection
            docs={docs}
            title={title}
            viewMode={viewMode}
            inline={true}
            page={page}
            setPage={setPage}
            perPage={perPage}
            setPerPage={setPerPage}
            isPreviousData={isPreviousData}
            hasMore={kmapsRelated.hasMore}
            assetCount={assets.count}
            relateds={kmapsRelated}
        />
    );
}
