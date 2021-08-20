import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { useSolr } from '../../hooks/useSolr';
import { MandalaPopover } from '../common/MandalaPopover';
import { Col, Container, Row } from 'react-bootstrap';
import { FeaturePager } from '../common/FeaturePager/FeaturePager';
import { useParams } from 'react-router-dom';
import { useHistory } from '../../hooks/useHistory';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../common/utils';

export function SubjectsRelPlacesViewer(props) {
    let { id } = useParams();
    const baseType = 'subjects';
    const addPage = useHistory((state) => state.addPage);
    // const history = useContext(HistoryContext);
    // console.log("in subject", history);
    const {
        isLoading: isKmapLoading,
        data: kmap,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');

    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [colSize, setColSize] = useState(20);

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmap]);

    const uid = kmap?.uid;
    const kid = uid?.split('-')[1] * 1;

    // Construct Solr query and useSolr call
    // TODO: generalize to do both places and subjects. This is just for related places of subjects now.
    const q = {
        index: 'terms',
        params: {
            q:
                '({!parent which=block_type:parent}related_subjects_id_s:' +
                uid +
                ' AND tree:places) OR feature_type_id_i:' +
                kid,
            fl: 'tree,uid,uid_i,header,origin_uid_s',
            sort: 'header ASC',
            rows: pageSize,
            start: startRow,
        },
    };

    const {
        isLoading: isPlaceDataLoading,
        data: placedata,
        isError: isPlaceDataError,
        error: placeDataError,
    } = useSolr(uid + '-related-places', q);
    console.log('placedata', placedata);
    const placeids = $.map(placedata?.docs, function (item, n) {
        return item.origin_uid_s;
    });
    const plcnmquery = {
        index: 'terms',
        params: {
            q: 'id: (' + placeids.join(' ') + ')',
            fl: 'uid,header',
            sort: 'header ASC',
            rows: placeids.length,
            start: 0,
        },
    };
    // Query to get related place headers
    const nmres = useSolr(uid + 'related-place-names', plcnmquery);
    let nmlist = new Object();
    $.each(nmres.docs, (n, item) => {
        nmlist[item['uid']] = item['header'];
    });
    const numFound = placedata?.numFound ? placedata?.numFound : 0;

    const pager = {
        numFound: numFound,
        getMaxPage: () => {
            return Math.floor(pager.numFound / pager.getPageSize());
        },
        getPage: () => {
            return pageNum;
        },
        setPage: (pg) => {
            pg = parseInt(pg);
            if (!isNaN(pg) && pg > -1 && pg <= pager.getMaxPage()) {
                setPageNum(pg);
                pager.pgnum = pg;
            }
        },
        setPageSize: (size) => {
            size = parseInt(size);
            if (!isNaN(size) && size > 0 && size < 101) {
                setPageSize(size);
                pager.pgsize = size;
            }
        },
        getPageSize: () => {
            return pageSize;
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

    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    // Process into list items
    const placeitems = $.map(placedata?.docs, function (item, n) {
        const rndn = Math.ceil(Math.random() * 10000);

        if (item.uid.includes('_featureType')) {
            const uid = item.origin_uid_s;
            const iheader = uid in nmlist ? nmlist[uid] : 'Loading...';
            const mykey = uid + '-' + rndn;
            const pts = uid.split('-');
            if (pts.length === 2) {
                return (
                    <li key={mykey}>
                        <MandalaPopover
                            domain={pts[0]}
                            kid={pts[1]}
                            children={[iheader]}
                        />
                    </li>
                );
            }
        } else {
            const mykey = item.uid + '-' + n + rndn;
            const kid = item.uid.replace('places-', '');
            return (
                <li key={mykey}>
                    <MandalaPopover
                        domain={item.tree}
                        kid={kid}
                        children={[item.header]}
                    />
                </li>
            );
        }
    });
    const chunks = chunkIt(placeitems, colSize);
    return (
        <Container fluid className={'c-relplaces-list kmap-related subjects'}>
            <h3 className={'row'}>Related Places </h3>
            {numFound > pageSize && (
                <FeaturePager
                    pager={pager}
                    position={'top'}
                    className={'row'}
                />
            )}
            <Row>
                {$.map(chunks, function (chk, n) {
                    return (
                        <Col md={3} key={`chunk-col-${n}`}>
                            <ul>{chk}</ul>
                        </Col>
                    );
                })}
            </Row>
            {numFound > pageSize && (
                <FeaturePager
                    pager={pager}
                    position={'bottom'}
                    className={'row'}
                />
            )}
        </Container>
    );
}

function chunkIt(list, num_of_chunks) {
    if (
        typeof list === 'undefined' ||
        list.length < 1 ||
        typeof num_of_chunks === 'undefined' ||
        isNaN(num_of_chunks) ||
        num_of_chunks < 1
    ) {
        return list;
    }
    const chunks = [];
    const size = 25;
    while (list.length) {
        const chunk = list.splice(0, size);
        chunks.push(chunk);
    }
    return chunks;
}
