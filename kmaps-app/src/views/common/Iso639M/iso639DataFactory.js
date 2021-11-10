import React from 'react';

/** Comment these out to post to server
import ISO6391 from 'iso-639-1';
import { iso6393 } from 'iso-639-3';
 */
// This is the react component that creates the JSON data in a <pre></pre> tag:

export function Iso639DataFactory(props) {
    return <div>ISO 639 NPM Packages Not Available.</div>; // Comment out to use locally
    /*
    /!* Comment out below to post to server *!/
    const all2Codes = ISO6391.getAllCodes();
    const allNames = ISO6391.getAllNames();
    const allNativeNames = ISO6391.getAllNativeNames();
    const data = {};
    for (let i in all2Codes) {
        const cd = all2Codes[i];
        const cd3 = convertLangCode(cd);
        const nm = allNames[i];
        let cd3data = iso6393.filter((c3d) => {
            return c3d.name === nm;
        });
        cd3data = cd3data?.length > 0 ? cd3data[0] : false;

        data[cd] = {
            name: nm,
            native: allNativeNames[i],
            iso1: cd,
            iso3: convertLangCode(cd),
            iso3b: cd3data?.iso6392B ? cd3data?.iso6392B : false,
            iso3t: cd3data?.iso6392T ? cd3data?.iso6392T : false,
            type: cd3data?.type ? cd3data.type : false,
        };
    }
    return (
        <div>
            <pre>{JSON.stringify(data, null, 4)}</pre>
        </div>
    );*/
}

/*

THE FOLLOWING COMMENTED OUT BLOCK CONTAINS THE FUNCTIONS USED TO CREATE THE CUSTOM DATA, iso639data.js, FILE
THEY USE NPM PACKAGES THAT ARE NOT AVAILABLE IN REACT NATIVELY
I COULDN'T INSTALL THEM ON THE SERVER BUT COULD DO SO LOCALLY
*/

/*

/!**
 * Convert lang codes between iso-639-1 (2 letter) and iso-639-3 (3 letter) versions.
 * E.g. bo => tib
 * @param lc
 * @returns {string|boolean|boolean}
 *!/
export function convertLangCode(lc) {
    const langname = getLangNameFromCode(lc);
    if (!langname) {
        return false;
    }
    if (lc?.length === 3) {
        return ISO6391.getCode(langname);
    } else if (lc?.length === 2) {
        const langdata = iso6393.filter((lng) => {
            return lng.name === langname;
        });
        return langdata?.length > 0 ? langdata[0].iso6393 : false;
    }
}

/!**
 * Get a languages name from the code
 * @param lc : the language code 2 or 3 letters long
 * @param native  : boolean on whether to return the native languages name for itself
 * @returns {string|boolean}
 *!/
export function getLangNameFromCode(lc, native = false) {
    if (lc?.length === 3) {
        const langdata = iso6393.filter((lng) => {
            return lng.iso6393 === lc;
        });
        if (native) {
            const shortcd = convertLangCode(lc);
            return ISO6391.getNativeName(lc);
        } else {
            return langdata?.length > 0 ? langdata[0].name : false;
        }
    } else if (lc?.length === 2) {
        if (native) {
            return ISO6391.getNativeName(lc);
        } else {
            return ISO6391.getName(lc);
        }
    }
}

/!**
 * Get the lang code of a certain length from the name
 *
 * @param langnm : the name of the language to get the code for
 * @param cdlen  : the length of the code to return either 2 or 3, defaults to 2.
 * @returns {string|boolean}
 *!/
export function getLangCodeFromName(langnm, cdlen = 2) {
    if (cdlen === 3) {
        const langdata = iso6393.filter((lng) => {
            return lng.name === langnm;
        });
        return langdata?.length > 0 ? langdata[0].iso6393 : false;
    } else if (cdlen === 2) {
        return ISO6391.getCode(langnm);
    }
}
*/
