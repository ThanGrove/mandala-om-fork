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
    let allcollurl = '/collections/all';
    if (assetType) {
        allcollurl = `/${assetType}/collections/all`;
    }
    let breadcrumbs = [
        <Link key={'bc-asset-title'} to="#" className="breadcrumb-item">
            {assetType}
        </Link>,
        <Link
            key={'bc-asset-collections'}
            to={allcollurl}
            className="breadcrumb-item"
        >
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
    if (collData?.title?.length > 0) {
        breadcrumbs.push(
            <Link key={'bc-asset-self'} to="#" className="breadcrumb-item">
                {collData?.title[0]}
            </Link>
        );
    } else {
        breadcrumbs.push(
            <Link key={'bc-asset-self'} to="#" className="breadcrumb-item">
                No Collection Data Found!
            </Link>
        );
    }
    return breadcrumbs;
}
