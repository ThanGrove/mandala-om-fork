import React from 'react';
import { TermPassageGroup } from './TermsPassageGroup';

/**
 * getTermPassages : returns the child documents of the kmaps Term that have passage fields in them.
 * Each such child doc may have multiple passages within it, e.g. related_definitions_passage_1_content_t, etc.
 * So the array returned does not represent the number of passages.
 *
 * @param kmapData
 */
export function getTermPassages(kmapData) {
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
    return passages;
}

export function TermPassages({ kmapData, passnum, setPassnum }) {
    /* Find child documents for definitions with passages */
    let passages = getTermPassages(kmapData);
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
