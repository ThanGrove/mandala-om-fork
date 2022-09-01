import { Cookies } from 'react-cookie';
import { useSearchParams } from 'react-router-dom';
import { removeURLParams } from '../views/common/utils';

export function MandalaSession() {
    const cookies = new Cookies();
    const sstr = window.location.search;
    const solr_session = cookies.get('solrsid');
    if (solr_session) {
        console.log('solr session already set', solr_session);
    } else if (sstr.includes('sid=')) {
        const session_id = sstr.split('sid=')[1];
        if (session_id) {
            cookies.set('solrsid', session_id, { path: '/' });
            console.log('Setting session id: ', session_id);
            removeURLParams();
        }
    }
}

export function GetSessionID() {
    const cookies = new Cookies();
    return cookies.get('solrsid');
}
