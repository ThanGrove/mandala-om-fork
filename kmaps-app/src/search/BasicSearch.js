import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import qs from 'qs';
import * as PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
    useQueryParams,
    StringParam,
    withDefault,
    encodeQueryParams,
} from 'use-query-params';
import { stringify } from 'query-string';
import { ArrayOfObjectsParam } from '../hooks/utils';

const target = document.getElementById('basicSearchPortal');

export function BasicSearch(props) {
    const history = useHistory();
    const inputEl = useRef(null);

    // eslint-disable-next-line no-unused-vars
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    const { searchText: search, filters } = query;

    //const currText = '';
    // const [state, setState] = useState({searchString: {currText}});
    const handleSubmit = () => {
        //props.search.setSearchText(inputEl.current.value);
        //props.onSubmit(inputEl.current.value);
        //console.log('BasicSearch handleSubmit: ', inputEl.current.value);
        //setSearch(inputEl.current.value);
        //document.getElementById('advanced-search-tree-toggle').click();

        //encode each parameter according to the configuration
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
            //window.location.href = `${process.env.REACT_APP_STANDALONE_PATH}/#/search`;
            history.push({
                pathname: process.env.REACT_APP_STANDALONE_PATH,
                search: `?${stringify(encodedQuery)}`,
                hash: '#/search/deck',
            });
        } else {
            //history.push('/search/deck');
            history.push({
                pathname: `/search/deck`,
                search: `?${stringify(encodedQuery)}`,
            });
        }
    };
    const clearInput = () => {
        inputEl.current.value = '';
        //clearSearch();
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
                <input
                    type="text"
                    id="sui-search"
                    className="sui-search2"
                    defaultValue={search}
                    placeholder="Enter Search"
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
