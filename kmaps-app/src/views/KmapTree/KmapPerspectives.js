import React from 'react';

export const KmapPerpsectiveData = {
    places: [
        { name: 'Cultural Regions', id: 'cult.reg' },
        { name: 'National Admin Units', id: 'pol.admin.hier', root: 13735 },
        {
            name: 'Historical Polity Admin Units',
            id: 'hist.pol.admin.unit',
            root: 24107,
        },
        { name: 'Electoral Relationships', id: 'elect.rel' },
        { name: 'Site Relationships', id: 'site.rel' },
        { name: 'Political Relationships', id: 'pol.rel' },
        { name: 'Cultural Relationships', id: 'cult.rel' },
        { name: 'Environmental Relationships', id: 'envir.rel' },
        { name: 'Administrative Relationships', id: 'admin.rel' },
        { name: 'Organizational Relationships', id: 'org.rel' },
        { name: 'Religious Relationships', id: 'rel.rel' },
        { name: 'Geographic Relationship', id: 'geo.rel' },
    ],

    subjects: [{ name: 'General', id: 'gen' }],

    terms: [
        { name: 'Tibetan Alphabetical', id: 'tib.alpha' },
        { name: 'English Alphabetical', id: 'eng.alpha' },
        { name: 'Grammatical/Semantic', id: 'gram.sem.rel' },
    ],
};

export function PerspectiveChooser({ domain, current, setter, ...props }) {
    const choices =
        domain in KmapPerpsectiveData ? KmapPerpsectiveData[domain] : false;
    if (!domain || !choices) {
        // console.log('one is false! ', domain, choices);
        return null;
    }
    let pclass =
        props?.classes && props.classes?.length && props.classes.length > 0
            ? props.classes
            : '';
    pclass = ['c-perspective-select', ...pclass];

    const changeMe = (evt) => {
        console.log('Perspective is now: ', evt.target.value);
        setter(evt.target.value);
    };
    return (
        <div className={pclass}>
            <label>Persepective: </label>
            <select defaultValue={current} onChange={changeMe}>
                {choices.map((persp, i) => {
                    const sel = persp.id === current ? 'selected' : '';
                    return (
                        <option
                            value={persp.id}
                            key={`${domain}-persp-choice-${i}`}
                        >
                            {persp.name}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

export function getPerspectiveRoot(pid, domain = 'places') {
    let perspRoot = false;
    for (let n = 0; n < KmapPerpsectiveData[domain].length; n++) {
        let persp = KmapPerpsectiveData[domain][n];
        if (persp['id'] === pid && persp['root']) {
            perspRoot = persp['root'];
            break;
        }
    }
    return perspRoot;
}
