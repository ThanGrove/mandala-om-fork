import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function SourcesHome(props) {
    return (
        <div className={'assethome sources'}>
            <div className={'desc'}>
                <h1>Sources</h1>
                <p>This page shows all sources in this project.</p>
            </div>
            <div className={'c-asset-collection'}>
                <AssetHomeCollection asset_type={'sources'} />
            </div>
        </div>
    );
}

export default SourcesHome;
