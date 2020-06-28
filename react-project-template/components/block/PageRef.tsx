import * as React from 'react'
import { BlockData } from '.'
import { OnHover } from '@libs/OnHover.tsx'
import { findPage } from '@libs/findPage.ts'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useLocation, useHistory } from 'react-router'
import { getVersionPage } from '@components/Sider'

export type PageRefType = "page-ref"

export const RenderPageRef: React.FC<{
    type: PageRefType;
    data?: BlockData;
}> = ({ type, children, data }) => {
    const location = useLocation();
    const versionName = getVersionPage(location.pathname)?.version!
    switch (type) {
        case 'page-ref':
            const pageInfo = findPage(data?.page!, versionName)
            return <React.Fragment>
                <PageLink pageInfo={pageInfo} link={data?.page} />
                {children}
            </React.Fragment>
        default:
            return null
    }
}

const PageLink: React.FC<{ pageInfo?: VersionInfo; link?: string }> = ({ pageInfo, link }) => {
    const history = useHistory();
    if (!pageInfo) {
        return <div>
            error ref:{link}
        </div>
    }
    return <OnHover>
        {
            onHover => {
                return <a style={{ color: "#FC6C04" }} onClick={() => history.push(pageInfo.uid)}>
                    <div style={{ marginBottom: "16px", border: `1px solid ${onHover ? "#FC6C04" : "#e2e9ef"}`, borderRadius: "3px", padding: "16px", display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", }}>
                            <ArrowRightOutlined style={{ fontSize: "24px", marginRight: "16px" }} />
                            {pageInfo.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", color: "#9DAAB6", fontSize: "12px" }}>
                            <span>/{pageInfo.title}</span>
                        </div>
                    </div>
                </a>
            }
        }
    </OnHover>
}

