import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { stringify } from 'query-string';
import {
    useQueryParams,
    StringParam,
    withDefault,
    encodeQueryParams,
} from 'use-query-params';
import * as SC from './SearchConstants';
import { SearchBuilder } from './SearchBuilder';
import { ArrayOfObjectsParam } from '../../hooks/utils';
import './AdvancedSearch.scss';
import { needsDateString } from './SearchConstants';
import { MdDeleteForever } from 'react-icons/all';

const SEARCH_PATH = '/search/:view';
const searchview = 'deck';

const AdvancedSearch = () => {
    const history = useHistory();

    const [qryrows, setRows] = useState([]);
    const [squery, setSQuery] = useState(false);
    const [count, setCount] = useState(0);

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    let { searchText: search, filters } = query;

    useEffect(() => {
        const qr = <QueryRow key={`query-row-${Date.now()}`} n={count} />;
        qryrows.push(qr);
        setRows(qryrows);
        setCount(count + 1);
    }, []);

    const deleteRow = (id) => {
        const delind = qryrows.findIndex((el) => el.key === id);
        console.log('delind', delind);
        if (delind < qryrows.length) {
            let newrows = qryrows
                .slice(0, delind)
                .concat(qryrows.slice(delind + 1));
            console.log(qryrows, newrows);
            setRows(newrows);
        }
    };

    const addRow = (typ) => {
        setCount(count + 1);
        const mykey = `query-row-${Date.now()}`;
        const newrow = (
            <QueryRow key={mykey} n={count} id={mykey} delfunc={deleteRow} />
        );
        qryrows.push(newrow);
        setRows(qryrows);
    };

    const addQueryRow = (e) => {
        e.preventDefault();
        addRow('normal');
    };

    const submitForm = (e) => {
        e.preventDefault();
        const form = document.getElementById('myform');
        if (!form) {
            console.log('No form element!');
            return;
        }
        const formels = form.elements;

        const numrows = form.dataset.rows * 1;
        const rows = [];
        for (let rn = 0; rn < numrows; rn++) {
            let rownum = rn + 1;
            let fielditem = formels.namedItem(`advfield-${rownum}`); // use one field to determine if date row
            if (fielditem) {
                let isdaterow = fielditem
                    ?.closest('.advsrch-form-row')
                    ?.classList?.contains('date');
                if (isdaterow) {
                    console.log('Row ' + rownum + ' is a date row!');
                }
                let row = {
                    isdate: isdaterow,
                    conn:
                        rn > 0
                            ? formels.namedItem(`advconn-${rownum}`)?.value
                            : false,
                    field: fielditem.value,
                    scope: formels.namedItem(`advscope-${rownum}`)?.value,
                    text: formels.namedItem(`advtext-${rownum}`)?.value,
                };
                rows.push(row);
            }
        }
        if (rows?.length > 0) {
            const builder = new SearchBuilder(rows);
            const newqry = builder.buildQuery();
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

    const clearForm = () => {
        setRows([]);
    };

    let surl =
        'https://mandala-solr-proxy-dev.internal.lib.virginia.edu/solr/kmassets/select?fl=*&wt=json&echoParams=explicit&q=' +
        squery;
    surl = encodeURI(surl);
    return (
        <div className="advanced-search-wrap">
            <form id="myform" className="search-form" data-rows={count}>
                <div className="mb-3">
                    <h4 className="title">Advanced Search</h4>
                    <div className="query-rows">
                        <div className="query-rows-wrapper">{qryrows}</div>
                        <div className="add-btns">
                            <button
                                className="btn btn-secondary btn-lg rounded"
                                onClick={addQueryRow}
                            >
                                Add Row
                            </button>
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
                <div className="card-header">Results</div>
                <div className="card-body">
                    <p>
                        <small>Try out the query: </small>
                        <a
                            href={surl}
                            target="_blank"
                            className="btn btn-outline-warning btn-sm"
                        >
                            Click here
                        </a>
                    </p>
                    {squery && (
                        <pre className="querypre">
                            <code>{squery}</code>
                        </pre>
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
        } else {
            setHasSearchBox(true);
        }
    }, [rowType]);
    const deleteme = () => {
        delfunc(id);
    };
    return (
        <div className="advsrch-form-row" id={id}>
            <div>{n > 0 && <ConnectorSelect id={`advconn-${n}`} n={n} />}</div>
            <div>
                <FieldSelect id={`advfield-${n}`} setType={setRowType} />
            </div>
            <div>
                {rowType === 'normal' && <ScopeSelect id={`advscope-${n}`} />}
                {rowType === 'date' && (
                    <DateScopeSelect
                        id={`advscope-${n}`}
                        setSearchBox={setHasSearchBox}
                        selel={dateSelect}
                    />
                )}
            </div>
            <div>
                <SearchBox id={`advtext-${id}`} disable={!hasSearchBox} />
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
    name = name || id;
    const selel = useRef();
    const ichanged = () => {
        const choice = selel.current.value;
        if (SC.isDate(choice)) {
            setType('date');
        } else {
            setType('normal');
        }
    };
    return (
        <select id={id} name={name} ref={selel} onChange={ichanged}>
            <option value={SC.ANY}>Any</option>
            <option value={SC.TITLE}>Title</option>
            <option value={SC.PERSON}>Person</option>
            <option value={SC.REL_PLACES}>Related Places</option>
            <option value={SC.REL_SUBJECTS}>Related Subjects</option>
            <option value={SC.REL_TERMS}>Related Terms</option>
            <option value={SC.PUB_PLACE}>Place of Publication</option>
            <option value={SC.PUBLISHER}>Publisher</option>
            <option value={SC.IDS}>ID Numbers</option>
            <option value={SC.CREATE_DATE}>Create Date</option>
            <option value={SC.ENTRY_DATE}>Upload Date</option>
            <option value={SC.RESOURCE_TYPE}>Resource Type</option>
        </select>
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

export default AdvancedSearch;
