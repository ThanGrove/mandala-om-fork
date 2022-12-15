import { Link } from 'react-router-dom';
import { capitalAsset } from '../../views/common/utils';
import React from 'react';
import { HtmlCustom } from '../../views/common/MandalaMarkup';

export function AssetBreadcrumbs({ itemData, itemTitle, itemType }) {
    // Asset Breadcrumbs
    let breadcrumbs = itemData?.collection_uid_path_ss?.map((cup, cind) => {
        const cplabel = itemData?.collection_title_path_ss[cind];
        const url =
            '/' + cup.replace(/-/g, '/').replace('audio/video', 'audio-video');
        return (
            <Link key={`bc-asset-${cind}`} to={url} className="breadcrumb-item">
                {' '}
                {cplabel}
            </Link>
        );
    });
    if (typeof breadcrumbs === 'undefined') {
        breadcrumbs = [];
    }
    breadcrumbs.push(
        <Link key={'bc-title'} to="#" className="breadcrumb-item">
            <HtmlCustom markup={itemTitle} />
        </Link>
    );

    if (breadcrumbs) {
        breadcrumbs.unshift(
            <Link key={'bc-asset-title'} to="#" className="breadcrumb-item">
                {capitalAsset(itemType)}
            </Link>
        );
        return breadcrumbs;
    }
}
