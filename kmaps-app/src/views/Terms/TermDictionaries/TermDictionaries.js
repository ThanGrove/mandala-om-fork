import React, { useEffect } from 'react';
import ReactHtmlParser from 'react-html-parser';
import './TermDictionaries.css';
import { getLangClass, getUniquePropIds } from '../../common/utils';
import { Link } from 'react-router-dom';

/**
 * TermDictionaries is original component by Gerard
 * Andres updated SOLR field names since then. Than created singular TermDictionary below based on this.
 * 2023-01-02
 * @param definitions
 * @returns {JSX.Element}
 * @constructor
 */
const TermDictionaries = ({ definitions, kmapData }) => {
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
    return (
        <div className="sui-termDicts__wrapper">
            <div className="sui-termDicts__content">
                {Object.keys(definitions).map((key, i) => (
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

                                    {dict.related_definitions_language_s && (
                                        <div className="sui-termDicts__dict-extra">
                                            <span className="sui-termDicts__dict-extra-lang">
                                                Language:
                                            </span>{' '}
                                            <span className="sui-termDicts__dict-extra-lang-text ">
                                                {
                                                    dict.related_definitions_language_s
                                                }
                                            </span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
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
        return (
            <dl>
                {relations.map((r, ri) => {
                    const k = dict + 'relterm' + ri;
                    let lkn = r?.related_terms_id_s?.replace('-', '/');
                    if (!lkn?.length > 0) {
                        lkn = '#';
                    } else {
                        lkn = '/' + lkn;
                    }
                    return (
                        <React.Fragment key={k}>
                            <dt>{r?.related_terms_relation_label_s}</dt>
                            <dd>
                                <Link to={lkn}>
                                    {r?.related_terms_header_s}
                                </Link>
                            </dd>
                        </React.Fragment>
                    );
                })}
            </dl>
        );
    }
    return null;
}
