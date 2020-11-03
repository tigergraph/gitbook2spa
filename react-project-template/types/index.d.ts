declare const STATIC_PATH: string;
declare const pageName: string;
declare const versionName: string;
declare const whiteList: string;
declare const InlineMath: any;
declare const CopyBlock: any;
declare const dracula: any;
declare const KaTeX: any;
declare const katex: any;
declare const revision: Revision;
declare const space: Space;
declare module 'react-katex';
declare module '@ant-design/icons';
declare module 'react-code-blocks';
declare module '*.css';
declare module '*.json';
declare module '*.js';

declare type Space = {
    name: string;
    links: Array<{
        title: string;
        href: string;
        pageID: string;
    }>
}

declare type Pages = Array<VersionInfo>
declare type VersionInfo = {
    uid: string;
    parentPath?: string;
    title: string;
    kind: 'document' | 'group' | 'link';
    description: string;
    path: string;
    href: string;
    documentURL: string;
    createdAt: string;
    pages: Pages;
    github: any;
    isPathUntouched: boolean;
    stats: { words: number, images: number, codeLines: number, revisions: number };
    edits: { contributions: Array<any> };
}

declare type Revision = {
    versions: Record<string, TopLevelVersion>
}

declare type TopLevelVersion = {
    page: VersionInfo
    ref: "2.2.0"
    title: "2.2"
}



