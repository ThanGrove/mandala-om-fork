import React, { useState, useEffect } from 'react';
import { MdLogin, MdCheckCircle } from 'react-icons/all';
import { GetSessionID } from './MandalaSession';

export function LoginLink() {
    let logio_url = function () {
        window.location.href =
            process.env?.REACT_APP_LOGIN_URL +
            '?returl=' +
            process.env?.REACT_APP_HOME_URL;
    };

    const sid = GetSessionID();
    //console.log('Sid', sid);

    const icon = sid ? <MdCheckCircle /> : <MdLogin />;
    const title = sid ? 'Logged into Mandala' : 'Click to log into Mandala';

    return (
        <button className="mdl-login" title={title} onClick={logio_url}>
            {icon}
        </button>
    );
}
