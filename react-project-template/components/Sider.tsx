import * as React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import Icon from '@ant-design/icons';

import { OnHover } from "@libs/OnHover.tsx";

import styles from '@styles/side-nav.module.css';

let currentScrollTopOfSideNav = 0;

const ExternalSvg = () => (
    <svg
        className="icon"
        viewBox="0 0 1024 1024"
        p-id="4392"
        width="1em"
        height="1em"
    >
        <path
            d="M995.2 0L668.8 0.34a28.8 28.8 0 0 0-28.8 28.8v66.62a28.8 28.8 0 0 0 29.38 28.8l147.26-5.44 4.12 4.12-557.72 557.74a24 24 0 0 0 0 34l46 46a24 24 0 0 0 34 0l557.72-557.74 4.12 4.12-5.44 147.26a28.8 28.8 0 0 0 28.8 29.38h66.62a28.8 28.8 0 0 0 28.8-28.8L1024 28.8A28.8 28.8 0 0 0 995.2 0zM864 576h-32a32 32 0 0 0-32 32v308a12 12 0 0 1-12 12H108a12 12 0 0 1-12-12V236a12 12 0 0 1 12-12h308a32 32 0 0 0 32-32V160a32 32 0 0 0-32-32H96a96 96 0 0 0-96 96v704a96 96 0 0 0 96 96h704a96 96 0 0 0 96-96V608a32 32 0 0 0-32-32z"
            p-id="4393" />
    </svg>
);

const ExternalIcon:React.FC<{ className?: any }> = props => <Icon {...props} component={ExternalSvg} />;

const getParentPath = (
    pages: Pages,
    targetPath: string
): string | undefined => {
    for (let i = 0; i < pages?.length; i++) {
        const page = pages[i];
        if (page.path === targetPath) {
            return page.parentPath;
        }

        if (!!page?.pages?.length) {
            const parentPath = getParentPath(page.pages, targetPath);

            if (parentPath) {
                return parentPath;
            }
        }
    }
};

const getPathList = (
    versionName: string,
    path: string,
    container: string[],
    targetPath?: string
) => {
    const pageObj = revision.versions[versionName]?.page;
    const parentPath = getParentPath(pageObj?.pages, targetPath || path);

    if (parentPath) {
        container.push(parentPath);
        getPathList(versionName, path, container, parentPath);
    }
};

const getPageInfo = (
    versionName: string,
    path: string,
    pageObj: VersionInfo
) => {
    const pathList: string[] = path ? [path] : [];
    getPathList(versionName, path, pathList);

    const onSelect = pathList[0] === pageObj?.path;
    const hasChildren = !!pageObj?.pages?.length;
    const onOpen = pathList.includes(pageObj?.path) && hasChildren;

    return {
        onSelect,
        onOpen,
        hasChildren,
    };
};

const formatPageRoutes = (
    versionName: string,
    currentPath: string,
    currentPageObj: VersionInfo,
    parentPath?: string
) => {
    const { hasChildren } = getPageInfo(versionName, currentPath, currentPageObj);

    if (hasChildren) {
        (currentPageObj?.pages || []).forEach((childPage) =>
            formatPageRoutes(versionName, currentPath, childPage, currentPageObj.path)
        );
    }

    if (!!parentPath) {
        currentPageObj["parentPath"] = parentPath;
    }
};

export const getVersionPage = (
    pathName?: string
) : {
    version: string;
    path: string;
} | undefined => {
    const currentPath = pathName || location.pathname || "";
    const version = currentPath?.split("/")[1];
    const path = currentPath?.split("/").slice(2).join("/");

    if (version !== "") {
        return {
            version,
            path: path || "master",
        };
    }

    return undefined;
};

