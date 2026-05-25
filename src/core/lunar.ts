/**
 * 农历适配层
 * 使用 tyme4ts 库进行公历农历转换
 */

import { SolarDay, SolarTime } from 'tyme4ts';
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

  const solar = SolarDay.fromYmd(adjustedYear, adjustedMonth, adjustedDay);
  const lunar = solar.getLunarDay();
  const lunarMonth = lunar.getLunarMonth();
  const sixtyCycleDay = solar.getSixtyCycleDay();

  // 获取四柱
  const yearGZ = sixtyCycleDay.getYear().getName();
  const monthGZ = sixtyCycleDay.getMonth().getName();
  const dayGZ = sixtyCycleDay.getSixtyCycle().getName();
  const hourGZ = SolarTime
    .fromYmdHms(year, month, day, hour, 0, 0)
    .getSixtyCycleHour()
    .getSixtyCycle()
    .getName();

  return {
    year: lunarMonth.getLunarYear().getYear(),
    month: Math.abs(lunarMonth.getMonthWithLeap()),
    day: lunar.getDay(),
    isLeap: lunarMonth.isLeap(),
    yearGanZhi: parseGanZhi(yearGZ),
    monthGanZhi: parseGanZhi(monthGZ),
    dayGanZhi: parseGanZhi(dayGZ),
    hourGanZhi: parseGanZhi(hourGZ),
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
  const tianGanArr: readonly string[] = TIAN_GAN;
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
  const tianGanArr: readonly string[] = TIAN_GAN;
  const diZhiArr: readonly string[] = DI_ZHI;
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
    const solar = SolarDay.fromYmd(year, month, day);
    return solar.getTerm().getName();
  } catch {
    return '';
  }
}
