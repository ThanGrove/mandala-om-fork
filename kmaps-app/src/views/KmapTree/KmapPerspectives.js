import React from 'react';

/**
 * Kmap perspective data as a JS Object for dealing with perspective switches
 * Chooser only shows if more than one perspective
 * Each perspective has an optional root ID otherwise it uses level 1
 * Commented out perspectives in places are ones without any data (afaics)
 *
 * @type constant object
 */
export const KmapPerpsectiveData = {
    places: [
        { name: 'Cultural Regions', id: 'cult.reg', root: 13735 },
        { name: 'National Admin Units', id: 'pol.admin.hier', root: 13735 },
        {
            name: 'Historical Polity Admin Units',
            id: 'hist.pol.admin.unit',
            root: 24107,
        },
        { name: 'Electoral Relationships', id: 'elect.rel', root: 13735 },
        { name: 'Site Relationships', id: 'site.rel', root: 26870 },
        /*{ name: 'Political Relationships', id: 'pol.rel' },*/
        /*{ name: 'Cultural Relationships', id: 'cult.rel' }, */
        { name: 'Environmental Relationships', id: 'envir.rel', root: 15431 },
        /* { name: 'Administrative Relationships', id: 'admin.rel' },*/
        /* { name: 'Organizational Relationships', id: 'org.rel' }, */
        /*{ name: 'Religious Relationships', id: 'rel.rel' }, */
        /*{ name: 'Geographic Relationship', id: 'geo.rel' },*/
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
        // console.log('Perspective is now: ', evt.target.value);
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
