export function findPage(v: string, versionName: string, k?: keyof VersionInfo): VersionInfo | undefined {
    if (!reversion) {
        return undefined;
    }
    const pageRoutes = reversion.versions[versionName]?.page;
    const key = k! || "uid"
    if (!v) {
        return undefined
    }
    if (pageRoutes?.[key] === v) {
        return pageRoutes
    } else {
        return mapPageInfo(pageRoutes, v, k)
    }
}

function mapPageInfo(page: VersionInfo, v: string, k?: keyof VersionInfo): VersionInfo | undefined {
    const key = k! || "uid"
    if (!page) {
        return undefined
    }

    const targetPage = page.pages.find(p => p[key] === v)
    if (!!targetPage) {
        return targetPage
    }

    for (let i = 0; i < page.pages.length; i++) {
        if (!!page.pages?.length && mapPageInfo(page.pages[i], v, k)) {
            return mapPageInfo(page.pages[i], v, k)
        }
    }
}