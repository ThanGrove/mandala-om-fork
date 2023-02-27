import React, { useState, useEffect } from 'react';
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
import { SearchBuilder } from './SearchBuilder';
import { ArrayOfObjectsParam } from '../../hooks/utils';
import './AdvancedSearch.scss';

const SEARCH_PATH = '/search/:view';
const searchview = 'deck';

const AdvancedSearch = () => {
    const history = useHistory();

    const [qryrows, setRows] = useState([]);
    const [squery, setSQuery] = useState(false);
    const [count, setCount] = useState(1);

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    let { searchText: search, filters } = query;

    let rowdiv = <div className="query-rows-wrapper">{qryrows}</div>;
    let qlen = qryrows.length;
    useEffect(() => {
        rowdiv = <div className="query-rows-wrapper">{qryrows}</div>;
    }, [count]);

    const addRow = (typ) => {
        const newindex = qryrows.length + 1;
        const newrow =
            typ === 'date' ? (
                <QueryDateRow key={newindex} n={newindex} />
            ) : (
                <QueryRow key={newindex} n={newindex} />
            );
        qryrows.push(newrow);
        setRows(qryrows);
        setCount(count + 1);
    };
    const addQueryRow = (e) => {
        e.preventDefault();
        addRow('normal');
    };

    const addDateQueryRow = (e) => {
        e.preventDefault();
        addRow('date');
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
                        {rowdiv}
                        <div className="add-btns">
                            <button
                                className="btn btn-outline-secondary btn-lg"
                                onClick={addQueryRow}
                            >
                                Add Normal Row
                            </button>

                            <button
                                className="btn btn-outline-secondary btn-lg"
                                onClick={addDateQueryRow}
                            >
                                Add Date Row
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

const QueryRow = ({ n }) => {
    return (
        <div className="advsrch-form-row">
            <div>{n > 1 && <ConnectorSelect id={`advconn-${n}`} n={n} />}</div>
            <div className="field-select">
                <FieldSelect id={`advfield-${n}`} />
            </div>
            <div>
                <ScopeSelect id={`advscope-${n}`} />
            </div>
            <div>
                <SearchBox id={`advtext-${n}`} />
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

const FieldSelect = ({ id, name = false }) => {
    const [selectedValue, setSelectedValue] = useState(null);
    const setTree = treeStore((state) => state.setTree);
    const setBrowse = browseSearchToggle((state) => state.setBrowse);
    const setOpenTab = openTabStore((state) => state.changeButtonState);

    const handleSelect = (e) => {
        setSelectedValue(e.target.value);
    };
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
    return (
        <>
            <select id={id} name={name} onChange={handleSelect}>
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
            {selectedValue && ['13', '14', '15'].includes(selectedValue) && (
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

const SearchBox = ({ id, name = false }) => {
    name = name || id;
    return <input type="text" id={id} name={name} />;
};

const QueryDateRow = ({ n }) => {
    return (
        <div className="advsrch-form-row date">
            <div>{n > 1 && <ConnectorSelect id={`advconn-${n}`} n={n} />}</div>
            <div>
                <DateFieldSelect id={`advfield-${n}`} />
            </div>
            <div>
                <DateScopeSelect id={`advscope-${n}`} />
            </div>
            <div>
                <SearchBox id={`advtext-${n}`} />
            </div>
        </div>
    );
};

const DateFieldSelect = ({ id, name = false }) => {
    name = name || id;
    return (
        <select id={id} name={name}>
            <option value={SC.CREATE_DATE}>Creation Date</option>
            <option value={SC.ENTRY_DATE}>Data Entry Date</option>
        </select>
    );
};

const DateScopeSelect = ({ id, name = false }) => {
    name = name || id;
    return (
        <select id={id} name={name}>
            <option value={SC.LAST1YEAR}>in last year</option>
            <option value={SC.LAST5YEARS}>in last 5 years</option>
            <option value={SC.LAST10YEARS}>in last 10 years</option>
            <option value={SC.EXACTLY}>exactly</option>
            <option value={SC.BETWEEN}>between</option>
        </select>
    );
};

export default AdvancedSearch;
