import { HtmlCustom } from '../../common/MandalaMarkup';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Collapse from 'react-bootstrap/Collapse';
import { getUniquePropIds } from '../../common/utils';

export function TermCitation({ data, cid, source, trans = false }) {
    const [open, setOpen] = useState(false);
    const toggle_icon = open ? (
        <span className="u-icon__minus"> </span>
    ) : (
        <span className="u-icon__plus"> </span>
    );
    const toggle_divid = `${data.uid}-${cid}-collapse`;
    let citation = (
        <HtmlCustom
            markup={data[`related_definitions_citation_${cid}_reference_s`]}
        />
    );
    let passage = (
        <HtmlCustom
            markup={data[`related_definitions_citation_${cid}_note_t`]}
        />
    );
    let transNote = null;
    if (trans) {
        citation = (
            <HtmlCustom
                markup={
                    data[
                        `related_definitions_passage_translation_${cid}_citation_references_ss`
                    ]
                }
            />
        );
        const transNoteNums = getUniquePropIds(
            data,
            /related_definitions_passage_translation_\d+_note_(\d+)_content_t/
        );
        passage = (
            <>
                <h4>Passage Translation</h4>
                <HtmlCustom
                    markup={
                        data[
                            `related_definitions_passage_translation_${cid}_content_t`
                        ]
                    }
                />
            </>
        );
        transNote = transNoteNums.map((tnnum, tnind) => {
            return (
                <div key={`pass-tran-note-${tnind}`}>
                    <h4>Note</h4>
                    <HtmlCustom
                        markup={
                            data[
                                `related_definitions_passage_translation_${cid}_note_${tnnum}_content_t`
                            ]
                        }
                    />

                    <div className="passage-note-author">
                        {data[
                            `related_definitions_passage_translation_${cid}_note_${tnnum}_authors_ss`
                        ].join(',')}
                    </div>
                </div>
            );
        });
    }
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
                {citation}
            </p>

            <Collapse in={open}>
                <div id={toggle_divid}>
                    {passage}
                    {source}
                    {transNote}
                </div>
            </Collapse>
        </div>
    );
}
