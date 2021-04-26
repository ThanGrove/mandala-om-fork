import React, { useEffect, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import FancyTree from '../../FancyTree';
import KmapTree from '../../KmapTree/KmapTree';
import HistoryViewer from '../../History/HistoryViewer';
import { useKmapRelated } from '../../../hooks/useKmapRelated';
import { useUnPackedMemoized } from '../../../hooks/utils';
import {
    getPerspective,
    getProject,
    queryID,
} from '../../../views/common/utils';
import './RelatedsViewer.scss';
import { useHistory } from '../../../hooks/useHistory';
import MandalaSkeleton from '../../common/MandalaSkeleton';

export function RelatedsViewer() {
    let statePages = useHistory((state) => state.pages);
    /*
    // Remove current page from list so that it doesn't show
    statePages = Array.from(statePages);
    statePages = statePages.filter((sp) => {
        return !sp.includes('::' + window.location.pathname);
    });
    */
    const match = useRouteMatch([
        '/:baseType/:id/related-:type/:definitionID/view/:relID',
        '/:baseType/:id/related-:type/:definitionID/:viewMode',
        '/:baseType/:id/related-:type',
        '/:baseType/:id',
    ]);

    const loc = match?.params.type || 'home';
    let locMatch = {};
    locMatch[loc] = 'selected';

    let baseArgs = {
        baseType: match?.params.baseType,
        id: match?.params.id,
    };

    const {
        isLoading: isRelatedLoading,
        data: relatedData,
        isError: isRelatedError,
        error: relatedError,
    } = useKmapRelated(queryID(baseArgs.baseType, baseArgs.id), 'all', 0, 100);

    //Unpack related data using memoized function
    const kmapsRelated = useUnPackedMemoized(
        relatedData,
        baseArgs.id,
        'all',
        0,
        100
    );

    if (!baseArgs.id || !baseArgs.baseType) {
        return null;
    }

    if (isRelatedLoading) {
        return (
            <aside className="l-column__related">
                <div className="l-column__related__wrap">
                    <section className="l-related__list__wrap">
                        <MandalaSkeleton
                            count={10}
                            height={25}
                            width={'100%'}
                            marginTop={12}
                        />
                    </section>
                </div>
            </aside>
        );
    }

    if (isRelatedError) {
        return (
            <aside className="l-column__related">
                <div className="l-column__related__wrap">
                    <section className="l-related__list__wrap">
                        <span>Error: {relatedError.message}</span>
                    </section>
                </div>
            </aside>
        );
    }

    //Set relateds data to baseArgs
    baseArgs.relateds = kmapsRelated;

    return (
        <aside className={'l-column__related'}>
            <div className="l-column__related__wrap">
                <section className="l-related__list__wrap">
                    <div className="u-related__list__header">
                        Related Resources
                    </div>
                    <div className="c-relatedViewer">
                        <Link
                            id="sui-rl-Home"
                            to={'/' + baseArgs.baseType + '/' + baseArgs.id}
                            className={`c-related__link--home c-related__item ${locMatch['home']}`}
                        >
                            <span className={'icon u-icon__overview'}></span>{' '}
                            <span>Home</span>
                        </Link>

                        <RelatedCount
                            type={'all'}
                            {...baseArgs}
                            className={locMatch['mandala']}
                        />
                        <RelatedCount
                            type={'places'}
                            {...baseArgs}
                            className={locMatch['places']}
                        />
                        <RelatedCount
                            type={'audio-video'}
                            {...baseArgs}
                            className={locMatch['audio-video']}
                        />
                        <RelatedCount
                            type={'images'}
                            {...baseArgs}
                            className={locMatch.images}
                        />
                        <RelatedCount
                            type={'sources'}
                            {...baseArgs}
                            className={locMatch.sources}
                        />
                        <RelatedCount
                            type={'texts'}
                            {...baseArgs}
                            className={locMatch.texts}
                        />
                        <RelatedCount
                            type={'visuals'}
                            {...baseArgs}
                            className={locMatch.visuals}
                        />
                        <RelatedCount
                            type={'subjects'}
                            {...baseArgs}
                            className={locMatch.subjects}
                        />
                        <RelatedCount
                            type={'terms'}
                            {...baseArgs}
                            className={locMatch.terms}
                        />
                        <RelatedCount
                            type={'collections'}
                            {...baseArgs}
                            className={locMatch.collections}
                        />
                    </div>
                </section>

                {statePages.length > 0 && (
                    <section className="l-history__list__wrap">
                        <div className="u-related__list__header">
                            Recently Viewed
                        </div>
                        <HistoryViewer />
                    </section>
                )}
                <section className="l-terms__tree__wrap">
                    <div className="u-related__list__header">
                        Browse{' '}
                        <span className={'text-capitalize'}>
                            {baseArgs.baseType}
                        </span>
                    </div>

                    <RelatedTree {...baseArgs} />
                </section>
            </div>
        </aside>
    );
}

function RelatedCount(props) {
    const count = props.relateds?.assets
        ? props.relateds.assets[props.type]?.count
        : 0;

    // assign shanticon class according to type.  "all" type should get the "shanticon-logo-shanti" icon.
    const iconClass =
        'icon u-icon__' + (props.type === 'all' ? 'logo-shanti' : props.type);

    let display = 'deck';
    const listTypes = ['places', 'sources', 'subjects', 'texts'];
    if (listTypes.includes(props.type)) {
        display = 'list';
    }
    if (props.type === 'images') {
        display = 'gallery';
    }
    // return null if the count doesn't exist or is === 0
    return count ? (
        <Link
            id={'sui-rl-' + props.type}
            href="#"
            className={'c-related__item c-related__link--' + props.type}
            to={
                '/' +
                props.baseType +
                '/' +
                props.id +
                '/related-' +
                props.type +
                '/' +
                (props.baseType === 'terms' ? 'any/' : '') +
                display
            }
        >
            <span className={'u-icon__' + props.type + ' ' + iconClass}></span>
            <span className={'c-related__item__label'}> {props.type}</span>
            <span id="sui-rln-places">{count}</span>
        </Link>
    ) : null;
}

function RelatedTree(props) {
    // Determine which tree (browse_tree) to display in the relateds sidebar
    const domain = props.baseType;
    const kid = props.id;
    const fid = queryID(domain, kid);
    // places settings
    let persp = 'pol.admin.hier';
    let view = 'roman.scholar'; // TODO: add view to kmap tree?
    let sortby = 'header_ssort+ASC'; // TODO: check sort works in tree

    // Subject settings
    if (domain === 'subjects') {
        persp = 'gen';
        view = 'roman.popular';

        // Term settings
    } else if (domain === 'terms') {
        persp = 'tib.alpha';
        sortby = 'position_i+ASC';
    }

    return (
        <KmapTree
            elid="c-relatedTreeLeft"
            domain={domain}
            selectedNode={fid}
            project={getProject()}
        />
    );
}
