import * as React from 'react'
import { useHistory } from "react-router-dom";

import { BlockData } from '.'

interface AnchorMap {
    [key: string]: {
        [key: string]: {
            [key: string]: number
        }
    }
}

let anchorMap: AnchorMap;

export type HeadType = "heading-1" | "heading-2" | "heading-3"

export const RenderHead: React.FC<{ type: HeadType, data?: BlockData, version: string, pageUID: string }> = ({ type, children, data, version, pageUID }) => {
    const [anchor, setAnchor] = React.useState('');
    const history = useHistory();

    const child = ((children as any)?.props?.children);
    const pattern1 = /[,.?:()'"/!*+=\-\[\]]/g;
    const pattern2 = /\b\s+\b/g;

    if (anchor === '') {
        // init anchor
        if (typeof child === 'string') {
            setAnchor(child
                .toLowerCase()
                .replace(/v(\d+)/g, 'v $1') // add a space between 'v' and 'version number'
                .replace(/&/g, 'and') // transform '&' into 'and'
                .replace(pattern1, ' ') // replace all the special characters with space
                .replace(pattern2, '-') // replace all spaces with dash
                .trim()
            )
        }

        if (
            Array.isArray(child) &&
            child.every((item) => typeof item === "string")
        ) {
            setAnchor(child
                .join("")
                .toLowerCase()
                .replace(/v(\d+)/g, 'v $1')
                .replace(/&/g, 'and')
                .replace(pattern1, ' ')
                .replace(pattern2, "-")
                .trim()
            );
        }

        if (Array.isArray(children)) {
            setAnchor(children
                .map((item) => findChildText(item))
                .join("")
                .toLowerCase()
                .replace(/v(\d+)/g, 'v $1')
                .replace(/&/g, 'and')
                .replace(pattern1, ' ')
                .replace(pattern2, "-")
                .trim()
            );
        }
    }

    // anchor map cleanup
    React.useEffect(() => {
        const unListen = history.listen((location, action) => {
            if (action === "PUSH") {
                // reset the anchor map for a new page
                anchorMap = {};
            }
        });

        return () => {
            unListen();
        };
    }, []);

    // add number suffix to duplicate anchor
    React.useEffect(() => {
        const number = getNumberOfDuplicateAnchor(version, pageUID, anchor);

        if (number !== 1) {
            // add number suffix
            setAnchor(`${anchor}_${number}`);
        }
    }, []);

    switch (type) {
        case "heading-1":
            return (
                <h1
                    className={"heading-anchor-link"}
                    data-level={"one"}
                    id={anchor}
                    style={{
                        fontSize: "24px",
                        color: "#242A31",
                        fontWeight: 500,
                        lineHeight: 1.5,
                        padding: data?.isFirstEle ? "0px 0px 24px" : "24px 0",
                        borderTop: data?.isFirstEle ? "none" : "1px solid #E6ECF1",
                        marginTop: "24px",
                    }}
                >
                    {children}
                </h1>
            );
        case "heading-2":
            return (
                <h2
                    className={"heading-anchor-link"}
                    data-level={"two"}
                    id={anchor}
                    style={{
                        paddingBottom: "12px",
                        fontSize: "20px",
                        fontWeight: 500,
                    }}
                >
                    {children}
                </h2>
            );
        case "heading-3":
            return (
                <h3
                    style={{
                        paddingBottom: "12px",
                        fontSize: "16px",
                        fontWeight: 500,
                    }}
                >
                    {children}
                </h3>
            );
        default:
            return null;
    }
};

function findChildText(element: any): string {
    const child = element?.props?.children;

    if (typeof child === 'object' && 'props' in child) {
        return findChildText(child)
    }

    return  Array.isArray(child) && child.every((item: any) => typeof item === "string")
        ? child.join("")
        : String(child);
}

function getNumberOfDuplicateAnchor(version: string, pageUID: string, anchor: string): number {
    while (true) {
        if (anchorMap) {
            if (anchorMap[version]) {
                if (anchorMap[version][pageUID]) {
                    if(anchorMap[version][pageUID][anchor]) {
                        anchorMap[version][pageUID][anchor] ++;
                    } else {
                        anchorMap[version][pageUID][anchor] = 1;
                    }

                    break ;
                } else {
                    anchorMap[version][pageUID] = {};
                }
            } else {
                anchorMap[version] = {};
            }
        } else {
            anchorMap = {}
        }
    }

    return anchorMap[version][pageUID][anchor];
}
