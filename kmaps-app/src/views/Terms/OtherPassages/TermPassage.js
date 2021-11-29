import { HtmlCustom } from '../../common/MandalaMarkup';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Collapse from 'react-bootstrap/Collapse';

export function TermPassage({ data, pid, source }) {
    const [open, setOpen] = useState(false);
    const toggle_icon = open ? (
        <span className="u-icon__minus"></span>
    ) : (
        <span className="u-icon__plus"></span>
    );
    const toggle_divid = `${data.uid}-${pid}-collapse`;
    let notes = Object.keys(data).filter((k) => {
        return (
            k.includes(`_${pid}_note_`) &&
            k.includes('_content_t') &&
            data[k]?.length > 0
        );
    });
    notes = notes.map((ntnm, nti) => {
        const mtch = ntnm.match(/note_(\d+)_/);
        if (mtch) {
            const notenum = mtch[1];

            return (
                <div
                    className="passage_note"
                    key={`term-passage-${pid}-${notenum}`}
                >
                    {notes?.length > 1 && (
                        <h4 className="passage_note_num">Note {nti + 1}</h4>
                    )}
                    <HtmlCustom
                        markup={
                            data[
                                `related_definitions_passage_${pid}_note_${notenum}_content_t`
                            ]
                        }
                    />

                    <div className="passage-note-author">
                        {data[
                            `related_definitions_passage_${pid}_note_${notenum}_authors_ss`
                        ].join(',')}
                    </div>
                </div>
            );
        }
    });
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
                        data[
                            `related_definitions_passage_${pid}_citation_references_ss`
                        ]
                    }
                />
            </p>

            <Collapse in={open}>
                <div id={toggle_divid}>
                    <h3>Passage</h3>
                    <HtmlCustom
                        markup={
                            data[`related_definitions_passage_${pid}_content_s`]
                        }
                    />

                    {source}

                    {notes?.length > 0 && (
                        <>
                            <h3>Notes</h3>
                            {notes}
                        </>
                    )}
                </div>
            </Collapse>
        </div>
    );
}
