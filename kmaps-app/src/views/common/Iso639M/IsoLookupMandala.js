import React, { useEffect, useRef, useState } from 'react';
import { Iso639M } from './Iso639M';
import { Col, Container, Row } from 'react-bootstrap';
import { iso639 } from './iso639data';

export function IsoLookupMandala(props) {
    const [lang, setLang] = useState(iso639['en']);
    return (
        <div>
            <h1>Language Code Lookup</h1>
            <p>
                This page allows one to look up the ISO information on a
                specific language by code or name:{' '}
            </p>
            <IsoLangForm lang={lang} setLang={setLang} />
            <ul>
                <li>
                    <strong>Name: </strong> {lang.name}
                </li>
                <li>
                    <strong>Native Name: </strong> {lang.native}
                </li>
                <li>
                    <strong>Type: </strong> {lang?.type}
                </li>
                <li>
                    <strong>
                        <a
                            href="https://www.loc.gov/standards/iso639-2/php/code_list.php"
                            target="_blank"
                        >
                            ISO-639-1
                        </a>
                        :{' '}
                    </strong>{' '}
                    {lang.iso1}
                </li>
                <li>
                    <strong>
                        <a
                            href="https://iso639-3.sil.org/code_tables/639/data"
                            target="_blank"
                        >
                            ISO-639-3
                        </a>
                        :{' '}
                    </strong>{' '}
                    {lang.iso3}
                </li>
                <li>
                    <strong title="Abbreviation for bibliographic contexts">
                        ISO-639-3B:{' '}
                    </strong>{' '}
                    {lang?.iso3b}
                </li>
                <li>
                    <strong title="Abbreviation for terminological contexts">
                        ISO-639-3T:{' '}
                    </strong>{' '}
                    {lang?.iso3t}
                </li>
            </ul>
        </div>
    );
}

function IsoLangForm({ lang, setLang }) {
    const cdref = useRef(null);
    const nameref = useRef(null);
    const nativeref = useRef(null);

    const changeCode = (e) => {
        nameref.current.value = '';
        nativeref.current.value = '';
        let newcode = e?.target?.value;
        if (newcode.length === 3) {
            newcode = Iso639M.convertLangCode(newcode);
        }
        if (newcode in iso639) {
            const newdata = iso639[newcode];
            setLang(newdata);
        }
    };

    const changeName = (e) => {
        cdref.current.value = '';
        nativeref.current.value = '';
        let newname = e?.target?.value;
        const newcode = Iso639M.getLangCodeFromName(newname);
        if (newcode) {
            const newdata = iso639[newcode];
            setLang(newdata);
        }
    };

    const changeNative = (e) => {
        cdref.current.value = '';
        nameref.current.value = '';
        let newname = e?.target?.value;
        const newcode = Iso639M.getLangCodeFromName(newname);
        if (newcode) {
            const newdata = iso639[newcode];
            setLang(newdata);
        }
    };
    return (
        <Container onSubmit={null}>
            <Row>
                <Col md={2}>
                    <label>
                        <strong>Code: </strong>
                        <input
                            name="langcode"
                            type="text"
                            onChange={changeCode}
                            size={5}
                            ref={cdref}
                        />
                    </label>
                </Col>
                <Col md={3}>
                    <label>
                        <strong>Name: </strong>
                        <input
                            name="langname"
                            type="text"
                            onChange={changeName}
                            size={15}
                            ref={nameref}
                        />
                    </label>
                </Col>
                <Col md={3}>
                    <label>
                        <strong>Native Name: </strong>
                        <input
                            name="langnative"
                            type="text"
                            onChange={changeNative}
                            size={15}
                            ref={nativeref}
                        />
                    </label>
                </Col>
            </Row>
        </Container>
    );
}
