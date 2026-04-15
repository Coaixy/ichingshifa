/**
 * 农历适配层
 * 使用 lunar-javascript 库进行公历农历转换
 */

// @ts-ignore - lunar-javascript 没有类型定义
import { Solar, Lunar } from 'lunar-javascript';
import type { GanZhi } from '../types';
import { TIAN_GAN, DI_ZHI, LIUJIA_XUNKONG } from '../data/jiazi';

/** 农历日期信息 */
export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  yearGanZhi: GanZhi;
  monthGanZhi: GanZhi;
  dayGanZhi: GanZhi;
  hourGanZhi: GanZhi;
}

/**
 * 公历转农历
 */
export function solarToLunar(
  year: number,
  month: number,
  day: number,
  hour: number = 0
): LunarDate {
  // 子时特殊处理：23:00-01:00 属于次日子时
  let adjustedDay = day;
  let adjustedMonth = month;
  let adjustedYear = year;

  if (hour >= 23) {
    // 晚子时，算次日
    const date = new Date(year, month - 1, day + 1);
    adjustedYear = date.getFullYear();
    adjustedMonth = date.getMonth() + 1;
    adjustedDay = date.getDate();
  }

  const solar = Solar.fromYmd(adjustedYear, adjustedMonth, adjustedDay);
  const lunar = solar.getLunar();

  // 获取四柱
  const yearGZ = lunar.getYearInGanZhi();
  const monthGZ = lunar.getMonthInGanZhi();
  const dayGZ = lunar.getDayInGanZhi();

  // 时柱计算
  const hourGZ = getHourGanZhi(dayGZ, hour);

  return {
    year: lunar.getYear(),
    month: Math.abs(lunar.getMonth()),
    day: lunar.getDay(),
    isLeap: lunar.getMonth() < 0,
    yearGanZhi: parseGanZhi(yearGZ),
    monthGanZhi: parseGanZhi(monthGZ),
    dayGanZhi: parseGanZhi(dayGZ),
    hourGanZhi: hourGZ,
  };
}

/**
 * 解析干支字符串
 */
function parseGanZhi(gz: string): GanZhi {
  return {
    tian: gz[0],
    di: gz[1],
    gz: gz,
  };
}

/**
 * 五鼠遁：根据日干推算时干支
 */
export function getHourGanZhi(dayGZ: string, hour: number): GanZhi {
  const dayGan = dayGZ[0];

  // 五鼠遁起始：日干 -> 子时天干
  const wuShuDun: Record<string, string> = {
    '甲': '甲', '己': '甲',
    '乙': '丙', '庚': '丙',
    '丙': '戊', '辛': '戊',
    '丁': '庚', '壬': '庚',
    '戊': '壬', '癸': '壬',
  };

  // 计算时辰索引 (子丑寅卯辰巳午未申酉戌亥)
  // 子时: 23:00-01:00
  let zhiIndex: number;
  if (hour >= 23 || hour < 1) {
    zhiIndex = 0; // 子
  } else {
    zhiIndex = Math.floor((hour + 1) / 2);
  }

  // 计算时干
  const startGan = wuShuDun[dayGan];
  const tianGanArr = [...TIAN_GAN];
  const startGanIndex = tianGanArr.indexOf(startGan);
  const hourGanIndex = (startGanIndex + zhiIndex) % 10;

  return {
    tian: TIAN_GAN[hourGanIndex],
    di: DI_ZHI[zhiIndex],
    gz: TIAN_GAN[hourGanIndex] + DI_ZHI[zhiIndex],
  };
}

/**
 * 计算旬空
 */
export function calcXunKong(dayGZ: string): string {
  const tianGanArr = [...TIAN_GAN];
  const diZhiArr = [...DI_ZHI];
  const ganIndex = tianGanArr.indexOf(dayGZ[0]);
  const zhiIndex = diZhiArr.indexOf(dayGZ[1]);

  // 找到所在六甲旬的甲日
  let jiaIndex = zhiIndex - ganIndex;
  if (jiaIndex < 0) jiaIndex += 12;

  const jiaZhi = diZhiArr[jiaIndex];
  const jiaGZ = '甲' + jiaZhi;

  return LIUJIA_XUNKONG[jiaGZ] || '';
}

/**
 * 获取当前节气
 */
export function getCurrentSolarTerm(year: number, month: number, day: number): string {
  try {
    const solar = Solar.fromYmd(year, month, day);
    // lunar-javascript 使用 getPrevJieQi 获取前一个节气
    const prevJieQi = solar.getPrevJieQi();
    if (prevJieQi) {
      return prevJieQi.getName();
    }
    return '';
  } catch {
    return '';
  }
}
