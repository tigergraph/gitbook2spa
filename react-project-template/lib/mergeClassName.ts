export const mergeClassName = (classNames: Array<string | undefined>) => {
    return classNames.filter(c => !!c).join(' ')
}