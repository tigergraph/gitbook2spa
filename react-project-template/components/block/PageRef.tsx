import * as React from "react";
import { useLocation, useHistory } from "react-router";
import { ArrowRightOutlined } from "@ant-design/icons";

import { findPage } from "@libs/findPage.ts";
import { getVersionPage } from "@components/Sider";
import { BlockData } from ".";

import styles from '@styles/block-type.module.css';

export type PageRefType = "page-ref";

export const RenderPageRef: React.FC<{
    type: PageRefType;
    data?: BlockData;
}> = ({ type, children, data }) => {
    const location = useLocation();
    const versionName = getVersionPage(location.pathname)?.version!;

    if(type === 'page-ref') {
        const pageInfo = findPage(data?.page!, versionName, 'uid');

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
    const versionName = getVersionPage(location.pathname)?.version!;

    if (!pageInfo) {
        return <div>error ref:{link}</div>;
    }

    return (
        <a
            className='tg-main-color'
            onClick={() => history.push(`/${versionName}/${pageInfo.path}`)}
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
