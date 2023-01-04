import React, { useEffect, useState } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function AudioVideoHome(props) {
    return (
        <div className={'assethome audio-video'}>
            <div className={'desc'}>
                <h1>Audio-Video</h1>
            </div>
            <div className={'c-asset-collection'}>
                <AssetHomeCollection asset_type={'audio-video'} />
            </div>
        </div>
    );
}

export default AudioVideoHome;
