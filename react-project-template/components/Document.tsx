import * as React from 'react';
import { findPage } from '@libs/findPage.ts'
import { useLocation } from 'react-router';
import { getVersionPage } from '@components/Sider';

export const Document: React.SFC<Partial<{
    type: string
}>> = props => {
    const location = useLocation();
    const uid = getVersionPage(location.pathname)?.uid!
    const versionName = getVersionPage(location.pathname)?.version!
    React.useEffect(() => {
        document.body.style.fontFamily = "Content-font, Roboto, sans-serif"
        document.body.style.color = "#3b454e"
    }, [])
    return <div style={styles.layout}>
        <div style={{ marginBottom: "32px", padding: "40px 0", borderBottom: "2px solid rgb(230, 236, 241)" }}>
            <h1 style={styles.title}>{findPage(uid, versionName, 'uid')?.title || "我是固定的标题"}</h1>
            {findPage(uid, versionName, 'uid')?.description && <div style={styles.desc}>{findPage(uid, versionName, 'uid')?.description}</div>}
        </div>
        {
            /* check first element is not heading-1 type */
            (() => {
                return React.Children.map(props.children, (child: any, idx) => {
                    if (child?.props?.type === 'heading-1' && idx === 0) {
                        const child = (props?.children as any)?.[0]
                        if (!child) {
                            return null;
                        }

                        return React.cloneElement(child, {
                            data: {
                                ...child?.props?.data || {},
                                isFirstEle: true
                            }
                        })
                    } else {
                        return child
                    }
                })
            })()
        }
    </div>
}

const styles: Record<
    'layout' | 'title' | 'desc'
    , React.CSSProperties> = {
    layout: {
        backgroundColor: "whtie",
        padding: "0 88px",
        width: "100%",
        maxWidth: "926px",
        fontSize: "16px",
    },
    title: {
        fontSize: "32px",
        fontWeight: 700,
        lineHeight: 1.5,
        color: "#242a31",
        marginBottom: 0
    },
    desc: {
        marginTop: "8px",
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: 1.625,
        color: "rgb(116,129,141)"
    }
}
