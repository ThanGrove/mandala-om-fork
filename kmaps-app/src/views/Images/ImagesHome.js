import React, { useEffect, useState } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';
import useStatus from '../../hooks/useStatus';

export function ImagesHome(props) {
    return (
        <div className={'assethome images'}>
            <div className={'desc'}>
                <h1>Images Resources</h1>
                <p>This page shows all images in this project.</p>
            </div>
            <AssetHomeCollection asset_type={'images'} />
        </div>
    );
}

export default ImagesHome;
