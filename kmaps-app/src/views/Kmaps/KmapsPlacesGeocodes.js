import React from 'react';
import GenericPopover from '../common/GenericPopover';

export const kmaps_geocodes = {
    'auf.id': 'Aufschnaiter Lhasa Map ID',
    'bell.id': 'Bellezza Site ID',
    fips: 'FIPS 10-4',
    'flashmap.id': 'Flashmap ID',
    gb: 'GB Code',
    'gb.ryavec': 'GB Code - Ryavec',
    'iso.alpha.2': 'ISO 3166-1 alpha-2',
    'iso.alpha.3': 'ISO 3166-1 alpha-3',
    'iso.num': 'ISO 3166-1 numeric',
    lsad: 'Legal/Statistical Area Description Code',
    'la.id': 'Lhasa Atlas ID',
    stusps: 'Official United States Postal Service state abbreviations',
    post: 'Postal Code',
    rgb: 'Royal Government of Bhutan Code',
    tbrc: 'TBRC Geocode',
    'gb.ext': 'THL Extended GB Code',
    'thf.id': 'Tibet Heritage Fund Lhasa Building ID',
    cd113fp: 'US 2-character 113th congressional district FIPS code',
    statefp: 'US 2-character state FIPS code',
    countyfp: 'US 3-character county FIPS code',
    cousubfp: 'US 5-character county FIPS code',
    statens: 'US 8-character National Standard ANSI code',
    cousubns: 'US 8-character National Standard ANSI code',
    countyns: 'US 8-character National Standard ANSI code',
    gnisid: 'US 8-digit Geographic Names Information Systems Identifier',
    affgeoid: 'US AFF Summary Level Code',
    geoid: 'US Geographic ID',
    zip: 'Zip Code',
};

export function getGeocodes() {
    return Object.keys(kmaps_geocodes);
}

export function getGeocodeLabel(geocode) {
    const gcds = getGeocodes();
    return gcds.includes(geocode) ? kmaps_geocodes[geocode] : false;
}

export function PlacesGeocodes({ kmap }) {
    const kmkeys = Object.keys(kmap);
    const code_keys = kmkeys.filter((k, i) => {
        return k.startsWith('code_');
    });
    if (code_keys.length === 0) return null;
    // Get set of unique code IDs in case there is more than one type of code
    const codelist = code_keys.map((ck, cki) => {
        return ck.split('_')[1];
    });
    const codes = new Set(codelist);
    let codeelements = [];
    for (let code of codes) {
        codeelements.push(<Geocode key={code} kmap={kmap} code={code} />);
    }
    return codeelements;
}

function Geocode({ kmap, code }) {
    const kmkeys = Object.keys(kmap);
    const cdlabel = getGeocodeLabel(code);
    const cdval = kmap[`code_${code}_value_s`];
    const refskey = `code_${code}_citation_references_ss`;
    let refs = false;
    if (kmkeys.includes(refskey) && kmap[refskey].length > 0) {
        const srcicon = <span className="u-icon__sources"> </span>;
        const refcontent = kmap[refskey].join(', ');
        refs = (
            <GenericPopover
                title={`References for ${cdlabel}`}
                content={refcontent}
                icon={srcicon}
            />
        );
    }
    const datekey = `code_${code}_time_units_ss`;
    let date = false;
    if (kmkeys.includes(datekey) && kmap[datekey].length > 0) {
        date = ` (${kmap[datekey].join(', ')}) `;
    }
    return (
        <p>
            <strong>{cdlabel}: </strong> {cdval}
            {date}
            {refs}
        </p>
    );
}
