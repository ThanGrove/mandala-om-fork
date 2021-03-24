import React, { useState } from 'react';
import { FeatureCollection } from './common/FeatureCollection';
import { useSearchStore } from '../hooks/useSearchStore';
import { useFilterStore } from '../hooks/useFilterStore';
import { useSearch } from '../hooks/useSearch';
import qs from 'qs';
import { useLocation, useParams } from 'react-router-dom';
import _ from 'lodash';

const searchSelector = (state) => state.search;
const setSearchSelector = (state) => state.setSearch;

const filtersSelector = (state) => state.filters;
const addMultipleFiltersSelector = (state) => state.addMultipleFilters;

export function SearchViewer() {
    //const history = useHistory();
    const location = useLocation();
    const { viewMode } = useParams();

    const search = useSearchStore(searchSelector);
    const setSearch = useSearchStore(setSearchSelector);

    const filters = useFilterStore(filtersSelector);
    const addMultipleFilters = useFilterStore(addMultipleFiltersSelector);

    // Only do these transformations if history location is not internal
    if (!location.state?.interal) {
        const queryObject = qs.parse(location.search, {
            allowDots: true,
            ignoreQueryPrefix: true,
        });
        // Check if searchText is in queryObject, if not put one with empty string
        if (!queryObject?.searchText) {
            queryObject.searchText = '';
        }

        // Get search first from Store and only setSearch if it is different from search Query string.
        if (
            _.isEmpty(search.trim()) &&
            search.trim() !== queryObject.searchText.trim()
        ) {
            setSearch(queryObject.searchText);
        }

        let newFilters = [];
        // Check to make sure the filters are in state and if not add them
        for (const [key, value] of Object.entries(queryObject)) {
            if (!isNaN(parseInt(key, 10))) {
                newFilters.push(value);
            }
        }
        // From the newFilters array, remove all filters from state if present to prevent duplicates.
        const dedupedNewFilters = _.differenceWith(
            newFilters,
            filters,
            (arrVal, OthVal) => arrVal.id === OthVal.id
        );
        if (dedupedNewFilters.length > 0) {
            addMultipleFilters(dedupedNewFilters);
        }
    }

    const [perPage, setPerPage] = useState(100); // These are the rows returned
    const [page, setPage] = useState(0); // Start will always be page * perPage
    const {
        isLoading: isSearchLoading,
        data: searchData,
        isError: isSearchError,
        error: searchError,
        isPreviousData,
    } = useSearch(search, page, perPage, 'none', 0, 0, true, filters);

    if (isSearchLoading) {
        return (
            <div>
                <span>SearchScreen Loading Skeleton</span>
            </div>
        );
    }

    if (isSearchError) {
        return (
            <div>
                <span>Error: {searchError.message}</span>
            </div>
        );
    }

    const docs = searchData.response?.docs ?? [];
    const numFound = searchData.response?.numFound ?? 0;
    let output = (
        <FeatureCollection
            docs={docs}
            viewMode={viewMode}
            inline={false}
            page={page}
            setPage={setPage}
            perPage={perPage}
            setPerPage={setPerPage}
            isPreviousData={isPreviousData}
            assetCount={numFound}
            showSearchFilters={true}
            hasMore={numFound <= page * perPage + perPage ? false : true}
        />
    );
    return output;
}
