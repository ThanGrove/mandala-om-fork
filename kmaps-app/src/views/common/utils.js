import _ from 'lodash';
import $ from 'jquery';
import {
    BsCheckCircle,
    BsLayoutTextSidebarReverse,
    BsMap,
    ImStack,
} from 'react-icons/all';
import React from 'react';
import { Link } from 'react-router-dom';
import GenericPopover from './GenericPopover';
import MandalaCitation from '../Sources/MandalaCitation';
import { HtmlCustom } from './MandalaMarkup';

export function buildNestedDocs(docs, child_type, path_field) {
    path_field = path_field ? path_field : child_type + '_path_s';

    const base = {};
    docs = _.filter(docs, (x) => {
        return x.block_child_type === child_type;
    });

    _.forEach(docs, (doc, i) => {
        const path = doc[path_field].split('/');
        doc.order = i;
        if (path.length === 1) {
            // this is a "root doc", push it on the base list
            base[path[0]] = doc;
        } else {
            // this is a "nested doc"

            // check for each "ancestor"
            // create  "fake ancestor", if it doesn't exist
            // add the doc to its parent in _nestedDoc_ field
            //      created _nestedDoc_ field if it doesn't exist
            //      if it already exists (it might have been faked earlier), populate fields
            // console.log("buildNestedDocs: nested path = ", path);
            var curr = base;
            for (let i = 0; i < path.length; i++) {
                if (!curr[path[i]]) {
                    curr[path[i]] = {};
                }
                if (i === path.length - 1) {
                    curr[path[i]] = doc;
                }
                if (!curr[path[i]]._nested_) {
                    curr[path[i]]._nested_ = {};
                }
                curr = curr[path[i]]._nested_;
            }
        }
    });
    return base;
}

/**
 * Generic function to normalize links in document's html from Mandala APIs
 * This needs to be called from UseEffect once html has been inserted.
 * It is called from kmaps-app/src/context/MdlAssetContext.js
 */
export function normalizeLinks(asset_type) {
    if (typeof asset_type == 'undefined') {
        asset_type = 'mandala';
    }
    let aels = [];
    // Mandala Assets inserted in text that have the attribute "data-mandala-id"
    const mandala_items = document.querySelectorAll('[data-mandala-id]');
    _.forEach(mandala_items, function (el) {
        const mid = el.getAttribute('data-mandala-id');
        const new_url = '/' + mid.replace('-', '/');
        aels = el.getElementsByTagName('a');
        _.forEach(aels, function (ael) {
            ael.setAttribute('href', new_url);
            ael.setAttribute('target', '_self');
        });
    });

    // Update links to external sources so they are either internal or disabled (currently all disabled)
    aels = document.querySelectorAll('a');
    _.forEach(aels, function (el) {
        const href = el.getAttribute('href');
        if (href) {
            if (href.indexOf('shanti_texts/node_ajax_text') > -1) {
                return;
            } else if (href.indexOf('/content') === 0) {
                // All /content/... links are in the same app
                el.setAttribute('data-asset-type', asset_type);
                el.setAttribute('data-url', href);
                el.setAttribute('href', '#');
                el.removeAttribute('target');
                el.classList.add('extlink');
            } else if (href.indexOf('.shanti.virginia.edu') > -1) {
                // Links to .shanti.virginia.edu. Disable for now"
                el.setAttribute('data-url', href);
                el.removeAttribute('href');
                el.setAttribute('href', '#');
                el.removeAttribute('target');
                el.classList.add('extlink');
            }
        }
    });
}

export function isLat(str) {
    const low = 0;
    const high = 3839;
    return testChars(str, low, high);
}

export function isTib(str) {
    const low = 3839;
    const high = 4096;
    return testChars(str, low, high);
}

