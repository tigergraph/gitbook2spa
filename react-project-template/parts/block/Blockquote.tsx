import * as React from 'react'

export type BlockquoteType = "blockquote"

export const RenderBlockquote: React.FC<{ type: BlockquoteType, children: any }> = ({ type, children }) => {
    switch (type) {
        case "blockquote":
            return <div style={{
                borderLeft: "4px solid rgb(230, 236, 241)",
                color: "rgb(116, 129, 141)",
                margin: "0px 0px 24px",
                padding: "0px 0px 0px 12px",
                borderColor: "rgb(230, 236, 241)",
            }}>
                <div style={{margin: "0px 0px 24px"}}/>
                {children}
            </div>
        default:
            return children
    }
}