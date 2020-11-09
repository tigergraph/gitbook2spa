import * as React from 'react';
import { useHistory, useLocation } from 'react-router';
import { Row, Col } from 'antd';

import { getPageInfoFromRevision } from '@libs/findPage.ts'
import { getUrlInfo } from '@components/Sider';

export const Recommend: React.FC<Partial<{
    type: string
}>> = props => {
    const history = useHistory();
    const location = useLocation();

    const { version, path } = getUrlInfo(location.pathname)!;
    const pageInfo = getPageInfoFromRevision(path, version, 'path');

    if (!pageInfo?.pages?.length) {
        return null
    }

    return <div style={{ paddingTop: "40px" }}>
        <div style={{ color: "#3B454E", fontSize: 16, lineHeight: 1.625, fontFamily: "Content-font, Roboto, sans-serif", marginBottom: "28px" }}>
            Here are the articles in this section:
        </div>
        <Row justify='space-between'>
            {
                pageInfo?.pages?.map((childPage, index) => {
                    return (
                        <Col
                            key={index}
                            span={11}
                            onClick={() => {
                                history.push(`/${version}/${childPage.path}`)
                            }}
                            style={{
                                fontSize: '16px',
                                fontFamily: "Content-font, Roboto, sans-serif",
                                lineHeight: 1.5,
                                padding: "16px",
                                boxShadow: "rgba(116, 129, 141, 0.1) 0px 3px 8px 0px",
                                marginBottom: "20px",
                                cursor: "pointer",
                                border: "1px solid #E6ECF1"
                            }}
                        >
                            <div style={{ fontWeight: 500, color: "rgb(36, 42, 49)" }}>
                                {childPage.title}
                            </div>

                            {
                                !!childPage.description && <div style={{ color: "rgb(157, 170, 182)" }}>
                                    {childPage.description}
                                </div>
                            }
                        </Col>
                    )
                })
            }
        </Row>
    </div>
};
