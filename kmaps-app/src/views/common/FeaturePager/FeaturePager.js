import React from 'react';
import NumericInput from 'react-numeric-input';
import './FeaturePager.scss';

export function FeaturePager(props) {
    //const [pinsize, setPgInputSize] = useState(3)
    const assetCount = props?.assetCount ? props.assetCount : 0;
    const perPage = props?.perPage ? props.perPage : 1;
    const maxPage = assetCount > 0 ? Math.ceil(assetCount / perPage) : 1;
    const page = props?.page ? props.page : 0;
    const display_page = isNaN(props.page) ? '' : parseInt(props.page) + 1;
    if (assetCount > 0 && page * perPage > assetCount) {
        props.setPage(0);
    }
    let input_size = 3;
    if (maxPage > 99) {
        input_size = maxPage > 999 ? 5 : 4;
    }
    let wingo = (
        <NumericInput
            aria-label="Goto page"
            min={1}
            max={maxPage}
            size={input_size}
            value={display_page}
            onChange={(pg) => {
                if (pg === null) {
                    return;
                }
                if (window?.featurePageNum) {
                    clearTimeout(window.featurePageNum);
                }
                window.featurePageNum = setTimeout(function () {
                    if (!isNaN(pg)) {
                        pg = pg * 1;
                        pg = pg - 1;
                        if (pg < 0) {
                            pg = 0;
                        }
                        if (assetCount > 0 && pg >= maxPage) {
                            pg = maxPage - 1;
                        }
                        props.setPage(pg);
                    }
                }, 500);
            }}
            mobile={false}
            noStyle={true}
        />
    );

    const position = props?.position ? ' ' + props.position : '';
    const classname = props.className ? ' ' + props.className : '';
    const start_item = page > 0 ? page * perPage + 1 : 1;
    return (
        <div className={`c-featurePager__container${position}${classname}`}>
            <div className="c-featurePager__resultSummary">
                Total (<span className="total">{assetCount}</span>) - Viewing
                <span className="start">{start_item}</span>
                to{' '}
                <span className="end">
                    {Math.min(page * perPage + perPage, assetCount)}
                </span>
            </div>
            <div className="c-featurePager__navButtons">
                <span
                    onClick={() => props.setPage(0)}
                    className="icon u-icon__arrow-end-left c-pagerIcon__buttonFirst"
                >
                    {' '}
                </span>
                <span
                    onClick={() => props.setPage((old) => Math.max(old - 1, 0))}
                    className="icon u-icon__arrow3-left c-pagerIcon__buttonPrev"
                >
                    {' '}
                </span>
                <span className="c-pager__counterWrapper">
                    Page
                    <span className="c-pager__counter-1">{wingo}</span>
                    of
                    <span className="c-pager__counterMax">{maxPage}</span>
                </span>
                <span
                    onClick={() => {
                        if (!props.isPreviousData && props.hasMore) {
                            props.setPage((old) => old + 1);
                        }
                    }}
                    className="icon u-icon__arrow3-right c-pagerIcon__buttonNext"
                >
                    {' '}
                </span>
                <span
                    onClick={() => props.setPage(maxPage - 1)}
                    className="icon u-icon__arrow-end-right c-pagerIcon__buttonLast"
                >
                    {' '}
                </span>
            </div>
            {props.loadingState ? <span> loading...</span> : <span></span>}
            <div className="c-featurePager__itemCount">
                <span>Items per page</span>
                <NumericInput
                    aria-label="Set number of items per page"
                    min={25}
                    max={100}
                    size={3}
                    step={25}
                    // style={{width: "4em"}}
                    value={perPage}
                    onChange={(ps) => {
                        props.setPerPage(ps);
                    }}
                    mobile={false}
                    style={{
                        'input.mobile': {
                            border: '0px',
                        },
                        'btnUp.mobile': {},
                    }}
                />
            </div>
        </div>
    );
}
