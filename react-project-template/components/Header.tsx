import * as React from 'react'
import { Link } from 'react-router-dom'
import { Search } from "@components/Search";

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
                        space?.links?.map(link => {
                            if (!!link.pageID) {
                                return <Link
                                    rel="noopener noreferrer"
                                    key={link.pageID}
                                    to={link.pageID}
                                    style={{
                                        color: "#FC6C04",
                                        marginRight: "35px"
                                    }}>
                                    {link.title}
                                </Link>
                            }
                            return <a
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
}