function testChars(str, lower, upper) {
    if (typeof str !== 'string' || typeof (lower + upper) !== 'number') {
        return false;
    }
    str = str.replace(/\s/g, '');
    if (str.length === 0) {
        return false;
    }
    let isInRange = true;
    for (let n in str) {
        let chcd = str.charCodeAt(n);
        isInRange = lower < chcd < upper;
    }
    return isInRange;
}

/**
 *
 * @param sel
 */
export function addBoClass(sel) {
    const els =
        'h1, h2, h3, h4, h5, h6, h7, div, p, blockquote, li, span, label, th, td, a, b, strong, i, em, u, s, dd, dl, dt, figure';
    const repat = /[a-zA-Z0-9\,\.\:\;\-\s]/g; // the regex patter to strip latin and other characters from string

    const ellist =
        typeof sel === 'undefined' || sel === 'all' ? $(els) : $(sel).find(els);

    // Iterate through such elements
    ellist.each(function () {
        //var etxt = $.trim($(this).text());  // get the text of the element
        var etxt = $(this).clone().children().remove().end().text(); // See https://stackoverflow.com/a/8851526/2911874
        etxt = etxt.replace(repat, ''); // strip of irrelevant characters
        var cc1 = etxt.charCodeAt(0); // get the first character code
        // If it is within the Tibetan Unicode Range
        if (cc1 > 3839 && cc1 < 4096) {
            // If it does not already have .bo
            if (!$(this).hasClass('bo') && !$(this).parents().hasClass('bo')) {
                $(this).addClass('bo'); // Add .bo
            }
        }
    });
}

export function grokId(id) {
    const [nid] = id.match(/(\d+)$/);
    return nid;
}

export function fitDimensions(maxHeight, maxWidth, imgHeight, imgWidth) {
    const targetProportions = maxHeight / maxWidth;
    const imageProportions = imgHeight / imgWidth;
    let targetHeight = 0;
    let targetWidth = 0;
    if (targetProportions < imageProportions) {
        // height constrained
        targetHeight = maxHeight;
        targetWidth = Math.floor(imgWidth * (maxHeight / imgHeight));
    } else {
        // width constrained
        targetWidth = maxWidth;
        targetHeight = Math.floor(imgHeight * (maxWidth / imgWidth));
    }
    return { height: targetHeight, width: targetWidth };
}

/**
 * Function to replace entity codes with the character in text
 * Currently  has only &#039 => '
 * @param txt
 * @returns {*}
 */
export function fixEntities(txt) {
    if (typeof txt === 'string' || txt instanceof String) {
        const ents = ["&#039;|'"];
        ents.forEach((ent, en) => {
            const [fnd, rep] = ent.split('|');
            const re = new RegExp(fnd, 'g');
            txt = txt.replace(re, rep);
        });
    }
    return txt;
}

