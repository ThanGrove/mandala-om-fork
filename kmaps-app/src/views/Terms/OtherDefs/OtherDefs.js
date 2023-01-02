import React, { useEffect, useState } from 'react';
// import { OtherDefGroup } from './OtherDefGroup';
import { getPropsContaining, getUniquePropIds } from '../../common/utils';
import { HtmlCustom } from '../../common/MandalaMarkup';
import { Tab, Tabs } from 'react-bootstrap';
import { TermPassage } from '../OtherPassages/TermPassage';
import { TermDictionary } from '../TermDictionaries/TermDictionaries';
// import {OtherDefNotes} from "./OtherDefNotes";

/**
 * getOtherDefs : returns the child documents of the kmaps Term that have passage fields in them.
 * Each such child doc may have multiple passages within it, e.g. related_definitions_passage_1_content_t, etc.
 * So the array returned does not represent the number of passages.
 *
 * @param kmapData
 */
export function getOtherDefs(kmapData) {
    return kmapData?._childDocuments_?.filter((cd) => {
        return (
            cd?.block_child_type === 'related_definitions' &&
            (cd?.related_definitions_content_s?.length > 0 ||
                cd?.related_definitions_content_tibtu?.length > 0 ||
                cd?.related_definitions_content_latinu?.length > 0)
        );
    });
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
export function OtherDefs({ kmapData }) {
    /* Find child documents for definitions with passages */
    let defs = getOtherDefs(kmapData);
    return (
        <div className="term-otherdefs">
            {defs.map((p, pi) => {
                return (
                    <OtherDefGroup
                        key={`term-odgroup-${kmapData?.uid}-od-${pi}`}
                        data={p}
                        index={pi}
                    />
                );
            })}
        </div>
    );
}

/**
 * OtherDefGroup: The div that groups aspects of a definition external to Mandala terms.
 * Other Defs can have a defintion, passages, and/or notes.
 * If multiple of these exist, use tabs.
 *
 * @param data
 * @param passnum
 * @param setPassnum
 * @returns {JSX.Element}
 * @constructor
 */
export function OtherDefGroup({ data, index }) {
    const [activeTab, setActiveTab] = useState(''); // Active Tab in Other Def group
    // Get content Id
    const contentId = getUniquePropIds(
        data,
        /related_definitions_content_(\w+)/
    );
    const cntfield =
        contentId?.length > 0
            ? 'related_definitions_content_' + contentId[0]
            : false;

    // Get all passage IDs from filtering data (solr doc) properties
    const passageIds = getUniquePropIds(
        data,
        /related_definitions_passage_(\d+)_content_s/
    );
    // Tablist determines number of tabs and top one is set to active in useEffect
    let tablist = passageIds?.length > 0 ? ['otherdefpassages'] : [];
    useEffect(() => {
        if (tablist && tablist?.length > 0) {
            setActiveTab(tablist[0]);
        }
    }, [data]);

    // Header for other dictionary source
    const header = data?.related_definitions_in_house_source_s ? (
        <div className="sui-termDicts__title">
            {data?.related_definitions_in_house_source_s}
        </div>
    ) : null;

    // Definition from Other Source if it exists
    let def = null;
    if (cntfield) {
        def =
            data[cntfield].length > 0 ? (
                <div className="otherdef-cnt">
                    <TermDictionary
                        field={cntfield}
                        data={data}
                        index={index + 1}
                    />
                </div>
            ) : null;
    }

    if (def) {
        tablist.shift('otherdef');
    }

    // Notes from Other Def
    const defnoteids = getUniquePropIds(
        data,
        /related_definitions_note_(\d+)_/
    );
    if (defnoteids?.length > 0) {
        tablist.push('otherdefnotes');
    }

    // Two different returns based on whether to use tabs (i.e. if there is more than one section)
    if (tablist?.length > 1) {
        return (
            <div className="otherdef-group">
                {header}
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    id="other-def-sections"
                    className="mb-3"
                >
                    {def && (
                        <Tab eventKey="otherdef" title="Definition">
                            {def}
                        </Tab>
                    )}
                    {passageIds?.length > 0 && (
                        <Tab
                            eventKey="otherdefpassages"
                            title={`Passages (${passageIds?.length})`}
                        >
                            <div className="otherdef-passages">
                                {passageIds.map((pid, pind) => {
                                    return (
                                        <TermPassage
                                            data={data}
                                            pid={pid}
                                            key={`term-otherdef-passage-${pid}-${pind}`}
                                        />
                                    );
                                })}
                            </div>
                        </Tab>
                    )}
                    {defnoteids?.length > 0 && (
                        <Tab
                            eventKey="otherdefnotes"
                            title={`Notes (${defnoteids?.length})`}
                        >
                            <div className="otherdef-notes">
                                <OtherDefNotes
                                    data={data}
                                    noteids={defnoteids}
                                />
                            </div>
                        </Tab>
                    )}
                </Tabs>
            </div>
        );
    } else {
        return (
            <div className="otherdef-group">
                {header}
                {def}
                {passageIds?.length > 0 && (
                    <div className="otherdef-passages">
                        {passageIds.map((pid, pind) => {
                            return (
                                <TermPassage
                                    data={data}
                                    pid={pid}
                                    key={`term-otherdef-passage-${pid}-${pind}`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
}

/**
 * getOtherDefNotes returns an associative array keyed on note ID number with the value being the relevant kmap
 * childDocument that contains the note. This is called by TermsDetails to get a list of the notes so that a count
 * can be displayed in the tab. TermDetails then sends that data back here to OtherDefNotes below when the
 * tab is show to actually display the notes themselves.
 *
 * @param kmapData
 * @returns {{}}
 */
export function getOtherDefNotes(kmapData) {
    const notedefs = kmapData._childDocuments_
        .filter((cd, cdi) => {
            return cd?.block_child_type === 'related_definitions';
        })
        .filter((cd, cdi) => {
            const noteprops = getPropsContaining(
                cd,
                'related_definitions_note_',
                'starts'
            );
            return noteprops?.length > 0;
        });
    let notes = {};
    notedefs.forEach((nd, ndi) => {
        let nids = getUniquePropIds(nd, /related_definitions_note_(\d+)_/);
        nids.forEach((nid, nidi) => {
            notes[nid] = nd;
        });
    });
    return notes;
}

/**
 * OtherDefNotes takes an associative array keyed on the note ID number (NTID) whose value is the relevant child
 * document from the Kmap data for the term.
 * Each note has is represented by two fields in the kmap "related_definitions" child document
 * "related_definitions_note_NTID_content_t" is the content of the note and
 * "related_definitions_note_NTID_content_t" is the author.
 * The code below takes the key (note ID number) and finds those two fields in the child document value and
 * uses them to display the note.
 *
 * @param data
 * @returns {JSX.Element}
 * @constructor
 */
export function OtherDefNotes({ data }) {
    return (
        <div>
            {Object.keys(data)?.map((objkey, okind) => {
                const defdata = data[objkey];
                const cntkey = `related_definitions_note_${objkey}_content_t`;
                const authkey = `related_definitions_note_${objkey}_authors_ss`;
                if (cntkey in defdata) {
                    return (
                        <div
                            className="other-def-note"
                            key={`other-def-note-${okind}`}
                        >
                            <div className="note-content">
                                <h4 className="note-number">
                                    Note {okind + 1}
                                </h4>
                                <HtmlCustom markup={defdata[cntkey]} />
                            </div>
                            {authkey in defdata && (
                                <div className="note-authors">
                                    by {defdata[authkey]?.join(', ')}
                                    {defdata?.related_definitions_in_house_source_s && (
                                        <>
                                            {' '}
                                            (
                                            {
                                                defdata?.related_definitions_in_house_source_s
                                            }
                                            )
                                        </>
                                    )}
                                </div>
                            )}
                            {okind < Object.keys(data)?.length - 1 && (
                                <hr width="75%" />
                            )}
                        </div>
                    );
                } else {
                    return <p>{cntkey} not in Data</p>;
                }
            })}
        </div>
    );
}
