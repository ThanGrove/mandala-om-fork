import React from 'react';
import { Link, useParams } from 'react-router-dom';

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

export function RelatedAssetHeader({ type, subtype, header }) {
    const retpath = window.location.pathname.split('/view')[0];
    return (
        <>
            <div className="c-nodeHeader__backLink__wrap">
                <Link to={retpath} className="c-nodeHeader__backLink">
                    <span className="icon u-icon__arrow-left_2">Return</span>
                </Link>
            </div>
            <h5 className="c-nodeHeader-itemHeader">
                <span className={`icon u-icon__${type}`}> </span>
                <span className="c-nodeHeader-itemHeader-subType">
                    {' '}
                    {subtype}{' '}
                </span>
                <span className="c-nodeHeader-itemHeader-caption">
                    {' '}
                    {header}{' '}
                </span>
            </h5>
        </>
    );
}
