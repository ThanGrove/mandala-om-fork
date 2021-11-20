// import React from 'react';
// import ISO6391 from 'iso-639-1';
// import { iso6393 } from 'iso-639-3';
import { iso639 } from './iso639data';

/**
 *
 * Iso639M is a custom Javascript Object that provides language utilities based on the ISO 639 language codes, written
 * for use with the Mandala React site:
 *      iso-639-1 : the 2-character language codes
 *      iso-639.3 : the 3-character language codes
 * It uses a custom data set of these character, iso639data.js, and provides the following functions:
 *      convertLangCode — converts a code of one length to the other length
 *      getLangNameFromCode — retrieves either the standard or native name for a language from either type of code
 *      getLangCodeFromName — returns the desired length code from the standard name give
 */
export const Iso639M = {
    convertLangCode: (lc) => {
        if (!(lc in iso639)) {
            const l3data = Iso639M.get3Data(lc);
            lc = l3data?.iso1;
            if (!lc) {
                return false;
            }
            return lc;
        }
        const langdata = iso639[lc];
        return langdata.iso3;
    },
    getLangNameFromCode: (lc, useNative = false) => {
        lc = lc?.length === 3 ? this.convertLangCode(lc) : lc;
        const langdata = iso639[lc];
        const native = langdata.native ? langdata.native : langdata.name; // if no native, return regular name for native
        return useNative ? native : langdata.name;
    },
    getLangCodeFromName: (lname, codelen = 2) => {
        for (const k in iso639) {
            const ldata = iso639[k];
            if (ldata.name === lname || ldata.native === lname) {
                return codelen === 3 ? ldata.iso3 : ldata.iso1; // iso3 vs. iso1 refers to iso-639-3 and iso-639-1 not the number of characters
            }
        }
    },
    get3Data: (lc) => {
        for (let lckey in iso639) {
            let langdata = iso639[lckey];
            if (
                langdata?.iso3 === lc ||
                langdata?.iso3b === lc ||
                langdata?.iso3t === lc
            ) {
                return langdata;
            }
        }
        return false;
    },
};
