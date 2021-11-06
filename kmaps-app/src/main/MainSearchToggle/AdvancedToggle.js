import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { closeStore, openTabStore } from '../../hooks/useCloseStore';
import { browseSearchToggle } from '../../hooks/useBrowseSearchToggle';
import { ADVANCED_LABEL, BASIC_LABEL } from '../../App';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { BsGear, BsMap, ImTree } from 'react-icons/all';
import './MainSearchToggle.scss';
import { ViewSettings } from '../MandalaSettings/ViewSettings';
import { MandalaSettings } from '../MandalaSettings/MandalaSettings';

const target = document.getElementById('browseSearchPortal');

export function AdvancedToggle() {
    //const [mode, setMode] = useState(viewMode || 'off'); // "search" | "tree" | "off"

    // Get function to change state of the rightsidebar (open/close)
    const setSearch = browseSearchToggle((state) => state.setSearch);
    const setBrowse = browseSearchToggle((state) => state.setBrowse);
    const setOpenTab = openTabStore((state) => state.changeButtonState);
    const openTab = openTabStore((state) => state.openTab);
    const default_value =
        openTab === 1 ? 'search' : openTab === 2 ? 'browse' : '';

    // Set open button to the browse tree for kmaps
    React.useEffect(() => {
        const pthpts =
            process.env.REACT_APP_STANDALONE === 'standalone'
                ? window.location.hash.split('/')
                : window.location.pathname.split('/');
        if (
            pthpts?.length > 1 &&
            ['places', 'subjects', 'terms'].includes(pthpts[1])
        ) {
            setOpenTab(2);
        }
    }, []);

    React.useEffect(() => {
        // When sidebar is closed by toggle button, cursor is over button and so it gets focus. Wait and remove that focus.
        if (openTab === 0) {
            setTimeout(() => {
                let tbs = document?.getElementsByClassName(
                    'c-MainSearchToggle--button'
                );
                for (let tct = 0; tct < tbs?.length; tct++) {
                    tbs[tct].classList.remove('focus');
                }
            }, 10);
        }
    }, [openTab]);

    const settingsButton =
        process.env.REACT_APP_STANDALONE === 'standalone' ? (
            <MandalaSettings />
        ) : null;
    const toggleBtnGroup = (
        <>
            <ToggleButtonGroup
                name="Georgie"
                value={default_value}
                type={'radio'}
                className={'c-MainSearchToggle--group'}
            >
                <ToggleButton
                    name={'viewMode'}
                    value={'search'}
                    type={'radio'}
                    id={'advanced-search-tree-toggle'}
                    className={'c-MainSearchToggle--button advanced'}
                    onMouseUp={(evt) => {
                        setOpenTab(1);
                        setSearch();
                    }}
                >
                    <span className={'icon shanticon-preview'}></span>
                </ToggleButton>

                <ToggleButton
                    name={'viewMode'}
                    value={'browse'}
                    type={'radio'}
                    id={'main-search-tree-toggle'}
                    className={'c-MainSearchToggle--button tree'}
                    onMouseUp={(evt) => {
                        setOpenTab(2);
                        setBrowse();
                    }}
                >
                    <ImTree></ImTree>
                </ToggleButton>
            </ToggleButtonGroup>
            {settingsButton}
        </>
    );

    if (target) {
        return ReactDOM.createPortal(toggleBtnGroup, target);
    } else {
        return toggleBtnGroup;
    }
}
