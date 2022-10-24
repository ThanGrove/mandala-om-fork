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
    const sstrpts = window.location.search.replace('?', '').split('&');
    // console.log(sstrpts);
    const params = {};
    sstrpts.map((pp, ppi) => {
        if (pp.includes('=')) {
            const [nm, val] = pp.split('=');
            params[nm] = val;
        }
    });
    if (params['logout'] === 'true') {
        cookies.remove('solrsid');
        removeURLParams();
    }
    const solr_session = cookies.get('solrsid');
    if (!solr_session && params.sid?.length > 0) {
        console.log('params sid', params.sid);
        cookies.set('solrsid', params.sid, { path: '/' });
        if (params?.uid?.length > 0) {
            cookies.set('muid', params.uid);
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
