import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
    useQueryParams,
    StringParam,
    withDefault,
    encodeQueryParams,
} from 'use-query-params';
import { useStatus } from '../hooks/useStatus';
import { stringify } from 'query-string';
import { ArrayOfObjectsParam } from '../hooks/utils';
import { standaloneSettings } from '../views/common/utils';
import { Cookies } from 'react-cookie';

const target = document.getElementById('basicSearchPortal');
const SEARCH_PATH = '/search/:view';

export function BasicSearch(props) {
    const history = useHistory();
    const inputEl = useRef(null);
    const cookie = new Cookies();
    let searchview = cookie?.get('searchview');
    if (!searchview || searchview.length == 0) {
        searchview = process.env?.REACT_APP_SEARCH_VIEW_DEFAULT || 'list';
        cookie.set('searchview', searchview);
    }

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);

    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    let { searchText: search, filters } = query;

    const handleSubmit = () => {
        document.getElementById('advanced-search-tree-toggle').click();
        if (!searchView) {
            const encodedQuery = encodeQueryParams(
                {
                    searchText: StringParam,
                    filters: withDefault(ArrayOfObjectsParam, []),
                },
                {
                    searchText: inputEl.current.value,
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
                    searchText: inputEl.current.value,
                    filters: [...filters],
                },
                'push'
            );
        }
    };
    const clearInput = () => {
        inputEl.current.value = '';
        setQuery(
            {
                searchText: '',
                filters,
            },
            'push'
        );
    };
    const handleKey = (x) => {
        // submit on return
        if (x.keyCode === 13) {
            handleSubmit();
        }
    };

    function cleanSearch(srch) {
        let newSearch = '';
        if (!srch.startsWith('advSearch')) {
            newSearch = srch;
        }
        return newSearch;
    }

    const basicSearchPortal = (
        <>
            <div className="sui-search1">
                <input
                    key={search}
                    type="text"
                    id="sui-search"
                    className="sui-search2"
                    defaultValue={decodeURIComponent(cleanSearch(search || ''))}
                    placeholder="Search &amp; Explore!"
                    onKeyDownCapture={handleKey}
                    ref={inputEl}
                />

                <span
                    id="sui-clear"
                    className="sui-search3"
                    onClick={clearInput}
                >
                    {' '}
                </span>
                <span
                    id="sui-searchgo"
                    className="sui-search4"
                    onClick={handleSubmit}
                >
                    <span className={'icon shanticon-magnify'}></span>
                </span>
            </div>
        </>
    );

    if (target) {
        return ReactDOM.createPortal(basicSearchPortal, target);
    } else {
        return basicSearchPortal;
    }
}

BasicSearch.propTypes = { onChange: PropTypes.func };
