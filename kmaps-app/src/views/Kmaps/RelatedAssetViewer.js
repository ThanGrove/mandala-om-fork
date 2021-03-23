import React from 'react';
import { useParams } from 'react-router-dom';

const AudioVideoViewer = React.lazy(() =>
    import('../AudioVideo/AudioVideoViewer')
);
const ImagesViewer = React.lazy(() => import('../Images/ImagesViewer'));
const SourcesViewer = React.lazy(() => import('../Sources/SourcesViewer'));
const TextsViewer = React.lazy(() => import('../Texts/TextsViewer'));
const VisualsViewer = React.lazy(() => import('../Visuals/VisualsViewer'));

export default function RelatedAssetViewer({ parentData }) {
    let { relatedType, assetId } = useParams();
    console.log('in related asset veiwer', relatedType, assetId);
    switch (relatedType) {
        case 'images':
            return <ImagesViewer id={assetId} />;
        case 'audio-video':
            return <AudioVideoViewer id={assetId} sui={window.sui} />;
        case 'sources':
            return <SourcesViewer id={assetId} />;
        case 'texts':
            return <TextsViewer id={assetId} />;
        case 'visuals':
            return <VisualsViewer id={assetId} />;
        default:
            return <div>Unknown related type!</div>;
    }
}
