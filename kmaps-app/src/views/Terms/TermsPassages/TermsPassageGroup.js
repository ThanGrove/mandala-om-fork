import { HtmlCustom } from '../../common/MandalaMarkup';
import React, { useEffect } from 'react';
import { TermPassage } from './TermPassage';

export function TermPassageGroup({ data, passnum, setPassnum }) {
    const passageIds = Object.keys(data)
        .map((pn) => {
            const mtch = pn.match(
                /related_definitions_passage_(\d+)_content_s/
            );
            if (mtch) {
                return mtch[1];
            }
            return;
        })
        .filter((it) => {
            return it;
        });

    useEffect(() => {
        setPassnum(passnum + passageIds?.length);
    }, [data]);

    const header = data?.related_definitions_in_house_source_s ? (
        <div className="sui-termDicts__title">
            {data?.related_definitions_in_house_source_s}
        </div>
    ) : null;
    return (
        <div className="term-passage-group">
            {header}
            <div className="term-passages-wrapper">
                {passageIds.map((pid, pind) => {
                    return (
                        <TermPassage
                            data={data}
                            pid={pid}
                            key={`term-passage-${pid}-${pind}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
