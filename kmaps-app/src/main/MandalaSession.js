import { Cookies } from 'react-cookie';
import { useSearchParams } from 'react-router-dom';
import { removeURLParams } from '../views/common/utils';

export function MandalaSession() {
    const cookies = new Cookies();
    let sstr = window.location.search;
    if (sstr.includes('logout=true')) {
        cookies.remove('solrsid');
        removeURLParams();
    }
    const solr_session = cookies.get('solrsid');
    if (solr_session) {
        // console.log('solr session already set', solr_session);
    } else if (sstr.includes('sid=')) {
        sstr = sstr.replace('?', '').split('&');
        const session_id = sstr[0].split('sid=')[1];
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

export function GetSessionID() {
    const cookies = new Cookies();
    return cookies.get('solrsid');
}

export function GetUID() {
    const cookies = new Cookies();
    return cookies.get('muid');
}
