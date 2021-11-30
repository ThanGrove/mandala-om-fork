import { MandalaPopover } from '../common/MandalaPopover';
import React from 'react';

export function TermSubjectFacets({ kmAsset }) {
    if (
        !kmAsset?.associated_subject_map_idfacet?.length ||
        kmAsset?.associated_subject_map_idfacet?.length == 0
    ) {
        return null;
    }
    return (
        <ul className="sui-termsDetails__list">
            {kmAsset?.associated_subject_map_idfacet?.map((asset) => {
                const assetSplit = asset.split('|');
                const assocSubject = assetSplit[1].split('=');
                const subID = assocSubject[1].split('-');
                return (
                    <li className="sui-termsDetails__list-item" key={asset}>
                        {assetSplit[0].split('=')[0].toUpperCase()}
                        :&nbsp; {` `}
                        <MandalaPopover domain={subID[0]} kid={subID[1]}>
                            <span className="sui-termsDetails__li-subjects">
                                {assocSubject[0]}
                            </span>
                        </MandalaPopover>
                    </li>
                );
            })}
        </ul>
    );
}
