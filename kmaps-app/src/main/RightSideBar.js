import React, { useState, Suspense } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Section } from 'react-simple-resizer';
import ReactDOM from 'react-dom';
import { closeStore, openTabStore } from '../hooks/useCloseStore';
import { browseSearchToggle } from '../hooks/useBrowseSearchToggle';
//import { AdvancedToggle } from './MainSearchToggle/AdvancedToggle';
import './RightSideBar.scss';
import MandalaSkeleton from '../views/common/MandalaSkeleton';
const TreeNav = React.lazy(() => import('./TreeNav'));
const SearchAdvanced = React.lazy(() => import('../search/SearchAdvanced'));

const target = document.getElementById('advancedSearchPortal');

export default function RightSideBar() {
    // Get Close Button state.
    // const closeButton = closeStore((state) => state.buttonState);

    const openTab = openTabStore((state) => state.openTab);
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
    const browseSearch =
        ['terms', 'places', 'subjects'].includes(baseType) || openTab == 2
            ? 'browse'
            : 'search';

    React.useEffect(() => {
        if (browseSearch !== browseSearchState) {
            switch (browseSearch) {
                case 'browse':
                    setBrowse(); // changes browseSearchState to "browse"
                    break;
                case 'search':
                    setSearch(); // changes browseSearchState to "search"
                    break;
                default:
                    break;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match?.url]);

    const advancedSearchPortal = (
        <Section
            className={`l-content__rightsidebar ${
                //closeButton ? 'openSideBar' : 'closeSideBar'
                openTab > 0 ? 'openSideBar' : 'closeSideBar'
            }`}
            maxSize={580}
            minSize={350}
            defaultSize={380}
        >
            <div className="advanced-search-and-tree">
                {browseSearchState === 'search' && (
                    <Suspense fallback={<MandalaSkeleton />}>
                        <SearchAdvanced advanced={true} />
                    </Suspense>
                )}
                {browseSearchState === 'browse' && (
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
