export const arraySwap = <T>(arr: Array<T>, idx1: number, idx2: number): void => {
  const temp: T = arr[idx1];
  arr[idx1] = arr[idx2];
  arr[idx2] = temp;
}

export const getHashUrlParams = (paramName: string) => {
  // eslint-disable-next-line
  const searchStartIdx = location.hash.indexOf('?');
  const reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)", "i"); //定义正则表达式
  // eslint-disable-next-line
  const query = location.hash.substring(searchStartIdx + 1).match(reg);
  if (query != null) return unescape(query[2]);

  return null;
}