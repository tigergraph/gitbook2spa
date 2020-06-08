import * as React from 'react'
import { BlockData } from '.'
import { InlineMath } from 'react-katex';

export type MathType = "math"

export const RenderMath: React.FC<{
    type: MathType;
    children: any;
    data?: BlockData
}> = ({ type, children, data }) => {
    switch (type) {
        default:
            return (() => {
                const formula = data?.formula && eval("'" + `${data?.formula}`.replace(/\\/g, "\\\\") + "'")
                return <div>
                    {!!formula && <div style={{ textAlign: 'center', padding: "16px 0" }}>
                        <h2>
                            <InlineMath>{formula}</InlineMath>
                        </h2>
                    </div>}
                    {children}
                </div>
            })()
    }
}
