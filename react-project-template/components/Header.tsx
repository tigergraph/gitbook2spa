import * as React from 'react'
import { Link } from 'react-router-dom'

import { getUrlInfo } from "@components/Sider";
import { Search } from "@components/Search";
import { getPageInfoFromRevision } from "@libs/findPage";

import styles from '@styles/header.module.css';

export const Header: React.FC = ({ children }) => {
    return <React.Fragment>
        <div className={styles.header}>
            <div className={styles.layout}>
                <div className={styles.logoLayout}>
                    <div className={styles.logoInnerLayout}>
                        <img src={'/logo.png'} style={{ width: "40px", height: "40px" }} />
                        <span className={styles.logoText}>{space?.name}</span>
                    </div>
                </div>

                <div className={styles.navLayout}>
                    {
                        space?.links?.map((link, index) => {
                            if (!!link.pageID) {
                                return <Link
                                    rel="noopener noreferrer"
                                    key={link.pageID}
                                    to={getUrlPath(link.pageID)}
                                    style={{
                                        color: "#FC6C04",
                                        marginRight: "35px"
                                    }}>
                                    {link.title}
                                </Link>
                            }
                            return <a
                                key={index}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={link.href}
                                style={{
                                    color: "#FC6C04",
                                    marginRight: "35px"
                                }}>
                                {link.title}
                            </a>
                        })
                    }
                </div>

                <Search/>
            </div>
        </div>
        {children}
    </React.Fragment>
};

const getUrlPath = (pageID: string): string => {
    const version = getUrlInfo(location.pathname)?.version!;
    const pageInfo = getPageInfoFromRevision(pageID!, version, 'uid');

    return `/${version}/${pageInfo?.path}`;
};
