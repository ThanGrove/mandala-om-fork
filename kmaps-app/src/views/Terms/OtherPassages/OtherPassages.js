import React from 'react';
import { OtherPassageGroup } from './OtherPassageGroup';

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
        return (
            cd?.block_child_type === 'related_definitions' &&
            cd?.related_definitions_content_s === ''
        );
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
        <div className="term-otherdefs">
            {defs.map((p, pi) => {
                return (
                    <OtherPassageGroup
                        key={`term-otherdef-group-${kmapData?.uid}`}
                        data={p}
                    />
                );
            })}
        </div>
    );
}
