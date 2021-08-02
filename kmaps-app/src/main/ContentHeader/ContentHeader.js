import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import './ContentHeader.scss';
import { useKmap } from '../../hooks/useKmap';
import { capitalAsset, parseParams, queryID } from '../../views/common/utils';
import MandalaSkeleton from '../../views/common/MandalaSkeleton';
import { KmapsBreadcrumbs } from './KmapsBreadcrumbs';
import { AssetBreadcrumbs } from './AssetBreadcrumbs';
import useCollection from '../../hooks/useCollection';
import { CollectionBreadcrumbs } from './CollectionBreadcrumbs';

export function ContentHeader({ siteClass, title, location }) {
    const pgpath = location.pathname.substr(1);
    const [first, mid, last] = pgpath?.split('/');
    const itemType = first;
    const queryType = itemType; // had  "+ '*'" was breaking query
    const isCollection = mid === 'collection';
    let itemId = isCollection ? last : mid;
    if (!itemId || typeof itemId === 'undefined') {
        itemId = '';
    }
    const isAsset = [
        'audio-video',
        'av',
        'images',
        'sources',
        'texts',
        'visuals',
    ].includes(queryType.toLowerCase());
    const solrqtype = isAsset ? 'asset' : 'info';
    const {
        isLoading: isItemLoading,
        data: itemData,
        isError: isItemError,
        error: itemError,
    } = useKmap(queryID(queryType, itemId), solrqtype);
    // some comment
    if (isItemLoading) {
        return (
            <MandalaSkeleton
                height={'1rem'}
                width={'100%'}
                color={'transparent'}
                marginTop={'-4rem'}
            />
        );
    }

    let convertedPath = '';
    let mytitle = itemData?.header
        ? itemData.header
        : itemData?.title
        ? itemData.title[0]
        : 'No Title';

    // console.log('item data', queryID(queryType, itemId), itemData);
    // Handle an Error
    if (isItemError) {
        console.log(queryID(queryType, itemId), itemError);
        return (
            <div>
                There was a problem in the Content Header for{' '}
                {queryID(queryType, itemId)}!
            </div>
        );
    }

    // What to return if the SOLR query returned a hit
    if (itemData) {
        // If nothing found
        if (itemData?.response?.numFound === 0) {
            return (
                <AltContentHeader
                    domain={itemType}
                    kid={itemId}
                    siteClass={siteClass}
                    isCollection={isCollection}
                />
            );
        }

        if (itemType === 'search') {
            let srchstr = document.getElementById('sui-search').value;
            if (srchstr.length > 0) {
                srchstr = ` for “${srchstr}”`;
            }
            mytitle = `Search${srchstr}`;
            convertedPath = '';
        }
        const cheader = (
            <header
                id="c-content__header__main"
                className={`c-content__header__main legacy ${siteClass} ${itemType}`}
            >
                <div
                    id="c-content__header__main__wrap"
                    className="c-content__header__main__wrap legacy"
                >
                    <div className={'c-content__header__breadcrumb breadcrumb'}>
                        {itemType !== 'search' && (
                            <ContentHeaderBreadcrumbs
                                itemData={itemData}
                                itemTitle={mytitle}
                                itemType={itemType}
                            />
                        )}
                    </div>
                </div>
            </header>
        );
        return cheader;
    }

    // No hit in kmassets index so try kmterms
    return (
        <AltContentHeader
            domain={itemType}
            kid={itemId}
            siteClass={siteClass}
        />
    );
}

/**
 * ContentHeaderBreadcrumbs
 * Returns the breadcrumbs for an asset or kmap.
 * Used by both ContentHeader and AltContentHeader (below)
 *
 * @param itemData
 * @param itemTitle
 * @param itemType
 * @returns {null|*}
 * @constructor
 */
function ContentHeaderBreadcrumbs({ itemData, itemTitle, itemType }) {
    let breadcrumbs = [];
    switch (itemType) {
        case 'places':
        case 'subjects':
        case 'terms':
            return (
                <KmapsBreadcrumbs
                    kmapData={itemData}
                    itemTitle={itemTitle}
                    itemType={itemType}
                />
            );

        default:
            return (
                <AssetBreadcrumbs
                    itemData={itemData}
                    itemTitle={itemTitle}
                    itemType={itemType}
                />
            );
    }
    return null;
}

/**
 * AltContentHeader:
 * for cases where a kmap item is not indexed in the kmasset solr index but only in the kmterms one
 *
 * @param domain
 * @param kid
 * @param siteClass
 * @returns {JSX.Element}
 * @constructor
 */
function AltContentHeader({ domain, kid, siteClass, isCollection }) {
    const loc = useLocation();
    const params = loc?.search ? parseParams(loc.search) : false;
    const {
        isLoading: isItemLoading,
        data: itemData,
        isError: isItemError,
        error: itemError,
    } = useKmap(queryID(domain, kid), 'info');

    const {
        isLoading: isCollLoading,
        data: collData,
        isError: isCollError,
        error: collError,
    } = useCollection(domain, kid);

    useEffect(() => {
        const contentTitle = document.getElementById('sui-termTitle');
        const cttext = contentTitle?.innerText.toLowerCase();
        if (contentTitle && !cttext.includes('not found')) {
            contentTitle.innerText = alttitle;
        }
    });

    if (isItemLoading || isCollLoading) {
        return <MandalaSkeleton />;
    }

    let alttitle = itemData?.header ? itemData.header : false;
    let bcrumbs = itemData ? (
        <ContentHeaderBreadcrumbs
            itemData={itemData}
            itemTitle={alttitle}
            itemType={domain}
        />
    ) : (
        ''
    );
    let newCollData =
        isCollection && collData?.numFound > 0 ? collData.docs[0] : collData;
    if (!alttitle && domain?.length > 1) {
        alttitle = domain[0].toUpperCase() + domain.substr(1);
        bcrumbs = '';
        if (domain == 'search' && params?.searchText) {
            const decoded = decodeURI(params.searchText);
            alttitle += ` for “${decoded}”`;
        }
    }

    const cheader = (
        <header
            id="c-content__header__main"
            className={`c-content__header__main legacy ${siteClass} ${domain}`}
        >
            <div
                id="c-content__header__main__wrap"
                className="c-content__header__main__wrap legacy"
            >
                <h1 className={'c-content__header__main__title alttitle'}>
                    <span className={`icon u-icon__${domain}`}></span>
                    {alttitle}
                </h1>

                <div className={'c-content__header__breadcrumb breadcrumb'}>
                    {bcrumbs && !isCollection && bcrumbs}
                    {isCollection && (
                        <CollectionBreadcrumbs collData={newCollData} />
                    )}
                </div>
                <h5 className={'c-content__header__main__id'}>{kid}</h5>
                <h4 className={'c-content__header__main__sub'}>
                    {/* subtitle here? */}
                </h4>
            </div>
        </header>
    );
    return cheader;
}

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <span role="alert">
            <span>Something went wrong in ContentHeader.js</span>
        </span>
    );
}
