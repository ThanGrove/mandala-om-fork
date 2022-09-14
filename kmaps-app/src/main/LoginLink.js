import React, { useState, useEffect } from 'react';
import { MdLogin, MdCheckCircle } from 'react-icons/all';
import { GetSessionID, GetUID } from './MandalaSession';

export function LoginLink() {
    if (
        !process.env?.REACT_APP_LOGIN_URL ||
        !process.env?.REACT_APP_LOGOUT_URL ||
        !process.env?.REACT_APP_HOME_URL
    ) {
        return null;
    }
    const logio_url = function () {
        const sid = GetSessionID();
        const access_url = sid
            ? process.env.REACT_APP_LOGOUT_URL
            : process.env.REACT_APP_LOGIN_URL;
        window.location.href =
            access_url + '?returl=' + process.env.REACT_APP_HOME_URL;
    };

    const sid = GetSessionID();
    const uid = GetUID();
    const icon = sid ? <MdCheckCircle /> : <MdLogin />;
    const title = sid
        ? 'Mandala User ' + uid + ' (Click to logout)'
        : 'Click to log into Mandala';

    return (
        <button className="mdl-login btn" title={title} onClick={logio_url}>
            {icon}
        </button>
    );
}
