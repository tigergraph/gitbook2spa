import * as React from 'react'
import { BlockData } from '.'

export type HeadType = "heading-1" | "heading-2" | "heading-3"

export const RenderHead: React.FC<{ type: HeadType, data?: BlockData }> = ({ type, children, data }) => {
    const child = ((children as any)?.props?.children)
    const text = (typeof child === 'string' ? child : "").toLowerCase().replace(/\s+|\./g, "_");
    switch (type) {
        case "heading-1":
            return <h1 className={"heading-anchor-link"} data-level={"one"} id={text} style={{
                fontSize: "24px",
                color: "#242A31",
                fontWeight: 700,
                lineHeight: 1.5,
                padding: data?.isFirstEle ? '0px 0px 24px' : "24px 0",
                borderTop: data?.isFirstEle ? 'none' : "1px solid #E6ECF1",
                marginTop: "24px"
            }}>
                {children}
            </h1>
        case "heading-2":
            return <h2 className={"heading-anchor-link"} data-level={"two"} id={text} style={{ paddingBottom: "12px", fontSize: "20px", fontWeight: 700 }}>
                {children}
            </h2>
        case "heading-3":
            return <h3 style={{ paddingBottom: "12px", fontSize: "16px", fontWeight: 700 }}>
                {children}
            </h3>
        default:
            return null;
    }
}
