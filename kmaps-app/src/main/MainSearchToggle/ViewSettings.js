import { BsGear } from 'react-icons/all';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, FormControl, InputGroup, Modal } from 'react-bootstrap';
import _ from 'lodash';
import axios from 'axios';
import { useQuery } from 'react-query';
import MandalaSkeleton from '../../views/common/MandalaSkeleton';
import { capitalize } from '../../views/common/utils';
import './ViewSettings.scss';
import { useView } from '../../hooks/useView';

const getViewData = async (domain) => {
    const apiurl = `https://${domain}.kmaps.virginia.edu/admin/views.json`;
    const { data } = await axios.request(apiurl);
    return data;
};

export function ViewSettings(props) {
    const viewSettingsState = useView();
    const [viewSettings, setViewSettings] = useState(viewSettingsState);
    const [show, setShow] = useState(false);
    const toggle = () => {
        setShow(!show);
    };

    const registerChange = (form) => {
        viewSettings[form.target.name] = form.target.value;
        setViewSettings(viewSettings);
    };

    const saveChanges = () => {
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
        setShow(false);
    };

    useEffect(() => {
        const savedSettings =
            localStorage.getItem('savedViewSettings') === 'true';
        let mysettings = savedSettings
            ? localStorage.getItem('userViewSettings')
            : false;
        if (mysettings) {
            mysettings = JSON.parse(mysettings);
            setViewSettings(mysettings);
        }
    }, []);

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
                    <Modal.Title>Site-wide View Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Use this page to save preferences on how to view
                        knowledge maps
                    </p>
                    <KmapsSettings
                        type="view"
                        domain="places"
                        handleChange={registerChange}
                    />
                    <KmapsSettings
                        type="view"
                        domain="subjects"
                        handleChange={registerChange}
                    />
                    <KmapsSettings
                        type="view"
                        domain="terms"
                        handleChange={registerChange}
                    />
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

function KmapsSettings({ type, domain, handleChange }) {
    // Get Perspective data from API
    const {
        isLoading: isViewDataLoading,
        data: viewData,
        isError: isViewDataError,
        error: viewDataError,
    } = useQuery(['views', 'data', domain], () => getViewData(domain));

    if (isViewDataLoading) {
        return <MandalaSkeleton />;
    }
    const name = `${domain}`;
    return (
        <div id={`${domain}-settings`} className="c-modal_subsection">
            <h2>{capitalize(domain)} Name Form</h2>
            <p>Select how you want {domain} names to be displayed:</p>
            <form name={`${name}_form`} onChange={handleChange}>
                <KmapSettingsInputs
                    name={name}
                    domain={domain}
                    data={viewData}
                />
            </form>
        </div>
    );
}

function KmapSettingsInputs({ name, domain, data }) {
    const currentSettings = useView((state) => state[domain]);

    if (!data) {
        return null;
    }

    const inputs = data.map((vd, n) => {
        const myval = `${vd.id}|${vd.code}`;
        const radioBtn =
            myval === currentSettings ? (
                <InputGroup.Radio name={name} value={myval} defaultChecked />
            ) : (
                <InputGroup.Radio name={name} value={myval} />
            );
        return (
            <InputGroup key={`km-setting-${name}-${n}`}>
                {radioBtn}
                <InputGroup.Text>{vd.name}</InputGroup.Text>
            </InputGroup>
        );
    });

    return <>{inputs}</>;
}
