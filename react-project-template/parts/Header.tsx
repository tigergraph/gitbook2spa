import * as React from 'react'
import { style } from 'typestyle'
import { Link } from 'react-router-dom'

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
            </div>
        </div>
        {children}
    </React.Fragment>
}

const styles = {
    header: style({
        display: "flex",
        justifyContent: "center",
        borderBottom: "1px solid rgb(212, 218, 223)",
        boxShadow: "0 3px 8px 0 rgba(17, 20, 23, 0.1)",
    }),
    layout: style({
        display: "flex",
        height: "80px",
        width: "100%",
        maxWidth: "1560px",
        margin: "0 auto",
        alignItems: "center",
    }),
    logoLayout: style({
        width: "355px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "1px solid rgb(230, 236, 241)"
    }),
    logoInnerLayout: style({
        width: "250px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

    }),
    logoText: style({
        color: "#242a31",
        fontSize: "17px",
        fontWeight: 500,
        whiteSpace: "nowrap"
    }),
    navLayout: style({
        paddingLeft: "88px",
        color: "#FC6C04",
        fontWeight: "bolder",
        fontSize: "16px"
    })
}
