import React, { useState, useEffect } from 'react';
import { closeStore } from '../../hooks/useCloseStore';
import { browseSearchToggle } from '../../hooks/useBrowseSearchToggle';
import { ADVANCED_LABEL, BASIC_LABEL } from '../../App';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { BsGear, BsMap, BsSearch, ImTree } from 'react-icons/all';
import './MainSearchToggle.scss';
import { ViewSettings } from './ViewSettings';

export function AdvancedToggle() {
    //const [mode, setMode] = useState(viewMode || 'off'); // "search" | "tree" | "off"

    // Get function to change state of the rightsidebar (open/close)
    const openButtonState = closeStore((state) => state.openButtonState);
    const browseSearch = browseSearchToggle((state) => state.browseSearch);
    const setSearch = browseSearchToggle((state) => state.setSearch);
    const setBrowse = browseSearchToggle((state) => state.setBrowse);

    return (
        <ToggleButtonGroup
            name="Georgie"
            value={browseSearch}
            type={'radio'}
            className={'c-MainSearchToggle--group'}
        >
            <ToggleButton
                name={'viewMode'}
                value={'browse'}
                type={'radio'}
                id={'main-search-tree-toggle'}
                className={'c-MainSearchToggle--button tree'}
                onClick={(evt) => {
                    openButtonState();
                    setBrowse();
                    // if (evt.target.value === 'tree') {
                    //     if (mode === 'tree') {
                    //         evt.stopPropagation();
                    //         return false;
                    //     } else {
                    //         setMode('tree');
                    //         chooseViewMode('tree');
                    //     }
                    //     evt.stopPropagation();
                    //     return false;
                    // }
                }}
            >
                <ImTree></ImTree>
            </ToggleButton>
            <ToggleButton
                name={'viewMode'}
                value={'search'}
                type={'radio'}
                id={'advanced-search-tree-toggle'}
                className={'c-MainSearchToggle--button advanced'}
                onClick={(evt) => {
                    openButtonState();
                    setSearch();
                    // if (evt.target.value === 'advanced') {
                    //     if (mode === 'advanced') {
                    //         evt.stopPropagation();
                    //         return false;
                    //     } else {
                    //         setMode('advanced');
                    //         chooseViewMode('advanced');
                    //     }
                    //     evt.stopPropagation();
                    //     return false;
                    // }
                }}
            >
                <BsSearch></BsSearch>
            </ToggleButton>

            <ViewSettings />
        </ToggleButtonGroup>
    );
}
