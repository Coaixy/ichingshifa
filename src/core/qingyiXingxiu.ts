/**
 * 青衣排盘星宿、锁泊算法提取模块
 *
 * 该算法来自打包后的青衣排盘页面：星宿按宫位、宫内层级与世应位置推排，
 * 锁泊按星宿第二字与爻支直接查表。它与本库默认排盘算法保持独立。
 */

import type { YaoString } from '../types';
import { DI_ZHI } from '../data/jiazi';
import { XINGXIU_28, XINGXIU_FULL_NAMES } from '../data/xingxiu';

export type QingyiSuoBoKey = '木' | '火' | '金' | '日' | '月' | '土' | '水';

/** 单爻青衣星宿与锁泊结果 */
export interface QingyiXingXiuYao {
  /** 爻位，1 为初爻，6 为上爻 */
  position: number;
  /** 第一套星宿全称，也是青衣页面实际展示的星宿来源 */
  xingXiu: string;
  /** 第二套星宿全称，青衣算法会生成但页面未用于锁泊展示 */
  secondaryXingXiu: string;
  /** 星宿名首字，如“柳土獐”的“柳” */
  xingXiuName: string;
  /** 星宿第二字，青衣锁泊表按此字分组 */
  suoBoKey: QingyiSuoBoKey;
  /** 传入爻支时返回对应锁泊；未传爻支时为空 */
  suoBo?: string;
}

/** 青衣星宿算法的完整推排结果 */
export interface QingyiXingXiuResult {
  /** 青衣页面使用的 0/1 六爻码，1 为阳爻，0 为阴爻 */
  yaoCode: string;
  /** 所属宫，顺序来自原打包文件：坤艮坎巽震离兑乾 */
  palace: string;
  /** 所属宫索引，范围 0-7 */
  palaceIndex: number;
  /** 宫内层级索引，范围 0-7 */
  palaceLevelIndex: number;
  /** 世爻位置，1 为初爻，6 为上爻 */
  shiPosition: number;
  /** 应爻位置，1 为初爻，6 为上爻 */
  yingPosition: number;
  /** 第一套星宿，按初爻到上爻排序 */
  primaryXingXiu: string[];
  /** 第二套星宿，按初爻到上爻排序 */
  secondaryXingXiu: string[];
  /** 逐爻星宿、锁泊数据，按初爻到上爻排序 */
  yaoList: QingyiXingXiuYao[];
}

const QINGYI_PALACE_ORDER = ['坤', '艮', '坎', '巽', '震', '离', '兑', '乾'] as const;

const QINGYI_PALACE_CODE_ORDER = [
  '000000', '100000', '110000', '111000', '111100', '111110', '111010', '000010',
  '001001', '101001', '111001', '110001', '110101', '110111', '110011', '001011',
  '010010', '110010', '100010', '101010', '101110', '101100', '101000', '010000',
  '011011', '111011', '101011', '100011', '100111', '100101', '100001', '011001',
  '100100', '000100', '010100', '011100', '011000', '011010', '011110', '100110',
  '101101', '001101', '011101', '010101', '010001', '010011', '010111', '101111',
  '110110', '010110', '000110', '001110', '001010', '001000', '001100', '110100',
  '111111', '011111', '001111', '000111', '000011', '000001', '000101', '111101',
] as const;

const QINGYI_PRIMARY_START = [24, 16, 8, 4, 0, 12, 20, 20] as const;
const QINGYI_SECONDARY_START = [14, 14, 7, 0, 21, 7, 21, 0] as const;

const QINGYI_SHI_YING_BY_LEVEL = [
  [5, 2],
  [0, 3],
  [1, 4],
  [2, 5],
  [3, 0],
  [4, 1],
  [3, 0],
  [2, 5],
] as const;

const QINGYI_SUOBO_TABLE: Record<QingyiSuoBoKey, string> = {
  木: '水田园井刀天草岸风火月山',
  火: '火月山水田园井刀天草岸风',
  金: '草岸风火月山水田园井刀天',
  日: '天草岸风火月山水田园井刀',
  月: '刀天草岸风火月山水田园井',
  土: '井刀天草岸风火月山水田园',
  水: '井刀天草岸风火月山水田园',
};

const QINGYI_XINGXIU_FULL_LIST = XINGXIU_28.map(
  item => XINGXIU_FULL_NAMES[item]
);

/**
 * 按青衣锁泊表计算单爻锁泊。
 * @param diZhi 爻支，如“子”“丑”
 * @param xingXiu 星宿全称，如“柳土獐”
 * @returns 锁泊字；参数不在表中时返回空字符串
 */
