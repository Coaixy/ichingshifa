/**
 * 神煞排法
 * 依起卦日支、月令、日干，对照卦中各爻纳支后输出命中结果
 */

import { DI_ZHI } from '../data/jiazi';
import type { ShenShaMap, ShenShaName } from '../types';

const SHENSHA_ORDER: ShenShaName[] = [
  '驿马',
  '桃花',
  '华盖',
  '天医',
  '天喜',
  '天马',
  '天乙贵人',
  '禄神',
  '文昌',
];

function getDayBranchShenSha(dayZhi: string): Record<'驿马' | '桃花' | '华盖', string[]> {
  if (['申', '子', '辰'].includes(dayZhi)) {
    return { 驿马: ['寅'], 桃花: ['酉'], 华盖: ['辰'] };
  }

  if (['寅', '午', '戌'].includes(dayZhi)) {
    return { 驿马: ['申'], 桃花: ['卯'], 华盖: ['戌'] };
  }

  if (['巳', '酉', '丑'].includes(dayZhi)) {
    return { 驿马: ['亥'], 桃花: ['午'], 华盖: ['丑'] };
  }

  if (['亥', '卯', '未'].includes(dayZhi)) {
    return { 驿马: ['巳'], 桃花: ['子'], 华盖: ['未'] };
  }

  return { 驿马: [], 桃花: [], 华盖: [] };
}

function getTianYi(monthZhi: string): string[] {
  const index = DI_ZHI.indexOf(monthZhi as (typeof DI_ZHI)[number]);
  if (index === -1) {
    return [];
  }

  // 天医依月令退一位，直接用地支循环回推即可
  return [DI_ZHI[(index + DI_ZHI.length - 1) % DI_ZHI.length]];
}

function getTianMa(monthZhi: string): string[] {
  if (['寅', '申'].includes(monthZhi)) return ['午'];
  if (['卯', '酉'].includes(monthZhi)) return ['申'];
  if (['辰', '戌'].includes(monthZhi)) return ['戌'];
  if (['巳', '亥'].includes(monthZhi)) return ['子'];
  if (['子', '午'].includes(monthZhi)) return ['寅'];
  if (['丑', '未'].includes(monthZhi)) return ['辰'];
  return [];
}

function getSeasonByMonthZhi(monthZhi: string): '春' | '夏' | '秋' | '冬' | undefined {
  if (['寅', '卯', '辰'].includes(monthZhi)) return '春';
  if (['巳', '午', '未'].includes(monthZhi)) return '夏';
  if (['申', '酉', '戌'].includes(monthZhi)) return '秋';
  if (['亥', '子', '丑'].includes(monthZhi)) return '冬';
  return undefined;
}

function getTianXi(monthZhi: string): string[] {
  const season = getSeasonByMonthZhi(monthZhi);
  if (season === '春') return ['戌'];
  if (season === '夏') return ['丑'];
  if (season === '秋') return ['辰'];
  if (season === '冬') return ['未'];
  return [];
}

function getTianYiGuiRen(dayGan: string): string[] {
  if (['甲', '戊'].includes(dayGan)) return ['丑', '未'];
  if (['乙', '己'].includes(dayGan)) return ['子', '申'];
  if (['丙', '丁'].includes(dayGan)) return ['亥', '酉'];
  if (['庚', '辛'].includes(dayGan)) return ['午', '寅'];
  if (['壬', '癸'].includes(dayGan)) return ['卯', '巳'];
  return [];
}

function getLuShen(dayGan: string): string[] {
  if (dayGan === '甲') return ['寅'];
  if (dayGan === '乙') return ['卯'];
  if (dayGan === '丙') return ['巳'];
  if (dayGan === '丁') return ['午'];
  if (dayGan === '戊') return ['巳'];
  if (dayGan === '己') return ['午'];
  if (dayGan === '庚') return ['申'];
  if (dayGan === '辛') return ['酉'];
  if (dayGan === '壬') return ['亥'];
  if (dayGan === '癸') return ['子'];
  return [];
}

function getWenChang(dayGan: string): string[] {
  if (dayGan === '甲') return ['巳'];
  if (dayGan === '乙') return ['午'];
  if (dayGan === '丙') return ['申'];
  if (dayGan === '丁') return ['酉'];
  if (dayGan === '戊') return ['申'];
  if (dayGan === '己') return ['酉'];
  if (dayGan === '庚') return ['亥'];
  if (dayGan === '辛') return ['子'];
  if (dayGan === '壬') return ['寅'];
  if (dayGan === '癸') return ['卯'];
  return [];
}

function getShenShaTargets(dayGan: string, dayZhi: string, monthZhi: string): Record<ShenShaName, string[]> {
  const dayBranchShenSha = getDayBranchShenSha(dayZhi);

  return {
    驿马: dayBranchShenSha.驿马,
    桃花: dayBranchShenSha.桃花,
    华盖: dayBranchShenSha.华盖,
    天医: getTianYi(monthZhi),
    天喜: getTianXi(monthZhi),
    天马: getTianMa(monthZhi),
    天乙贵人: getTianYiGuiRen(dayGan),
    禄神: getLuShen(dayGan),
    文昌: getWenChang(dayGan),
  };
}

/**
 * 按日干、日支、月令生成神煞对应地支表
 */
export function buildShenShaMap(dayGan: string, dayZhi: string, monthZhi: string): ShenShaMap {
  const targets = getShenShaTargets(dayGan, dayZhi, monthZhi);
  const result = {} as ShenShaMap;

  for (const name of SHENSHA_ORDER) {
    result[name] = [...targets[name]];
  }

  return result;
}
