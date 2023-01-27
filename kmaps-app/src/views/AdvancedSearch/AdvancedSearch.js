import React, { useState, useEffect } from 'react';
import * as SC from './SearchConstants';
import { SearchBuilder } from './SearchBuilder';
import './AdvancedSearch.scss';

const AdvancedSearch = () => {
    const [qryrows, setRows] = useState([]);
    const [squery, setQuery] = useState(false);
    const [count, setCount] = useState(1);

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
            // console.log("new query", newqry);
            setQuery(newqry);
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
                <hr class="my-4"></hr>
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
            <div>
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
    name = name || id;
    return (
        <select id={id} name={name}>
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
