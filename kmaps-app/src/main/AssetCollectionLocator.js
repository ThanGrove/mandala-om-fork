import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useKmap } from '../hooks/useKmap';
import { queryID } from '../views/common/utils';
import MandalaSkeleton from '../views/common/MandalaSkeleton';

/**
 * Simple component for path /find/:assetType/:id/collection in ContentMain.js
 * Looks up asset type by ID and redirects to its collection using the collection id from SOLR
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function AssetCollectionLocator() {
    const { assetType, id } = useParams();
    const qid = queryID(assetType, id);
    const {
        isLoading: isAssetLoading,
        data: kmasset,
        isError: isAssetError,
        error: assetError,
    } = useKmap(qid, 'asset');

    if (isAssetLoading) {
        return <MandalaSkeleton />;
    }

    const collid = kmasset?.collection_nid;
    return <Redirect to={`/${assetType}/collection/${collid}`} />;
}