export function selectIcon(type) {
    const mykey = `${type}-${Math.ceil(Math.random() * 10000)}`;
    const ICON_MAP = {
        'audio-video': (
            <span
                className={'facetItem icon u-icon__audio-video'}
                key={`av-${mykey}`}
            />
        ),
        texts: (
            <span
                className={'facetItem icon u-icon__texts'}
                key={`texts-${mykey}`}
            />
        ),
        'texts:pages': (
            <span
                className={'facetItem icon u-icon__texts'}
                key={`texts-pages-${mykey}`}
            />
        ),
        images: (
            <span
                className={'facetItem icon u-icon__images'}
                key={`images-${mykey}`}
            />
        ),
        sources: (
            <span
                className={'facetItem icon u-icon__sources'}
                key={`sources-${mykey}`}
            />
        ),
        visuals: (
            <span
                className={'facetItem icon u-icon__visuals'}
                key={`visuals-${mykey}`}
            />
        ),
        places: (
            <span
                className={'facetItem icon u-icon__places'}
                key={`places-${mykey}`}
            />
        ),
        subjects: (
            <span
                className={'facetItem icon u-icon__subjects'}
                key={`subjects-${mykey}`}
            />
        ),
        terms: (
            <span
                className={'facetItem icon u-icon__terms'}
                key={`terms-${mykey}`}
            />
        ),
        collections: (
            <span className={'facetItem'} key={`facetitem-${mykey}`}>
                <ImStack />
            </span>
        ),
        asset_type: (
            <span className={'facetItem'} key={`facetitem2-${mykey}`}>
                <BsCheckCircle />
            </span>
        ),
        users: (
            <span
                className={'facetItem icon u-icon__community'}
                key={`community-${mykey}`}
            />
        ),
        creator: (
            <span
                className={'facetItem icon u-icon__agents'}
                key={`agents-${mykey}`}
            />
        ),
        languages: (
            <span
                className={'facetItem icon u-icon__comments-o'}
                key={`comments-${mykey}`}
            />
        ),
        feature_types: (
            <span className={'facetItem'} key={`feattypes-${mykey}`}>
                <BsMap />
            </span>
        ),
        associated_subjects: (
            <span
                className={'facetItem icon u-icon__essays'}
                key={`essays-${mykey}`}
            />
        ),
        perspective: (
            <span
                className={'facetItem icon u-icon__file-picture'}
                key={`picture-${mykey}`}
            />
        ),
        search: (
            <span
                className={'facetItem icon u-icon__search'}
                key={`search-${mykey}`}
            />
        ),
    };

    return ICON_MAP[type];
}

export function createAssetCrumbs(kmasset) {
    const asset_type = kmasset.asset_type;
    let bcrumbs = [
        {
            uid: '/' + asset_type,
            name: capitalAsset(asset_type),
        },
    ];
    if (
        kmasset.collection_title_path_ss &&
        kmasset.collection_title_path_ss.length > 0
    ) {
        for (
            var bcn = 0;
            bcn < kmasset.collection_title_path_ss.length;
            bcn++
        ) {
            const colltitle = kmasset.collection_title_path_ss[bcn];
            const collnid = kmasset.collection_nid_path_is[bcn];
            const colluid = `/${asset_type}/collection/${collnid}`;
            bcrumbs.push({
                uid: colluid,
                name: colltitle,
            });
        }
        const mytitle =
            kmasset.title && kmasset.title.length > 0
                ? kmasset.title[0]
                : kmasset.caption;
        let selfbc = {
            uid: '#',
            name: mytitle,
        };
        bcrumbs.push(selfbc);
    }
    return bcrumbs;
}

export function capitalAsset(asn) {
    if (typeof asn !== 'string' || asn.length === 0) {
        return '';
    }
    return asn[0].toUpperCase() + asn.substr(1).replace('-v', '-V');
}

/**
 * Take a type and id and return them concatenated together with a hypen
 * Example: type: texts, id: 584, Result: texts-584
 */
export function queryID(type, id) {
    return `${type}-${id}`;
}

export function parseParams(ss) {
    if (!ss || typeof ss !== 'string' || ss?.length === 0) {
        return false;
    }
    ss = ss.replace(new RegExp('^[?]'), '');
    const sspts = ss.split('&');
    const paramobj = {};
    sspts.map((pt) => {
        const subpts = pt.split('=');
        if (subpts.length > 1) {
            paramobj[subpts[0]] = subpts[1];
        } else {
            paramobj[subpts[0]] = true;
        }
    });
    return paramobj;
}

export function getProject() {
    return process?.env?.REACT_APP_PROJECT
        ? process.env.REACT_APP_PROJECT
        : false;
}

/**
 * Creates a hash for a React element key value by taking an index and creating a string with the timestamp and
 * hashing it.
 * @param indexin : string
 *      an index number or string initializer
 * @returns {number}
 */
export function getKeyHash(indexin) {
    // From https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/ but modified
    let hashString = new Date().getTime() + '-' + indexin;
    let hash = 0;

    if (hashString.length == 0) return hash;

    for (let i = 0; i < hashString.length; i++) {
        let achar = hashString.charCodeAt(i);
        hash = (hash << 5) - hash + achar;
        hash = hash & hash;
    }

    return hash;
}

