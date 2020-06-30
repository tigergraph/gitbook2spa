import * as React from 'react';
import { mergeClassName } from '@libs/mergeClassName';
import { style } from 'typestyle';

type MarkTypes = "italic" | "bold" | "strikethrough" | "code"

interface Mark {
    kind: "mark",
    data: any,
    type: MarkTypes
}

export const Text: React.SFC<Partial<{
    type: string
    marks: Mark[]
    children?: any
}>> = ({ marks = [], type, children: _children }) => {
    const isArrChildren = Array.isArray(_children)
    const isText = typeof _children === 'string' || (isArrChildren && !_children?.find?.((c: any) => typeof c !== "string"))
    const children = isText ? String((isArrChildren ? _children?.join?.('') : _children) || "")?.replace(/&nbsp;/ig, '') : _children

    if (isText && !!children && !children?.replace(/\./ig, '')) return null

    return <React.Fragment>
        <Container>
            {!!isText && (!!marks.length ? RenderMarkContainer(marks, children) : children || "")}
        </Container>
        {!isText && children || ""}
    </React.Fragment>
}

function RenderMarkContainer(marks: Mark[], child?: any) {
    if (!marks.length) {
        return child || ""
    }
    switch (marks.shift()?.type) {
        case 'bold':
            return <Container className={styles.textTypeBold}>
                {RenderMarkContainer(marks, child)}
            </Container>
        case 'code':
            return <Container className={styles.textTypeCode}>
                {RenderMarkContainer(marks, child)}
            </Container>
        case 'italic':
            return <Container className={styles.textTypeItalic}>
                {RenderMarkContainer(marks, child)}
            </Container>
        case 'strikethrough':
            return <Container className={styles.textTypeStrikethrough}>
                {RenderMarkContainer(marks, child)}
            </Container>
        default:
            return null
    }
}

const Container: React.FC<{
    children?: any
    className?: string
}> = ({ children, className }) => {
    return <span className={mergeClassName([styles.defaultStyle, className])}>{children || ""}</span>
}

const styles = {
    defaultStyle: style({
        lineHeight: 1.625
    }),
    textTypeItalic: style({
        fontStyle: "italic",
    }),
    textTypeBold: style({
        fontWeight: 500,
    }),
    textTypeStrikethrough: style({
        textDecoration: 'line-through',
    }),
    textTypeCode: style({
        backgroundColor: "rgb(245, 247, 249)",
        padding: "3px 6px",
        borderRadius: "3px",
        margin: "0px 1px",
        fontSize: "85% !important",
    }),
    border: style({ border: "1px solid red" })
}
