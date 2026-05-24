/**
 * 五行工具函数
 */

import type { WuXing, WuXingRelation } from '../types';

/** 干支五行映射 */
const GAN_ZHI_WUXING: Record<string, WuXing> = {
  // 天干
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  // 地支
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
  // 八卦
  '乾': '金', '兌': '金',
  '離': '火',
  '震': '木', '巽': '木',
  '坎': '水',
  '艮': '土', '坤': '土',
};

/** 五行相生 */
const SHENG: Record<WuXing, WuXing> = {
  '木': '火',  // 木生火
  '火': '土',  // 火生土
  '土': '金',  // 土生金
  '金': '水',  // 金生水
  '水': '木',  // 水生木
};

/** 五行相克 */
const KE: Record<WuXing, WuXing> = {
  '木': '土',  // 木克土
  '土': '水',  // 土克水
  '水': '火',  // 水克火
  '火': '金',  // 火克金
  '金': '木',  // 金克木
};

/**
 * 获取干支的五行
 */
export function ganZhiToWuXing(ganOrZhi: string): WuXing {
  const wx = GAN_ZHI_WUXING[ganOrZhi];
  if (!wx) {
    throw new Error(`未知的干支或卦名: ${ganOrZhi}`);
  }
  return wx;
}

/**
 * 获取五行生克关系（从宫的视角）
 * @param yaoWx 爻的五行
 * @param gongWx 宫的五行
 * @returns 关系描述（从宫的视角）
 */
export function getWuXingRelation(yaoWx: WuXing, gongWx: WuXing): WuXingRelation {
  if (yaoWx === gongWx) return '比和';
  // 爻生宫 = 有人生我 = 生我 = 父母
  if (SHENG[yaoWx] === gongWx) return '生我';
  // 宫生爻 = 我生他 = 我生 = 子孙
  if (SHENG[gongWx] === yaoWx) return '我生';
  // 爻克宫 = 有人克我 = 尅我 = 官鬼
  if (KE[yaoWx] === gongWx) return '尅我';
  // 宫克爻 = 我克他 = 我尅 = 妻财
  if (KE[gongWx] === yaoWx) return '我尅';
  return '比和'; // 不应该到这里
}

/**
 * 根据五行关系确定六亲
 * @param yaoWuXing 爻的五行
 * @param gongWuXing 宫的五行
 */
export function wuXingToLiuQin(yaoWuXing: WuXing, gongWuXing: WuXing): string {
  const relation = getWuXingRelation(yaoWuXing, gongWuXing);
  switch (relation) {
    case '比和': return '兄弟';
    case '生我': return '父母';
    case '我生': return '子孙';
    case '尅我': return '官鬼';
    case '我尅': return '妻财';
    default: return '兄弟';
  }
}

/**
 * 获取五行索引
 */
export function getWuXingIndex(wx: WuXing): number {
  const order: WuXing[] = ['金', '木', '水', '火', '土'];
  return order.indexOf(wx);
}
