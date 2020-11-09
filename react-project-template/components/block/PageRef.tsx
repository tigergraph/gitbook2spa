import * as React from "react";
import { useHistory, useLocation } from "react-router";
import { ArrowRightOutlined } from "@ant-design/icons";

import { getPageInfoFromRevision } from "@libs/findPage.ts";
import { getUrlInfo } from "@components/Sider";
import { BlockData } from ".";

import styles from '@styles/block-type.module.css';

export type PageRefType = "page-ref";

export const RenderPageRef: React.FC<{
    type: PageRefType;
    data?: BlockData;
}> = ({ type, children, data }) => {
    const location = useLocation();

    const version = getUrlInfo(location.pathname)?.version!;

    if(type === 'page-ref') {
        const pageInfo = getPageInfoFromRevision(data?.page!, version, 'uid');

        return (
            <React.Fragment>
                <PageLink pageInfo={pageInfo} link={data?.page} />
                {children}
            </React.Fragment>
        );
    } else {
        return null;
    }
};

const PageLink: React.FC<{
    pageInfo?: VersionInfo;
    link?: string
}> = ({ pageInfo, link }) => {
    const history = useHistory();
    const location = useLocation();

    const version = getUrlInfo(location.pathname)?.version!;

    if (!pageInfo) {
        return <div>error ref:{link}</div>;
    }

    return (
        <a
            className='tg-main-color'
            onClick={() => history.push(`/${version}/${pageInfo.path}`)}
        >
            <div className={styles.blockLink}>
                <div className='vertical-center-block'>
                    <ArrowRightOutlined className={styles.blockLinkIcon} />
                    {pageInfo.title}
                </div>
                <div className={styles.blockLinkDetail}>
                    <span>/{pageInfo.title}</span>
                </div>
            </div>
        </a>
    );
};
