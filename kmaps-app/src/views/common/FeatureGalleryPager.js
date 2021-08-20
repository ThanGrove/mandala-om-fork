import InputNumber from 'rc-input-number';
import * as PropTypes from 'prop-types';
import React from 'react';

export function FeatureGalleryPager(props) {
    return (
        <div>
            <span>
                <span>Page</span>
                <InputNumber
                    aria-label="Set number of items per page"
                    min={1}
                    max={props.pager.getMaxPage() + 1}
                    style={{ width: '5rem' }}
                    value={props.pager.getPage() + 1}
                    onChange={(pg) => {
                        console.log(
                            'FeatureGalleryPager pg = ' +
                                pg +
                                ' maxPage = ' +
                                props.pager.getMaxPage()
                        );
                        props.pager.setPage(pg - 1);
                    }}
                    onPressEnter={(evt) => {
                        evt.target.blur();
                    }}
                    readOnly={false}
                    disabled={false}
                />{' '}
                of {props.pager.getMaxPage() + 1}
            </span>

            <span className={'c-featurePager__itemCount'}>
                <span>Items per page::</span>
                <InputNumber
                    aria-label="Set number of items per page"
                    min={25}
                    max={100}
                    size={3}
                    step={25}
                    value={props.pager.getPageSize()}
                    onChange={(ps) => {
                        props.pager.setPageSize(ps);
                    }}
                    onPressEnter={(evt) => {
                        evt.target.blur();
                    }}
                    readOnly={false}
                    disabled={false}
                />
            </span>
        </div>
    );
}

FeatureGalleryPager.propTypes = {
    pager: PropTypes.shape({
        getPageSize: PropTypes.func,
        getMaxPage: PropTypes.func,
        getPage: PropTypes.func,
        setPageSize: PropTypes.func,
        setPage: PropTypes.func,
    }),
};
