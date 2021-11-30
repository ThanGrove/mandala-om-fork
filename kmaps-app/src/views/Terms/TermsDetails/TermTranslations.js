import GenericPopover from '../../common/GenericPopover';
import React from 'react';

export function TermTranslations({ translations }) {
    return (
        <div className="translations">
            <p>There are {translations?.length} translation equivalents: </p>
            <ul>
                {translations.map((tr, tri) => {
                    return (
                        <li key={`transequiv-${tri}`}>
                            <TermTranslation data={tr} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function TermTranslation({ data }) {
    const lngcode = data?.langcode; // convertLangCode(data.langcode);
    const srcicon = <span className="u-icon__sources"> </span>; //u-icon__file-text-o
    return (
        <>
            <span className="langname text-uppercase">{data?.lang}</span>:{' '}
            <span className={lngcode}>{data?.content}</span>{' '}
            {data?.citations?.length > 0 && (
                <GenericPopover
                    title="Citations"
                    content={data?.citations}
                    icon={srcicon}
                />
            )}
        </>
    );
}
