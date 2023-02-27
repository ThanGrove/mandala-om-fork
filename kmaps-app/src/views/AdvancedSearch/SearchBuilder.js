import * as SC from './SearchConstants';
import { LAST1YEAR } from './SearchConstants';

/**
 * Main Class is SearchBuilder. It uses a secondary class QueryItem which processes each line from the form
 * TODO: extend QueryItem to work with kmaps relateds, and dates.
 *
 * sample query in form:
         FIRST|TITLE|CONTAINS|meditation
         OR|PERSON|STARTSWITH|David
 */

export class SearchBuilder {
    /**
     * Search Builder: A JS class to construct SOLR queries from a list of data items.
     *
     * Initialize with a array of data items which are strings separated by a delim or
     * an array of already split up arrays
     * @param data
     * @param delim
     */
    constructor(data, delim = '|') {
        this.data = data;
        this.delim = delim;
        this.lines = '';
        this.items = '';
        this.query = '';
        this.init();
    }

    init() {
        this.lines = this.processData();
        this.items = this.convertLines();
    }

    /**
     * Process the list of items into normalized, list of lists, each with 4 items
     * @returns {*}
     */
    processData() {
        const data = this?.data;
        if (!data) {
            console.log('no data here');
        }
        let lines = [];
        // If the data list is already a list of 4-item lists just return it
        if (Array.isArray(data)) {
            if (data?.length === 0) {
                return false; // Return false when data is not in the correct format.
            }
            lines = data;
        } else if (data instanceof String) {
            lines = data.split('\n');
        }
        // otherwise, break each item up. If it is a string with delimiter or object with named propreties
        return lines.map((item, itn) => {
            // console.log('item ' + itn, item);
            if (item instanceof Object) {
                const scpval = isNaN(item?.scope * 1)
                    ? item?.scope
                    : item?.scope * 1;
                let res = [
                    item?.conn * 1,
                    item?.field * 1,
                    scpval,
                    item?.text,
                    item?.isdate,
                ];
                return res;
            } else if (item instanceof String && item.includes(this.delim)) {
                // TODO: deal with "isdate" in delimited string if need be
                return item.split(this.delim).map((pt, ptn) => {
                    if (!isNaN(pt * 1)) {
                        return pt * 1;
                    }
                    return pt;
                });
            } else {
                console.log(
                    'Mandala Search Builder: delim not found in item #' + itn
                );
            }
        });
    }

    convertLines() {
        return this?.lines?.map((ln, lnn) => {
            if (Array.isArray(ln)) {
                return new QueryItem(...ln);
            }
        });
    }

    buildQuery() {
        let qs = '';
        this.items.map((itm, itmn) => {
            qs += itm?.getQuery();
        });
        this.query = qs;
        return this.query;
    }
}

class QueryItem {
    /**
     * Builds a single query item (equivalent to one line from the form)
     * Values for conn, field, and scope must be the integer values defined in SearchConstants.js
     * And must have the corresponding key defined in SearchConstants.SOLRFIELDS object
     *
     * @param conn
     * @param field
     * @param scope
     * @param qstr
     */
    constructor(conn, field, scope, qstr, isdate) {
        //console.log("Constructior: field is:", field);
        this.conn = conn;
        this.connstr = this.getConnector(this.conn);
        this.field = field;
        this.fieldlist = this.getFields(this.field);
        this.scope = scope;
        this.qstr = qstr;
        this.query = ';';
    }

    getQuery() {
        // builds the query for this item
        this.query = `${this.connstr}(${this.buildQueryString()})`; // Saves in class for later use
        return this.query; // But also returns it for use outside class
    }

    getConnector(conn) {
        switch (conn) {
            case SC.AND:
                return ' AND ';
            case SC.OR:
                return ' OR ';
            case SC.ANDNOT:
                return ' AND -';
            default:
                return '';
        }
    }

    getFields(field) {
        if (field) {
            field = isNaN(field) ? field : field.toString();
            if (Object.keys(SC.SOLRFIELDS).includes(field)) {
                return SC.SOLRFIELDS[field];
            }
        }
        return ['text']; // default to 'text' = all fields
    }

    // TODO: Need to deal with "and not". To make the minus work the item's string needs to be in parentheses.
    buildQueryString() {
        let query = '';
        let escqs = encodeURIComponent(this?.qstr);
        this.fieldlist.map((fld, fn) => {
            if (fn > 0 && fn < this.fieldlist.length) {
                query += ' OR ';
            }
            switch (this?.scope) {
                case SC.EXACTLY:
                    query += `${fld}:${escqs}`;
                    break;
                case SC.STARTSWITH:
                    query += `${fld}:${escqs}*`;
                    break;
                case SC.ENDSWITH:
                    query += `${fld}:*${escqs}`;
                    break;
                case SC.LAST1YEAR:
                    query += `${fld}:[NOW-1YEAR TO NOW]`;
                    break;
                case SC.LAST5YEARS:
                    query += `${fld}:[NOW-5YEAR TO NOW]`;
                    break;
                case SC.LAST10YEARS:
                    query += `${fld}:[NOW-10YEAR TO NOW]`;
                    break;
                case SC.BETWEEN:
                    if (escqs.includes('-')) {
                        const [stdt, enddt] = escqs.split('-');
                        query += `${fld}:[${stdt} TO ${enddt}]`;
                    } else {
                        console.log(
                            'Query string needs to be two SOLR dates separated by a dash, using default query'
                        );
                        query += '*:*';
                    }
                default:
                    if (this.field === SC.RESOURCE_TYPE) {
                        query += `${fld}:${this.scope}`;
                    } else {
                        query += `${fld}:*${escqs}*`;
                    }
            }
        });
        return query;
    }
}
