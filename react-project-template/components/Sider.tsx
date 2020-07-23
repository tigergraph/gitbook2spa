import * as React from "react";
import { OnHover } from "@libs/OnHover.tsx";
import { RightOutlined, DownOutlined } from "@ant-design/icons";
import { useHistory, useLocation } from "react-router-dom";

let currentScrollTopOfSideNav = 0;

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
    const anchorLinks = React.useRef<HTMLCollectionOf<Element>>(
        document.getElementsByClassName("heading-anchor-link")
    );
    const [loading, setLoading] = React.useState(true);
    const [showVersion, setShowVersion] = React.useState(false);

    const currentVersionItem = versionList.filter(
        (v) => getVersionPage(location.pathname)?.version === v
    )?.[0];

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
                        {Array.from(anchorLinks.current).map((ele) => {
                            if (ele.querySelector("span")?.textContent) {
                                const level = (ele as any).dataset.level;
                                const pattern = /\s+|[.,:]/g;
                                const href = `#${(ele.textContent || "")
                                    .toLowerCase()
                                    .replace(pattern, "_")}`;
                                const onSelect = location.hash === href;
                                switch (level) {
                                    case "one":
                                        return (
                                            <OnHover>
                                                {(isEnter: boolean) => {
                                                    return (
                                                        <div
                                                            style={{
                                                                lineHeight: "15px",
                                                                marginBottom: "8px",
                                                                padding: onSelect
                                                                    ? "4px 16px 4px 22px"
                                                                    : "4px 16px 4px 24px",
                                                                borderLeft: onSelect
                                                                    ? "2px solid rgb(252, 108, 4)"
                                                                    : "none",
                                                                overflow: "hidden",
                                                                whiteSpace: "nowrap",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                        >
                                                            <a
                                                                href={href}
                                                                style={{
                                                                    color:
                                                                        isEnter || onSelect
                                                                            ? "rgb(252, 108, 4)"
                                                                            : "rgb(116, 129, 141)",
                                                                    textDecoration: "none",
                                                                    fontSize: "12px",
                                                                    fontWeight: 500,
                                                                    lineHeight: "21px",
                                                                }}
                                                            >
                                                                {ele.textContent}
                                                            </a>
                                                        </div>
                                                    );
                                                }}
                                            </OnHover>
                                        );
                                    case "two":
                                        return (
                                            <OnHover>
                                                {(isEnter: boolean) => {
                                                    return (
                                                        <div
                                                            style={{
                                                                lineHeight: "15px",
                                                                marginBottom: "8px",
                                                                padding: onSelect
                                                                    ? "4px 16px 4px 38px"
                                                                    : "4px 16px 4px 40px",
                                                                borderLeft: onSelect
                                                                    ? "2px solid rgb(252, 108, 4)"
                                                                    : "none",
                                                                overflow: "hidden",
                                                                whiteSpace: "nowrap",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                        >
                                                            <a
                                                                href={href}
                                                                style={{
                                                                    color:
                                                                        isEnter || onSelect
                                                                            ? "rgb(252, 108, 4)"
                                                                            : "rgb(116, 129, 141)",
                                                                    textDecoration: "none",
                                                                    fontSize: "12px",
                                                                    fontWeight: 500,
                                                                    lineHeight: "18px",
                                                                }}
                                                            >
                                                                {ele.textContent}
                                                            </a>
                                                        </div>
                                                    );
                                                }}
                                            </OnHover>
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
                    window.open(href);
                }

                const nextPath = targetPath();
                !!nextPath && history.push(nextPath);
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
                                    {onOpen ? (
                                        <DownOutlined style={{ color: "rgba(157,170,182,0.8)" }} />
                                    ) : (
                                        <RightOutlined style={{ color: "rgba(157,170,182,0.8)" }} />
                                    )}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        lineHeight: "21px",
                                        paddingRight: "24px",
                                    }}
                                >
                                    {title}
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
