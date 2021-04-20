import React from 'react';
import './subjectsinfo.scss';
import { HtmlCustom, HtmlWithPopovers } from '../common/MandalaMarkup';
import useMandala from '../../hooks/useMandala';
import { Tabs, Tab } from 'react-bootstrap';
import useAsset from '../../hooks/useAsset';
import MandalaSkeleton from '../common/MandalaSkeleton';
import { useKmap } from '../../hooks/useKmap';

function KmapsDescText({ txtid }) {
    const {
        isLoading: isAssetLoading,
        data: asset,
        isError: isAssetError,
        error: assetError,
    } = useAsset('texts', txtid);
    let solrdoc = false;
    if (!isAssetLoading && asset) {
        if (asset.data?.docs && asset.data.docs.length > 0) {
            solrdoc = asset.data.docs[0];
        }
    }

    const {
        isLoading: isNodeLoading,
        data: nodedata,
        isError: isNodeError,
        error: nodeError,
    } = useMandala(solrdoc);

    const txtjson = !isNodeLoading && nodedata?.data ? nodedata.data : nodedata;
    const isToc = txtjson?.toc_links && txtjson.toc_links.length > 0;
    const defkey = isToc ? 'toc' : 'info';

    const txtmup = txtjson?.full_markup ? (
        <>
            <div className={'desc-toc'}>
                <Tabs defaultActiveKey={defkey} id="text-meta-tabs">
                    {isToc && (
                        <Tab eventKey="toc" title="Table of Contents">
                            <div className={'toc'}>
                                <HtmlCustom markup={txtjson.toc_links} />
                            </div>
                        </Tab>
                    )}
                    <Tab eventKey="info" title="Info">
                        {txtjson?.bibl_summary && (
                            <div className={'info'}>
                                <HtmlWithPopovers
                                    markup={txtjson?.bibl_summary}
                                />
                            </div>
                        )}
                    </Tab>
                </Tabs>
            </div>

            <HtmlWithPopovers markup={txtjson?.full_markup} />
        </>
    ) : (
        <>
            <div className={'mt-5'}></div>
        </>
    );

    return txtmup;
}

export default KmapsDescText;
