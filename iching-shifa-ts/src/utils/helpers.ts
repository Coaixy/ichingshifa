/**
 * 通用工具函数
 */

/**
 * 循环轮转列表
 * 将列表从指定元素开始重新排列
 * @example rotateList(['a','b','c','d'], 'c') => ['c','d','a','b']
 */
export function rotateList<T>(list: T[], start: T): T[] {
  const idx = list.indexOf(start);
  if (idx === -1) return [...list];
  return [...list.slice(idx), ...list.slice(0, idx)];
}

/**
 * 循环轮转列表（按索引）
 */
export function rotateListByIndex<T>(list: T[], startIndex: number): T[] {
  const idx = startIndex % list.length;
  return [...list.slice(idx), ...list.slice(0, idx)];
}

/**
 * 多键字典查找
 * 类似 Python 的 multi_key_dict_get
 */
export function multiKeyGet<V>(
  dict: Record<string, V>,
  key: string
): V | undefined {
  // 直接查找
  if (key in dict) {
    return dict[key];
  }
  // 遍历查找（用于逗号分隔的多键）
  for (const [keys, value] of Object.entries(dict)) {
    if (keys.includes(key)) {
      return value;
    }
  }
  return undefined;
}

/**
 * 生成 60 甲子
 */
export function generateJiaZi(tianGan: string[], diZhi: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < 60; i++) {
    result.push(tianGan[i % 10] + diZhi[i % 12]);
  }
  return result;
}

/**
 * 取模（处理负数）
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
