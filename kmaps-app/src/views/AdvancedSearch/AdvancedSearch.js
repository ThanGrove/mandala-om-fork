import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { stringify } from 'query-string';
import {
    useQueryParams,
    StringParam,
    withDefault,
    encodeQueryParams,
} from 'use-query-params';
import { openTabStore, treeStore } from '../../hooks/useCloseStore';
import { browseSearchToggle } from '../../hooks/useBrowseSearchToggle';

import * as SC from './SearchConstants';
import { buildQuery, getReadableQuery, SearchBuilder } from './SearchBuilder';
import { ArrayOfObjectsParam } from '../../hooks/utils';
import './AdvancedSearch.scss';
import { needsDateString, RESOURCE_TYPE } from './SearchConstants';
import { MdDeleteForever } from 'react-icons/all';
import Form from 'react-bootstrap/Form';

const SEARCH_PATH = '/search/:view';
const searchview = 'deck';

const rowid = (n) => {
    const rnd = Math.floor(Math.random() * 1000);
    return `query-row-${n}-${rnd}`;
};

const AdvancedSearch = () => {
    const history = useHistory();
    const firstid = rowid(0);
    const firstrow = <QueryRow key={firstid} id={firstid} n={0} />;
    const [qryrows, setRows] = useState([firstrow]);
    const [squery, setSQuery] = useState(false);
    const [delrow, setDel] = useState(false);
    const [showQuery, setShowQuery] = useState(false);

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    let { searchText: search, filters } = query;

    useEffect(() => {
        if (delrow) {
            const rowids = qryrows.map((rw, rwi) => {
                return rw.props.id;
            });
            if (rowids?.includes(delrow)) {
                // console.log("Need to delete row", delrow);
                let newrows = [...qryrows];
                newrows = newrows.filter((rw, ri) => {
                    return rw?.props?.id !== delrow;
                });
                setRows(newrows);
            } else {
                setDel(false);
            }
        }
    }, [delrow]);

    const deleteRow = (id) => {
        setDel(id);
    };

    const addRow = (e) => {
        e.preventDefault();
        let count = qryrows?.length || 0;
        const myid = rowid(count);
        const newrows = [...qryrows];
        newrows.push(
            <QueryRow key={myid} n={count} id={myid} delfunc={deleteRow} />
        );
        setRows(newrows);
    };

    const buildRowList = () => {
        const form = document.getElementById('mdl-advsearch-form');
        const rowels = form.querySelectorAll('.advsrch-form-row');
        const rowlist = [];

        rowels.forEach((el, n) => {
            const inputs = el.querySelectorAll('input, select');
            const isFirst = n === 0;
            const aug = isFirst ? 0 : 1;
            const fieldval = inputs[0 + aug].value;
            const isdate = SC.isDate(fieldval);
            const connval = !isFirst ? inputs[0].value : false;
            const scopeval = inputs[1 + aug].value;
            const textval = inputs[2 + aug].value;
            // Ignore rows with empty text boxes when relevant
            if (typeof textval === 'string' && textval.trim() === '') {
                if (
                    (isdate && SC.needsDateString(scopeval)) ||
                    fieldval === SC.RESOURCE_TYPE
                ) {
                    return;
                }
            }

            let row = {
                isdate: isdate,
                conn: connval,
                field: fieldval,
                scope: scopeval,
                text: textval,
            };
            rowlist.push(row);
        });
        // console.log("Rowlist just built", rowlist);
        return rowlist;
    };

    const submitForm = (e) => {
        e.preventDefault();
        const rows = buildRowList();

        if (rows?.length > 0) {
            const newqry = buildQuery(rows);
            // console.log('new query', newqry);
            setSQuery(newqry);
            document.getElementById('advanced-search-tree-toggle').click();
            if (!searchView) {
                const encodedQuery = encodeQueryParams(
                    {
                        searchText: StringParam,
                        filters: withDefault(ArrayOfObjectsParam, []),
                    },
                    {
                        searchText: `advSearch:${newqry}`,
                        filters: [...filters],
                    }
                );
                if (process.env.REACT_APP_STANDALONE === 'standalone') {
                    window.location.hash = `#/search/${searchview}?${stringify(
                        encodedQuery
                    )}`;
                } else {
                    //history.push('/search/deck');
                    history.push({
                        pathname: `/search/` + searchview,
                        search: `?${stringify(encodedQuery)}`,
                    });
                }
            } else {
                setQuery(
                    {
                        searchText: `advSearch:${newqry}`,
                        filters: [...filters],
                    },
                    'push'
                );
            }
        }
        return false;
    };

    const clearForm = (e) => {
        e.preventDefault();
        setRows([]);
    };

    const revealQuery = (e) => {
        e.preventDefault();
        setShowQuery(true);
        const rows = buildRowList();
        if (rows?.length > 0) {
            const builder = new SearchBuilder(rows);
            const newqry = builder.buildQuery();
            setSQuery(newqry);
            if (e.target.id === 'show-results') {
                let surl =
                    'https://mandala-solr-proxy-dev.internal.lib.virginia.edu/solr/kmassets/select?fl=*&wt=json&echoParams=explicit&q=' +
                    newqry;
                surl = encodeURI(surl);
                window.open(surl, '_blank');
            }
        }
    };

    const readableQuery = (e) => {
        e.preventDefault();
        setShowQuery(true);
        const rows = buildRowList();
        const rq = getReadableQuery(rows);
        setSQuery(rq);
    };

    return (
        <div className="advanced-search-wrap">
            <form
                id="mdl-advsearch-form"
                className="search-form"
                data-rows={qryrows?.length}
            >
                <div className="mb-3">
                    <h4 className="title">Advanced Search</h4>
                    <div className="query-rows">
                        <div className="query-rows-wrapper">
                            {qryrows}
                            <div className="add-btns">
                                <button
                                    className="btn btn-secondary btn-lg rounded"
                                    onClick={addRow}
                                >
                                    Add Row
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="my-4"></hr>
                <div className="action-btns">
                    <button
                        className="btn btn-primary btn-lg m-2"
                        onClick={submitForm}
                    >
                        Submit
                    </button>
                    ||
                    <button
                        className="btn btn-outline-primary btn-lg m-2"
                        onClick={clearForm}
                    >
                        Clear
                    </button>
                </div>
            </form>
            <div className="card output">
                <div className="card-header">
                    {'Current Query (Show ... '}
                    <a onClick={revealQuery} className="action">
                        Query
                    </a>
                    {' | '}
                    <a
                        id="show-results"
                        onClick={revealQuery}
                        className="action"
                    >
                        Results
                    </a>
                    {' | '}
                    <a
                        id="show-readable"
                        onClick={readableQuery}
                        className="action"
                    >
                        Summary
                    </a>
                    )
                </div>
                <div className="card-body">
                    {showQuery && (
                        <Form.Control
                            as="textarea"
                            className="query-code"
                            rows={5}
                            value={squery}
                            readOnly={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const QueryRow = ({ n, id, delfunc }) => {
    const [rowType, setRowType] = useState('normal');
    const [hasSearchBox, setHasSearchBox] = useState(true);
    const dateSelect = useRef();
    useEffect(() => {
        if (rowType === 'date') {
            const choice = dateSelect?.current?.value;
            setHasSearchBox(SC.needsDateString(choice));
        } else if (rowType === 'assettype') {
            setHasSearchBox(false);
        } else {
            setHasSearchBox(true);
        }
    }, [rowType]);
    const deleteme = () => {
        delfunc(id);
    };
    return (
        <div className="advsrch-form-row" id={id} data-n={n}>
            <div>
                {n > 0 && (
                    <ConnectorSelect
                        id={`advconn-${n}`}
                        n={n}
                        className="connector"
                    />
                )}
            </div>
            <div className="field-select">
                <FieldSelect
                    id={`advfield-${n}`}
                    setType={setRowType}
                    className="field"
                />
            </div>
            <div>
                {rowType === 'normal' && (
                    <ScopeSelect id={`advscope-${n}`} className="scope" />
                )}
                {rowType === 'date' && (
                    <DateScopeSelect
                        id={`advscope-${n}`}
                        className="scope"
                        setSearchBox={setHasSearchBox}
                        selel={dateSelect}
                    />
                )}
                {rowType === 'assettype' && (
                    <AssetTypeSelect
                        id={`advscope-${n}`}
                        className="scope asset"
                        setSearchBox={setHasSearchBox}
                        selel={dateSelect}
                    />
                )}
            </div>
            <div>
                <SearchBox
                    id={`advtext-${id}`}
                    disable={!hasSearchBox}
                    className="textbox"
                />
            </div>
            <div className="row-delete">
                {n > 0 && <MdDeleteForever onClick={deleteme} />}
            </div>
        </div>
    );
};

const ConnectorSelect = ({ id, name = false, n }) => {
    name = name || id;
    return (
        <select id={id} name={name}>
            <option value={SC.AND}>And</option>
            <option value={SC.ANDNOT}>And Not</option>
            <option value={SC.OR}>Or</option>
        </select>
    );
};

const FieldSelect = ({ id, setType, name = false }) => {
    const [selectedValue, setSelectedValue] = useState(null);
    const setTree = treeStore((state) => state.setTree);
    const setBrowse = browseSearchToggle((state) => state.setBrowse);
    const setOpenTab = openTabStore((state) => state.changeButtonState);

    const handleBtnClick = (e) => {
        e.preventDefault();
        setOpenTab(2);
        setBrowse();
        const treeEnum = {
            13: 'places',
            14: 'subjects',
            15: 'terms',
        };
        setTree(treeEnum[selectedValue]);
    };
    name = name || id;
    const selel = useRef();
    const ichanged = () => {
        const choice = selel.current.value * 1;
        // console.log('ichanged', choice);
        setSelectedValue(choice);
        if (SC.isDate(choice)) {
            setType('date');
            console.log('Its a date!');
        } else if (choice === SC.RESOURCE_TYPE) {
            setType('assettype');
        } else {
            setType('normal');
        }
    };
    return (
        <>
            <select id={id} name={name} ref={selel} onChange={ichanged}>
                <option value={SC.ANY}>Any</option>
                <option value={SC.TITLE}>Title/Header</option>
                <option value={SC.RESOURCE_TYPE}>Resource Type</option>
                <option value={SC.PERSON}>Person</option>
                <option value={SC.REL_PLACES}>Related Places</option>
                <option value={SC.REL_SUBJECTS}>Related Subjects</option>
                <option value={SC.REL_TERMS}>Related Terms</option>
                <option value={SC.PUB_PLACE}>Place of Publication</option>
                <option value={SC.PUBLISHER}>Publisher</option>
                <option value={SC.IDS}>ID Numbers</option>
                <option value={SC.CREATE_DATE}>Create Date</option>
                <option value={SC.ENTRY_DATE}>Upload Date</option>
            </select>
            {selectedValue && [13, 14, 15].includes(selectedValue) && (
                <span>
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={handleBtnClick}
                    >
                        Open Related Tree
                    </button>
                </span>
            )}
        </>
    );
};

const ScopeSelect = ({ id, name = false }) => {
    name = name || id;
    return (
        <select id={id} name={name}>
            <option value={SC.CONTAINS}>Contains</option>
            <option value={SC.EXACTLY}>Exactly</option>
            <option value={SC.STARTSWITH}>Starts With</option>
            <option value={SC.ENDSWITH}>Ends With</option>
        </select>
    );
};

const SearchBox = ({ id, disable, name = false }) => {
    name = name || id;

    return <input type="text" id={id} name={name} disabled={disable} />;
};

const DateScopeSelect = ({ id, setSearchBox, selel, name = false }) => {
    name = name || id;
    const ichanged = () => {
        const choice = selel.current.value;
        if (SC.needsDateString(choice)) {
            setSearchBox(true);
        } else {
            setSearchBox(false);
        }
    };
    return (
        <select id={id} name={name} ref={selel} onChange={ichanged}>
            <option value={SC.LAST1YEAR}>in last year</option>
            <option value={SC.LAST5YEARS}>in last 5 years</option>
            <option value={SC.LAST10YEARS}>in last 10 years</option>
            <option value={SC.EXACTLY}>exactly</option>
            <option value={SC.BETWEEN}>between</option>
        </select>
    );
};

const AssetTypeSelect = ({ id, setSearchBox, selel, name = false }) => {
    name = name || id;
    return (
        <select id={id} name={name} ref={selel} className="asset-select">
            {Object.keys(SC?.ASSET_TYPES).map((ak, ki) => {
                return (
                    <option key={`atopt-${ki}`} value={ak}>
                        {SC?.ASSET_TYPES[ak]}
                    </option>
                );
            })}
        </select>
    );
};

export default AdvancedSearch;
