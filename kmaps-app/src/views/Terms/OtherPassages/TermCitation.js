import { HtmlCustom } from '../../common/MandalaMarkup';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Collapse from 'react-bootstrap/Collapse';

export function TermCitation({ data, cid, source }) {
    const [open, setOpen] = useState(false);
    const toggle_icon = open ? (
        <span className="u-icon__minus"> </span>
    ) : (
        <span className="u-icon__plus"> </span>
    );
    const toggle_divid = `${data.uid}-${cid}-collapse`;
    return (
        <div className="term-passage">
            <p className="passage-ref">
                <Button
                    onClick={() => setOpen(!open)}
                    aria-controls={toggle_divid}
                    aria-expanded={open}
                    variant={'outline-info'}
                >
                    {toggle_icon}
                </Button>
                <HtmlCustom
                    markup={
                        data[`related_definitions_citation_${cid}_reference_s`]
                    }
                />
            </p>

            <Collapse in={open}>
                <div id={toggle_divid}>
                    <HtmlCustom
                        markup={
                            data[`related_definitions_citation_${cid}_note_t`]
                        }
                    />

                    {source}
                </div>
            </Collapse>
        </div>
    );
}
