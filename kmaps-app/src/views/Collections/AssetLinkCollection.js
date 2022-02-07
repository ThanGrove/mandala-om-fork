import { useHistory } from '../../hooks/useHistory';
import {
    Redirect,
    Route,
    Switch,
    useParams,
    useRouteMatch,
} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import MandalaSkeleton from '../common/MandalaSkeleton';
import RelatedAssetViewer from '../Kmaps/RelatedAssetViewer';
import { SubjectsRelSubjectsViewer } from '../Kmaps/SubjectsRelSubjectsViewer';
import RelatedsGallery from '../common/RelatedsGallery';
import {
    CollectionInfo,
    CollectionSortModeSelector,
    CollectionsViewer,
} from './CollectionsViewer';
import useCollection from '../../hooks/useCollection';
import { useSolr } from '../../hooks/useSolr';
import $ from 'jquery';
import { NotFoundPage } from '../common/utilcomponents';
import { FeatureCollection } from '../common/FeatureCollection';
import ImagesViewer from '../Images/ImagesViewer';
import AudioVideoViewer from '../AudioVideo/AudioVideoViewer';
import SourcesViewer from '../Sources/SourcesViewer';
import TextsViewer from '../Texts/TextsViewer';
import VisualsViewer from '../Visuals/VisualsViewer';

export function AssetLinkCollection(props) {
    const addPage = useHistory((state) => state.addPage);
    let { id: alcoll_id, view_mode, asset_type: atype, aid } = useParams();

    const showAssetViewer = typeof view_mode === 'undefined';

    // Get Collection data. See hooks/useCollection
    const {
        isLoading: isCollLoading,
        data: colldata,
        isError: isCollError,
        error: collError,
    } = useCollection('mandala', alcoll_id);

    const collsolr = colldata?.numFound === 1 ? colldata.docs[0] : false;

    useEffect(() => {
        if (!isCollLoading && !isCollError) {
            addPage(
                'collections-mandala',
                collsolr.title,
                window.location.pathname
            );
        }
    }, [colldata]);

    if (isCollLoading) {
        return <MandalaSkeleton />;
    }
    if (isCollError) {
        console.log('Error loading collections', collError);
        return null;
    }
    const collcontent = showAssetViewer ? (
        <AssetLinkViewer asset_type={atype} asset_id={aid} />
    ) : (
        <AssetLinkGallery collsolr={collsolr} asset_id={alcoll_id} />
    );
    return (
        <>
            <CollectionInfo collsolr={collsolr} asset_type="mandala" />
            <div className="coll-content">{collcontent}</div>
        </>
    );
}

