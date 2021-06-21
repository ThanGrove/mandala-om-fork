import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import MandalaSkeleton from '../common/MandalaSkeleton';
import GenericPopover from '../common/GenericPopover';
import {
    BsFillQuestionCircleFill,
    BsInfo,
    BsInfoCircle,
    BsQuestionCircle,
    ImQuestion,
} from 'react-icons/all';
import { Button, Modal } from 'react-bootstrap';
import { capitalize } from '../common/utils';
import { HtmlCustom } from '../common/MandalaMarkup';
import { usePerspective } from '../../hooks/usePerspective';

// The following perspectives appear to have no data (Jun 2021, ndg) so filtering them out. See line 63
export const EMPTY_PERSPECTIVE_CODES = [
    'pol.rel',
    'cult.rel',
    'envir.rel',
    'admin.rel',
    'org.rel',
    'rel.rel',
    'geo.rel',
    'gram.sem.rel',
];

export function PerspectiveChooser({ domain, current, setter, ...props }) {
    const setPerspective = usePerspective((state) => state.setPerspective);

    // Get Perspective data from API
    const {
        isLoading: isPerspDataLoading,
        data: perspData,
        isError: isPerspDataError,
        error: perspDataError,
    } = useQuery(['perspective', 'data', domain], () =>
        getPerspectiveData(domain)
    );
    if (isPerspDataLoading) {
        return <MandalaSkeleton />;
    }
    if (perspData.length === 1) {
        return null;
    }
    const choices = perspData;
    if (!domain || !choices) {
        return null;
    }
    let pclass =
        props?.classes && props.classes?.length && props.classes.length > 0
            ? props.classes
            : '';
    pclass = ['c-perspective-select', ...pclass];

    const changeMe = (evt) => {
        const persp_code = evt.target.value;
        setPerspective(domain, persp_code);
        /*
        console.log(
            `********** New Perspective: ${persp_code} *****************`
        );
         */
    };

    return (
        <div className={pclass}>
            <label>
                Persepective
                <PerspectiveDescs domain={domain} />
            </label>
            <select defaultValue={current} onChange={changeMe}>
                {choices.map((persp, i) => {
                    if (EMPTY_PERSPECTIVE_CODES.includes(persp.code)) {
                        return null;
                    }
                    return (
                        <option
                            value={persp.code}
                            key={`${domain}-persp-choice-${i}`}
                        >
                            {persp.name}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

export const getPerspectiveData = async (domain) => {
    const apiurl = `https://${domain}.kmaps.virginia.edu/admin/perspectives.json`;
    const { data } = await axios.request(apiurl);
    return data;
};

export function PerspectiveDescs({ domain, ...props }) {
    const [showDescs, setShowDescs] = useState(false);
    const handleClose = () => setShowDescs(false);
    const handleShow = () => setShowDescs(true);

    // Get Perspective data from API
    const {
        isLoading: isPerspDataLoading,
        data: perspData,
        isError: isPerspDataError,
        error: perspDataError,
    } = useQuery(['perspective', 'data', domain], () =>
        getPerspectiveData(domain)
    );
    if (isPerspDataLoading) {
        return <MandalaSkeleton />;
    }
    if (perspData.length === 1) {
        return null;
    }
    let mu = `<h1>Perspective Descriptions</h1><p>${capitalize(
        domain
    )} have the following perspectives:</p>`;
    perspData.forEach((prsp) => {
        let desc = !prsp['description']
            ? '<p>No description available.</p>'
            : prsp['description'];
        mu += `<div><h2>${prsp['name']}</h2>${desc}</div>`;
    });
    mu = `<div>${mu}</div>`;
    return (
        <>
            <a
                onClick={handleShow}
                title={`About ${domain} perspectives`}
                style={{ cursor: 'pointer' }}
            >
                <BsInfoCircle />
            </a>

            <Modal
                show={showDescs}
                onHide={handleClose}
                dialogClassName="modal-persp-desc"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        About Perspectives in {capitalize(domain)}{' '}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <HtmlCustom markup={mu} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
