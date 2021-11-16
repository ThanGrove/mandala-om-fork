import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './TermDefinitionsResources.css';

const TermDefinitionsResources = ({ defID, resCounts }) => {
    let history = useHistory();
    let location = useLocation();

    const resources = resCounts[defID];
    if (!resources) {
        return (
            <div className="sui-termDefResource__wrapper">
                No resources are currently tagged with this definition.
            </div>
        );
    }

    const handleClick = (e, key) => {
        e.preventDefault();
        history.push(`${location.pathname}/related-${key}/${defID}/deck`);
    };

    return (
        <div className="sui-termDefResource__content">
            {Object.keys(resources)
                .filter((key) => key !== 'all')
                .map((key) => (
                    <Button
                        key={key}
                        variant="outline-dark"
                        size="lg"
                        onClick={(e) => handleClick(e, key)}
                    >
                        <span className={`u-icon__${key} icon`}></span>
                        <span className="btn-text">
                            {key.toUpperCase()}
                        </span>{' '}
                        <span className="badge badge-light">
                            {resources[key]}
                        </span>
                    </Button>
                ))}
        </div>
    );
};

export default TermDefinitionsResources;