/**
 * Returns true if type given is an asset type and not a kmap type
 * Otherwise returns false
 *
 * @param mytype
 * @returns {boolean}
 */
export function isAssetType(mytype) {
    const assetTypes = [
        'audio-video',
        'av',
        'images',
        'sources',
        'texts',
        'visuals',
    ];
    return assetTypes.includes(mytype);
}

export function isKmap(mytype) {
    return ['places', 'subjects', 'terms'].includes(mytype);
}

/**
 * Capitalize function since one is not provided by JS.
 */
export const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Convert a string to a hash
 *      Taken from https://stackoverflow.com/a/8076436/2911874
 */
export function stringToHash(astr) {
    var hash = 0;
    for (var i = 0; i < astr.length; i++) {
        var character = astr.charCodeAt(i);
        hash = (hash << 5) - hash + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function getHeaderForView(kmapdata, viewdata) {
    const view = viewdata?.includes('|') ? viewdata.split('|')[1] : viewdata;
    const fieldname = `name_${view}`;
    const kmkeys = Object.keys(kmapdata);
    let kmhead = kmkeys.includes(fieldname)
        ? kmapdata[fieldname]
        : kmapdata?.header;
    if (Array.isArray(kmhead)) {
        kmhead = kmhead.length > 1 ? kmhead[1] : kmhead[0];
    }
    if (!kmhead) {
        kmhead = kmapdata?.header;
    }
    return kmhead;
}

/**
 * Generic function to retrieve date or citation reference from a SOLR document
 * Given the field name. Checks to see if value exists and if value is an array,
 * then returns the first item in array.
 * If field is not in record or has no date, it returns false
 *
 * @param {Object} data - The kmaps SOLR document as a JS object
 * @param {string} field - The name of the field whose value is to be retrieved
 * @returns {boolean|string}
 */
export function getFieldData(data, field) {
    if (!data || !field || !Object.keys(data).includes(field) || !data[field]) {
        return false;
    }
    let val = Array.isArray(data[field]) ? data[field].join(' ') : data[field];
    if (val && val.length > 0) {
        return val;
    }
    return false;
}

/**
 *
 * Checks if SOLR document has a note field and returns the data from that field.
 * Either searches for parameter with name note_... or uses given field name
 * and then calls getFieldData() to get the data from that field
 *
 * @param data
 * @param title
 * @param field
 * @returns {JSX.Element|null}
 */
export function getSolrNote(data, title, field) {
    let note_key = null;
    if (field !== undefined) {
        note_key = field;
    } else {
        note_key = Object.keys(data).filter((k, i) => {
            return k.includes('note_');
        });
        if (note_key.length === 0) {
            return null;
        }
        note_key = note_key[0];
    }
    const notedata = getFieldData(data, note_key);
    return notedata ? (
        <GenericPopover title={title} content={notedata} />
    ) : null;
}

/**
 * Get a citation JSX element from solr doc and field if citation exists
 *
 * @param {Object} data - The kmaps items solr doc as a JS object
 * @param {string} title - Title for top of not popupe
 * @param {string} field - Name of the field that contains the reference info
 * @returns {JSX.Element|null}
 */
export function getSolrCitation(data, title, field, nodate) {
    if (!data || !title || !field) {
        return null;
    }
    if (typeof nodate === undefined) {
        nodate = false;
    }
    let citedata = getFieldData(data, field);
    if (!citedata || citedata.length === 0) {
        // console.log('No citation data found for field: ', field, data);
        return null;
    }
    const cdstripped = citedata?.replace(/[\s\.\,\;]+/g, '');
    if (!isNaN(cdstripped)) {
        citedata = <MandalaCitation srcid={cdstripped} />;
    } else if (citedata.search(/<\/[^>]+>/)) {
        // remove links as will probably be broken in citations.
        citedata = citedata.replace(/<\/?a[^>]*>/g, '');
        // Add links to new tab to URL strings.
        let mre = RegExp(/(https?\:[^\s\)\]]+)[\s\)$]/);
        const mtchs = mre.exec(citedata);
        if (mtchs) {
            citedata = citedata.replace(
                mtchs[1],
                `<a href="${mtchs[1]}" target="_blank">${mtchs[1]}</a>`
            );
        }
        citedata = citedata.replace(/,\s+\./g, '.');
        citedata = citedata.replace(/\s+00:00:00\s+UTC/g, ''); // Remove meaningless time value
        citedata = <HtmlCustom markup={citedata} />;
    } else {
        citedata = citedata.replace(/,\s+\./g, '.');
    }
    const srcicon = <span className="u-icon__file-text-o"> </span>;
    if (typeof citedata === 'string') {
        const tufield = field.replace('_citation_references_', '_time_units_');
        if (
            !nodate &&
            Object.keys(data).includes(tufield) &&
            data[tufield].length > 0
        ) {
            citedata += ' (' + data[tufield].join(' ') + ' CE).';
        }

        citedata = citedata.replace(/\s+00:00:00\s+UTC/g, ''); // Remove meaningless time value
        return (
            <GenericPopover title={title} content={citedata} icon={srcicon} />
        );
    } else {
        return (
            <GenericPopover
                title={title}
                content=""
                children={citedata}
                icon={srcicon}
            />
        );
    }
    return null;
}

