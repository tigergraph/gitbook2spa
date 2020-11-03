import * as React from 'react';

import { BlockData } from '.';

import assetsMap from '@gitbook/assets.js';

import styles from '@styles/block-type.module.css';

export type ImageType = "image"

export const RenderImage: React.FC<{ type: ImageType, data?: BlockData, children: any }> = ({ type, children, data }) => {
    if (type === 'image') {
        const origin_key = Object.keys(assetsMap).find(k => !!data?.assetID && k.startsWith(data?.assetID));

        const pathName = origin_key ? assetsMap[origin_key]?.Name : '';
        const url = origin_key ? `/assets/${pathName}` : undefined;
        const imgName = origin_key
            ? pathName.replace(new RegExp(`${data?.assetID}-(\\w+)[.\\w]+$`), '$1')
            : 'image';

        return (
            <figure style={{ margin: "32px auto 24px" }}>
                {
                    !!origin_key && <div>
                        <img className={styles.image} src={url} alt={imgName}/>
                        <div className={styles.imageCaption}>{data?.caption}</div>
                    </div>
                }
            </figure>
        );
    } else {
        return children;
    }
};
