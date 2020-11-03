import * as React from 'react';
import { useLocation, useHistory } from 'react-router';
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
        <div className='inline-block'>
            <span style={{ marginRight: "8px" }}>{emoji}</span>
            {children}
        </div>
    );
};

const LinkContainer: React.FC<{ data?: InlineData, children: any }> = ({ data, children }) => {
    const [showUnderLine, setShowUnderLine] = React.useState(false);
    const location = useLocation();
    const history = useHistory();
    const versionName = getVersionPage(location.pathname)?.version!;

    const handleClickOnLink = () => {
        const pageInfo = findPage(data?.pageID!, versionName);

        if (!!data?.pageID && !data?.href && !!pageInfo) {
            !!pageInfo.path && history.push(pageInfo.uid);
            return;
        }

        window.open(data?.href)
    };

    return (
        <span
            className={styles.link}
            style={{
                textDecorationLine: showUnderLine ? "underline" : undefined
            }}
            data-href={data?.href}
            onMouseEnter={() => setShowUnderLine(true)}
            onMouseLeave={() => setShowUnderLine(false)}
            onClick={handleClickOnLink}
        >
            {children}
        </span>
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
        <span className={styles.inlineImageWrapper}>
            {
                !!origin_key &&
                <img
                    className={styles.inlineImage}
                    style={{
                        maxHeight: data?.size === 'line' ? 28 : 40
                    }}
                    src={url}
                    alt={imgName}
                />
            }
        </span>
    );
};

const MathFormula: React.FC<{ data?: InlineData }> = ({ data }) => {
    const formula = data?.formula && eval("'" + `${data?.formula}`.replace(/\\/g, "\\\\") + "'");

    return !!formula ? <InlineMath>{formula}</InlineMath> : null;
};