/**
 * Return the value from the date field of a SOLR doc, assuming there is one field with _time_units_ in its name.
 * Optionally, can provide a date field namet
 * @param data
 * @param field
 * @returns {*|string}
 */
export function getSolrDate(data, datefieldname) {
    let dateval = datefieldname ? data[datefieldname] : '';
    if (!datefieldname) {
        const fldnms = findFieldNames(data, '_time_units_');
        if (fldnms.length > 0) {
            dateval = data[fldnms[0]];
        }
    }
    return dateval;
}

/**
 * A function to find field names in a kmap SOLR doc object from a substring and position or a regular expression
 * @param {Object} data - the SOLR data as a JS Object
 * @param {string} substr - the substring or regular expression to search with
 * @param {string} pos - ["starts", "ends", "regex"]
 * @returns {T[]}
 */
export function findFieldNames(data, substr, pos) {
    if (pos === undefined) pos = 'includes';
    const keys = Object.keys(data);
    return keys.filter((k, ki) => {
        switch (pos) {
            case 'starts':
                return k.startsWith(substr);
            case 'ends':
                return k.endsWith(substr);
            case 'regex':
                const re = new RegExp(substr);
                return k.match(re) ? true : false;
            default:
                return k.includes(substr);
        }
    });
}

/**
 * Takes a JSON version of a Drupal entity with a field_language KMap Field and returns the HTML class for the span
 * @param drpljson
 */
export function getLangClass(drpfld) {
    let langclass;
    const langfield = drpfld?.field_language;
    let langhead =
        langfield?.und?.length > 0
            ? langfield.und[0]?.header.toLowerCase()
            : false;
    if (langhead === false && typeof drpfld === 'string') {
        langhead = drpfld.toLowerCase().trim();
    }
    // console.log("In get lang class: ", langhead, drpfld);
    switch (langhead) {
        case 'chinese':
            langclass = 'zh';
            break;
        case 'tibetan':
            langclass = 'bo';
            break;
        case 'myanmar':
        case 'burmese':
            langclass = 'my';
            break;
        case 'english':
            langclass = 'en';
            break;
        default:
            langclass = '';
            break;
    }
    return langclass;
}

/**
 * Find properties of an object that startwith, contain, endwith or match a regex
 *
 * @param obj
 * @param propmtch
 * @param pos
 * @returns {*[]}
 */
