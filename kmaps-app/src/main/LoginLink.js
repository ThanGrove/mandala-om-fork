import React, { useState, useEffect } from 'react';
import { MdLogin, MdCheckCircle } from 'react-icons/all';
import { GetSessionID, GetUID } from './MandalaSession';
import { Cookies, useCookies } from 'react-cookie';
import useMandala from '../hooks/useMandala';
import Dropdown from 'react-bootstrap/Dropdown';

const CHECK_COOKIE_NAME = 'mandalacheckcookie';
const WAIT_TIME = 120000; // 2 minutes in milliseconds

/**
 * Displays a login link and checks every 2 mins whether session is still valid
 * Determines if there is a session ID and display logout link if there is and
 * does checking. Otherwise, shows login link and does not check session validity.
 *
 * @returns {JSX.Element|null}
 * @constructor
 */
export function LoginLink() {
    if (
        !process.env?.REACT_APP_LOGIN_URL ||
        !process.env?.REACT_APP_LOGOUT_URL ||
        !process.env?.REACT_APP_HOME_URL
    ) {
        return null;
    }
    const sid = GetSessionID();
    const checktime = new Cookies().get(CHECK_COOKIE_NAME);
    const currtime = new Date().getTime();
    // Only check if there is an sid (logged in) and either no check time or every 2 minutes.
    const docheck = sid && (!checktime || currtime - checktime > WAIT_TIME);

    const icon = sid ? <LogoutIcon sid={sid} /> : <LoginIcon />;

    return (
        <>
            {icon}
            {docheck && <LoginCheck sid={sid} />}
        </>
    );
}

function LogoutIcon() {
    const data = {
        url_json:
            'https://mandala-dev.internal.lib.virginia.edu/general/api/user/current',
        asset_type: 'user',
        uid: 'current-user',
        id: 'current-user',
    };
    const {
        isLoading: isUserLoading,
        data: userinfo,
        isError: isUserError,
        error: userError,
    } = useMandala(data);

    const logout = function () {
        window.location.href =
            process.env.REACT_APP_LOGOUT_URL +
            '?returl=' +
            process.env.REACT_APP_HOME_URL;
    };
    if (isUserLoading) {
        return null;
    }
    if (isUserError) {
        console.log('Not logged into mandala');
        logout();
    }
    const title = `Mandala User ${userinfo?.name} (${userinfo?.uid}) (Click to logout)`;
    return (
        <button className="mdl-login btn" title={title} onClick={logout}>
            <MdCheckCircle />
        </button>
    );
}

function LoginIcon() {
    const login = function () {
        window.location.href =
            process.env.REACT_APP_LOGIN_URL +
            '?returl=' +
            process.env.REACT_APP_HOME_URL;
    };

    const login2 = function () {
        window.location.href =
            process.env.REACT_APP_LOGIN_URL +
            '?returl=' +
            process.env.REACT_APP_HOME_URL +
            '&logintype=saml';
    };

    return (
        <div className="mndl-login m-3">
            <Dropdown>
                <Dropdown.Toggle variant="outline-info" id="dropdown-basic">
                    Login <MdLogin />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item onClick={login2}>
                        With UVA Netbadge
                    </Dropdown.Item>
                    <Dropdown.Item onClick={login}>With Password</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

/**
 * An element that always returns null but does an async call to the proxy ping.php script with the
 * session id to see if the session is still valid. If it is, the script returns and json object
 * with "loggedIn: true". If the session has been logged out, redirects to the logout url so that
 * react removes the session cookie and react app.
 *
 * @param sid
 * @returns {null}
 * @constructor
 */
function LoginCheck({ sid }) {
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
                if (!res?.loggedIn) {
                    window.location.href =
                        process.env.REACT_APP_LOGOUT_URL +
                        '?returl=' +
                        process.env.REACT_APP_HOME_URL;
                } else {
                    new Cookies().set(CHECK_COOKIE_NAME, new Date().getTime());
                }
            })
            .catch((e) => {
                console.log(e.message, e);
            });
    }, []);
    return null;
}
