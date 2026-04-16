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
