import { FeatureGallery } from './FeatureGallery';
import React, { useEffect, useState } from 'react';
import { Redirect, useHistory, useLocation, useParams } from 'react-router';
import _ from 'lodash';
import { FeatureDeck } from './FeatureDeck';
import { FeatureList } from './FeatureList';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Spinner from 'react-bootstrap/Spinner';
import { FeatureFilters } from './FeatureFilters';
import Dropdown from 'react-bootstrap/Dropdown';
import { DropdownButton } from 'react-bootstrap';

// There are three view modes encapsulated by three different components
//          gallery:    FeatureGallery
//          list:       FeatureList
//          deck:       FeatureDeck
//
// FeatureCollection decides which view mode to use depending on two different settings
//  1. viewMode property
//  2. viewMode path id
//

// ndg8f added recognition of a props.sorter JSX component of selects with states for determining sort order
// See CollectionViewer.js as example

const DEFAULT_VIEWMODE = 'deck'; //  deck or gallery or list

export function FeatureCollection(props) {
    const params = useParams();
    // console.log("FeatureCollection: params: ", params);
    const { viewMode: paramsViewMode } = params;
    const [viewMode, setViewMode] = useState(DEFAULT_VIEWMODE);

    // let determine the requested viewMode from props or from params.
    const requestedViewMode = paramsViewMode ? paramsViewMode : props.viewMode;

    // console.log("FeatureCollection: props.viewMode = ", props.viewMode);
    // console.log("FeatureCollection: requestedViewMode = ", requestedViewMode);
    // console.log("FeatureCollection: paramsViewMode = ", paramsViewMode);
    useEffect(() => {
        setTimeout(() => {
            const divel = document.getElementById('mandala-coll-no-items');
            if (divel && divel?.style) {
                divel.style.display = 'block';
                divel.style.color = 'red';
            }
        }, 500);
    }, []);

    if (!_.isEmpty(requestedViewMode) && viewMode !== requestedViewMode) {
        setViewMode(requestedViewMode);
    }

    if (viewMode && paramsViewMode && paramsViewMode !== viewMode) {
        return <Redirect to={viewMode} />;
    }

    // console.log( "FeatureCollection: FINAL VIEWMODE = ", viewMode );

    let viewer = <Redirect to={DEFAULT_VIEWMODE} />; // by default, let's redirect to the DEFAULT_VIEWMODE url
    switch (viewMode) {
        case 'gallery':
            viewer = <FeatureGallery {...props} />;
            break;
        case 'deck':
            viewer = <FeatureDeck {...props} />;
            break;
        case 'list':
            viewer = <FeatureList {...props} />;
            break;
    }
    let inclGallery = viewMode === 'gallery' ? true : false;
    let viewModeDiv = null;

    const atype = props.docs[0]?.asset_type;
    if (atype && 'audio-video|images'.includes(atype)) {
        inclGallery = true;
    }

    viewModeDiv = (
        <div className={'c-buttonGroup__viewMode'}>
            {/* View Mode:{' '} */}
            <span className="c-buttonGroup__viewMode-header">Switch View:</span>
            <FeatureCollectionViewModeSelector
                viewMode={viewMode}
                inclGallery={inclGallery}
            />
            {props.loadingState && (
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            )}
        </div>
    );
    return (
        <div className={'c-buttonGroup__viewMode__wrap'}>
            {props?.sorter}
            {viewModeDiv}
            {props.showSearchFilters && <FeatureFilters />}
            {viewer}
        </div>
    );
}

function FeatureCollectionViewModeSelector(props) {
    const history = useHistory();
    // const pathname = useLocation().pathname;
    const qs = useLocation().search;
    const { viewMode, inclGallery } = props;

    function navigate(viewMode) {
        history.push(viewMode + qs);
    }

    const deckLabel = <span className={'u-icon__grid icon'}></span>; // card deck
    const galleryLabel = <span className={'u-icon__th icon'}></span>; // Gallery
    const listLabel = <span className={'u-icon__list2 icon'}></span>; // List
    return (
        <ToggleButtonGroup
            name={viewMode}
            value={viewMode}
            type={'radio'}
            onChange={(mode) => navigate(mode)}
        >
            <ToggleButton
                name={'viewMode'}
                value={'deck'}
                type={'radio'}
                role={'button'}
                title={'View Mode: Cards'}
            >
                {deckLabel}
            </ToggleButton>
            {inclGallery && (
                <ToggleButton
                    name={'viewMode'}
                    value={'gallery'}
                    type={'radio'}
                    role={'button'}
                    title={'View Mode: Gallery'}
                >
                    {galleryLabel}
                </ToggleButton>
            )}
            <ToggleButton
                name={'viewMode'}
                value={'list'}
                type={'radio'}
                role={'button'}
                title={'View Mode: List'}
            >
                {listLabel}
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
