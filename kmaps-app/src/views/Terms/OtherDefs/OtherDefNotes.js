import React, { useEffect, useState } from 'react';
import { HtmlCustom } from '../../common/MandalaMarkup';

export function OtherDefNotes({ data, noteids }) {
    return (
        <div>
            {noteids?.map((noteid, nind) => {
                const cntkey = `related_definitions_note_${noteid}_content_t`;
                const authkey = `related_definitions_note_${noteid}_authors_ss`;
                if (cntkey in data) {
                    return (
                        <div className="other-def-note">
                            <div className="note-content">
                                <HtmlCustom markup={data[cntkey]} />
                            </div>
                            {authkey in data && (
                                <div className="note-authors">
                                    by {data[authkey]?.join(', ')}
                                </div>
                            )}
                            {nind < noteids?.length - 1 && <hr width="75%" />}
                        </div>
                    );
                } else {
                    return <p>{cntkey} not in Data</p>;
                }
            })}
        </div>
    );
}
