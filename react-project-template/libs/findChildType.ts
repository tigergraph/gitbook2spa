export const findChildType = (_child: any, target: string): boolean => {
    let child = _child
    if (!child) {
        return false
    }

    if (Array.isArray(child)) {
        child = child?.[0]
    }

    if (child?.props?.type === target) {
        return true
    }

    return findChildType(child?.props?.children, target)
}