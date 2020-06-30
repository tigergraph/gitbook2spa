import * as React from 'react'
import { BlockData } from '.'
import { style } from 'typestyle'
import { Row, Col } from 'antd'

export type TableType = "table" | "table-row" | "table-cell"

export const RenderTable: React.FC<{
    type: TableType;
    data?: BlockData;
}> = ({ type, children, data }) => {
    switch (type) {
        case 'table':
            return <div style={{ margin: "24px 0 20px", fontSize: "16px" }}>
                {
                    React.Children.map(children, (child: any, idx) => {
                        if (!child) {
                            return null
                        }
                        return React.cloneElement(child, { key: idx, data: Object.assign({}, data, { isFirst: idx === 0 }) })
                    })
                }
            </div>
        case 'table-row':
            const isTitleRow = (data as any)?.isFirst
            return <Row align="middle" justify="space-around" style={{
                display: "flex",
                borderBottom: `${isTitleRow ? '2px' : "1px"} solid rgba(157,170,182,0.4)`,
                color: isTitleRow ? "rgba(157, 170, 182,0.7)" : "#3B454E",
                fontWeight: isTitleRow ? 700 : 400,
            }}>
                {
                    React.Children.map(children, (child, idx) => {
                        return <Col
                            key={idx}
                            span={Math.floor(Number(24 / React.Children.toArray(children).length))}
                            style={{ alignItems: data?.aligns?.[idx] || 'left', }}
                        >
                            {child}
                        </Col>
                    })
                }
            </Row>
        case 'table-cell':
            return <div style={{ padding: "8px", wordBreak: "break-word" }} className={styles.clearPTagStyle}>
                {children}
            </div>
        default:
            return null
    }
}

const styles = {
    clearPTagStyle: style({
        $nest: {
            "&>p": {
                display: "block",
                marginBottom: 0
            }
        }
    })
}
