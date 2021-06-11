import React, { useState, useEffect } from 'react';
import { ADVANCED_LABEL, BASIC_LABEL } from '../../App';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { BsGear, BsMap, BsSearch, ImTree } from 'react-icons/all';
import './MainSearchToggle.scss';
import { SettingsModal } from './SettingsModal';

export function AdvancedToggle({ chooseViewMode, viewMode }) {
    const [mode, setMode] = useState(viewMode || 'off'); // "search" | "tree" | "off"

    return (
        <ToggleButtonGroup
            name="Georgie"
            value={mode}
            type={'radio'}
            className={'c-MainSearchToggle--group'}
        >
            <ToggleButton
                name={'viewMode'}
                value={'tree'}
                type={'radio'}
                id={'main-search-tree-toggle'}
                className={'c-MainSearchToggle--button tree'}
                onClick={(evt) => {
                    if (evt.target.value === 'tree') {
                        if (mode === 'tree') {
                            evt.stopPropagation();
                            return false;
                        } else {
                            setMode('tree');
                            chooseViewMode('tree');
                        }
                        evt.stopPropagation();
                        return false;
                    }
                }}
            >
                <ImTree></ImTree>
            </ToggleButton>
            <ToggleButton
                name={'viewMode'}
                value={'advanced'}
                type={'radio'}
                id={'advanced-search-tree-toggle'}
                className={'c-MainSearchToggle--button advanced'}
                onClick={(evt) => {
                    if (evt.target.value === 'advanced') {
                        if (mode === 'advanced') {
                            evt.stopPropagation();
                            return false;
                        } else {
                            setMode('advanced');
                            chooseViewMode('advanced');
                        }
                        evt.stopPropagation();
                        return false;
                    }
                }}
            >
                <BsSearch></BsSearch>
            </ToggleButton>

            <SettingsModal />
        </ToggleButtonGroup>
    );
}
