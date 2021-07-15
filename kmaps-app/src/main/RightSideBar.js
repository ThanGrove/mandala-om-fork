import React, { useState, Suspense } from 'react';
import { Section } from 'react-simple-resizer';
import ReactDOM from 'react-dom';
import { closeStore } from '../hooks/useCloseStore';
import { browseSearchToggle } from '../hooks/useBrowseSearchToggle';
//import { AdvancedToggle } from './MainSearchToggle/AdvancedToggle';
import './RightSideBar.css';
import MandalaSkeleton from '../views/common/MandalaSkeleton';
const TreeNav = React.lazy(() => import('./TreeNav'));
const SearchAdvanced = React.lazy(() => import('../search/SearchAdvanced'));

const target = document.getElementById('advancedSearchPortal');

export default function RightSideBar() {
    // Get Close Button state.
    const closeButton = closeStore((state) => state.buttonState);

    const browseSearch = browseSearchToggle((state) => state.browseSearch);

    const advancedSearchPortal = (
        <Section
            className={`l-content__rightsidebar ${
                closeButton ? 'openSideBar' : 'closeSideBar'
            }`}
            maxSize={500}
            minSize={350}
            defaultSize={350}
        >
            <div className="advanced-search-and-tree">
                {browseSearch === 'search' && (
                    <SearchAdvanced advanced={true} />
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
