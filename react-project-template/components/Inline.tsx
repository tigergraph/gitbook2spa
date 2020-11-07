import * as React from 'react';
import { useLocation } from 'react-router';
import { Link } from "react-router-dom";
import { InlineMath } from 'react-katex';

import { findPage } from '@libs/findPage';
import { getVersionPage } from './Sider';

import assetsMap from '@gitbook/assets.js';

import styles from '@styles/inline-type.module.css';

interface InlineData {
    href?: string
    code?: string
    assetID?: string
    size?: 'original' | 'line'
    formula?: string
    pageID?: string
}

type InlineType<T> = {
    type: 'link' | 'emoji' | 'inline-image' | 'inline-math'
    data?: InlineData
} & T

export const Inline: React.FC<InlineType<Partial<{
    children: any
}>>> = ({ data, type, children }) => {
    switch (type) {
        case "emoji":
            return <Emoji data={data}>{children}</Emoji>;
        case "link":
            return <LinkContainer data={data}>{children}</LinkContainer>;
        case "inline-image":
            return <InlineImage data={data}/>;
        case "inline-math":
            return <MathFormula data={data}/>;
        default:
            return children;
    }
};

const Emoji: React.FC<{ data?: InlineData, children: any }> = ({ data, children }) => {
    const emoji = data?.code && eval("'" + `&#x${data?.code};`.replace(/&#x(.*?);/g, "\\u$1") + "'");

    return (
        <span className='inline-block'>
            <span style={{ marginRight: "8px" }}>{emoji}</span>
            {children}
        </span>
    );
};

const LinkContainer: React.FC<{ data?: InlineData, children: any }> = ({ data, children }) => {
    const TG_DOCS_URL = 'https://docs.tigergraph.com/';
    const TG_DOCS_URL_SWITCH_TO_OTHER_VERSION = 'https://docs.tigergraph.com/v';
    const location = useLocation();

    const versionName = getVersionPage(location.pathname)?.version!;
    const pageInfo = findPage(data?.pageID!, versionName, 'uid');

    let isInternalLink = true;
    let targetUrl = '';

    // handle internal link to other page in the app
    if (data?.pageID && pageInfo) {
        targetUrl = `/${versionName}/${pageInfo.path}`;
    }

    // handle external link
    if (data?.href) {
        // when it points to external document, take it as internal link
        if (data.href.includes(TG_DOCS_URL_SWITCH_TO_OTHER_VERSION)) {
            // use the path with version number
            targetUrl = data.href.replace(TG_DOCS_URL_SWITCH_TO_OTHER_VERSION, '');
        } else if (data.href.includes(TG_DOCS_URL)) {
            const path = data.href.replace(TG_DOCS_URL, '');
            targetUrl = `/${versionName}/${path}`;
        } else {
            isInternalLink = false;
            targetUrl = data.href;
        }
    }

    return (
        isInternalLink
            ? (
                <Link className={styles.link} to={targetUrl}>{children}</Link>
            ) : (
                <a
                    className={styles.link}
                    href={targetUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {children}
                </a>
            )
    );
};

const InlineImage: React.FC<{ data?: InlineData }> = ({ data }) => {
    const origin_key = Object.keys(assetsMap).find(k => !!data?.assetID && k.startsWith(data?.assetID));

    const pathName = origin_key ? assetsMap[origin_key]?.Name : '';
    const url = origin_key ? `/assets/${pathName}` : undefined;
    const imgName = origin_key
        ? pathName.replace(new RegExp(`${data?.assetID}-(\\w+)[.\\w]+$`), '$1')
        : 'image';

    return (
        origin_key
            ? (
                <span className={styles.inlineImageWrapper}>
                <img
                    className={styles.inlineImage}
                    style={{
                        maxHeight: data?.size === 'line' ? 28 : 40
                    }}
                    src={url}
                    alt={imgName}
                />
            </span>
            ) : null
    );
};

const MathFormula: React.FC<{ data?: InlineData }> = ({ data }) => {
    const formula = data?.formula && eval("'" + `${data?.formula}`.replace(/\\/g, "\\\\") + "'");

    return !!formula ? <InlineMath>{formula}</InlineMath> : null;
};
