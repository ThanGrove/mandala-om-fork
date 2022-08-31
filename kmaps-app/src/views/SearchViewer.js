import React, { useState } from 'react';
import { FeatureCollection } from './common/FeatureCollection';
import { useFilterStore } from '../hooks/useFilterStore';
import { useRecentSearch } from '../hooks/useRecentSearch';
import { useSearch } from '../hooks/useSearch';
import { useParams } from 'react-router-dom';
import { useQueryParams, StringParam, withDefault } from 'use-query-params';
import { ArrayOfObjectsParam } from '../hooks/utils';
import MandalaSkeleton from './common/MandalaSkeleton';
import { openTabStore } from '../hooks/useCloseStore';
import { browseSearchToggle } from '../hooks/useBrowseSearchToggle';

export function SearchViewer() {
    const { viewMode } = useParams();
    const setOpenTab = openTabStore((state) => state.changeButtonState);
    const setSearch = browseSearchToggle((state) => state.setSearch);

    // eslint-disable-next-line no-unused-vars
    const [query, setQuery] = useQueryParams({
        searchText: StringParam,
        filters: withDefault(ArrayOfObjectsParam, []),
    });
    const addSearchPage = useRecentSearch((state) => state.addSearchPage);
    let { searchText: search, filters } = query;

    const [perPage, setPerPage] = useState(50); // These are the rows returned
    const [page, setPage] = useState(0); // Start will always be page * perPage
    const start_row = page * perPage;
    const {
        isLoading: isSearchLoading,
        data: searchData,
        isError: isSearchError,
        error: searchError,
        isPreviousData,
    } = useSearch(search, start_row, perPage, 'none', 0, 0, true, filters);

    if (isSearchLoading) {
        return (
            <div>
                <MandalaSkeleton />
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

    // Add the search page and filters to the store.
    addSearchPage(query);

    // Open the search tab
    setOpenTab(1);
    setSearch();

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
