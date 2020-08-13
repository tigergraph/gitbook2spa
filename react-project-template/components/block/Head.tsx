import * as React from 'react'
import { BlockData } from '.'
import { useHistory } from "react-router-dom";

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
    const pattern = /\s+|[.,:]/g;

    if (anchor === '') {
        // init anchor
        if (typeof child === 'string') {
            setAnchor(child
                .toLowerCase()
                .replace(pattern, '_')
            )
        }

        if (
            Array.isArray(child) &&
            child.every((item) => typeof item === "string")
        ) {
            setAnchor(child
                .join("")
                .toLowerCase()
                .replace(pattern, "_")
            );
        }

        if (Array.isArray(children)) {
            setAnchor(children
                .map((item) => findChildText(item))
                .join("")
                .toLowerCase()
                .replace(pattern, "_")
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
