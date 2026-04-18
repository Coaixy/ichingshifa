/**
 * 起卦核心模块
 * 实现大衍筮法、时间起卦、手动起卦
 */

import type { YaoString, YaoValue } from '../types';
import { DI_ZHI } from '../data/jiazi';

/**
 * 大衍筮法 - 模拟蓍草起卦
 * 返回6位爻字符串（6/7/8/9）
 */
export function dayan(): YaoString {
  const yaoValues: YaoValue[] = [];

  // 6爻，从初爻到上爻
  for (let yao = 0; yao < 6; yao++) {
    const value = dayanOneYao();
    yaoValues.push(value);
  }

  return yaoValues.join('');
}

/**
 * 大衍筮法 - 计算单爻
 * 三变得一爻
 */
function dayanOneYao(): YaoValue {
  let stalks = 49; // 大衍之数五十，其用四十有九

  // 一变
  const bian1 = dayanOneBian(stalks);
  stalks -= bian1;

  // 二变
  const bian2 = dayanOneBian(stalks);
  stalks -= bian2;

  // 三变
  const bian3 = dayanOneBian(stalks);
  stalks -= bian3;

  // 计算爻值
  const yaoValue = stalks / 4;

  // 6=老阴, 7=少阳, 8=少阴, 9=老阳
  if (yaoValue === 6 || yaoValue === 7 || yaoValue === 8 || yaoValue === 9) {
    return yaoValue as YaoValue;
  }

  // 理论上不会到这里，但作为保底
  return 7;
}

/**
 * 大衍筮法 - 一变
 */
function dayanOneBian(stalks: number): number {
  // 分二：随机分为左右两堆
  const leftMin = Math.max(1, Math.floor(stalks * 0.3));
  const leftMax = Math.min(stalks - 1, Math.floor(stalks * 0.7));
  const left = leftMin + Math.floor(Math.random() * (leftMax - leftMin + 1));
  let right = stalks - left;

  // 挂一：从右堆取出一根
  const guayi = 1;
  right -= guayi;

  // 揲四：左右各数四取余
  let leftRemainder = left % 4;
  if (leftRemainder === 0) leftRemainder = 4;

  let rightRemainder = right % 4;
  if (rightRemainder === 0) rightRemainder = 4;

  // 归奇：一变的结果
  return leftRemainder + rightRemainder + guayi;
}

/**
 * 时间起卦
 * 根据年月日时计算卦象
 */
export function timeQiGua(
  year: number,
  month: number,
  day: number,
  hour: number,
  lunarMonth: number,
  lunarDay: number,
  yearZhi: string,
  hourZhi: string
): YaoString {
  // 年支数值 (子=1, 丑=2, ...)
  const diZhiArr = [...DI_ZHI];
  const yzCode = diZhiArr.indexOf(yearZhi) + 1;
  const hzCode = diZhiArr.indexOf(hourZhi) + 1;

  // 农历月日
  const cm = lunarMonth;
  const cd = lunarDay;

  // 上卦 = (年支 + 月 + 日 + 时支) % 8
  let upperNum = (yzCode + cm + cd + hzCode) % 8;
  if (upperNum === 0) upperNum = 8;

  // 下卦 = (年支 + 月 + 日) % 8
  let lowerNum = (yzCode + cm + cd) % 8;
  if (lowerNum === 0) lowerNum = 8;

  // 动爻 = (年支 + 月 + 日 + 时支) % 6
  let dongYao = (yzCode + cm + cd + hzCode) % 6;
  if (dongYao === 0) dongYao = 6;

  // 数字转三爻（1=乾777, 2=兑778, 3=离787, 4=震788, 5=巽877, 6=坎878, 7=艮887, 8=坤888）
  const numToTrigram: Record<number, string> = {
    1: '777', 2: '778', 3: '787', 4: '788',
    5: '877', 6: '878', 7: '887', 8: '888',
  };

  const lowerTrigram = numToTrigram[lowerNum];
  const upperTrigram = numToTrigram[upperNum];

  // 组合6爻（下卦在前，上卦在后）
  const yaoArray = (lowerTrigram + upperTrigram).split('').map(c => parseInt(c, 10));

  // 设置动爻（将静爻变为动爻）
  const dongIndex = dongYao - 1; // 0-5
  if (yaoArray[dongIndex] === 7) {
    yaoArray[dongIndex] = 9; // 少阳变老阳
  } else if (yaoArray[dongIndex] === 8) {
    yaoArray[dongIndex] = 6; // 少阴变老阴
  }

  return yaoArray.join('');
}

/**
 * 手动输入起卦
 * 校验并归一化6位爻值
 */
export function manualQiGua(input: string): YaoString {
  // 移除空格
  const cleaned = input.replace(/\s/g, '');

  if (cleaned.length !== 6) {
    throw new Error(`爻值字符串长度必须为6，当前长度: ${cleaned.length}`);
  }

  // 校验每位必须是 6/7/8/9
  for (const char of cleaned) {
    if (!['6', '7', '8', '9'].includes(char)) {
      throw new Error(`无效的爻值: ${char}，必须是 6/7/8/9`);
    }
  }

  return cleaned;
}

/**
 * 计算之卦（变卦）
 * 老阳(9)变少阴(8)，老阴(6)变少阳(7)
 */
export function getZhiGua(yaoString: YaoString): YaoString {
  return yaoString
    .replace(/9/g, '8')
    .replace(/6/g, '7');
}

/**
 * 计算互卦
 * 取本卦2-4爻为下卦，3-5爻为上卦
 */
export function getHuGua(yaoString: YaoString): YaoString {
  // 先将动爻转为静爻
  const staticYao = getZhiGua(yaoString);

  // 互卦：2-4爻为下卦（索引1,2,3），3-5爻为上卦（索引2,3,4）
  const lower = staticYao.slice(1, 4); // 爻位2,3,4
  const upper = staticYao.slice(2, 5); // 爻位3,4,5

  return lower + upper;
}

