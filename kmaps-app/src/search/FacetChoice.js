import * as PropTypes from 'prop-types';
import React from 'react';
import { selectIcon } from '../views/common/utils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

export function FacetChoice(props) {
    const operatorOptions = (
        <div className="sui-advEditBool" title="Change boolean method">
            <div
                className="sui-boolItem"
                onClick={() => handleSetOperator('AND')}
                id="sui-boolItem-places-0-AND"
            >
                AND
            </div>
            |
            <div
                className="sui-boolItem"
                onClick={() => handleSetOperator('OR')}
                id="sui-boolItem-places-0-OR"
            >
                OR
            </div>
            |
            <div
                className="sui-boolItem"
                onClick={() => handleSetOperator('NOT')}
                id="sui-boolItem-places-0-NOT"
            >
                NOT
            </div>
            &nbsp;
        </div>
    );

    function handleFacetAdd() {
        props.onFacetClick({ ...props, action: 'add' });
    }

    function handleFacetRemove(x, y) {
        props.onFacetClick({ ...props, action: 'remove' });
    }

    function handleSetOperator(operator) {
        props.onFacetClick({
            ...props,
            operator: operator,
            action: 'changeOperator',
            mode: operator,
        });
    }

    const chosen = props.chosen ? 'chosen' : '';
    const icon = selectIcon(props.facetType);

    const choice =
        props.mode === 'add' ? (
            <div
                onClick={handleFacetAdd}
                className={'sui-advEditLine ' + chosen}
            >
                <span className={props.className}></span> {icon} {props.label}(
                {props.count}){' '}
            </div>
        ) : (
            <div>
                {props.booleanControls && operatorOptions}{' '}
                <span
                    onClick={handleFacetRemove}
                    className={props.className}
                ></span>{' '}
                {icon} {props.label}
            </div>
        );

    const renderTooltip = (p) => {
        return (
            <Popover {...p} className={'c-FacetChoice--popover'}>
                <Popover.Content>{props.value}</Popover.Content>
            </Popover>
        );
    };

    const wrapped_choice = (
        <OverlayTrigger
            placement="auto"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
            popperConfig={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 10],
                        },
                    },
                ],
            }}
        >
            {choice}
        </OverlayTrigger>
    );

    return wrapped_choice;
}

FacetChoice.propTypes = {
    className: PropTypes.string,
    value: PropTypes.any,
    count: PropTypes.any,
    mode: PropTypes.string,
    chosen: PropTypes.bool,
    onFacetClick: PropTypes.func,
};
