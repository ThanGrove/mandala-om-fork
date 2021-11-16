import React, { useState } from 'react';
import _ from 'lodash';
import './TermDefinitionsDetails.css';
import { Button } from 'react-bootstrap';
import { HtmlCustom } from '../../../common/MandalaMarkup';
import Collapse from 'react-bootstrap/Collapse';

const TermDefinitionsDetails = ({ details, defid }) => {
    const [open, setOpen] = useState(false);
    const toggle_id = `${defid}-details`;
    const toggle_icon = open ? (
        <span className="u-icon__minus"> </span>
    ) : (
        <span className="u-icon__plus"> </span>
    );

    // Do not show details if only language because that is already shown
    const detailkeys = Object.keys(details);
    if (
        detailkeys?.length === 1 &&
        details[detailkeys[0]]?.header_title === 'Language'
    ) {
        return null;
    }
    return (
        <div className="term-def-details">
            <p className="details-ref">
                <Button
                    onClick={() => setOpen(!open)}
                    aria-controls={toggle_id}
                    aria-expanded={open}
                    variant={'outline-info'}
                    title="More details"
                >
                    {toggle_icon}
                </Button>
            </p>

            <Collapse in={open}>
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
            </Collapse>
        </div>
    );
};

export default TermDefinitionsDetails;
