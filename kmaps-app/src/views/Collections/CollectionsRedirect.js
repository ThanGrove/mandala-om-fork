import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Redirect, useLocation } from 'react-router-dom';

export function CollectionsRedirect(props) {
    const location = useLocation();
    const params = useParams();
    const asset_type = params?.asset_type;
    const asset_id = params?.id;
    const cid = params?.cid;
    const nid = params?.nid;
    let redurl = '/';
    // Redirect for items in collection (See route in Content Main)
    if (cid && nid) {
        redurl = `/${asset_type}/${nid}${location.search}`;
    } else {
        let vm = 'deck';
        if (asset_type === 'images') {
            vm = 'gallery';
        } else if (asset_type === 'sources' || asset_type === 'texts') {
            vm = 'list';
        }
        redurl = `/${asset_type}/collection/${asset_id}/${vm}${location.search}`;
    }
    return <Redirect to={redurl} />;
}
