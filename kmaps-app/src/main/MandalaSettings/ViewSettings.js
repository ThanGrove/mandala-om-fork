import { BsGear } from 'react-icons/all';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, FormControl, InputGroup, Modal } from 'react-bootstrap';
import _ from 'lodash';
import axios from 'axios';
import { useQuery } from 'react-query';
import MandalaSkeleton from '../../views/common/MandalaSkeleton';
import { capitalize } from '../../views/common/utils';
import { useView } from '../../hooks/useView';

const getViewData = async (domain) => {
    const apiurl = `https://${domain}.kmaps.virginia.edu/admin/views.json`;
    const { data } = await axios.request(apiurl);
    return data;
};

export function ViewSettings({ current, setView }) {
    const registerChange = (form) => {
        current[form.target.name] = form.target.value;
        setView(current);
    };

    useEffect(() => {
        const savedSettings =
            localStorage.getItem('savedViewSettings') === 'true';
        let mysettings = savedSettings
            ? localStorage.getItem('userViewSettings')
            : false;
        if (mysettings) {
            mysettings = JSON.parse(mysettings);
            setView(mysettings);
        }
    }, []);

    return (
        <>
            <p>
                Use this page to save preferences on how to view knowledge maps
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
    data = ReorderKmapSettings(domain, data);
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

function ReorderKmapSettings(domain, data) {
    const settings_name = `REACT_APP_${domain.toUpperCase()}_SETTINGS_ORDER`;
    if (process?.env[settings_name]) {
        const order = process?.env[settings_name].split(',');
        let newdata = [];
        order.map((oid, n) => {
            oid = oid * 1;
            let items = data.filter((member) => {
                return member.id === oid;
            });
            if (items.length > 0) {
                newdata.push(items[0]);
            }
        });
        if (newdata?.length === order?.length) {
            data = newdata;
        }
    }
    return data;
}