/**
 * AssetLinkGallery : displays the gallery of items in an Asset collection. It duplicated the part of Collection Viewer
 * that does the gallery, split off so it can be replaced by an asset viewere
 * @param collsolr
 * @param asset_id
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function AssetLinkGallery({ collsolr, asset_id, ...props }) {
    const asset_type = 'mandala';
    // Set up state variables for pager
    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    // Set up sort mode state
    const DEFAULT_SORTMODE = 'title_sort_s asc';
    const [sortMode, setSortMode] = useState(DEFAULT_SORTMODE);

    // Make Solr Query to find assets in Collection
    const query = {
        index: 'assets',
        params: {
            fq: ['asset_type:' + asset_type, '-asset_subtype:page'],
            q: 'collection_nid_path_is:' + asset_id,
            sort: sortMode,
            start: startRow,
            rows: pageSize,
        },
    };
    const qkey = [
        'collection',
        asset_type,
        asset_id,
        sortMode,
        startRow,
        pageSize,
    ];
    const {
        isLoading: isItemsLoading,
        data: items,
        isError: isItemsError,
        error: itemsError,
    } = useSolr(qkey, query);

    const collitems = items?.docs ? items.docs : [];
    //if (items?.numFound && !isNaN(items?.numFound)) { setNumFound(items.numFound); }
    //console.log("collections solr doc", collitems);

    // Use Effect for when page num or size change
    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum]);

    useEffect(() => {
        const newPage = Math.ceil(startRow / pageSize);
        setPageNum(newPage);
    }, [pageSize]);

    // Reset pagination on change in sort order
    useEffect(() => {
        setPageNum(0);
    }, [sortMode]);

    let coll_paths = [];

    // Set page Info (header and breadcrumbs) based on collsolr returned
    useEffect(() => {
        if (props.ismain) {
            if (collsolr) {
                coll_paths = [
                    {
                        uid: '/' + asset_type,
                        name: 'Mandala',
                    },
                ];
                // Check and do parent collection link
                if (
                    collsolr?.collection_nid &&
                    collsolr.collection_nid.length > 0
                ) {
                    coll_paths.push({
                        uid:
                            '/' +
                            asset_type +
                            '/collection/' +
                            collsolr.collection_nid,
                        name: collsolr.collection_title,
                    });
                }
                // Do self link
                coll_paths.push({
                    uid: '/' + asset_type + '/collection/' + collsolr.id,
                    name: collsolr.title,
                });
                //status.setPath(coll_paths);
            }
        }
    }, [collsolr]); // End UseEffect()

    const numFound = items?.numFound;

    // Get and display (if exists) thumbnail image
    let thumburl = $.trim(collsolr?.url_thumb);
    if (thumburl && thumburl.length > 0) {
        thumburl = (
            <img
                src={thumburl}
                className={'rounded float-left'}
                alt={'alignment'}
            />
        );
    }

    // Set Summary Variable
    let summary = $.trim(collsolr?.summary);
    if (summary && summary.length == 0) {
        summary = false;
    }

    // Do Not Found if not Solr Doc found (collsolr)
    if (collsolr?.numFound === 0) {
        coll_paths = [
            {
                uid: '/' + asset_type,
                name: 'Mandala',
            },
        ];
        coll_paths.push({
            uid: '#',
            name: 'Not Found',
        });
        /*status.setHeaderTitle(
            asset_type[0].toUpperCase() + asset_type.substr(1)
        );
        status.setPath(coll_paths);*/
        return <NotFoundPage type={asset_type + ' collection'} id={asset_id} />;
    }

    // console.log('collitems', collitems);
    // console.log(collsolr);
    const collabel = collsolr?.collection_nid ? 'Subcollection' : 'Collection';
    let colltitle =
        collsolr?.title?.length > 0
            ? `${collsolr.title[0].replace(/collections?/gi, '')} ${
                  collsolr.asset_subtype
              } ${collabel}`
            : false;
    const sorter = (
        <CollectionSortModeSelector
            setSort={setSortMode}
            sortMode={sortMode}
            assetType={asset_type}
        />
    );

    const hasMoreItems = numFound <= (pageNum + 1) * pageSize ? false : true;

    return (
        <>
            <section
                className={
                    'c-collection__container l-content__main__wrap ' +
                    asset_type
                }
            >
                <div className={'c-content__main__kmaps c-collection'}>
                    {colltitle && (
                        <h1 className="title collection text-capitalize">
                            {colltitle}
                        </h1>
                    )}
                    {(collsolr?.url_thumb?.length > 0 ||
                        $.trim(collsolr?.summary).length > 0) && (
                        <p className={'colldesc clearfix'}>
                            {thumburl}
                            {summary}
                        </p>
                    )}
                    <h3 className={'clearfix'}>
                        Mandala Items in This {collabel}
                    </h3>
                    <FeatureCollection
                        docs={collitems}
                        assetCount={numFound}
                        page={pageNum}
                        setPage={setPageNum}
                        perPage={pageSize}
                        setPerPage={setPageSize}
                        viewMode={'deck'}
                        inline={asset_type === 'mandala'} // TODO: will this work for asset links?
                        hasMore={hasMoreItems}
                        className={'c-collection__items'}
                        sorter={sorter}
                        isLoading={isItemsLoading}
                    />
                </div>
            </section>
        </>
    );
}

function AssetLinkViewer({ asset_type, asset_id }) {
    switch (asset_type) {
        case 'images':
            return <ImagesViewer id={asset_id} />;
        case 'audio-video':
            return <AudioVideoViewer id={asset_id} sui={window.sui} />;
        case 'sources':
            return <SourcesViewer id={asset_id} />;
        case 'texts':
            return <TextsViewer id={asset_id} />;
        case 'visuals':
            return <VisualsViewer id={asset_id} />;
        default:
            return <div>Unknown asset type!</div>;
    }
}
