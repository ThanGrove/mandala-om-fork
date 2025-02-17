import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useHistory } from '../../hooks/useHistory';

const ImagesViewer = React.lazy(() => import('../Images/ImagesViewer'));
const AudioVideoViewer = React.lazy(() =>
    import('../AudioVideo/AudioVideoViewer')
);
const SourcesViewer = React.lazy(() => import('../Sources/SourcesViewer'));
const TextsViewer = React.lazy(() => import('../Texts/TextsViewer'));
const VisualsViewer = React.lazy(() => import('../Visuals/VisualsViewer'));

export default function RelatedAssetViewer({ parentData }) {
    let { relatedType, assetId } = useParams();
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
    const retpath =
        process.env.REACT_APP_STANDALONE === 'standalone'
            ? window.location.hash.split('/view')[0].replace('#', '')
            : window.location.pathname.split('/view')[0];
    const asset_link_coll = window.location.pathname?.includes(
        'mandala/collection/'
    );
    return (
        <>
            {' '}
            {!asset_link_coll && (
                <div className="c-nodeHeader__backLink__wrap">
                    <Link to={retpath} className="c-nodeHeader__backLink">
                        <span className="icon u-icon__arrow-left_2">
                            Return
                        </span>
                    </Link>
                </div>
            )}
            <h2 className="c-nodeHeader-itemHeader">
                <span className={`icon u-icon__${type}`}> </span>
                <span className="c-nodeHeader-itemHeader-subType">
                    {' '}
                    {subtype}{' '}
                </span>
                <span className="c-nodeHeader-itemHeader-caption">
                    {' '}
                    {header}{' '}
                </span>
            </h2>
        </>
    );
}
