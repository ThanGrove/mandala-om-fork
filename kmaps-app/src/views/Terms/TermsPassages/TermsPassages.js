import React from 'react';
import { TermPassageGroup } from './TermsPassageGroup';

export function TermPassages({ kmapData, passnum, setPassnum }) {
    /* Find child documents for definitions with passages */
    let passages = [];
    const reldefs = kmapData?._childDocuments_?.filter((cd) => {
        return cd?.block_child_type === 'related_definitions';
    });
    for (var n = 0; n < reldefs?.length; n++) {
        let rd = reldefs[n];
        if (
            Object.keys(rd).join('|').includes('related_definitions_passage_')
        ) {
            passages.push(rd);
        }
    }

    return (
        <div className="passage-list">
            {passages.map((p, pi) => {
                return (
                    <TermPassageGroup
                        key={`term-passage-group-${kmapData?.uid}`}
                        data={p}
                        passnum={passnum}
                        setPassnum={setPassnum}
                    />
                );
            })}
        </div>
    );
}
