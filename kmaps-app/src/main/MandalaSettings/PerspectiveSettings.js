import { PerspectiveChooser } from '../../views/KmapTree/KmapPerspectives';
import React from 'react';

export function PerspectiveSettings({ current, setPerspective }) {
    const domains = ['places', 'terms']; // subjects has just one perspective
    return (
        <>
            <h1>Perspectives</h1>
            <p>
                Choose the perspective you want to show for the places and terms
                domains.
            </p>
            {domains.map((dm, dmi) => {
                return (
                    <>
                        <h2 className="text-capitalize">{dm}</h2>
                        <PerspectiveChooser
                            domain={dm}
                            current={current[dm]}
                            setter={setPerspective}
                        />
                        {dm !== 'terms' && <hr />}
                    </>
                );
            })}
        </>
    );
}
