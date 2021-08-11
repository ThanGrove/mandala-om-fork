import {
    EMPTY_PERSPECTIVE_CODES,
    getPerspectiveData,
} from '../../views/KmapTree/KmapPerspectives';
import React, { useState } from 'react';
import { usePerspective } from '../../hooks/usePerspective';
import { useQuery } from 'react-query';
import MandalaSkeleton from '../../views/common/MandalaSkeleton';
import { InputGroup } from 'react-bootstrap';

export function PerspectiveSettings({ current, setPerspective }) {
    // const perspective = usePerspective();
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
                    <PerspectiveOptions
                        domain={dm}
                        current={current[dm]}
                        setter={setPerspective}
                    />
                );
            })}
        </>
    );
}

function PerspectiveOptions({ domain, current, setter }) {
    const [activeChoice, setActiveChoice] = useState(current);
    const {
        isLoading: isPerspDataLoading,
        data: perspData,
        isError: isPerspDataError,
        error: perspDataError,
    } = useQuery(['perspective', 'data', domain], () =>
        getPerspectiveData(domain)
    );

    const changeHandler = (e) => {
        const target = e.target;
        const pval = target.getAttribute('value');
        setter(domain, pval);
        setActiveChoice(pval);
    };
    if (isPerspDataLoading) {
        return <MandalaSkeleton />;
    }
    return (
        <form>
            <h2 className="text-capitalize">{domain}</h2>
            {perspData.map((persp, i) => {
                if (EMPTY_PERSPECTIVE_CODES.includes(persp.code)) {
                    return null;
                }
                const radioBtn = (
                    <input
                        type="radio"
                        value={persp.code}
                        onChange={changeHandler}
                        checked={persp.code === activeChoice}
                    />
                );
                return (
                    <div
                        className="l-persp-radio"
                        key={`km-setting-${persp.id}-${i}`}
                    >
                        <label>
                            {radioBtn}
                            <span>{persp.name}</span>
                        </label>
                    </div>
                );
            })}
            {domain !== 'terms' && <hr />}
        </form>
    );
}