export function getPropsContaining(obj, propmtch, pos = 'contains') {
    const propnames = [];
    for (let propname in obj) {
        if (pos === 'starts' && propname.startsWith(propmtch)) {
            propnames.push(propname);
        }
        if (pos === 'contains' && propname.includes(propmtch)) {
            propnames.push(propname);
        }
        if (pos === 'ends' && propname.endsWith(propmtch)) {
            propnames.push(propname);
        }
        if (pos === 'regex' && propname.match(propmtch)) {
            propnames.push(propname);
        }
    }
    return propnames;
}

/**
 * Find object properties based on given RegEx pattern and makes sure they are unique
 *
 * @param data
 * @param regex
 * @param mindex
 *      the index for the match to capture
 * @returns {unknown[]}
 */
export function getUniquePropIds(data, regex, mindex = 1) {
    let ids = Object.keys(data)
        .map((pn) => {
            const mtch = pn.match(regex);
            if (mtch) {
                return mtch[mindex];
            }
            return;
        })
        .filter((it) => {
            return it; // filter out empty/null instances
        });
    ids = new Set(ids);
    return Array.from(ids);
}

/**
 *
 * @param data
 * @param regex
 * @param propname : the name of the prop with $ID$ where the id goes
 */
export function getFirstUniqueProp(data, regex, propname) {
    const ids = getUniquePropIds(data, regex);
    const firstid = ids[0];
    propname = propname.replace('$ID$', firstid);
    return data[propname];
}

/**
 * Detect a language from the unicode code point of its first character
 *
 * @param str
 * @returns {string} : the language code
 */
export function detectLanguage(str) {
    let lngcode = 'en'; // default lang code
    if (str?.length > 0) {
        const fchr = str.charCodeAt(0); // Code of the first character
        if (3839 < fchr < 4096) {
            lngcode = 'bo'; // Tibetan
        } else if (19967 < fchr < 40960) {
            lngcode = 'zh'; // Chinese
        } else if (2303 < fchr < 2432) {
            lngcode = 'sa'; // Sanskrit (or any language using Devanagari)
        }
    }
    return lngcode;
}

export function decodeEntities(str) {
    // Taken from https://stackoverflow.com/a/9609450/2911874
    // this prevents any overhead from creating the object each time
    const element = document.createElement('div');
    if (str && typeof str === 'string') {
        // strip script/html tags
        str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, '');
        str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, '');
        element.innerHTML = str;
        str = element.textContent;
        element.textContent = '';
    }
    return str;
}

/**
 * Removes URL Params and redirects to the clean url
 */
export const removeURLParams = () => {
    const href = window.location.href;
    if (href.includes('?')) {
        const [myurl, sstr] = href.split('?');
        let hash = '';
        if (sstr.includes('#')) {
            hash = '#' + sstr.split('#')[1];
        }
        const newurl = myurl + hash;
        window.history.pushState({}, undefined, newurl);
    }
};

/**
 * Translates lang code into label
 * @param lng
 * @returns {string|*}
 */
export const langCodeToLabel = (lng) => {
    switch (lng) {
        case 'bo':
            return 'Tibetan';
        case 'dz':
            return 'Dzongkha';
        case 'en':
            return 'English';
        case 'sa':
            return 'Sanskrit';
        case 'zh':
            return 'Chinese';
        default:
            return lng;
    }
};

export const standaloneSettings = (mode, name, value = '') => {
    let setname = process.env.REACT_APP_PUBLIC_URL.replace(/https?:\//, '')
        .replace(/^\/([^\/]+)\/$/, '$1')
        .replace(/[\/\.]/g, '_');
    if (!window[setname]) {
        window[setname] = {
            url: process.env.REACT_APP_PUBLIC_URL,
        };
    }
    let mysettings = window[setname];
    if (mode === 'set') {
        mysettings[name] = value;
        window[setname] = mysettings;
        return true;
    } else {
        return mysettings[name];
    }
};
