import * as React from 'react';
import { message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { renderFileSize } from '@libs/renderFileSize.ts';
import { BlockData } from '.'

import assetsMap from '@gitbook/assets.js';

import styles from '@styles/block-type.module.css';

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
                !!origin_key &&
                <a
                    className='tg-main-color'
                    download={origin_name}
                    href={`/assets/${fileInfo?.Name}`}
                    onClick={() => message.success('downloading...')}
                >
                    <div className={styles.blockLink}>
                        <div className='vertical-center-block'>
                            <DownloadOutlined className={styles.blockLinkIcon} />
                            {origin_name}
                        </div>
                        <div className={styles.blockLinkDetail}>
                            <span>{origin_name}</span>
                            <span style={{ margin: '0 4px' }}>-</span>
                            <span>{renderFileSize(fileInfo?.Size)}</span>
                        </div>
                    </div>
                </a>
            }
            {children}
        </React.Fragment>
    } else {
        return children;
    }
};
