import React, { useEffect, useState } from 'react';
import { HtmlCustom } from '../../common/MandalaMarkup';
import { getPropsContaining, getUniquePropIds } from '../../common/utils';

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
// {defdata?.}
export function OtherDefNotes({ data }) {
    return (
        <div>
            {Object.keys(data)?.map((objkey, okind) => {
                const defdata = data[objkey];
                const cntkey = `related_definitions_note_${objkey}_content_t`;
                const authkey = `related_definitions_note_${objkey}_authors_ss`;
                if (cntkey in defdata) {
                    return (
                        <div className="other-def-note">
                            {defdata?.related_definitions_in_house_source_s && (
                                <div className="sui-termDicts__title">
                                    {
                                        defdata?.related_definitions_in_house_source_s
                                    }
                                </div>
                            )}
                            <div className="note-content">
                                <HtmlCustom markup={defdata[cntkey]} />
                            </div>
                            {authkey in defdata && (
                                <div className="note-authors">
                                    by {defdata[authkey]?.join(', ')}
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
