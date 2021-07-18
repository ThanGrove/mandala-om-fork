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
import { stringify } from 'query-string';
import { ArrayOfObjectsParam } from '../hooks/utils';

const target = document.getElementById('basicSearchPortal');
const SEARCH_PATH = '/search/:view';

export function BasicSearch(props) {
    const history = useHistory();
    const inputEl = useRef(null);

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);

    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    const { searchText: search, filters } = query;

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
                    filters,
                }
            );
            if (process.env.REACT_APP_STANDALONE === 'standalone') {
                window.location.href = `${
                    process.env.REACT_APP_STANDALONE_PATH
                }/#/search/deck?${stringify(encodedQuery)}`;
            } else {
                //history.push('/search/deck');
                history.push({
                    pathname: `/search/deck`,
                    search: `?${stringify(encodedQuery)}`,
                });
            }
        } else {
            setQuery(
                {
                    searchText: inputEl.current.value,
                    filters,
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

    const basicSearchPortal = (
        <>
            <div className="sui-search1">
                <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 16 16"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill-rule="evenodd"
                        d="M10.442 10.442a1 1 0 011.415 0l3.85 3.85a1 1 0 01-1.414 1.415l-3.85-3.85a1 1 0 010-1.415z"
                        clip-rule="evenodd"
                    ></path>
                    <path
                        fill-rule="evenodd"
                        d="M6.5 12a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM13 6.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
                <input
                    key={search}
                    type="text"
                    id="sui-search"
                    className="sui-search2"
                    defaultValue={search}
                    placeholder="Search"
                    onKeyDownCapture={handleKey}
                    ref={inputEl}
                />
                <span className={'l-search__input__buttons'}>
                    <span
                        id="sui-searchgo"
                        className="sui-search4"
                        onClick={handleSubmit}
                    >
                        <span className={'icon'}></span>
                    </span>
                    <span
                        id="sui-clear"
                        className="sui-search3"
                        onClick={clearInput}
                    >
                        {' '}
                        x{' '}
                    </span>
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
