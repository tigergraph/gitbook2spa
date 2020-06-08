import * as React from 'react'
import { BlockData } from '.'
const assets = require('@source/assets')

export type ImageType = "image"

export const RenderImage: React.FC<{ type: ImageType, data?: BlockData, children: any }> = ({ type, children, data }) => {
    switch (type) {
        case "image":
            const origin_key = Object.keys(assets).find(k => !!data?.assetID && k.startsWith(data?.assetID))
            return <figure style={{ margin: "32px auto 24px" }}>
                {
                    !!origin_key && <div>
                        <img style={{
                            maxWidth: "100%",
                            marginBottom: "16px",
                            width: "100%",
                            display: "block",
                            maxHeight: "60vh",
                            objectFit: "contain"
                        }} src={`/assets/${assets[origin_key]?.Name}`} />
                        <div style={{ textAlign: 'center', color: "rgb(157, 170, 182)", fontSize: "16px", marginTop: "8px", }}>{data?.caption}</div>
                    </div>
                }
            </figure>
        default:
            return children
    }
}