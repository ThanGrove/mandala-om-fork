import React, { useState } from 'react';
import { Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { BsGear } from 'react-icons/all';
import _ from 'lodash';
import { ViewSettings } from './ViewSettings';
import './MandalaSettings.scss';
import { useView } from '../../hooks/useView';
import { usePerspective } from '../../hooks/usePerspective';
import { PerspectiveSettings } from './PerspectiveSettings';

export function MandalaSettings() {
    // For Views
    const viewSettingsState = useView();
    const [viewSettings, setViewSettings] = useState(viewSettingsState);

    // For Perspectives
    const perspectiveState = usePerspective();

    // For Modal
    const [show, setShow] = useState(false);
    const toggle = () => {
        setShow(!show);
    };

    const saveChanges = () => {
        // Save Views
        if (viewSettings['places']) {
            viewSettingsState.setPlacesView(viewSettings['places']);
        }
        if (viewSettings['subjects']) {
            viewSettingsState.setSubjectsView(viewSettings['subjects']);
        }
        if (viewSettings['terms']) {
            viewSettingsState.setTermsView(viewSettings['terms']);
        }
        localStorage.setItem('savedViewSettings', 'true');
        localStorage.setItem('userViewSettings', JSON.stringify(viewSettings));

        // Save Perspectives
        const allPersectives = {
            places: perspectiveState.places,
            subjects: perspectiveState.subjects,
            terms: perspectiveState.terms,
        };

        localStorage.setItem('savedPerspectives', 'true');
        localStorage.setItem(
            'userPerspectives',
            JSON.stringify(allPersectives)
        );
        setShow(false);
    };

    return (
        <>
            <Button
                name={'siteSettings'}
                value={'open'}
                type={'button'}
                id={'advanced-site-settings'}
                className={'siteSettings-Toggle--button settings'}
                onClick={_.debounce(toggle)}
            >
                <BsGear></BsGear>
            </Button>

            <Modal show={show} className={'c-modal__settings'}>
                <Modal.Header closeButton onClick={toggle}>
                    <Modal.Title>Mandala Site-Wide Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Use this page to save preferences on how to view
                        knowledge maps. There are two sets of preferences.
                        “Views” allows you to choose what language and font to
                        view knowledge maps in. On the other hand,
                        “Perspectives” allows you to choose the context in which
                        to display the knowledge maps. Not all views and
                        perspectives are available for every item.
                    </p>
                    <Tabs
                        defaultActiveKey="view"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                    >
                        <Tab eventKey="view" title="View Settings">
                            <ViewSettings
                                current={viewSettings}
                                setView={setViewSettings}
                            />
                        </Tab>
                        <Tab
                            eventKey="perspective"
                            title="Perspective Settings"
                        >
                            <PerspectiveSettings
                                current={perspectiveState}
                                setPerspective={perspectiveState.setPerspective}
                            />
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={saveChanges}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
