import React, { useEffect, useState } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function ImagesHome(props) {
    return (
        <div className={'assethome images'}>
            <div className={'desc'}>
                <h1>Images</h1>
            </div>
            <div className={'c-asset-collection'}>
                <AssetHomeCollection asset_type={'images'} />
            </div>
        </div>
    );
}

export default ImagesHome;
