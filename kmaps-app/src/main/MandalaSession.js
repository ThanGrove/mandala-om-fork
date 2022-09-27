import { Cookies } from 'react-cookie';
import { useSearchParams } from 'react-router-dom';
import { removeURLParams } from '../views/common/utils';

/**
 * Checks query string for session information.
 * If a sid parameter is set, converts it to cookie and removes.
 * @constructor
 */
export function MandalaSession() {
    const cookies = new Cookies();
    let sstr = window.location.search;
    if (sstr.includes('logout=true')) {
        cookies.remove('solrsid');
        removeURLParams();
    }
    const solr_session = cookies.get('solrsid');
    if (!solr_session && sstr.includes('sid=')) {
        const session_id = sstr.split('sid=')[1];
        if (session_id) {
            cookies.set('solrsid', session_id, { path: '/' });
        }
        if (sstr.length > 1 && sstr[1].includes('uid=')) {
            const uid = sstr[1].split('uid=')[1];
            cookies.set('muid', uid);
        }
        removeURLParams();
    }
}

/**
 * A function that returns the session id stored in the cookie, solrsid
 *
 * @returns {any}
 * @constructor
 */
export function GetSessionID() {
    const cookies = new Cookies();
    return cookies.get('solrsid');
}

export function GetUID() {
    const cookies = new Cookies();
    return cookies.get('muid');
}
