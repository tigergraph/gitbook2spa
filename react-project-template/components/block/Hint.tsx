import * as React from 'react'
import { BlockData } from '.'
import { InfoCircleTwoTone, WarningTwoTone, CheckCircleTwoTone } from '@ant-design/icons'
import { style } from 'typestyle'

export type HintType = "hint"

export const RenderHint: React.FC<{
    type: HintType;
    data?: BlockData;
}> = ({ type, children, data }) => {
    switch (type) {
        case 'hint':
            return <Layout style={data?.style}>{children}</Layout>
        default:
            return null
    }
}

export type HintStyle = "warning" | "danger" | "info" | "success"

const config: Record<HintStyle, {
    color: string,
    icon: JSX.Element
}> = {
    warning: {
        color: "rgb(247, 125, 5)",
        icon: <InfoCircleTwoTone twoToneColor={'rgb(247, 125, 5)'} style={{ fontSize: "24px" }} />
    },
    danger: {
        color: "rgb(255, 70, 66)",
        icon: <WarningTwoTone twoToneColor={'rgb(255, 70, 66)'} style={{ fontSize: "24px" }} />
    },
    info: {
        color: "rgb(56, 132, 255)",
        icon: <InfoCircleTwoTone twoToneColor={'rgb(56, 132, 255)'} style={{ fontSize: "24px" }} />
    },
    success: {
        color: "rgb(38, 203, 124)",
        icon: <CheckCircleTwoTone twoToneColor={'rgb(38, 203, 124)'} style={{ fontSize: "24px" }} />
    },
}

const Layout: React.FC<{ style?: HintStyle; children?: any }> = ({ style, children }) => {
    return <span style={{
        margin: "32px 0px",
        backgroundColor: "rgb(245, 247, 249)",
        borderRadius: "3px",
        padding: "24px",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        position: "relative"
    }}>
        {
            !!style && <React.Fragment>
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "5px",
                        backgroundColor: config[style].color
                    }} />
                <div style={{ marginRight: "8px" }}>{config[style].icon}</div>
            </React.Fragment>
        }
        <div className={!Array.isArray(children) ? styles.clearPTagStyle : ""}>
            {children}
        </div>
    </span>
}


const styles = {
    clearPTagStyle: style({
        $nest: {
            "&>p": {
                marginBottom: 0
            }
        }
    })
}