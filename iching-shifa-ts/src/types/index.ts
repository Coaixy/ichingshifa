/**
 * 周易六爻筮法类型定义
 */

/** 爻值：6=老阴(动), 7=少阳(静), 8=少阴(静), 9=老阳(动) */
export type YaoValue = 6 | 7 | 8 | 9;

/** 6爻字符串，从初爻到上爻，如 "778879" */
export type YaoString = string;

/** 八卦名称 */
export type BaguaName = '乾' | '坎' | '坤' | '離' | '震' | '艮' | '巽' | '兌';

/** 五行 */
export type WuXing = '金' | '木' | '水' | '火' | '土';

/** 六亲 */
export type LiuQin = '父母' | '兄弟' | '官鬼' | '妻财' | '子孙';

/** 六兽 */
export type LiuShou = '青龙' | '朱雀' | '勾陈' | '腾蛇' | '白虎' | '玄武';

/** 世应标记 */
export type ShiYingMark = '初' | '二' | '三' | '四' | '五' | '六' | '世' | '應';

/** 五行生克关系 */
export type WuXingRelation = '生我' | '我生' | '尅我' | '我尅' | '比和';

/** 干支对象 */
export interface GanZhi {
  tian: string;  // 天干
  di: string;    // 地支
  gz: string;    // 合并字符串
}

/** 单爻完整数据 */
export interface YaoData {
  position: number;         // 爻位 1-6（初爻到上爻）
  yaoValue: YaoValue;       // 原始爻值 6/7/8/9
  isMoving: boolean;        // 是否动爻
  tianGan: string;          // 天干
  diZhi: string;            // 地支
  naJia: string;            // 纳甲（天干+地支）
  wuXing: WuXing;           // 五行
  liuQin: LiuQin;           // 六亲
  liuShou: LiuShou;         // 六兽
  shiYing: ShiYingMark;     // 世应标记
  xingXiu?: string;         // 二十八宿
}

/** 伏神数据 */
export interface FuShenData {
  fuLiuQin: LiuQin;          // 伏神六亲
  fuNaJia: string;           // 伏神纳甲
  fuWuXing: WuXing;          // 伏神五行
  hostYaoIndex: number;      // 飞神（宿主）爻位
  hostNaJia: string;         // 飞神纳甲
  feiWuXing: WuXing;         // 飞神五行
  relation: WuXingRelation;  // 飞伏关系
}

/** 单卦排盘结果 */
export interface GuaPan {
  guaName: string;           // 卦名
  palace: string;            // 所属宫
  palaceWuXing: WuXing;      // 宫五行
  palaceLevel: string;       // 宫内层次
  wuXingStar: string;        // 五星
  yaoList: YaoData[];        // 6爻数据
  guaCi: string;             // 卦辞
  yaoCi: string[];           // 爻辞
  tuanCi: string;            // 彖辞
  shenYao?: number;          // 身爻位置
  fuShen?: FuShenData[];     // 伏神
}

/** 起卦选项 */
export interface DivinationOptions {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
}

/** 完整排盘结果 */
export interface PanResult {
  // 起卦时间信息
  queryTime: DivinationOptions;
  ganZhiYear: GanZhi;
  ganZhiMonth: GanZhi;
  ganZhiDay: GanZhi;
  ganZhiHour: GanZhi;
  lunarDate: { year: number; month: number; day: number; isLeap: boolean };
  solarTerm: string;

  // 旬空
  dayKong: string;
  hourKong: string;

  // 月建
  monthJian: string;

  // 三卦
  benGua: GuaPan;            // 本卦
  zhiGua: GuaPan;            // 之卦（变卦）
  huGua: GuaPan;             // 互卦

  // 原始6爻字符串
  yaoString: YaoString;

  // 动爻解释
  dongYaoCount: number;
  explanation: string;
}