export const Sider: React.FC = ({ children }) => {
    const versionList = Object.keys(revision.versions).filter(
        (v) => whiteList.split(",").includes(v)
    );
    const history = useHistory();
    const location = useLocation();

    const versionName = getVersionPage(location.pathname)?.version!;
    const pageRoutes = revision.versions[versionName]?.page;

    const [loading, setLoading] = React.useState(true);
    const [showVersion, setShowVersion] = React.useState(false);
    const [anchorLinks, setAnchorLinks] = React.useState(
        [...document.getElementsByClassName("heading-anchor-link")]
    );

    const currentVersionItem = versionList.filter(
        (v) => getVersionPage(location.pathname)?.version === v
    )?.[0];

    // Restore the scroll position of side navigation on the left.
    React.useEffect(() => {
        const unListen = history.listen((location, action) => {
            if (action === "PUSH") {
                setTimeout(() => {
                    const $sidenav = document.querySelector("div.side-nav");

                    if ($sidenav) {
                        $sidenav.scrollTop = currentScrollTopOfSideNav;

                        window.scrollTo(0, 80);
                    }
                }, 0);
            }
        });

        return () => {
            unListen();
        };
    }, []);

    // For the link with hash fragment, scroll to the heading element with related id.
    React.useEffect(() => {
        const hash = history.location.hash;

        if (hash) {
            setTimeout(() => {
                const elem = document.querySelector(hash);
                elem && elem.scrollIntoView();
            }, 150);
        }
    }, []);

    React.useEffect(() => {
        if (loading) {
            formatPageRoutes(
                getVersionPage(location.pathname)?.version!,
                "",
                revision.versions[getVersionPage()?.version!]?.page
            );
            setLoading(false);
        }
    }, [loading]);

    // To make sure the duplicate id is transformed, get all the anchor links after page rendering.
    React.useEffect(() => {
        setTimeout(() => {
            setAnchorLinks(
                [...document.getElementsByClassName("heading-anchor-link")]
            );
        }, 200);
    }, []);

    const recordSidenavScrollingPosition = () => {
        const $sidenav = document.querySelector("div.side-nav");

        currentScrollTopOfSideNav = $sidenav ? $sidenav.scrollTop : 0;
    };

    return (
        <div className="main-container">
            <main className="main">
                <div className="left-gray-bg" />
                <div className="side-nav-container sticky-col-wrapper">
                    <div className="side-nav sticky-col-with-hidden-scrollbar">

                        {/* ----- For version selection ----- */}
                        <GroupLayoutUI title={"versions"}>
                            <IndentLayout>
                                {!!currentVersionItem && (
                                    <SiderItemRenderUI
                                        onPress={() => {
                                            setShowVersion(!showVersion);
                                            return;
                                        }}
                                        title={currentVersionItem}
                                        path={""}
                                        kind={""}
                                        href={""}
                                        onSelected={false}
                                        hasChildren={true}
                                        onOpen={showVersion}
                                    />
                                )}
                                {showVersion &&
                                versionList.map((v, idx) => {
                                    return (
                                        <SiderItemRenderUI
                                            key={idx}
                                            title={v}
                                            path={`/${v}/${revision.versions[v]?.page?.path}`}
                                            kind={revision.versions[v]?.page?.kind}
                                            href={revision.versions[v]?.page?.href}
                                            onSelected={
                                                getVersionPage(location.pathname)?.version === v
                                            }
                                            onPress={recordSidenavScrollingPosition}
                                        />
                                    );
                                })}
                            </IndentLayout>
                        </GroupLayoutUI>

                        {/* ----- 'TigerGraph Document' nav item ----- */}
                        <IndentLayout>
                            <SiderItemRenderUI
                                kind={pageRoutes?.kind}
                                href={pageRoutes?.href}
                                title={pageRoutes?.title}
                                path={`/${pageRoutes?.path}`}
                                onPress={recordSidenavScrollingPosition}
                            />
                        </IndentLayout>

                        {/* ----- Other nav items ----- */}
                        {renderSider(
                            pageRoutes?.pages,
                            false,
                            recordSidenavScrollingPosition
                        )}
                    </div>
                </div>

                <div
                    id="content"
                    className="content"
                    style={{
                        flex: 1,
                    }}
                >
                    {children}
                </div>

                <div className="table-of-content-container sticky-col-wrapper">
                    <div className="table-of-content sticky-col-with-hidden-scrollbar">
                        {anchorLinks.length !== 0 && anchorLinks.map((ele, index) => {
                            if (ele.querySelector("span")?.textContent) {
                                const level = (ele as any).dataset.level;
                                const href = `#${ele.id}`;
                                const isActive = location.hash === href;

                                switch (level) {
                                    case "one":
                                        return (
                                            <div
                                                key={index}
                                                className={
                                                    isActive
                                                        ? 'toc-item-wrapper level-1 active'
                                                        : 'toc-item-wrapper level-1'
                                                }
                                            >
                                                <a
                                                    className={ isActive ? 'toc-item active' : 'toc-item' }
                                                    href={href}
                                                >
                                                    {ele.textContent}
                                                </a>
                                            </div>
                                        );
                                    case "two":
                                        return (
                                            <div
                                                key={index}
                                                className={
                                                    isActive
                                                        ? 'toc-item-wrapper level-2 active'
                                                        : 'toc-item-wrapper level-2'
                                                }
                                            >
                                                <a
                                                    className={ isActive ? 'toc-item active' : 'toc-item' }
                                                    href={href}
                                                >
                                                    {ele.textContent}
                                                </a>
                                            </div>
                                        );
                                    default:
                                        return null;
                                }
                            }
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

const renderSider = (
    pages: Pages = [],
    isSub?: boolean,
    onClick?: () => void,
    inGroup?: boolean
) => {
    return pages.map((page, idx) => {
        const content = isSub ? (
            <SiderItem
                key={page.uid}
                page={page}
                itemStyle={{ color: "rgba(157,170,182,0.8)", marginLeft: "-1px" }}
                onClick={onClick}
            />
        ) : (
            <IndentLayout
                style={{ padding: inGroup ? "4px 0" : "4px 0 4px 16px" }}
                key={page.uid}
            >
                <SiderItem key={page.uid} page={page} onClick={onClick} />
            </IndentLayout>
        );
        if (page.kind === "group") {
            return (
                <GroupLayout page={page} key={page.uid}>
                    {renderSider(page.pages, false, onClick, true)}
                </GroupLayout>
            );
        }
        return content;
    });
};

const GroupLayout: React.FC<{ page: VersionInfo }> = ({ page, children }) => {
    return (
        <GroupLayoutUI title={page.title} style={{ marginTop: "30px" }}>
            {children}
        </GroupLayoutUI>
    );
};

const GroupLayoutUI: React.FC<{
    title: string;
    style?: React.CSSProperties;
}> = ({ title, children, style = {} }) => {
    return (
        <IndentLayout style={style}>
            <IndentLayout>
                <div
                    style={{
                        fontWeight: 500,
                        lineHeight: 1.2,
                        fontSize: "12px",
                        letterSpacing: "1.2px",
                        fontFamily: "Content-font, Roboto, sans-serif",
                        color: "rgba(157,170,182,0.8)",
                    }}
                >
                    {String(title).toLocaleUpperCase()}
                </div>
            </IndentLayout>
            {children}
        </IndentLayout>
    );
};

const SiderItem: React.FC<{
    page: VersionInfo;
    itemStyle?: React.CSSProperties;
    onClick?: () => void;
}> = ({ page, itemStyle = {}, onClick }) => {
    const location = useLocation();
    const pageInfo =
        getPageInfo(
            getVersionPage(location.pathname)?.version!,
            getVersionPage(location.pathname)?.path!,
            page
        ) || {};
    return (
        <div>
            <SiderItemRenderUI
                kind={page?.kind}
                href={page?.href}
                title={page?.title}
                path={page?.path}
                itemStyle={itemStyle}
                {...pageInfo}
                onPress={onClick}
            />
            {pageInfo?.onOpen && (
                <IndentLayout style={{ paddingTop: 0 }}>
                    <div style={{ borderLeft: "1px solid rgb(230, 236, 241)" }}>
                        {renderSider(page.pages, true, onClick)}
                    </div>
                </IndentLayout>
            )}
        </div>
    );
};

const SiderItemRenderUI: React.FC<{
    title: string;
    path: string;
    kind: string;
    href: string;
    itemStyle?: React.CSSProperties;
    hasChildren?: boolean;
    onOpen?: boolean;
    onSelected?: boolean;
    onPress?: () => void;
}> = ({
    title,
    onPress,
    path = "",
    kind,
    href,
    onSelected: _onSelected,
    hasChildren,
    onOpen,
    itemStyle = {},
}) => {
    const history = useHistory();
    const location = useLocation();

    const targetPath = () => {
        if (!path) {
            return ""
        }

        const targetPathArgs = path?.split("/");
        const length = targetPathArgs.length;

        if (
            targetPathArgs.length === 3 &&
            targetPathArgs[length - 1] === 'master'
        ) {
            // For switching document version, make '/3.0/master' --> '/3.0'
            return targetPathArgs.slice(0, 2).join('/');
        } else {
            // For normal path
            const versionName = getVersionPage(location.pathname)?.version!;
            return `/${versionName}/${path}`;
        }
    };

    const onSelect = location.pathname === targetPath();

    const onSelectStyle: React.CSSProperties =
        _onSelected || onSelect
            ? {
                border: "1px solid #E6ECF1",
                borderRight: "none",
                backgroundColor: "white",
                color: "#FC6C04",
            }
            : {};

    return (
        <OnHover
            onPress={() => {
                if (onPress) {
                    onPress();
                }

                if (kind === "link") {
                    // If it is an external link, open it in new window.
                    window.open(href);
                } else {
                    // Otherwise, go to other page in document
                    const nextPath = targetPath();
                    nextPath && history.push(nextPath);
                }
            }}
        >
            {(onHover) => {
                return (
                    <div
                        style={{
                            cursor: "pointer",
                            fontSize: "15px",
                            lineHeight: "15px",
                            fontFamily: "Content-font, Roboto, sans-serif",
                            ...itemStyle,
                            ...onSelectStyle,
                            ...(onHover && !onSelect ? { backgroundColor: "#e2e9ef" } : {}),
                        }}
                    >
                        <IndentLayout style={{ padding: "8px 0px 8px 16px" }}>
                            {hasChildren
                                ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            paddingRight: "24px",
                                        }}
                                    >
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            lineHeight: "21px",
                                        }}
                                    >
                                        {title}
                                    </span>

                                        <span className={styles.navItemIcon}>
                                        {onOpen ? (
                                            <DownOutlined />
                                        ) : (
                                            <RightOutlined />
                                        )}
                                    </span>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            lineHeight: "21px",
                                            paddingRight: "24px",
                                        }}
                                    >
                                        {title}

                                        {
                                            kind === 'link' &&
                                            <span className={styles.navItemIcon}>
                                               <ExternalIcon />
                                            </span>
                                        }
                                    </div>
                                )}
                        </IndentLayout>
                    </div>
                );
            }}
        </OnHover>
    );
};

const IndentLayout: React.FC<{ style?: React.CSSProperties }> = ({
    children,
    style = {},
}) => {
    return (
        <div style={{ padding: "4px 0px 4px 16px", ...style }}>{children}</div>
    );
};