/**
 * 判断爻是否为动爻
 */
export function isMovingYao(yaoValue: number): boolean {
  return yaoValue === 6 || yaoValue === 9;
}

/**
 * 统计动爻数量
 */
export function countMovingYao(yaoString: YaoString): number {
  return yaoString.split('').filter(c => c === '6' || c === '9').length;
}

/**
 * 获取动爻位置（1-6）
 */
export function getMovingYaoPositions(yaoString: YaoString): number[] {
  const positions: number[] = [];
  for (let i = 0; i < yaoString.length; i++) {
    if (yaoString[i] === '6' || yaoString[i] === '9') {
      positions.push(i + 1);
    }
  }
  return positions;
}

/**
 * 数字转八卦三爻
 * 1=乾(777), 2=兑(778), 3=离(787), 4=震(788)
 * 5=巽(877), 6=坎(878), 7=艮(887), 8=坤(888)
 */
const NUM_TO_TRIGRAM: Record<number, string> = {
  1: '777', 2: '778', 3: '787', 4: '788',
  5: '877', 6: '878', 7: '887', 8: '888',
};

/**
 * 取余并处理 0 的情况
 */
function modWithZero(num: number, divisor: number): number {
  const remainder = num % divisor;
  return remainder === 0 ? divisor : remainder;
}

/**
 * 根据上下卦数字和动爻位置生成爻字符串
 */
function buildYaoString(upperNum: number, lowerNum: number, dongYao: number): YaoString {
  // 组合6爻（下卦在前，上卦在后）
  const yaoArray = (NUM_TO_TRIGRAM[lowerNum] + NUM_TO_TRIGRAM[upperNum])
    .split('')
    .map(c => parseInt(c, 10));

  // 设置动爻
  const dongIndex = dongYao - 1;
  if (yaoArray[dongIndex] === 7) {
    yaoArray[dongIndex] = 9; // 少阳变老阳
  } else if (yaoArray[dongIndex] === 8) {
    yaoArray[dongIndex] = 6; // 少阴变老阴
  }

  return yaoArray.join('');
}

/**
 * 略筮法 - 单次揲数
 * 49根蓍草随机分左右，从右堆挂一，左堆按 groupSize 揲数取余
 */
function lueshifaOnce(groupSize: number): number {
  const left = 1 + Math.floor(Math.random() * 48);
  const remainder = left % groupSize;
  return remainder === 0 ? 1 : remainder + 1;
}

/**
 * 略筮法（简易蓍草法）
 *
 * 用49根蓍草进行三次揲数起卦：
 * - 揲8得下卦（1~8对应八卦）
 * - 揲8得上卦（1~8对应八卦）
 * - 揲6得动爻（1~6对应爻位）
 *
 * @returns 6位爻字符串（6/7/8/9），含一个动爻
 */
export function lueshifa(): YaoString {
  const lowerNum = lueshifaOnce(8);
  const upperNum = lueshifaOnce(8);
  const dongYao  = lueshifaOnce(6);

  return buildYaoString(upperNum, lowerNum, dongYao);
}

/**
 * 三数起卦
 *
 * 第1数/8 余数为上卦，第2数/8 余数为下卦，第3数/6 余数为动爻
 *
 * @param num1 - 第一个数字（上卦）
 * @param num2 - 第二个数字（下卦）
 * @param num3 - 第三个数字（动爻）
 * @returns 6位爻字符串
 *
 * @example
 * threeNumberQiGua(5, 8, 3);  // 上卦5=巽，下卦8=坤，动爻3
 */
export function threeNumberQiGua(num1: number, num2: number, num3: number): YaoString {
  const upperNum = modWithZero(num1, 8);
  const lowerNum = modWithZero(num2, 8);
  const dongYao = modWithZero(num3, 6);

  return buildYaoString(upperNum, lowerNum, dongYao);
}

/**
 * 数组起卦
 *
 * 一组数字按奇偶分割：
 * - 偶数个：前半为上卦，后半为下卦
 * - 奇数个：前半少一个数字（如5个数字，前2后3）
 * - 上卦 = 前半数字之和 % 8
 * - 下卦 = 后半数字之和 % 8
 * - 动爻 = (上卦数 + 下卦数 + 时辰数) % 6
 *
 * @param numbers - 数字数组（至少2个）
 * @param hourZhiIndex - 时辰地支序号（子=1, 丑=2, ...亥=12），用于计算动爻
 * @returns 6位爻字符串
 *
 * @example
 * numberArrayQiGua([3, 8, 4, 2], 5);     // 4个数字，前2后2，时辰5
 * numberArrayQiGua([1, 2, 3, 4, 5], 8);  // 5个数字，前2后3，时辰8
 */
export function numberArrayQiGua(numbers: number[], hourZhiIndex: number): YaoString {
  if (numbers.length < 2) {
    throw new Error('数组起卦至少需要2个数字');
  }

  const len = numbers.length;
  // 奇数个：前半少一个；偶数个：平分
  const splitIndex = Math.floor(len / 2);

  const firstHalf = numbers.slice(0, splitIndex);
  const secondHalf = numbers.slice(splitIndex);

  const firstSum = firstHalf.reduce((a, b) => a + b, 0);
  const secondSum = secondHalf.reduce((a, b) => a + b, 0);

  const upperNum = modWithZero(firstSum, 8);
  const lowerNum = modWithZero(secondSum, 8);
  const dongYao = modWithZero(upperNum + lowerNum + hourZhiIndex, 6);

  return buildYaoString(upperNum, lowerNum, dongYao);
}
