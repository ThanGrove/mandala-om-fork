import React, { useState, Suspense } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Section } from 'react-simple-resizer';
import ReactDOM from 'react-dom';
import { closeStore } from '../hooks/useCloseStore';
import { browseSearchToggle } from '../hooks/useBrowseSearchToggle';
//import { AdvancedToggle } from './MainSearchToggle/AdvancedToggle';
import './RightSideBar.scss';
import MandalaSkeleton from '../views/common/MandalaSkeleton';
const TreeNav = React.lazy(() => import('./TreeNav'));
const SearchAdvanced = React.lazy(() => import('../search/SearchAdvanced'));

const target = document.getElementById('advancedSearchPortal');

export default function RightSideBar() {
    // Get Close Button state.
    const closeButton = closeStore((state) => state.buttonState);

    const browseSearchState = browseSearchToggle((state) => state.browseSearch);
    const setSearch = browseSearchToggle((state) => state.setSearch);
    const setBrowse = browseSearchToggle((state) => state.setBrowse);

    // Get the baseType for the route.
    const match = useRouteMatch([
        '/:baseType/:id/related-:type/:definitionID/view/:relID',
        '/:baseType/:id/related-:type/:definitionID/:viewMode',
        '/:baseType/:id/related-:type',
        '/:baseType/:id',
    ]);
    const baseType = match?.params.baseType || 'none';
    const browseSearch = ['terms', 'places', 'subjects'].includes(baseType)
        ? 'browse'
        : 'search';
    if (browseSearch !== browseSearchState) {
        switch (browseSearch) {
            case 'browse':
                setBrowse();
                break;
            case 'search':
                setSearch();
                break;
            default:
                break;
        }
    }

    const advancedSearchPortal = (
        <Section
            className={`l-content__rightsidebar ${
                closeButton ? 'openSideBar' : 'closeSideBar'
            }`}
            maxSize={580}
            minSize={350}
            defaultSize={380}
        >
            <div className="advanced-search-and-tree">
                {browseSearch === 'search' && (
                    <Suspense fallback={<MandalaSkeleton />}>
                        <SearchAdvanced advanced={true} />
                    </Suspense>
                )}
                {browseSearch === 'browse' && (
                    <Suspense fallback={<MandalaSkeleton />}>
                        <TreeNav tree={true} />
                    </Suspense>
                )}
            </div>
        </Section>
    );

    if (target) {
        return ReactDOM.createPortal(advancedSearchPortal, target);
    } else {
        return advancedSearchPortal;
    }
}
