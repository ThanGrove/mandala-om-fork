/** Connectors **/
export const FIRST = 0; // For use with first line????
export const AND = 1;
export const OR = 2;
export const ANDNOT = 3;

/** Fields **/
export const ANY = 10;
export const TITLE = 11;
export const PERSON = 12;
export const REL_PLACES = 13;
export const REL_SUBJECTS = 14;
export const REL_TERMS = 15;
export const PUB_PLACE = 16;
export const PUBLISHER = 17;
export const IDS = 18;
export const CREATE_DATE = 19;
export const ENTRY_DATE = 20;
export const RESOURCE_TYPE = 21; // NOT USING

/** Scope **/
export const CONTAINS = 50;
export const EXACTLY = 51;
export const STARTSWITH = 52;
export const ENDSWITH = 53;
export const BETWEEN = 54;
export const LAST1YEAR = 55;
export const LAST5YEARS = 56;
export const LAST10YEARS = 57;

/** Solr fields to use for each field choice listed above, the number must match the constant value **/
export const SOLRFIELDS = {
    // ANY
    10: ['text'],
    // TITLE
    11: [
        'title',
        'caption',
        'name_latin',
        'name_roman.scholar',
        'name_tibt',
        'name_hans',
        'name_zh',
        'name_deva',
        'title_alt_t',
        'title_alt_bo_latn_t',
        'title_corpus_bo_t',
        'title_corpus_bo_latn_t',
        'title_long_bo_t',
        'title_short_t',
        'title_short_bo_latn_t',
        'caption_alt_txt',
        'caption_alt_lang_ss',
    ],
    // PERSON
    12: ['creator'],
    // RELATED KMAPS
    13: ['kmapid_places_idfacet'],
    14: ['kmapid_subjects_idfacet'],
    15: ['kmapid_terms_idfacet'],
    // PUB FIELDS
    16: ['pubplace_s'],
    17: ['publisher_s'],
    // ID FIELDS
    18: ['uid', 'isbn_id_s', 'issn_id_s', 'doi_id_s', 'iiif_id_s'],
    // DATE FIELDS
    19: ['date_start'], // Note: for sources do not need 'pubyear_s' because date_start is the UTC version of it
    20: ['node_created'],
    21: ['asset_type'],
};

export const TIB_FIELDS = [
    'title',
    'caption',
    'name_tibt',
    'title_alt_t',
    'title_corpus_bo_t',
    'title_long_bo_t',
    'title_short_t',
    'caption_alt_txt',
];

export const ASSET_TYPES = {
    'audio-video': 'Audio-Visual',
    collections: 'Collections',
    images: 'Images',
    places: 'Places',
    sources: 'Sources',
    subjects: 'Subjects',
    terms: 'Terms',
    texts: 'Texts',
    visuals: 'Visualizations',
};

export function isDate(choice) {
    const choices = [CREATE_DATE, ENTRY_DATE];
    return choices.includes(choice * 1);
}

export function needsDateString(choice) {
    const choices = [EXACTLY, BETWEEN];
    return choices.includes(choice * 1);
}
