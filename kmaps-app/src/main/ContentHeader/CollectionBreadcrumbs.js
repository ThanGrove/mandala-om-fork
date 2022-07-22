import { Link, useLocation, useParams } from 'react-router-dom';
import { capitalAsset } from '../../views/common/utils';
import React from 'react';
import { useSolr } from '../../hooks/useSolr';
import useAsset from '../../hooks/useAsset';

/**
 * Return the breadcrumb list for Collections
 *
 * @param collData
 * @returns {JSX.Element[]}
 * @constructor
 */
export function CollectionBreadcrumbs({ collData }) {
    const loc = useLocation();
    const assetType = collData?.asset_subtype;
    const isSubColl = collData?.collection_uid_path_ss?.length > 0;

    // Adjust breadcrumbs for asset links by sniffing the location pathname for pattern
    const assetlink_match = loc.pathname.match(
        /(\/mandala\/collection\/\d+\/)(audio-video|images|sources|texts|visuals)\/(\d+)/
    );
    const collurl = assetlink_match ? assetlink_match[1] : null;
    const atype = assetlink_match ? assetlink_match[2] : null;
    const aid = assetlink_match ? assetlink_match[3] : null;

    let allcollurl = '/collections/all';
    if (assetType) {
        allcollurl = `/${assetType}/collections/all`;
    }

    let breadcrumbs = [
        <Link key={'bc-asset-title-1'} to="#" className="breadcrumb-item">
            {assetType?.length > 0 ? assetType : 'Mandala'}
        </Link>,
        <Link
            key={'bc-asset-collections-2'}
            to={allcollurl}
            className="breadcrumb-item"
        >
            Collections
        </Link>,
    ];
    if (isSubColl) {
        breadcrumbs.push(
            <Link
                key={'bc-asset-parent-3'}
                to={`/${assetType}/collection/${collData?.collection_nid}/`}
                className="breadcrumb-item"
            >
                {collData?.collection_title}
            </Link>
        );
    }
    if (collData?.title?.length > 0) {
        breadcrumbs.push(
            <Link key={'bc-asset-self-4'} to="#" className="breadcrumb-item">
                {collData?.title[0]}
            </Link>
        );
    } else {
        breadcrumbs.push(
            <Link key={'bc-asset-self-5'} to="#" className="breadcrumb-item">
                No Collection Data Found!
            </Link>
        );
    }
    if (assetlink_match) {
        breadcrumbs.pop();
        breadcrumbs.push(
            <Link
                key={`bc-asset-alcoll-6`}
                to={collurl}
                className="breadcrumb-item"
            >
                {collData?.title[0]}
            </Link>
        );
        breadcrumbs.push(
            <BreadcrumbAssetLink
                key={'bc-asset-self-item'}
                atype={atype}
                aid={aid}
            />
        );
    }
    return breadcrumbs;
}

function BreadcrumbAssetLink({ atype, aid }) {
    const {
        isLoading: isAssetLoading,
        data: asset,
        isError: isAssetError,
        error: assetError,
    } = useAsset(atype, aid);

    if (isAssetError || isAssetLoading) {
        return null;
    }
    let mytitle = '';
    if (asset?.docs || asset?.docs?.length > 0) {
        mytitle = asset.docs[0].title[0];
    }
    return (
        <Link key={`bc-asset-self-${aid}`} to="#" className="breadcrumb-item">
            {mytitle}
        </Link>
    );
}
