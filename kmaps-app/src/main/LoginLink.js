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
    return <LoginIcon />;
}

function LoginIcon(props) {
    const [status, setStatus] = useState(false);
    const sid = GetSessionID();
    const pingurl = process.env.REACT_APP_PING_URL + '?';
    const fetchData = async () => {
        const response = await fetch(
            pingurl +
                new URLSearchParams({
                    sid: sid,
                }),
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            }
        );
        if (!response.ok) {
            throw new Error('Data could not be fetched!');
        } else {
            return response.json();
        }
    };
    useEffect(() => {
        fetchData()
            .then((res) => {
                console.log('response to ping is', res);
                setStatus(res?.loggedIn);
            })
            .catch((e) => {
                console.log(e, e.message);
            });
    }, []);
    const logio_url = function () {
        const sid = GetSessionID();
        const access_url = sid
            ? process.env.REACT_APP_LOGOUT_URL
            : process.env.REACT_APP_LOGIN_URL;
        window.location.href =
            access_url + '?returl=' + process.env.REACT_APP_HOME_URL;
    };
    const tmplable = status ? 'Yup' : 'Nope';
    const uid = GetUID();
    const icon = sid ? <MdCheckCircle /> : <MdLogin />;
    const title = sid
        ? 'Mandala User ' + uid + ' (Click to logout)'
        : 'Click to log into Mandala';

    return (
        <button className="mdl-login btn" title={title} onClick={logio_url}>
            ({tmplable}) {icon}
        </button>
    );
}
