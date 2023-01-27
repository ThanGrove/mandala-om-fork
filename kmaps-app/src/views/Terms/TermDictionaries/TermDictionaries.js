import React, { useEffect } from 'react';
import ReactHtmlParser from 'react-html-parser';
import './TermDictionaries.css';
import { getLangClass, getUniquePropIds } from '../../common/utils';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from 'react-query';

/**
 * Kmaps Terms Api that returns order of dictionaries to display
 * @returns {Promise<any>}
 */
export const getDictionaryOrder = async () => {
    const apiurl = `https://terms.kmaps.virginia.edu/admin/info_sources.json`;
    const { data } = await axios.request(apiurl);
    return data;
};

/**
 * TermDictionaries is original component by Gerard
 * Andres updated SOLR field names since then. Than created singular TermDictionary below based on this.
 * 2023-01-02
 * @param definitions
 * @returns {JSX.Element}
 * @constructor
 */
const TermDictionaries = ({ definitions, kmapData }) => {
    const {
        isLoading: isDictOrderLoading,
        data: dictOrderData,
        isError: isDictOrderError,
        error: dictOrderError,
    } = useQuery(
        ['kmaps', 'terms', 'dict', 'order', 'api'],
        () => getDictionaryOrder(),
        {
            staleTime: 3600000, // 1 hr in milliseconds
        }
    );

    if (isDictOrderLoading) {
        return null;
    }

    // Once order is loaded get list of dictionary titles in order, filtered for existing defintitions
    let dictOrder = dictOrderData
        ?.map((d, di) => {
            return d?.title;
        })
        .filter((dt, dti) => {
            return Object.keys(definitions).includes(dt); // only keep dictionary titles if their def exists for this term
        });

    // Just in case the order doesn't load or something goes wrong, use the order of the definitions given
    if (!dictOrder || dictOrder?.length === 0) {
        dictOrder = Object.keys(definitions);
    }
    const getDefContent = (subdoc) => {
        const langsuff = getUniquePropIds(
            subdoc,
            /related_definitions_content_(\w+)/
        );
        if (langsuff.length > 0) {
            const fnm = 'related_definitions_content_' + langsuff[0];
            return subdoc[fnm];
        }
        return '';
    };
    const relatedToDefs = kmapData._childDocuments_.filter((c, ci) => {
        return (
            c?.block_child_type === 'related_terms' &&
            c?.related_terms_relation_code_s === 'is.related.to'
        );
    });

    // dictOrder is a list of definition keys by dictionary name
    return (
        <div className="sui-termDicts__wrapper">
            <div className="sui-termDicts__content">
                {dictOrder?.map((key, i) => (
                    <React.Fragment key={key}>
                        <div className="sui-termDicts__dict-name">
                            {i + 1}. <span>{key}</span>
                        </div>
                        <RelatedTermsDictionary
                            dict={key}
                            docs={relatedToDefs}
                        />
                        <ul className="sui-termDicts__dict-wrapper">
                            {definitions[key].map((dict) => (
                                <li
                                    className="sui-termDicts__dict"
                                    data-solrid={dict.id}
                                    key={dict.id}
                                >
                                    <div
                                        className={
                                            'sui-termDicts__dict-def ' +
                                            getLangClass(
                                                dict.related_definitions_language_s
                                            )
                                        }
                                    >
                                        {ReactHtmlParser(
                                            getDefContent(dict).replace(
                                                /(<p[^>]+?>|<p>|<\/p>)/gim,
                                                ''
                                            )
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="sui-termDicts__dict-extra">
                            <span className="sui-termDicts__dict-extra-lang">
                                Language:
                            </span>{' '}
                            <span className="sui-termDicts__dict-extra-lang-text ">
                                {
                                    definitions[key][0]
                                        ?.related_definitions_language_s
                                }
                            </span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default TermDictionaries;

function RelatedTermsDictionary({ dict, docs }) {
    const relations = docs?.filter((d, di) => {
        return d?.related_terms_relation_source_s === dict;
    });
    if (relations?.length > 0) {
        const combrels = {};
        relations.map((r, ri) => {
            const combkey = r?.related_terms_relation_label_s;
            if (!Object.keys(combrels).includes(combkey)) {
                combrels[combkey] = [];
            }
            let lkn = r?.related_terms_id_s?.replace('-', '/');
            if (!lkn?.length > 0) {
                lkn = '#';
            } else {
                lkn = '/' + lkn;
            }
            combrels[combkey].push(
                <Link to={lkn} key={`${dict}-relterm-${ri}`}>
                    {r?.related_terms_header_s}
                </Link>
            );
        });
        return (
            <dl>
                {Object.keys(combrels).map((k, ki) => {
                    const reactkey = `${dict}-${k}-relterm-${ki}`;

                    return (
                        <React.Fragment key={reactkey}>
                            <dt>{k}</dt>
                            <dd>
                                {combrels[k].map((term, ti) => {
                                    const suffix =
                                        ti < combrels[k].length - 1 ? (
                                            ', '
                                        ) : (
                                            <br />
                                        );
                                    return (
                                        <span key={`term-${ki}-${ti}`}>
                                            {term}
                                            {suffix}
                                        </span>
                                    );
                                })}
                            </dd>
                        </React.Fragment>
                    );
                })}
            </dl>
        );
    }
    return null;
}
