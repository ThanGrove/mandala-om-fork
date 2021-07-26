import { Link } from 'react-router-dom';
import { capitalAsset } from '../../views/common/utils';
import React from 'react';

/**
 * Return the breadcrumb list for Collections
 *
 * @param collData
 * @returns {JSX.Element[]}
 * @constructor
 */
export function CollectionBreadcrumbs({ collData }) {
    const assetType = collData?.asset_subtype;
    const isSubColl = collData?.collection_uid_path_ss?.length > 0;
    let breadcrumbs = [
        <Link key={'bc-asset-title'} to="#" className="breadcrumb-item">
            {assetType}
        </Link>,
        <Link key={'bc-asset-collections'} to="#" className="breadcrumb-item">
            Collections
        </Link>,
    ];
    if (isSubColl) {
        breadcrumbs.push(
            <Link
                key={'bc-asset-parent'}
                to={`/${assetType}/collection/${collData?.collection_nid}/`}
                className="breadcrumb-item"
            >
                {collData?.collection_title}
            </Link>
        );
    }
    breadcrumbs.push(
        <Link key={'bc-asset-self'} to="#" className="breadcrumb-item">
            {collData?.title[0]}
        </Link>
    );
    return breadcrumbs;
}
