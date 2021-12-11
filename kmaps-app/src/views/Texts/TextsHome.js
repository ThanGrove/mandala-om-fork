import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function TextsHome(props) {
    return (
        <div className={'assethome texts'}>
            <div className={'desc'}>
                <h1>Texts</h1>
            </div>
            <div className={'c-asset-collection'}>
                <AssetHomeCollection asset_type={'texts'} />
            </div>
        </div>
    );
}

export default TextsHome;
