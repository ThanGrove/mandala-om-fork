import React, { useEffect } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function SourcesHome(props) {
    return (
        <div className={'assethome sources'}>
            <div className={'desc'}>
                <h1>Sources</h1>
            </div>
            <div className={'c-asset-collection'}>
                <AssetHomeCollection asset_type={'sources'} />
            </div>
        </div>
    );
}

export default SourcesHome;
