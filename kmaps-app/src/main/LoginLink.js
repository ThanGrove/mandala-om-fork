import React, { useState, useEffect } from 'react';
import { MdLogin, MdCheckCircle } from 'react-icons/all';

export function LoginLink() {
    let logio_url = function () {
        window.location.href =
            process.env?.REACT_APP_LOGIN_URL +
            '?returl=' +
            process.env?.REACT_APP_HOME_URL;
    };

    let icon = <MdLogin />;

    return (
        <button
            className="mdl-login"
            title="Log into Mandala"
            onClick={logio_url}
        >
            {icon}
        </button>
    );
}
