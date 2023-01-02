import React, { useEffect } from 'react';
import ReactHtmlParser from 'react-html-parser';
import './TermDictionaries.css';

/**
 * TermDictionaries is original component by Gerard
 * Andres updated SOLR field names since then. Than created singular TermDictionary below based on this.
 * 2023-01-02
 * @param definitions
 * @returns {JSX.Element}
 * @constructor
 */
const TermDictionaries = ({ definitions }) => {
    return (
        <div className="sui-termDicts__wrapper">
            <div className="sui-termDicts__content">
                {Object.keys(definitions).map((key, i) => (
                    <React.Fragment key={key}>
                        <div className="sui-termDicts__dict-name">
                            {i + 1}. <span>{key}</span>
                        </div>
                        <ul className="sui-termDicts__dict-wrapper">
                            {definitions[key].map((dict) => (
                                <li
                                    className="sui-termDicts__dict"
                                    key={dict.id}
                                >
                                    {ReactHtmlParser(
                                        dict.related_definitions_content_s.replace(
                                            /(<p[^>]+?>|<p>|<\/p>)/gim,
                                            ''
                                        )
                                    )}
                                    {dict.related_definitions_language_s && (
                                        <div className="sui-termDicts__dict-extra">
                                            <span className="sui-termDicts__dict-extra-lang">
                                                Language:
                                            </span>{' '}
                                            <span className="sui-termDicts__dict-extra-lang-text">
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

/**
 * Reworking of TermDictionaries above to use new field names in SOLR (2023-01-02)
 * @param definitions
 * @returns {JSX.Element}
 * @constructor
 */
export const TermDictionary = ({ data, field, index }) => {
    let lang = data?.related_definitions_language_code_s;
    if (!lang || lang.length == 0) {
        lang = 'en';
    }
    if (lang === 'bod') {
        lang = 'bo';
    }
    return (
        <div className="sui-termDicts__wrapper">
            <div className="sui-termDicts__content">
                <div className="sui-termDicts__dict-name">
                    {index}. <span>{data?.related_definitions_source_s}</span>
                </div>
                <ul className="sui-termDicts__dict-wrapper">
                    <li
                        className={`sui-termDicts__dict ${lang}`}
                        key={Date.now()}
                    >
                        {ReactHtmlParser(
                            data[field].replace(/(<p[^>]+?>|<p>|<\/p>)/gim, '')
                        )}
                        {data.related_definitions_language_s && (
                            <div className="sui-termDicts__dict-extra">
                                <span className="sui-termDicts__dict-extra-lang">
                                    Language:
                                </span>{' '}
                                <span className="sui-termDicts__dict-extra-lang-text">
                                    {data.related_definitions_language_s}
                                </span>
                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default TermDictionaries;
