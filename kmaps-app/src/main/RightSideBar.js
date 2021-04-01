import React, { useState, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { AdvancedToggle } from './MainSearchToggle/AdvancedToggle';
import './RightSideBar.css';
import MandalaSkeleton from '../views/common/MandalaSkeleton';
const TreeNav = React.lazy(() => import('./TreeNav'));
const SearchAdvanced = React.lazy(() => import('../search/SearchAdvanced'));

const target = document.getElementById('advancedSearchPortal');

export default function RightSideBar() {
    const [viewMode, setViewMode] = useState('advanced');
    const [state, setState] = useState({ advanced: true, tree: false });
    const handleStateChange = (new_state) => {
        setState({ ...state, ...new_state });
    };

    function chooseViewMode(mode) {
        setViewMode(mode);
        if (mode === 'off') {
            handleStateChange({ advanced: false, tree: false });
        } else if (mode === 'tree') {
            handleStateChange({ advanced: false, tree: true });
        } else if (mode === 'advanced') {
            handleStateChange({ advanced: true, tree: false });
        }
    }
    const advancedSearchPortal = (
        <section className="l-content__rightsidebar">
            <AdvancedToggle
                chooseViewMode={chooseViewMode}
                viewMode={'advanced'}
            />
            <div className="advanced-search-and-tree">
                {viewMode === 'advanced' && (
                    <SearchAdvanced advanced={state.advanced} />
                )}
                {viewMode === 'tree' && (
                    <Suspense fallback={<MandalaSkeleton />}>
                        <TreeNav tree={state.tree} />
                    </Suspense>
                )}
            </div>
        </section>
    );

    if (target) {
        return ReactDOM.createPortal(advancedSearchPortal, target);
    } else {
        return advancedSearchPortal;
    }
}
