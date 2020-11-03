import * as React from 'react';
import { message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { OnHover } from '@libs/OnHover.tsx';
import { renderFileSize } from '@libs/renderFileSize.ts';
import { BlockData } from '.'

import assetsMap from '@gitbook/assets.js';

export type FileType = "file"

export const RenderFile: React.FC<{
    type: FileType;
    children: any;
    data?: BlockData
}> = ({ type, children, data }) => {
    const origin_key = Object.keys(assetsMap).find(k => !!data?.assetID && k.startsWith(data?.assetID));
    const origin_name = origin_key?.split('-').slice(2).join('');
    const fileInfo = assetsMap[origin_key!];

    if (type === 'file') {
        return <React.Fragment>
            {
                !!origin_key && <OnHover>
                    {
                        onHover => {
                            return <a onClick={() => message.success('正在下载...')} style={{ color: "#FC6C04" }} download={origin_name} href={`/assets/${fileInfo?.Name}`}>
                                <div style={{ border: `1px solid ${onHover ? "#FC6C04" : "#e2e9ef"}`, borderRadius: "3px", padding: "16px", display: "flex", justifyContent: "space-between", margin: "32px 0", boxShadow: "rgba(116, 129, 141, 0.1) 0px 3px 8px 0px" }}>
                                    <div style={{ display: "flex", alignItems: "center", }}>
                                        <DownloadOutlined style={{ fontSize: "24px", marginRight: "16px" }} />{origin_name}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", }}>
                                        <span>{origin_name}</span>
                                        <span style={{ margin: "0 4px" }}>-</span>
                                        <span>{renderFileSize(fileInfo?.Size)}</span>
                                    </div>
                                </div>
                            </a>
                        }
                    }
                </OnHover>
            }

            {children}
        </React.Fragment>
    } else {
        return children;
    }
};
