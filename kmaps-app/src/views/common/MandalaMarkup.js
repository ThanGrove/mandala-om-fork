import React, { useEffect, useState } from 'react';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { MandalaPopover } from './MandalaPopover';
import { MandalaModal } from './MandalaModal';
import { useSolr } from '../../hooks/useSolr';
import $ from 'jquery';
import { Link } from 'react-router-dom';

/**
 * The transform function sent to ReactHtmlParse for converting raw HTML into React Components
 * Used to:
 *    1) convert old popover html to MandalaPopover component and
 *    2) ferret out links in the HTML and if they are internal to mandala convert them to
 *       properly pathed internal links in same window using MandalaLink and MandalaPathDecoder
 *       or if external, either display in modal if the site permits it (using MandalaModal)
 *       or, if not, then opens in a new window with target attribute.
 *
 * @param node
 * @param index
 */
function transform(node, index) {
    // Process Popover Links in Mandala Markup (class="kmap-tag-group")
    // console.log("Node name: ", node.name);
    if (node.attribs && node.attribs['class'] === 'kmap-tag-group') {
        const kmpdom = node.attribs['data-kmdomain'];
        const kmpid = node.attribs['data-kmid'];
        const mykey = kmpdom + '-' + kmpid + '-' + Date.now();
        let label = 'Loading ...';
        if (
            node?.children?.length > 0 &&
            node.children[0]?.children.length > 0 &&
            node.children[0].children[0]?.data
        ) {
            label = node.children[0].children[0].data;
        } else {
            label = 'Loading...';
            console.log('Could not find label from popover node:', node);
        }
        return (
            <MandalaPopover
                domain={kmpdom}
                kid={kmpid}
                key={mykey}
                children={[label]}
            />
        );
    }
    // <img class="popover-icon"> : Process popover icon imgs to convert to mandala popovers (e.g., in AV record)
    else if (
        node.name === 'img' &&
        node.attribs &&
        node.attribs['class'] &&
        node.attribs['class'] === 'popover-icon' &&
        node.attribs['onmouseenter']
    ) {
        let mtchs = node.attribs['onmouseenter'].match(
            /(places|subjects|terms)\-(\d+)/
        );
        if (mtchs) {
            let label = node?.prev?.data ? node.prev.data : false;
            if (!label) {
                label = 'Loading ...';
                console.log('Could not find label from popover node:', node);
            }
            return (
                <MandalaPopover
                    key={`mp-img-${index}-${Date.now()}`}
                    domain={mtchs[1]}
                    kid={mtchs[2]}
                    children={[node.prev.data]}
                />
            );
        } else {
            return null;
        }
    }

    // text : Find text preceding popover icon and remove it, since MandalaPopover provides its own text by default
    else if (
        node.type === 'text' &&
        node.next &&
        node.next.attribs &&
        node.next.attribs['class'] &&
        node.next.attribs['class'] === 'popover-icon'
    ) {
        // In Bill's code text preceded by two spaces - I removed the two spaces (&nbsp;&nbsp;) - mf8yk july 16, 2021
        return ReactHtmlParser('');
    }
    // <p> give unique ids
    else if (node.name && node.name === 'p') {
        const newindex = 'p-' + index + '-' + Date.now();
        return convertNodeToElement(node, newindex, transform);
    }
    // <a href="..."> : Process External Links in Mandala Markup to turn into Modals or Internal links
    else if (
        node.name &&
        node.name === 'a' &&
        node.attribs &&
        node.attribs['href']
    ) {
        // Link to Text Collections
        let linkurl = node.attribs['href'];
        if (
            linkurl.includes('/node/') &&
            node.parent.attribs.class.includes('shanti-texts-field-content') &&
            node.parent.parent.attribs.class.includes('og_collection')
        ) {
            linkurl = linkurl.replace('/node/', '/texts/collection/');
            const reactkids = node.children.map((ch, ci) => {
                return convertNodeToElement(ch, ci, transform);
            });
            return <Link to={linkurl}>{reactkids}</Link>;
        } // End of text collection links

        // Match internal Mandala links with kmap or node ID
        let patt =
            /(places|subjects|terms|audio-video|images|sources|texts|visuals)\/(\d+)/;
        let mtch = linkurl.match(patt);
        if (mtch) {
            let newurl = `/${mtch[1]}/${mtch[2]}`;
            const reactkids = node.children.map((ch, ci) => {
                return convertNodeToElement(ch, ci, transform);
            });
            return <Link to={newurl}>{reactkids}</Link>;
        }

        // TODO: Develop way to look up a path alias and get node ID to make aliased paths internal

        // Get Mandala Asset ID if Data Attribute
        let mandalaid =
            typeof node.attribs['data-mandala-id'] === 'undefined'
                ? false
                : node.attribs['data-mandala-id'];

        // Get Link's contents
        let linkcontents = [];
        for (let n in node.children) {
            linkcontents.push(
                convertNodeToElement(node.children[n], index, transform)
            );
        }

        // Link's Title
        let mytitle = node.attribs['title'] ? node.attribs['title'] : false;
        if (mytitle === false) {
            mytitle =
                typeof linkcontents[0] === 'string'
                    ? linkcontents[0].split(':')[0]
                    : 'No title';
        }

        // Check link is in whitelist
        const blocked = isBlockedUrl(linkurl);

        if (process.env.REACT_APP_STANDALONE === 'standalone') {
            // Special processing for hash links in standalon
            // Text footnote links
            if (
                linkurl.match(/^#_?f?t?n(ref)?\d/) ||
                linkurl.match(/^#.*footnote/)
            ) {
                // For Footnote anchor links in Texts in standalones. Regex matches all known possibilities....
                // Possible anchors: #fn3, #n1, #_ftn2, or #_ftnref4 or #sdfootnote
                node.attribs['style'] = '';
                delete node.attribs['href'];
                node.attribs['data-anchor-ref'] = linkurl;
                return convertNodeToElement(node, index, transform);
            }
        } else if (linkurl[0] === '#') {
            // If not standalone, then ignore hash only links
            if (
                linkurl.match(/^#_?f?t?n(ref)?\d/) ||
                linkurl.match(/^#.*footnote/)
            ) {
                node.attribs['style'] = ''; // except remove style attribute for footnote reference links
            }
            return;
        } else if (mandalaid) {
            // If link has an `data-mandala-id` attribute, go to the Asset ID given there
            return <MandalaLink mid={mandalaid} contents={linkcontents} />;
        } else if (linkurl.includes('/add/') || linkurl.includes('/edit')) {
            // Do not process /add or /edit links in standalone
            return null;
        } else if (
            !linkurl.includes('https://mandala') &&
            (linkurl[0] === '/' || linkurl.includes('.virginia.edu'))
        ) {
            // When link url is to a mandala site outside of embedded standalone
            const path = linkurl.replace(/https?\:\/\//, '').split('?')[0]; // remove protocol and split off search string
            let pathparts = path.split('/'); // Get path parts
            // Get the domain
            const domain = pathparts[0].includes('.virginia.edu')
                ? pathparts.shift()
                : false;

            const mtch =
                domain && typeof domain == 'string'
                    ? domain.match(/(audio-video|images|sources|texts|visuals)/)
                    : false;
            //
            if (pathparts.length == 1 || !mtch) {
                if (pathparts[0] === '') {
                    // It's a relative link from a Mandala App which doesn't include its app name
                    if (
                        linkurl.startsWith('/collection') ||
                        linkurl.startsWith('/subcollection')
                    ) {
                        const pathpts =
                            process.env.REACT_APP_STANDALONE !== 'standalone'
                                ? window.location.pathname?.split('/')
                                : window.location.hash?.split('/');

                        // For Collections in an App. If not app named and asset ID, deliver link contents without link
                        if (pathpts?.length < 3) {
                            return <>{linkcontents}</>;
                        }
                        // TODO: check if this is working if urls starts with / then [1] would be "collection" not the asset type ???l
                        const newhref =
                            process.env.REACT_APP_STANDALONE !== 'standalone'
                                ? `/find/${pathpts[1]}/${pathpts[2]}/collection`
                                : `#/find/${pathpts[1]}/${pathpts[2]}/collection`;
                        // Otherwise use route /find/{asset-type}/{asset id}/collection
                        return (
                            <a
                                className="collection-link"
                                href={newhref}
                                data-href={linkurl}
                                key={`${pathpts[1]}-${pathpts[2]}-collection-link`}
                            >
                                {linkcontents}
                            </a>
                        );
                    }

                    // Otherwise return inactive link with url as data attribute
                    return (
                        <a
                            className="original-link"
                            data-href={linkurl}
                            key={`link-${linkurl}-${Date.now()}`}
                        >
                            {linkcontents}
                        </a>
                    );
                } else {
                    // Or create a modal for the link content
                    return (
                        <MandalaModal
                            url={linkurl}
                            title={mytitle}
                            text={linkcontents}
                        />
                    );
                }
            }

            const asset_path = pathparts.join('/');
            return (
                <MandalaPathDecoder
                    mpath={asset_path}
                    url={linkurl}
                    title={mytitle}
                    contents={linkcontents}
                />
            );
        } else if (blocked) {
            return (
                <a
                    href={linkurl}
                    target={'_blank'}
                    key={`blocked-link-${linkurl}-${Date.now()}`}
                >
                    {linkcontents}
                </a>
            );
        } else if (!linkurl.search(/(subjects|places|terms)\/\d+/)) {
            // Don't process links in popovers
            return (
                <MandalaModal
                    url={linkurl}
                    title={mytitle}
                    text={linkcontents}
                />
            );
        } else {
            // Process Internal Kmaps Links
            let mtch = linkurl.match(/(subjects|places|terms)\/(\d+)/);
            if (mtch) {
                const urlpref =
                    process.env.REACT_APP_STANDALONE === 'standalone'
                        ? '#/'
                        : '/';
                return (
                    <a
                        href={urlpref + mtch[0]}
                        key={`mandala-kmap-link-${mtch[0]}`}
                        data-original-url={linkurl}
                    >
                        {linkcontents}
                    </a>
                );
            }
        }
    } /* End of links transform */
}

/**
 * a function that determines which urls are allowed to show in modal windows instead of new window
 *
 * @param lnkurl
 * @returns {boolean} : returns true if blocked from showing in modal
 */
function isBlockedUrl(lnkurl) {
    // ToDo: Check if there's a way to ping a url to see if it allows Iframing?
    // List of allowed domains for modal popups
    const allowed = ['.virginia.edu', 'youtube.com', 'vimeo.com'];
    for (let n in allowed) {
        let domstr = allowed[n];
        if (lnkurl.includes(domstr)) {
            return false;
        }
    }
    return true;
}

/**
 * Custom function to converts HTML from a Mandala App API into React Component using the MandalaPopover component for Popovers
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function HtmlWithPopovers(props) {
    const htmlInput = props.markup ? props.markup : '<div></div>';
    const options = {
        decodeEntities: true,
        transform,
    };
    return <>{ReactHtmlParser(htmlInput, options)}</>;
}

/**
 * General implementation of ReactHTMLParser that allows one to call it with a custom options including a custom
 * transformer or no options. Does not process Mandala Popovers.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function HtmlCustom(props) {
    let htmlInput = props.markup ? props.markup : '<div></div>';
    const options = props.options ? props.options : {};
    if (options && !options.decodeEntities) {
        options.decodeEntities = true;
    }
    if (props?.nolinks) {
        htmlInput = htmlInput.replace(/<\/?a[^>]*>/g, '');
    }
    if (htmlInput.includes('xml:lang')) {
        const srchst = /xml:lang="[^"]+"/g;
        htmlInput = htmlInput.replace(srchst, '');
    }
    return <>{ReactHtmlParser(htmlInput, options)}</>;
}

function MandalaLink(props) {
    const mid = props.mid;
    const children = props.contents;
    let newurl = process.env.PUBLIC_URL + '/';
    if (mid.includes('-collection-')) {
        newurl += mid.replace('-collection-', '-collection/');
    } else {
        newurl += mid.replace(/\-/g, '/').replace('audio/video', 'audio-video');
    }
    return (
        <a key={`mlink-${mid}`} href={newurl} data-mandala-id={mid}>
            {children}
        </a>
    );
}

/**
 * Functional Component for in-Mandala links attempt to search for alias in SOLR and if found
 * returns a link within react to app/id.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function MandalaPathDecoder(props) {
    const asset_path = props.mpath;
    const qobj = {
        index: 'assets',
        params: {
            q: 'url_html:"' + asset_path + '"',
            fl: 'asset_type,id',
        },
    };
    const asset = useSolr(asset_path, qobj);
    if (asset && asset.docs && asset.docs.length > 0) {
        const { asset_type, id } = asset.docs[0];
        if (asset_type && id) {
            const newpath =
                process.env.PUBLIC_URL + '/' + asset_type + '/' + id;
            return (
                <a
                    href={newpath}
                    title={props.title}
                    data-original-url={props.url}
                >
                    {props.contents}
                </a>
            );
        }
    }
    return (
        <MandalaModal
            url={props.url}
            title={props.title}
            text={props.contents}
        />
    );
}

export function getRandomKey(txt) {
    const suff = txt ? txt : Math.floor(Math.random() * 10 ** 15).toString(16);
    return Math.floor(Math.random() * 10 ** 15).toString(16) + suff;
}
