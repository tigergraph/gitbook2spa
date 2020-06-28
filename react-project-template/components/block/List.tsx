import * as React from 'react'
import { BlockData } from '.'
import { style } from 'typestyle'
import { Checkbox } from 'antd'

export type ListType = "list-unordered" | "list-item" | "list-ordered"

export const RenderList: React.FC<{
    type: ListType;
    data?: BlockData;
}> = ({ type, children, data }) => {
    switch (type) {
        case 'list-item':
            if (!!data && isTaskItem(data)) {
                return <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ padding: "3px 3px 0 9px" }}><Checkbox checked={data?.checked} /></div>
                    <div>{children}</div>
                </div>
            }
            return <li className={styles.clearPTagStyle}>{children}</li>
        case 'list-unordered':
            if (hasTaskItem(React.Children.toArray(children))) {
                return <div>{children}</div>
            }
            return <ul style={{ paddingLeft: "30px" }}>{children}</ul>
        case 'list-ordered':
            return <ol>{children}</ol>
    }
}

const hasTaskItem = (eles: Array<Exclude<React.ReactNode, boolean | null | undefined>>): boolean => {
    return !!eles.find((i: any) => {
        return isTaskItem(i?.props?.data)
    })
}

const isTaskItem = (data: BlockData): boolean => {
    const d = new Object(data || {})
    return d.hasOwnProperty('checked')
}

const styles = {
    clearPTagStyle: style({
        $nest: {
            "&>p": {
                display:"inline"
            }
        }
    })
}