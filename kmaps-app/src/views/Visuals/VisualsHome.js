import React from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function VisualsHome(props) {
    return (
        <div className={'assethome visuals'}>
            <div className={'desc'}>
                <h1>Visuals</h1>
            </div>
            <div className={'c-asset-collection'}>
                <AssetHomeCollection asset_type={'visuals'} />
            </div>
        </div>
    );
}

export default VisualsHome;
