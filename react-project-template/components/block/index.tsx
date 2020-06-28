import * as React from 'react';
import { HeadType, RenderHead } from '@components/block/Head.tsx';
import { checkBlockType } from '@libs/checkType.ts';
import { RenderList, ListType } from '@components/block/List.tsx';
import { RenderCode, CodeType } from '@components/block/Code.tsx';
import { RenderBlockquote, BlockquoteType } from '@components/block/Blockquote.tsx';
import { RenderImage, ImageType } from '@components/block/Image.tsx';
import { RenderTable, TableType } from '@components/block/Table.tsx';
import { HintType, RenderHint, HintStyle } from '@components/block/Hint.tsx';
import { RenderPageRef, PageRefType } from '@components/block/PageRef.tsx';
import { RenderApiMethod, ApiMethodType } from '@components/block/ApiMethod.tsx';
import { RenderTabs, TabsType } from '@components/block/Tabs.tsx';
import { RenderMath, MathType } from '@components/block/Math.tsx';
import { RenderFile, FileType } from '@components/block/File.tsx';

type BlockType = "paragraph"

export type BlockData = {
    // custom
    isFirstEle?: boolean
    // original
    checked?: boolean
    assetID?: string
    caption?: string
    title?: string
    page?: string
    formula?: string
    syntax?: string
    aligns?: Array<'right' | 'left' | 'center'>
    style?: HintStyle
}

export const Block: React.SFC<Partial<{
    type: HeadType | BlockType | ListType | CodeType | BlockquoteType | ImageType | TableType | HintType | PageRefType | ApiMethodType | TabsType | MathType | FileType;
    children: any;
    data: BlockData
}>> = ({ type, children, data }) => {
    switch (checkBlockType(type)) {
        case 'heading':
            return <RenderHead type={type as HeadType} data={data}>{children}</RenderHead>
        case 'list':
            return <RenderList type={type as ListType} data={data}>{children}</RenderList>
        case 'code':
            return <RenderCode type={type as CodeType} data={data}>{children}</RenderCode>
        case 'blockquote':
            return <RenderBlockquote type={type as BlockquoteType}>{children}</RenderBlockquote>
        case 'image':
            return <RenderImage type={type as ImageType} data={data}>{children}</RenderImage>
        case 'table':
            return <RenderTable type={type as TableType} data={data}>{children}</RenderTable>
        case 'hint':
            return <RenderHint type={type as HintType} data={data}>{children}</RenderHint>
        case 'page':
            return <RenderPageRef type={type as PageRefType} data={data}>{children}</RenderPageRef>
        case 'api-method':
            return <RenderApiMethod type={type as ApiMethodType} data={data}>{children}</RenderApiMethod>
        case 'tabs':
            return <RenderTabs type={type as TabsType} data={data}>{children}</RenderTabs>
        case 'math':
            return <RenderMath type={type as MathType} data={data}>{children}</RenderMath>
        case 'file':
            return <RenderFile type={type as FileType} data={data}>{children}</RenderFile>
    }


    const containsLinkEle = type === 'paragraph' && !!React.Children.toArray(children).find((child: any) => child?.props?.type === 'link')

    return <p style={{ lineHeight: 1.625 }}>
        {children}{containsLinkEle && <br />}
    </p>
}