export function getQingyiSuoBo(diZhi: string, xingXiu: string): string {
  if (!diZhi || !xingXiu) {
    return '';
  }

  const key = xingXiu[1] as QingyiSuoBoKey;
  const suoBoList = QINGYI_SUOBO_TABLE[key];
  const zhiIndex = (DI_ZHI as readonly string[]).indexOf(diZhi);

  if (!suoBoList || zhiIndex === -1) {
    return '';
  }

  return suoBoList[zhiIndex] || '';
}

/**
 * 提取青衣页面的星宿推排算法。
 * @param yaoString 六爻字符串，支持本库 6/7/8/9 格式，也支持青衣 0/1 格式
 * @param diZhiList 可选爻支列表，按初爻到上爻排序；传入后会同时计算锁泊
 * @returns 青衣星宿推排结果
 */
export function calculateQingyiXingXiu(
  yaoString: YaoString,
  diZhiList?: readonly string[]
): QingyiXingXiuResult {
  const yaoCode = toQingyiYaoCode(yaoString);
  const codeIndex = QINGYI_PALACE_CODE_ORDER.indexOf(yaoCode as any);

  if (codeIndex === -1) {
    throw new Error(`无法按青衣算法识别六爻码：${yaoString}`);
  }

  if (diZhiList && diZhiList.length !== 6) {
    throw new Error('爻支列表必须按初爻到上爻传入 6 项');
  }

  const palaceIndex = Math.floor(codeIndex / 8);
  const palaceLevelIndex = codeIndex % 8;
  const [shiIndex, yingIndex] = QINGYI_SHI_YING_BY_LEVEL[palaceLevelIndex];
  const primaryXingXiu = Array<string>(6).fill('');
  const secondaryXingXiu = Array<string>(6).fill('');

  let primaryIndex = (QINGYI_PRIMARY_START[palaceIndex] + palaceLevelIndex) % 28;
  let secondaryIndex = (QINGYI_SECONDARY_START[palaceIndex] + palaceLevelIndex) % 28;

  const assignXingXiu = (positionIndex: number) => {
    primaryXingXiu[positionIndex] = QINGYI_XINGXIU_FULL_LIST[primaryIndex];
    secondaryXingXiu[positionIndex] = QINGYI_XINGXIU_FULL_LIST[secondaryIndex];
    primaryIndex = (primaryIndex + 1) % 28;
    secondaryIndex = (secondaryIndex + 1) % 28;
  };

  assignXingXiu(shiIndex);
  assignXingXiu(yingIndex);

  // 原算法剩余爻位按“上半卦由上往下、下半卦由初往上”交替补齐。
  for (let i = 0; i < 3; i++) {
    fillFirstEmpty([5, 4, 3], primaryXingXiu, assignXingXiu);
    fillFirstEmpty([0, 1, 2], primaryXingXiu, assignXingXiu);
  }

  const yaoList = primaryXingXiu.map((xingXiu, index) => {
    const suoBoKey = xingXiu[1] as QingyiSuoBoKey;
    return {
      position: index + 1,
      xingXiu,
      secondaryXingXiu: secondaryXingXiu[index],
      xingXiuName: xingXiu[0],
      suoBoKey,
      suoBo: diZhiList ? getQingyiSuoBo(diZhiList[index], xingXiu) : undefined,
    };
  });

  return {
    yaoCode,
    palace: QINGYI_PALACE_ORDER[palaceIndex],
    palaceIndex,
    palaceLevelIndex,
    shiPosition: shiIndex + 1,
    yingPosition: yingIndex + 1,
    primaryXingXiu,
    secondaryXingXiu,
    yaoList,
  };
}

function toQingyiYaoCode(yaoString: YaoString): string {
  if (/^[01]{6}$/.test(yaoString)) {
    return yaoString;
  }

  if (!/^[6789]{6}$/.test(yaoString)) {
    throw new Error(`无效六爻字符串：${yaoString}`);
  }

  return yaoString
    .split('')
    .map(item => (item === '7' || item === '9' ? '1' : '0'))
    .join('');
}

function fillFirstEmpty(
  positionIndexes: readonly number[],
  target: readonly string[],
  assignXingXiu: (positionIndex: number) => void
): void {
  const positionIndex = positionIndexes.find(item => target[item] === '');
  if (positionIndex !== undefined) {
    assignXingXiu(positionIndex);
  }
}
