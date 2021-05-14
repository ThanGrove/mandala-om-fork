/* eslint react/no-multi-comp: 0, react/prop-types: 0 */
import React, { useRef, useState } from 'react';
import { HtmlCustom } from './MandalaMarkup';
import { Overlay, Popover } from 'react-bootstrap';
import { ImStack } from 'react-icons/im';

const GenericPopover = ({ title, ...props }) => {
    const target = useRef(null);
    const [show, setShow] = useState(false);
    const placement = props?.placement ? props.placement : 'right';
    const showPop = (event) => {
        setShow(true);
    };
    let content = props?.content;
    content = !content.startsWith('<p>') ? `<p>${content}</p>` : content;
    const icon = props?.icon ? props.icon : <ImStack />;

    return (
        <>
            <span onMouseEnter={showPop} onMouseLeave={() => setShow(false)}>
                <span ref={target} className="popover-link">
                    {icon}
                </span>
                <Overlay
                    target={target.current}
                    placement={placement}
                    show={show}
                >
                    <Popover
                        id="popover-contained"
                        className="related-resources-popover processed"
                    >
                        <Popover.Title as="h5">{title}</Popover.Title>
                        <Popover.Content>
                            <HtmlCustom markup={content} />
                        </Popover.Content>
                    </Popover>
                </Overlay>
            </span>
        </>
    );
};

export default GenericPopover;
