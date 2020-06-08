export function renderFileSize(filesize: number) {
    if (typeof filesize !== 'number' && !filesize) {
        return "0 Bytes";
    }
    const unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
    let index = 0;
    const srcsize = parseFloat(filesize.toString());
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    let size = srcsize / Math.pow(1024, index);
    size = Number(size.toFixed(2));//保留的小数位数
    return size + unitArr[index];
}