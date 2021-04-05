import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import './ContentHeader.scss';
import { useKmap } from '../../hooks/useKmap';
import { capitalAsset, queryID } from '../../views/common/utils';
import MandalaSkeleton from '../../views/common/MandalaSkeleton';

export function ContentHeader({ siteClass, title, location }) {
    const pgpath = location.pathname.substr(1);
    const [first, mid, last] = pgpath?.split('/');
    const itemType = first;
    const queryType = itemType + '*';
    const isCollection = mid === 'collection';
    const itemId = isCollection ? last : mid;
    const {
        isLoading: isItemLoading,
        data: itemData,
        isError: isItemError,
        error: itemError,
    } = useKmap(queryID(queryType, itemId), 'asset');

    let convertedPath = '';
    let mytitle = itemData?.title ? itemData.title : '';
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
    // Handle an Error
    if (isItemError) {
        return <div>There was a problem!</div>;
    }

    // What to return if the SOLR query returned a hit
    if (itemData) {
        if (itemData?.response?.numFound === 0) {
            console.log('Going to alt header');
            return (
                <AltContentHeader
                    domain={itemType}
                    kid={itemId}
                    siteClass={siteClass}
                />
            );
        }
        mytitle = itemData?.title;
        convertedPath = (
            <ContentHeaderBreadcrumbs
                itemData={itemData}
                itemTitle={mytitle}
                itemType={itemType}
            />
        );
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
                    <h1 className={'c-content__header__main__title'}>
                        <span className={`icon u-icon__${itemType}`}></span>
                        {mytitle}
                    </h1>

                    <div className={'c-content__header__breadcrumb breadcrumb'}>
                        {convertedPath}
                    </div>
                    <h5 className={'c-content__header__main__id'}>{itemId}</h5>
                    <h4 className={'c-content__header__main__sub'}>
                        {itemData?.subTitle}
                    </h4>
                </div>
            </header>
        );
        return cheader;
    }

    // No hit in kmassets so try kmterms
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
            const tree = itemData.asset_type;
            breadcrumbs = itemData?.ancestor_ids_is?.map((aid, idn) => {
                const label = itemData.ancestors_txt[idn];
                return (
                    <Link
                        key={`bc-kmap-${idn}`}
                        to={`/${tree}/${aid}`}
                        className="breadcrumb-item"
                    >
                        {label}
                    </Link>
                );
            });
            break;

        default:
            // Asset Breadcrumbs
            breadcrumbs = itemData?.collection_uid_path_ss?.map((cup, cind) => {
                const cplabel = itemData?.collection_title_path_ss[cind];
                const url =
                    '/' +
                    cup
                        .replace(/-/g, '/')
                        .replace('audio/video', 'audio-video');
                return (
                    <Link
                        key={`bc-asset-${cind}`}
                        to={url}
                        className="breadcrumb-item"
                    >
                        {' '}
                        {cplabel}
                    </Link>
                );
            });
            if (typeof breadcrumbs === 'undefined') {
                breadcrumbs = [];
            }
            breadcrumbs.push(
                <Link key={'bc-title'} to="#" className="breadcrumb-item">
                    {itemTitle}
                </Link>
            );
    }
    if (breadcrumbs) {
        breadcrumbs.unshift(
            <Link key={'bc-asset-title'} to="#" className="breadcrumb-item">
                {capitalAsset(itemType)}
            </Link>
        );
        return breadcrumbs;
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
function AltContentHeader({ domain, kid, siteClass }) {
    const {
        isLoading: isItemLoading,
        data: itemData,
        isError: isItemError,
        error: itemError,
    } = useKmap(queryID(domain, kid), 'info');
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
    if (!alttitle && domain?.length > 1) {
        alttitle = domain[0].toUpperCase() + domain.substr(1);
        bcrumbs = '';
    }
    useEffect(() => {
        const contentTitle = document.getElementById('sui-termTitle');
        if (contentTitle) {
            contentTitle.innerText = alttitle;
        }
    });
    if (isItemLoading) {
        return <MandalaSkeleton />;
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
                    {bcrumbs}
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
