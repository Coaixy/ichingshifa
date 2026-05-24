/**
 * 纳甲排盘解码模块
 */

import type {
  YaoString, YaoValue, YaoData, GuaPan, PanResult,
  DivinationOptions, WuXing, LiuQin, LiuShou, FuShenData
} from '../types';
import { TIAN_GAN, DI_ZHI, WU_XING } from '../data/jiazi';
import { CODE_TO_BAGUA, YAO_STRING_TO_GUA } from '../data/gua64';
import { BAGUA_LIST, NAJIA_LOWER, NAJIA_UPPER } from '../data/najia';
import {
  GUA_PALACE, GUA_PALACE_LEVEL, PALACE_WUXING,
  PALACE_PURE_CODE, SHIYING_PATTERN, SHEN_YAO
} from '../data/palace';
import { GUA_DESCRIPTIONS } from '../data/descriptions';
import { LIU_SHOU, LIUSHOU_START } from '../data/liushou';
import { LIUQIN_WUXING } from '../data/liuqin';
import { WU_XING_STARS, XINGXIU_28 } from '../data/xingxiu';
import { getNaYin } from '../data/nayin';
import { ganZhiToWuXing, wuXingToLiuQin } from '../utils/wuxing';
import { rotateList } from '../utils/helpers';
import { getZhiGua, getHuGua, countMovingYao, getMovingYaoPositions } from './divination';
import { solarToLunar, calcXunKong, getCurrentSolarTerm } from './lunar';
import { buildShenShaMap } from './shensha';

const OPPOSITE_PALACE: Record<string, string> = {
  '乾': '坤',
  '坤': '乾',
  '坎': '离',
  '离': '坎',
  '震': '巽',
  '巽': '震',
  '艮': '兑',
  '兑': '艮',
};

/**
 * 查找卦名
 */
export function getGuaName(yaoString: YaoString): string {
  // 先尝试直接查找
  if (YAO_STRING_TO_GUA[yaoString]) {
    return YAO_STRING_TO_GUA[yaoString];
  }

  // 标准化为静爻后查找
  const staticYao = yaoString
    .replace(/9/g, '7')
    .replace(/6/g, '8');

  if (YAO_STRING_TO_GUA[staticYao]) {
    return YAO_STRING_TO_GUA[staticYao];
  }

  // 通过上下卦查找
  const lower = staticYao.slice(0, 3);
  const upper = staticYao.slice(3, 6);

  const lowerGua = CODE_TO_BAGUA[lower];
  const upperGua = CODE_TO_BAGUA[upper];

  if (lowerGua && upperGua) {
    // 通过上下卦组合查找64卦名
    // 这需要一个上下卦→64卦的映射表
    return findGuaByTrigrams(lowerGua, upperGua) || `${lowerGua}${upperGua}`;
  }

  return '未知';
}

/**
 * 通过上下卦查找64卦名
 */
function findGuaByTrigrams(lower: string, upper: string): string | undefined {
  // 尝试所有可能的6爻组合
  const lowerCodes: Record<string, string> = {
    '乾': '777', '兑': '778', '离': '787', '震': '788',
    '巽': '877', '坎': '878', '艮': '887', '坤': '888',
  };

  const lowerCode = lowerCodes[lower];
  const upperCode = lowerCodes[upper];

  if (lowerCode && upperCode) {
    const fullCode = lowerCode + upperCode;
    return YAO_STRING_TO_GUA[fullCode];
  }

  return undefined;
}

/**
 * 获取六兽列表（根据日天干）
 */
function getLiuShou(dayGan: string): LiuShou[] {
  const shouList = [...LIU_SHOU] as LiuShou[];
  const startShou = (LIUSHOU_START as any)[dayGan] as LiuShou;
  if (!startShou) {
    return shouList;
  }
  return rotateList(shouList, startShou);
}

/**
 * 解码单个卦的纳甲
 */
