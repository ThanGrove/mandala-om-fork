import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import _ from 'lodash';
import { useStoreActions, useStoreState } from '../model/StoreModel';
// import useStatus from '../hooks/useStatus';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

/**
 *                          DEPRECATED
 *    Container which injects the kmap and kmasset data, before rendering the its children.
 *
 *    It injects the props:
 *
 *          kmap:  The current fully-populated KMAP data including full solr child data
 *          kmasset:  The current ASSET data
 *
 *          NB:  This will ONLY inject into top-level children.  It is fully expected for these top-level components to manage
 *          passing its props to its children as needed.
 *
 *
 * */

export default function KmapContext(props) {
    // console.log('KmapContext: props=', props);
    const status = useStatus();

    // Let's do the Easy Peasy thing
    const kmapActions = useStoreActions((actions) => actions.kmap);
    const {
        firstRelatedsPage,
        gotoRelatedsPage,
        lastRelatedsPage,
        nextRelatedsPage,
        prevRelatedsPage,
        setRelatedsPage,
        setRelatedsPageSize,
        setUid,
        update,
        receiveKmap,
    } = kmapActions;

    const searchActions = useStoreActions((actions) => actions.search);

    // console.log("I'm seeing these kmap actions: ", kmapActions );
    // console.log("I'm seeing these search actions: ", searchActions );

    // Easy Peasy State Mapping
    const mapped_kmap = useStoreState((state) => state.kmap);
    const kmapId = useStoreState((state) => state.kmap.uid);
    const kmasset = useStoreState((state) => state.kmap.asset);
    const relateds = useStoreState((state) => state.kmap.relateds);
    const kmap = useStoreState((state) => state.kmap.kmap);
    const loadingState = useStoreState((state) => state.kmap.loadingState);
    const relatedPage = useStoreState((state) => state.kmap.relatedsPage?.page);
    const relatedPageSize = useStoreState(
        (state) => state.kmap.relatedsPage?.pageSize
    );

    if (isNaN(relatedPageSize) || relatedPageSize === 0) {
        setRelatedsPageSize(100); // TODO: Use default page size constant/variable?
    }

    // Handle cases where the id is "full" or numeric  e.g "places-637" vs. "637"
    const { id: requestId, relatedType, definitionID } = useParams();
    let prefix = '';
    if (requestId && !requestId.match(/[a-z]\-\d+/)) {
        // console.log('KmapContext: requestId=', requestId);
        if (props.assetType) {
            prefix = props.assetType + '-';
        }
    }
    const id = prefix + requestId;

    const pager = {
        getMaxPage: () => {
            if (!relateds.assets || !relateds.assets[relatedType]) {
                return 1;
            } else if (definitionID) {
                // Filter docs to only show those that have the definitionID specified
                //const defID = definitionID ?? 'any';
                const docs = relateds.assets[relatedType];
                let filteredDocs = docs;
                if (definitionID !== 'any') {
                    filteredDocs = docs.filter((doc) =>
                        doc.kmapid.includes(definitionID)
                    );
                }
                // Set counts
                const maxCount = filteredDocs.count;
                const maxPage = Math.floor((maxCount - 1) / relatedPageSize);
                return maxPage;
            } else {
                const maxCount = relateds.assets[relatedType].count;
                const maxPage = Math.floor((maxCount - 1) / relatedPageSize);
                return maxPage;
            }
        },
        getPage: () => {
            return relatedPage;
        },
        setPage: (pg) => {
            pg = Number(pg);
            const maxCount = relateds.assets[relatedType].count;
            const maxPage = Math.floor(maxCount / relatedPageSize);
            pg = _.isNaN(pg) ? 0 : pg;
            if (pg > maxPage) {
                gotoRelatedsPage(maxPage);
            } else if (pg < 0) {
                gotoRelatedsPage(0);
            } else {
                gotoRelatedsPage(pg);
            }
        },
        setPageSize: (size) => {
            size = Number(size);
            let oldSize = Number(size);
            let oldPage = Number(relatedPage);
            size = size < 1 ? 1 : size;
            size = _.isNaN(size) ? oldSize : size;
            setRelatedsPageSize(size);
            let newPage = Math.floor((relatedPageSize / oldSize) * oldPage);
            // console.log("newPage: " + newPage + " oldPage: " + oldPage + " pageSize = " + relatedPageSize + " oldSize = " + oldSize);
            newPage = _.isNaN(newPage) ? 0 : newPage;
            pager.setPage(newPage);
        },
        getPageSize: () => {
            return relatedPageSize;
        },
        nextPage: () => {
            pager.setPage(pager.getPage() + 1);
        },
        prevPage: () => {
            pager.setPage(pager.getPage() - 1);
        },
        lastPage: () => {
            pager.setPage(pager.getMaxPage());
        },
        firstPage: () => {
            pager.setPage(0);
        },
    };

    // Added by ndg, 11/9/20, TODO: check that this doesn't override any other setTypes in kmaps
    // gk3k 12/11/2020, Optimizing and removing items that cause re-renders.
    // useEffect(() => {
    //     if (props.assetType && props.assetType !== '') {
    //         status.setType(props.assetType);
    //         status.setHeaderTitle('Loading ...');
    //     }
    // }, [props.assetType, status]);

    //gk3k: TODO: this is causing multiple re-renders. Disabling for now
    // ndg8f: Gerard, setUid() is what causes the change of state for kmaps. CANNOT comment out. Or kmap pages do not load.
    // TODO: Figure out how to reduce number of re-renders while still keeping this effect.
    useEffect(() => {
        if (id) {
            setUid(id);
            setRelatedsPage({
                related_type: relatedType,
                page: relatedPage,
                pageSize: relatedPageSize,
            });
        }
    }, [
        id,
        relatedType,
        relatedPage,
        relatedPageSize,
        // setUid,  // ndg8f: Leaving this out at it seems circular and unnecessary
        setRelatedsPage,
    ]);

    const ret_children = React.Children.map(props.children, (child) => {
        if (child.type) {
            const new_child = React.cloneElement(child, {
                id: id,
                kmap: kmap,
                kmasset: kmasset,
                relateds: relateds,
                pager: pager,
            });
            return new_child;
        } else {
            return child;
        }
    });
    //console.log('TermsAudioPlayerCtx', ret_children);
    return ret_children;
}
