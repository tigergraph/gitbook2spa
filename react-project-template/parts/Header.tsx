import * as React from 'react'
import { style } from 'typestyle'

export const Header: React.FC = ({ children }) => {
    return <React.Fragment>
        <div className={styles.layout}>
            <div className={styles.logoLayout}>
                <div className={styles.logoInnerLayout}>
                    <img src={'/logo.png'} style={{ width: "40px", height: "40px" }} />
                    <span className={styles.logoInnertext}>TigerGraph Documentation</span>
                </div>
            </div>
            <div className={styles.navLayout}>
                <a target="_blank" rel="noopener noreferrer" href="https://www.tigergraph.com" style={{ color: "#FC6C04", marginRight: "35px" }}>TigerGraph</a>
                <a target="_blank" rel="noopener noreferrer" href="https://tigergraph.com/download" style={{ color: "#FC6C04", marginRight: "35px" }}>Download</a>
                <a target="_blank" rel="noopener noreferrer" href="https://app.gitbook.com/@tigergraph/s/document/release-notes-change-log" style={{ color: "#FC6C04", marginRight: "35px" }}>ALERT: IE and Edge browsers</a>
            </div>
        </div>
        {children}
    </React.Fragment>
}

const styles = {
    layout: style({
        width: "100%",
        height: "79px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid rgb(212, 218, 223)",
        boxShadow: "0 3px 8px 0 rgba(17, 20, 23, 0.1)",
    }),
    logoLayout: style({
        width: "340px",
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
    logoInnertext: style({
        color: "#242a31",
        fontSize: "17px",
        fontWeight: 500
    }),
    navLayout: style({
        paddingLeft: "88px",
        color: "#FC6C04",
        fontWeight: "bolder",
        fontSize: "16px"
    })
}