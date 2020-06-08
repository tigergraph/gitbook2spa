export const checkBlockType = (type: string = "") => {
    if (type?.startsWith("heading-")) {
        return 'heading'
    }
    if (type?.startsWith("list-")) {
        return 'list'
    }
    if (type?.startsWith("code")) {
        return 'code'
    }
    if (type?.startsWith("blockquote")) {
        return 'blockquote'
    }
    if (type?.startsWith("image")) {
        return 'image'
    }
    if (type?.startsWith("table")) {
        return 'table'
    }
    if (type?.startsWith("hint")) {
        return 'hint'
    }
    if (type?.startsWith("page")) {
        return 'page'
    }
    if (type?.startsWith("api-method")) {
        return 'api-method'
    }
    if (type?.startsWith("tabs")) {
        return 'tabs'
    }
    if (type?.startsWith("math")) {
        return 'math'
    }
    if (type?.startsWith("file")) {
        return 'file'
    }
    return null
}