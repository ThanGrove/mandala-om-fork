import React, { useEffect, useState } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';
import useStatus from '../../hooks/useStatus';

export function AudioVideoHome(props) {
    const status = useStatus();
    status.setType('audio-video');
    status.setHeaderTitle('Loading...');

    return (
        <div className={'assethome audio-video'}>
            <div className={'desc'}>
                <h1>Audio-Video Resources</h1>
                <p>
                    This page shows all the audio-video resources in this
                    project.
                </p>
            </div>
            <div className={'c-asset-collection'}>
                <AssetHomeCollection asset_type={'audio-video'} />
            </div>
        </div>
    );
}

export default AudioVideoHome;
