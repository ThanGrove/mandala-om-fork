import React, { useEffect, useState } from 'react';
import { getUniquePropIds } from '../../common/utils';
import { HtmlCustom } from '../../common/MandalaMarkup';
import { Button } from 'react-bootstrap';
import Collapse from 'react-bootstrap/Collapse';

/**
 * getOtherDefs : returns the child documents of the kmaps Term that have passage fields in them.
 * Each such child doc may have multiple passages within it, e.g. related_definitions_passage_1_content_t, etc.
 * So the array returned does not represent the number of passages.
 *
 * @param kmapData
 */
export function getOtherPassages(kmapData) {
    let passages = [];
    const reldefs = kmapData?._childDocuments_?.filter((cd) => {
        const reldeflangs = getUniquePropIds(
            cd,
            /related_definitions_content_(\w+)/
        );
        return (
            cd?.block_child_type === 'related_definitions' &&
            reldeflangs?.length > 0
        );
    });

    for (var n = 0; n < reldefs?.length; n++) {
        let rd = reldefs[n];
        let rdkeys = Object.keys(rd).join('|');
        if (
            rdkeys.includes('related_definitions_passage_') ||
            rdkeys.includes('related_definitions_citation_')
        ) {
            passages.push(rd);
        }
    }
    let np = reldefs.filter((rd, rdi) => {
        let rdkeys = Object.keys(rd).join('|');
        return (
            rdkeys.includes('related_definitions_passage_') ||
            rdkeys.includes('related_definitions_citation_')
        );
    });
    return passages;
}

/**
 * Other Defs are other imported definitions in Kmaps Terms. These definitions have details information
 * as opposed to other dictionaries which are just a dump of terms. These have structured data similar to the
 * main defintions, but they are definitions from other people, e.g. Higgins, Hopkins, and other people whose last
 * name does not begin with H.
 *
 * @param kmapData
 * @param passnum
 * @param setPassnum
 * @returns {JSX.Element}
 * @constructor
 */
export function OtherPassages({ kmapData }) {
    /* Find child documents for definitions with passages */
    let defs = getOtherPassages(kmapData);
    return (
        <>
            {defs.map((p, pi) => {
                return (
                    <OtherPassageGroup
                        key={`term-otherdef-group-${kmapData?.uid}`}
                        data={p}
                    />
                );
            })}
        </>
    );
}

/**
 * Other Passage Group: The div that groups aspects of a definition external to Mandala terms.
 * Other Defs can have a defintion, passages, and/or notes.
 * If multiple of these exist, use tabs.
 *
 * @param data
 * @param passnum
 * @param setPassnum
 * @returns {JSX.Element}
 * @constructor
 */
export function OtherPassageGroup({ data }) {
    const [activeTab, setActiveTab] = useState(''); // Active Tab in Other Def group
    // Get all passage IDs from filtering data (solr doc) properties
    let passageIds = getUniquePropIds(
        data,
        /related_definitions_passage_(\d+)_content_t/
    );

    const translationCitations = getUniquePropIds(
        data,
        /related_definitions_passage_translation_(\d+)_citation_references_ss/
    );
    const citationIds = getUniquePropIds(
        data,
        /related_definitions_citation_(\d+)_reference_s/
    );

    // Tablist determines number of tabs and top one is set to active in useEffect
    let tablist =
        passageIds?.length + citationIds?.length > 0
            ? ['otherdefpassages']
            : [];
    useEffect(() => {
        if (tablist && tablist?.length > 0) {
            setActiveTab(tablist[0]);
        }
    }, [data]);

    const relsource = data?.related_definitions_in_house_source_s ? (
        <div className="passage-src">
            {data?.related_definitions_in_house_source_s}
        </div>
    ) : null;

    return (
        <div className="otherdef-passages">
            {passageIds.map((pid, pind) => {
                return (
                    <OtherPassage
                        data={data}
                        pid={pid}
                        source={relsource}
                        key={`term-otherdef-passage-${pid}-${pind}`}
                    />
                );
            })}
            {citationIds.map((cid, cind) => {
                return (
                    <OtherCitation
                        data={data}
                        cid={cid}
                        source={relsource}
                        key={`term-otherdef-citation-${cid}-${cind}`}
                    />
                );
            })}
            {translationCitations.map((cid, cind) => {
                return (
                    <OtherCitation
                        data={data}
                        cid={cid}
                        source={relsource}
                        trans={true}
                        key={`term-otherdef-citation-${cid}-${cind}`}
                    />
                );
            })}
        </div>
    );
}

export function OtherPassage({ data, pid, source }) {
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
                            data[`related_definitions_passage_${pid}_content_t`]
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

export function OtherCitation({ data, cid, source, trans = false }) {
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
