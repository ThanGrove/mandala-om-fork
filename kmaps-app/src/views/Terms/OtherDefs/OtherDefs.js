import React from 'react';
import { getPropsContaining, getUniquePropIds } from '../../common/utils';
import { HtmlCustom } from '../../common/MandalaMarkup';

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
