import * as React from 'react';
import { style } from 'typestyle'
import { findPage } from '@libs/findPage';
import { InlineMath } from 'react-katex';
import { useLocation, useHistory } from 'react-router';
import { getVersionPage } from './Sider';

interface LinkData {
    href?: string
    code?: string
    assetID?: string
    formula?: string
    pageID?: string
}

type LinkType<T> = {
    type: 'link' | 'emoji' | 'inline-image' | 'inline-math'
    data?: LinkData
} & T

export const Inline: React.SFC<LinkType<Partial<{
    children: any
}>>> = ({ data, type, children }) => {
    const emoji = data?.code && eval("'" + `&#x${data?.code};`.replace(/&#x(.*?);/g, "\\u$1") + "'")
    switch (type) {
        case "emoji":
            return <span>
                <span style={{ marginRight: "8px" }}>{emoji}</span>
                {children}
            </span>
        case "link":
            return renderLinkContainer(data, children);
        case "inline-image":
            return <span>
                none-inline-image
                {children}
            </span>
        case "inline-math":
            return (() => {
                const formula = data?.formula && eval("'" + `${data?.formula}`.replace(/\\/g, "\\\\") + "'")
                return !!formula ? <InlineMath>{formula}</InlineMath> : null
            })()
        default:
            return children
    }
}


const renderLinkContainer = (data?: LinkData, child?: JSX.Element) => {
    const [showUnderLine, setShowUnderLine] = React.useState(false)
    const location = useLocation();
    const history = useHistory();
    const versionName = getVersionPage(location.pathname)?.version!
    return <span
        onMouseEnter={e => setShowUnderLine(true)}
        onMouseLeave={e => setShowUnderLine(false)}
        className={styles.clearPTagStyle}
        style={{
            cursor: "pointer",
            color: "rgb(252, 108, 4)",
            position: "relative",
            textDecorationLine: showUnderLine ? "underline" : undefined,
            wordBreak: "break-word"
        }}
        onClick={() => {
            const pageInfo = findPage(data?.pageID!, versionName)
            if (!!data?.pageID && !data?.href && !!pageInfo) {
                !!pageInfo.path && history.push(pageInfo.uid)
                return;
            }
            window.open(data?.href)
        }}>
        {child}
    </span>
}

const styles = {
    clearPTagStyle: style({
        $nest: {
            "&>p": {
                display: "inline"
            }
        }
    })
}
