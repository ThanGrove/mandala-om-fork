import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router';
import { useSolr } from '../../hooks/useSolr';
import { Link } from 'react-router-dom';
import './collections.scss';
import { FeatureCollection } from '../common/FeatureCollection';
import useCollection from '../../hooks/useCollection';
import $ from 'jquery';
import { NotFoundPage } from '../common/utilcomponents';
import { useHistory } from '../../hooks/useHistory';
import MandalaSkeleton from '../common/MandalaSkeleton';

/**
 * Component to return a collection page showing a gallery or list of items in the collection
 * with pager and list mode
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function CollectionsViewer(props) {
    const { asset_type, id: asset_id, view_mode } = useParams(); // retrieve parameters from route. (See ContentMain.js)
    //const history = useContext(HistoryContext);
    const addPage = useHistory((state) => state.addPage);
    const atypeLabel = <span className={'text-capitalize'}>{asset_type}</span>;

    // Get Collection data. See hooks/useCollection
    const {
        isLoading: isCollLoading,
        data: colldata,
        isError: isCollError,
        error: collError,
    } = useCollection(asset_type, asset_id);

    const collsolr = colldata?.numFound === 1 ? colldata.docs[0] : false;

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

    useEffect(() => {
        if (!isCollLoading && !isCollError) {
            addPage(
                'collections-' + asset_type,
                collsolr.title,
                window.location.pathname
            );
        }
    }, [colldata]);

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
                        name: atypeLabel,
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

    if (isCollLoading) {
        return <MandalaSkeleton />;
    }

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
                name: atypeLabel,
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

    const colltitle =
        collsolr?.title?.length > 0
            ? `${collsolr.title[0].replace(/collections?/gi, '')} ${
                  collsolr.asset_subtype
              } Collection`
            : false;

    const sorter = (
        <CollectionSortModeSelector setSort={setSortMode} sortMode={sortMode} />
    );

    const hasMoreItems = numFound <= (pageNum + 1) * pageSize ? false : true;

    return (
        <>
            <CollectionInfo collsolr={collsolr} asset_type={asset_type} />

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
                        {atypeLabel} Items in This Collection
                    </h3>
                    <FeatureCollection
                        docs={collitems}
                        assetCount={numFound}
                        page={pageNum}
                        setPage={setPageNum}
                        perPage={pageSize}
                        setPerPage={setPageSize}
                        viewMode={view_mode}
                        inline={false}
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

export function CollectionSortModeSelector({ sortMode, setSort }) {
    const SORTBYID = 'coll-sortby';
    const SORTORDERID = 'coll-sortorder';
    let { sortBy, sortOrder } = sortMode.split(' ');
    const sortChange = (sel) => {
        let newSortVal = sortMode;
        const selid = sel.target.id;
        if (selid === SORTBYID) {
            const sortpts = sortMode.split(' ');
            newSortVal = sel.target.value + ' ' + sortpts[1];
        } else if (selid === SORTORDERID) {
            const sortpts = sortMode.split(' ');
            newSortVal = sortpts[0] + ' ' + sel.target.value;
        }
        setSort(newSortVal);
    };

    const sortByVals = [
        'Title:title_sort_s',
        'Date:date_start',
        'Creator:creator_sort_s',
    ];
    const sortOrderVals = ['Asc', 'Desc'];
    return (
        <div className={'c-buttonGroup__sortMode'}>
            <span className="c-buttonGroup__sortMode-header">Sort By:</span>
            <select
                id={SORTBYID}
                className="c-featureCollection-sortBy-select"
                onChange={sortChange}
                defaultValue={sortBy}
            >
                {sortByVals.map((v, i) => {
                    let [alabel, avalue] = v.split(':');
                    return (
                        <option key={`sortby-val-${i}`} value={avalue}>
                            {alabel}
                        </option>
                    );
                })}
            </select>
            <select
                id={SORTORDERID}
                className="c-featureCollection-sort-order"
                onChange={sortChange}
                defaultValue={sortOrder}
            >
                {sortOrderVals.map((v, i) => {
                    const optval = v.toLowerCase();
                    return (
                        <option key={`sortby-val-${i}`} value={optval}>
                            {v}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

function CollectionInfo({ collsolr, asset_type }) {
    // Get and display Owner from collsolr
    const owner = collsolr?.node_user_full_s
        ? collsolr.node_user_full_s
        : collsolr.node_user;

    // Get and Display Parent collection
    const parentcollid = collsolr?.collection_nid;
    const parentcoll = parentcollid ? (
        <Link to={`/${asset_type}/collection/${parentcollid}`}>
            {collsolr.collection_title}
        </Link>
    ) : null;

    // Get and Display Subcollections
    const subcollids = collsolr?.subcollection_id_is;
    const subcolltitles = collsolr?.subcollection_name_ss;
    let subcolldata = subcollids?.map(function (item, n) {
        let sctitle = subcolltitles[n];
        return `${sctitle}###${item}`;
    });
    if (subcolldata?.length > 0) {
        subcolldata.sort();
    }

    const sctitleLen = 34;
    const subcolls = subcolldata?.map((item) => {
        const [sctitle, scid] = item.split('###');
        let sctitleval = sctitle;

        if (sctitleval.length > sctitleLen) {
            sctitleval =
                sctitleval.substr(0, sctitleval.lastIndexOf(' ', sctitleLen)) +
                ' ...';
        }
        const alttitle = sctitle;
        const scurl = `/${asset_type}/collection/${scid}`;
        const key = `${scid}-${sctitle}`;
        return (
            <li key={key}>
                <Link to={scurl} title={alttitle}>
                    {sctitleval}
                </Link>
            </li>
        );
    });

    return (
        <aside className={'l-column__related c-collection__metadata'}>
            {parentcoll && (
                <section className={'l-related__list__wrap c-coll-toc'}>
                    <h3 className={'u-related__list__header'}>{parentcoll}</h3>
                    <CollectionToc
                        pid={parentcollid}
                        currid={collsolr?.id}
                        type={asset_type}
                    />
                </section>
            )}

            {subcolls && (
                <section className={'l-related__list__wrap'}>
                    <h3 className={'u-related__list__header'}>
                        Subcollections ({subcolls.length})
                    </h3>
                    <ul className={'list-unstyled'}>{subcolls}</ul>
                </section>
            )}

            <section className={'l-related__list__wrap'}>
                <h3 className={'u-related__list__header'}>Owner</h3>
                <ul className={'list-unstyled'}>
                    <li>{owner}</li>
                </ul>
            </section>

            <section className={'l-related__list__wrap'}>
                <h3 className={'u-related__list__header'}>Members</h3>
                <ul className={'list-unstyled'}>
                    {collsolr?.members_name_ss?.map(function (member, n) {
                        const mykey = `member-item-${member}-${n}`.replace(
                            /\s+/g,
                            '_'
                        );
                        // const uid = collsolr.members_uid_ss[n]; // if needed add  data-uid={uid} to li
                        return <li key={mykey}>{member}</li>;
                    })}
                </ul>
            </section>
        </aside>
    );
}

export function CollectionToc({ pid, currid, type }) {
    const qkey = ['coll-sublist', type, pid];
    const query = {
        q: `collection_nid:${pid}`,
        fq: ['asset_type:collections', `asset_subtype:${type}`],
    };

    const {
        isLoading: isItemsLoading,
        data: subcolls,
        isError: isItemsError,
        error: itemsError,
    } = useSolr(qkey, { index: 'assets', params: query });

    if (isItemsLoading) {
        return <MandalaSkeleton />;
    }
    if (isItemsError) {
        return <p>Error!</p>;
    }
    const docs = subcolls?.docs;
    docs.sort(function cmp(a, b) {
        if (a.title[0] === b.title[0]) return 0;
        if (a.title[0] > b.title[0]) return 1;
        return -1;
    });
    return (
        <ul>
            {subcolls?.docs?.map((sc, sci) => {
                const cid = sc?.id;
                const ctitle = sc?.title[0];
                if (cid === currid) {
                    return (
                        <li className="active">
                            <span>{ctitle}</span>
                        </li>
                    );
                }
                return (
                    <li>
                        <Link to={`/${type}/collection/${cid}`}>{ctitle}</Link>
                    </li>
                );
            })}
        </ul>
    );
}