export function decodeGua(
  yaoString: YaoString,
  dayGanZhi: string,
  isZhiGua: boolean = false,
  includeNaYin: boolean = true
): GuaPan {
  const guaName = getGuaName(yaoString);
  const palace = GUA_PALACE[guaName] || '乾';
  const palaceLevel = GUA_PALACE_LEVEL[guaName] || '本宫';
  const palaceWuXing = (PALACE_WUXING[palace] || '金') as WuXing;

  // 获取纳甲数据
  const staticYao = yaoString.replace(/9/g, '7').replace(/6/g, '8');
  const lowerTrigram = CODE_TO_BAGUA[staticYao.slice(0, 3)] || '乾';
  const upperTrigram = CODE_TO_BAGUA[staticYao.slice(3, 6)] || '乾';

  const lowerNajiaRaw = (NAJIA_LOWER as any)[lowerTrigram] || [];
  const upperNajiaRaw = (NAJIA_UPPER as any)[upperTrigram] || [];

  // 解析纳甲数据（格式可能是 "0,0,2" 字符串或 [0,0,2] 数组）
  const parseNajia = (item: string | number[]): [number, number, number] => {
    if (typeof item === 'string') {
      const parts = item.split(',').map(Number);
      return [parts[0], parts[1], parts[2]];
    }
    return item as [number, number, number];
  };

  const lowerNajia = lowerNajiaRaw.map(parseNajia);
  const upperNajia = upperNajiaRaw.map(parseNajia);

  // 获取世应排法
  const shiYingStr = SHIYING_PATTERN[palaceLevel] || '初二应四五世';

  // 获取六兽
  const liuShouList = getLiuShou(dayGanZhi[0]);

  // 构建6爻数据
  const yaoList: YaoData[] = [];
  let shenYaoIndex: number | undefined;

  for (let i = 0; i < 6; i++) {
    const yaoValue = parseInt(yaoString[i], 10) as YaoValue;
    const isMoving = yaoValue === 6 || yaoValue === 9;

    // 获取纳甲
    let najiaData: [number, number, number];
    if (i < 3) {
      najiaData = lowerNajia[i] || [0, 0, 0];
    } else {
      najiaData = upperNajia[i - 3] || [0, 0, 0];
    }

    const tianGan = TIAN_GAN[najiaData[0]] || '甲';
    const diZhi = DI_ZHI[najiaData[1]] || '子';
    const wuXing = (WU_XING[najiaData[2]] || '金') as WuXing;
    const naJia = tianGan + diZhi;

    // 六亲
    const liuQin = wuXingToLiuQin(wuXing, palaceWuXing) as LiuQin;

    // 六兽
    const liuShou = liuShouList[i];

    // 世应标记
    const shiYing = shiYingStr[i] as any;

    // 身爻判断
    if (shiYing === '世') {
      const shenYaoZhi = SHEN_YAO[diZhi];
      if (shenYaoZhi !== undefined) {
        shenYaoIndex = shenYaoZhi;
      }
    }

    const yaoData: YaoData = {
      position: i + 1,
      yaoValue,
      isMoving,
      tianGan,
      diZhi,
      naJia,
      wuXing,
      liuQin,
      liuShou,
      shiYing,
    };

    // 纳音目前只挂在本卦、之卦；互卦不加，避免 JSON 误读为主要排盘信息
    if (includeNaYin) {
      yaoData.naYin = getNaYin(naJia);
    }

    yaoList.push(yaoData);
  }

  // 获取卦辞爻辞
  const desc = GUA_DESCRIPTIONS[guaName] || {};
  const guaCi = (desc as any)[0] || '';
  const yaoCi: string[] = [];
  for (let i = 1; i <= 6; i++) {
    yaoCi.push((desc as any)[i] || '');
  }
  const tuanCi = (desc as any)[7] || '';

  // 五星
  const wuXingStarIndex = Math.floor(Math.random() * 5); // 简化处理
  const wuXingStar = WU_XING_STARS[wuXingStarIndex] || '镇星';

  // 查找伏神（本卦才需要）
  let fuShen: FuShenData[] | undefined;
  let pangFuShen: FuShenData[] | undefined;
  if (!isZhiGua) {
    fuShen = findFuShen(yaoList, palace, palaceWuXing);
    pangFuShen = findPangFuShen(yaoList, palace);
  }

  return {
    guaName,
    palace,
    palaceWuXing,
    palaceLevel,
    wuXingStar,
    yaoList,
    guaCi,
    yaoCi,
    tuanCi,
    shenYao: shenYaoIndex,
    fuShen,
    pangFuShen,
  };
}

/**
 * 排伏神
 * 以本卦所属宫的本宫纯卦逐爻排入伏神，不再只补缺失的六亲
 */
function findFuShen(
  yaoList: YaoData[],
  palace: string,
  palaceWuXing: WuXing
): FuShenData[] {
  return buildFuShenFromPalace(yaoList, palace, palaceWuXing);
}

/**
 * 排旁伏神
 * 以首宫卦的对宫纯卦作为伏神来源，保留本卦同位爻作飞神
 */
function findPangFuShen(
  yaoList: YaoData[],
  palace: string
): FuShenData[] {
  const oppositePalace = OPPOSITE_PALACE[palace] || '坤';
  const oppositeWuXing = (PALACE_WUXING[oppositePalace] || '土') as WuXing;

  return buildFuShenFromPalace(yaoList, oppositePalace, oppositeWuXing);
}

/**
 * 依指定宫的纯卦生成伏神底盘
 */
