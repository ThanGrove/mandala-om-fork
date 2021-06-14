import { BsGear } from 'react-icons/all';
import ToggleButton from 'react-bootstrap/ToggleButton';
import React, { useRef, useState } from 'react';
import { Button, Form, FormControl, InputGroup, Modal } from 'react-bootstrap';
import _ from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import { useQuery } from 'react-query';
import MandalaSkeleton from '../../views/common/MandalaSkeleton';
import { capitalize } from '../../views/common/utils';
import './ViewSettings.scss';

export const VIEW_SETTINGS_COOKIE_NAME = 'mandala-view-settings';
const getViewData = async (domain) => {
    const apiurl = `https://${domain}.kmaps.virginia.edu/admin/views.json`;
    const { data } = await axios.request(apiurl);
    return data;
};

function getCurrentSettings() {
    const settings = localStorage.getItem(VIEW_SETTINGS_COOKIE_NAME)
        ? JSON.parse(localStorage.getItem(VIEW_SETTINGS_COOKIE_NAME))
        : {
              'subjects-names': '72|roman.popular',
              'terms-names': '73|roman.scholar',
              'places-names': '69|roman.popular',
          };
    return settings;
}

export function ViewSettings(props) {
    const currentSettings = getCurrentSettings();
    const [settings, setSettings] = useState(currentSettings);
    const [show, setShow] = useState(false);

    const toggle = () => {
        if (!show === true) {
            Object.entries(currentSettings).forEach((v, k) => {
                const option = v[0];
                const value = v[1];
                const selector = `input[value="${value}"]`;
                const optel = $(`input[value="${value}"]`);
            });
        }
        setShow(!show);
    };

    const registerChange = (form) => {
        settings[form.target.name] = form.target.value;
        setSettings(settings);
    };

    const saveChanges = () => {
        setShow(false);
        localStorage.setItem(
            VIEW_SETTINGS_COOKIE_NAME,
            JSON.stringify(settings)
        );
    };

    return (
        <>
            <ToggleButton
                name={'siteSettings'}
                value={'open'}
                type={'radio'}
                id={'advanced-site-settings'}
                className={'c-MainSearchToggle--button settings'}
                onClick={_.debounce(toggle)}
            >
                <BsGear></BsGear>
            </ToggleButton>

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
                        type="names"
                        domain="places"
                        handleChange={registerChange}
                    />
                    <KmapsSettings
                        type="names"
                        domain="subjects"
                        handleChange={registerChange}
                    />
                    <KmapsSettings
                        type="names"
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
    const name = `${domain}-${type}`;
    return (
        <div id={`${domain}-settings`} className="c-modal_subsection">
            <h2>{capitalize(domain)} Name Form</h2>
            <p>Select how you want {domain} names to be displayed:</p>
            <form name={`${name}-form`} onChange={handleChange}>
                <KmapSettingsInputs name={name} data={viewData} />
            </form>
        </div>
    );
}

function KmapSettingsInputs({ name, data }) {
    if (!data) {
        return null;
    }
    const currentSettings = getCurrentSettings();

    const inputs = data.map((vd, n) => {
        const myval = `${vd.id}|${vd.code}`;
        const radioBtn =
            myval === currentSettings[name] ? (
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
