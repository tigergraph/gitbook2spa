import * as React from 'react'
import { BlockData } from '.'
import { findChildType } from '@libs/findChildType'
import { style } from 'typestyle'
import { CopyBlock, dracula } from 'react-code-blocks'

export type CodeType = "code-line" | "code" | "code-tab"

export const RenderCode: React.FC<{ type: CodeType; children: any, data?: BlockData; }> = ({ type, children, data }) => {
    if (type === 'code') {
        const childs: any[] = React.Children.toArray(children) || []

        if (findChildType(children, 'code-tab')) {
            return <React.Fragment>
                {childs.map((child: any, idx) => {
                    const title = child?.props?.data?.title
                    let codeContent = ``;

                    if (!!child?.props?.children?.length) {
                        (child?.props?.children || [])?.forEach((codeLine: any) => {
                            const text = formatStrIndent(codeLine?.props?.children?.props?.children)
                            !!text && (codeContent += `${text}\n`)
                        })
                    }
                    let t = child?.props?.children?.props?.children?.props?.children
                    codeContent += Array.isArray(t) ? t?.join?.("") : t || ""

                    return <React.Fragment key={idx}>
                        {title && <div style={{ fontWeight: 700, fontSize: "14px", paddingTop: "12px" }}>{title}</div>}
                        <CodeBlock key={idx} text={codeContent} language={child?.props?.data?.syntax || ""} />
                    </React.Fragment>
                })}
            </React.Fragment>
        }

        if (findChildType(children, 'code-line')) {
            return (() => {
                let codeContent = ``;
                childs.forEach(child => {
                    const text = formatStrIndent(child?.props?.children?.props?.children)
                    codeContent += text ? `${Array.isArray(text) ? text?.join?.('') : text}\n` : '\n'
                })

                return <CodeBlock text={codeContent} language={data?.syntax || ""} />
            })()
        }
    }
    return null
}

const CodeBlock: React.FC<{ text: string; language: string }> = ({ text, language }) => {
    return <div style={{
        fontWeight: 100, fontSize: "14px",
        padding: "12px 24px 24px 8px",
        fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"
    }} className={style({
        $nest: {
            "button": {
                border: "1px solid transparent !important",
                cursor: "pointer"
            }
        }
    })}>
        <CopyBlock
            text={text}
            language={language}
            showLineNumbers
            theme={dracula}
            codeBlock
        />
    </div>
}

export const formatStrIndent = (_str: string = "") => {
    let str = _str
    let tmp = ``
    let lastForIndex = 0
    if (!str) {
        return "\t"
    }
    if (Array.isArray(str)) {
        str = str.join('')
    }
    if (!Array.isArray(str) && typeof str === 'object') {
        str = (str as any)?.props?.children
    }
    for (let i = 0; i < str.length; i++) {
        if (str[i] === ' ') {
            tmp += `  `
        } else {
            lastForIndex = i
            break;
        }
    }

    return tmp + (str || "")?.slice(lastForIndex)
}
