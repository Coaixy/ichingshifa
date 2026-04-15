/**
 * iching-shifa - 周易六爻筮法 TypeScript 库
 *
 * @example
 * ```typescript
 * import { dayan, decodePan } from 'iching-shifa';
 *
 * // 大衍筮法起卦
 * const yao = dayan();
 *
 * // 完整排盘
 * const result = decodePan(yao, {
 *   year: 2024, month: 11, day: 15, hour: 14
 * });
 *
 * console.log(result.benGua.guaName);  // 卦名
 * ```
 */

// 起卦方法
export {
  dayan,
  timeQiGua,
  manualQiGua,
  getZhiGua,
  getHuGua,
  isMovingYao,
  countMovingYao,
  getMovingYaoPositions,
} from './core/divination';

// 排盘方法
export {
  decodeGua,
  decodePan,
  getGuaName,
} from './core/decode';

// 农历/干支
export {
  solarToLunar,
  getHourGanZhi,
  calcXunKong,
  getCurrentSolarTerm,
} from './core/lunar';

// 五行工具
export {
  ganZhiToWuXing,
  getWuXingRelation,
  wuXingToLiuQin,
} from './utils/wuxing';

// 辅助工具
export {
  rotateList,
  rotateListByIndex,
} from './utils/helpers';

// 数据常量（按需导出）
export { TIAN_GAN, DI_ZHI, WU_XING, JIAZI_60 } from './data/jiazi';
export { GUA64_ORDER, BAGUA_XIANG } from './data/gua64';
export { LIU_SHOU } from './data/liushou';
export { LIU_QIN } from './data/liuqin';
export { XINGXIU_28, WU_XING_STARS } from './data/xingxiu';
export { JIEQI_NAMES } from './data/solarTerms';
export { GUA_DESCRIPTIONS } from './data/descriptions';

// 类型导出
export type {
  YaoValue,
  YaoString,
  BaguaName,
  WuXing,
  LiuQin,
  LiuShou,
  ShiYingMark,
  WuXingRelation,
  GanZhi,
  YaoData,
  FuShenData,
  GuaPan,
  DivinationOptions,
  PanResult,
} from './types';
