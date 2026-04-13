/**
 * 生成带有定位参数的预览链接
 * @param baseUrl 预览页面的基础 URL
 * @param fileId 文件标识
 * @param location 定位参数 (页码, 坐标等)
 */
export const generateLocatorLink = (
  baseUrl: string,
  fileId: string,
  location: {page: number; x1: number; y1: number; width: number; height: number}
): string => {
  const queryParts = [
    `fileId=${encodeURIComponent(fileId)}`,
    `page=${location.page}`,
    `x1=${location.x1}`,
    `y1=${location.y1}`,
    `width=${location.width}`,
    `height=${location.height}`,
  ];
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryParts.join('&')}`;
};

/**
 * 将像素坐标转换为百分比坐标 (用于适应 Web 预览)
 * @param pxValue 像素值
 * @param pageSize 页面总尺寸
 */
export const pxToPercentage = (pxValue: number, pageSize: number): number => {
  return parseFloat(((pxValue / pageSize) * 100).toFixed(2));
};
