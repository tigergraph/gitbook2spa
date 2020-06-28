import * as React from 'react'
import { BlockData } from '.'
import { findChildType } from '@libs/findChildType'
import { style } from 'typestyle';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

export type TabsType = "tabs" | "tabs-item"

export const RenderTabs: React.FC<{
    type: TabsType;
    children: any;
    data?: BlockData
}> = ({ type, children, data }) => {
    switch (type) {
        case "tabs":
            return <div className={childrenWrapCls(children)}>
                <Tabs>
                    {
                        React.Children.map(children, (child, idx) => {
                            return <TabPane tab={child?.props?.data?.title} key={idx.toString()}>
                                {child}
                            </TabPane>
                        })
                    }
                    {children}
                </Tabs>
            </div>
        default:
            return <div>{children}</div>
    }
}

const childrenWrapCls = (children: any): string => {
    let className = ""
    // check child is code block
    if (findChildType(children, 'code')) {
        className = style({
            $nest: {
                "&>.ant-tabs .ant-tabs-bar": {
                    marginBottom: "2px !important"
                }
            }
        })
    }
    return className
}