function buildFuShenFromPalace(
  yaoList: YaoData[],
  sourcePalace: string,
  sourcePalaceWuXing: WuXing
): FuShenData[] {
  // 取得来源宫纯卦纳甲，纯卦六爻即为伏神来源
  const pureCode = PALACE_PURE_CODE[sourcePalace] || '777777';
  const pureLowerTrigram = CODE_TO_BAGUA[pureCode.slice(0, 3)] || '乾';
  const pureUpperTrigram = CODE_TO_BAGUA[pureCode.slice(3, 6)] || '乾';

  const pureLowerNajiaRaw = (NAJIA_LOWER as any)[pureLowerTrigram] || [];
  const pureUpperNajiaRaw = (NAJIA_UPPER as any)[pureUpperTrigram] || [];

  // 解析纳甲数据
  const parseNajia = (item: string | number[]): [number, number, number] => {
    if (typeof item === 'string') {
      const parts = item.split(',').map(Number);
      return [parts[0], parts[1], parts[2]];
    }
    return item as [number, number, number];
  };

  const pureLowerNajia = pureLowerNajiaRaw.map(parseNajia);
  const pureUpperNajia = pureUpperNajiaRaw.map(parseNajia);

  const fuShenList: FuShenData[] = [];

  // 逐爻排入伏神；飞神固定取本卦同一位置的爻
  for (let i = 0; i < 6; i++) {
    let najiaData: [number, number, number];
    if (i < 3) {
      najiaData = pureLowerNajia[i] || [0, 0, 0];
    } else {
      najiaData = pureUpperNajia[i - 3] || [0, 0, 0];
    }

    const tianGan = TIAN_GAN[najiaData[0]] || '甲';
    const diZhi = DI_ZHI[najiaData[1]] || '子';
    const wuXing = (WU_XING[najiaData[2]] || '金') as WuXing;
    const naJia = tianGan + diZhi;

    const liuQin = wuXingToLiuQin(wuXing, sourcePalaceWuXing) as LiuQin;
    const hostYao = yaoList[i];

    fuShenList.push({
      fuLiuQin: liuQin,
      fuNaJia: naJia,
      fuNaYin: getNaYin(naJia),
      fuWuXing: wuXing,
      hostPosition: hostYao.position,
    });
  }

  return fuShenList;
}

/**
 * 生成动爻解释
 */
function buildExplanation(
  yaoString: YaoString,
  benGuaName: string,
  zhiGuaName: string,
  benGuaCi: string,
  zhiGuaCi: string,
  yaoCi: string[]
): string {
  const dongCount = countMovingYao(yaoString);
  const dongPositions = getMovingYaoPositions(yaoString);

  // 按朱熹《易学启蒙》的变爻断法
  if (dongCount === 0) {
    return `无动爻，占本卦【${benGuaName}】彖辞。`;
  }

  if (dongCount === 1) {
    const pos = dongPositions[0];
    const posNames = ['初', '二', '三', '四', '五', '上'];
    const yaoName = posNames[pos - 1];
    const yaoType = yaoString[pos - 1] === '9' ? '九' : '六';
    return `动爻一根，主看【${yaoName}${yaoType}】：${yaoCi[pos - 1]}`;
  }

  if (dongCount === 2) {
    return `动爻二根，以本卦二变爻辞占，以上爻为主。`;
  }

  if (dongCount === 3) {
    return `动爻三根，占本卦【${benGuaName}】及之卦【${zhiGuaName}】彖辞。`;
  }

  if (dongCount === 4) {
    return `动爻四根，以之卦【${zhiGuaName}】二不变爻占，以下爻为主。`;
  }

  if (dongCount === 5) {
    return `动爻五根，以之卦【${zhiGuaName}】唯一不变爻占。`;
  }

  if (dongCount === 6) {
    if (benGuaName === '乾' || benGuaName === '坤') {
      return `六爻皆动，乾坤占用爻。`;
    }
    return `六爻皆动，占之卦【${zhiGuaName}】彖辞。`;
  }

  return '';
}

/**
 * 完整排盘
 */
export function decodePan(
  yaoString: YaoString,
  options: DivinationOptions
): PanResult {
  const { year, month, day, hour, minute = 0 } = options;

  // 获取农历和干支
  const lunar = solarToLunar(year, month, day, hour);

  // 计算旬空
  const dayKong = calcXunKong(lunar.dayGanZhi.gz);
  const hourKong = calcXunKong(lunar.hourGanZhi.gz);

  // 获取节气
  const solarTerm = getCurrentSolarTerm(year, month, day);

  // 月建
  const monthJian = lunar.monthGanZhi.gz;

  // 解码三卦
  const dayGZ = lunar.dayGanZhi.gz;
  const benGua = decodeGua(yaoString, dayGZ, false);

  const zhiYaoString = getZhiGua(yaoString);
  const zhiGua = decodeGua(zhiYaoString, dayGZ, true);

  const huYaoString = getHuGua(yaoString);
  const huGua = decodeGua(huYaoString, dayGZ, true, false);

  const shenSha = buildShenShaMap(
    lunar.dayGanZhi.tian,
    lunar.dayGanZhi.di,
    lunar.monthGanZhi.di
  );

  // 动爻解释
  const dongYaoCount = countMovingYao(yaoString);
  const explanation = buildExplanation(
    yaoString,
    benGua.guaName,
    zhiGua.guaName,
    benGua.guaCi,
    zhiGua.guaCi,
    benGua.yaoCi
  );

  return {
    queryTime: options,
    ganZhiYear: lunar.yearGanZhi,
    ganZhiMonth: lunar.monthGanZhi,
    ganZhiDay: lunar.dayGanZhi,
    ganZhiHour: lunar.hourGanZhi,
    lunarDate: {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      isLeap: lunar.isLeap,
    },
    solarTerm,
    dayKong,
    hourKong,
    monthJian,
    shenSha,
    benGua,
    zhiGua,
    huGua,
    yaoString,
    dongYaoCount,
    explanation,
  };
}
