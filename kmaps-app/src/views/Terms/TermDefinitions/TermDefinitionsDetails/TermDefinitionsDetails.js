import React, { useState } from 'react';
import _ from 'lodash';
import './TermDefinitionsDetails.scss';
import { Button } from 'react-bootstrap';
import { HtmlCustom } from '../../../common/MandalaMarkup';
import Collapse from 'react-bootstrap/Collapse';

const TermDefinitionsDetails = ({ details, defid }) => {
    // Do not show details if only language because that is already shown
    const detailkeys = Object.keys(details);
    if (
        detailkeys?.length === 1 &&
        details[detailkeys[0]]?.header_title === 'Language'
    ) {
        return null;
    }
    return (
        <div className="sui-termDefDetailsWrapper">
            {Object.keys(details).map((key) => (
                <div key={key} className="sui-termDefDetails__item">
                    <span className="sui-termDefDetails__title">
                        {details[key].header_title}:{' '}
                    </span>
                    <span className="sui-termDefDetails__text">
                        {details[key].header_text.join(', ')}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default TermDefinitionsDetails;
