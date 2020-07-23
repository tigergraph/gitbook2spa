import * as React from 'react';
import { findPage } from '@libs/findPage.ts'
import { useLocation } from 'react-router';
import { getVersionPage } from '@components/Sider';

export const Document: React.SFC<Partial<{
    type: string
}>> = props => {
    const location = useLocation();
    const path = getVersionPage(location.pathname)?.path!
    const versionName = getVersionPage(location.pathname)?.version!
    React.useEffect(() => {
        document.body.style.fontFamily = "Content-font, Roboto, sans-serif"
        document.body.style.color = "#3b454e"
    }, [])
    return <div style={styles.layout}>
        <div style={{ marginBottom: "32px", padding: "40px 0", borderBottom: "2px solid rgb(230, 236, 241)" }}>
            <h1 style={styles.title}>{findPage(path, versionName, 'path')?.title || "Page Title"}</h1>
            {
                findPage(path, versionName, 'path')?.description &&
                <div style={styles.desc}>
                    {findPage(path, versionName, 'path')?.description}
                </div>
            }
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
        backgroundColor: "#fff",
        width: "750px",
        fontSize: "16px",
    },
    title: {
        fontSize: "32px",
        fontWeight: 500,
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
