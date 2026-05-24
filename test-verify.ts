/**
 * 排盘验证脚本
 *
 * 用几个代表性样例检查新版输出：当前时间、标准卦、极端动爻。
 */
import { decodePan } from './src/index';
import type { DivinationOptions, FuShenData, GuaPan, PanResult, ShenShaMap, YaoData } from './src/index';

type Sample = {
  label: string;
  yaoString: string;
  options: DivinationOptions;
};

const now = new Date();
const samples: Sample[] = [
  {
    label: '当前时间样例',
    yaoString: '978879',
    options: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    },
  },
  {
    label: '纯乾基准',
    yaoString: '777777',
    options: {
      year: 2024,
      month: 4,
      day: 15,
      hour: 14,
    },
  },
  {
    label: '六爻皆动边界',
    yaoString: '666666',
    options: {
      year: 2024,
      month: 4,
      day: 15,
      hour: 14,
    },
  },
];

const positionNames = ['初', '二', '三', '四', '五', '上'] as const;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function formatTime(options: DivinationOptions): string {
  const minute = options.minute ?? 0;
  return `${options.year}-${pad2(options.month)}-${pad2(options.day)} ${pad2(options.hour)}:${pad2(minute)}`;
}

function formatRange(range?: { startAge: number; endAge: number }): string {
  return range ? `${range.startAge}-${range.endAge}` : '-';
}

function joinValues(values?: string[]): string {
  return values && values.length > 0 ? values.join('、') : '无';
}

function summarizeYaoList(list: YaoData[]): string {
  const counts = {
    naYin: list.filter(item => Boolean(item.naYin)).length,
    xingXiu: list.filter(item => Boolean(item.xingXiu)).length,
    suoBo: list.filter(item => Boolean(item.suoBo)).length,
    suiXian: list.filter(item => Boolean(item.suiXian)).length,
  };

  return `纳音 ${counts.naYin}/6 ｜ 星宿 ${counts.xingXiu}/6 ｜ 锁泊 ${counts.suoBo}/6 ｜ 岁限 ${counts.suiXian}/6`;
}

function printShenSha(shenSha: ShenShaMap): void {
  const summary = Object.entries(shenSha)
    .map(([name, values]) => `${name}=${joinValues(values)}`)
    .join(' ｜ ');
  console.log(`神煞: ${summary}`);
}

function printFuShen(title: string, items?: FuShenData[]): void {
  console.log(`${title}: ${items?.length ? `${items.length} 条` : '无'}`);
  if (!items?.length) {
    return;
  }

  items.forEach(item => {
    console.log(`  ${item.hostPosition}爻 -> ${item.fuNaJia} ${item.fuNaYin} ${item.fuLiuQin} ${item.fuWuXing}`);
  });
}

function printGua(title: string, gua: GuaPan, includeFuShen: boolean): void {
  console.log(`\n--- ${title} ---`);
  console.log(`卦名: ${gua.guaName}`);
  console.log(`所属宫: ${gua.palace}宫（${gua.palaceWuXing}）`);
  console.log(`宫位: ${gua.palaceLevel}`);
  console.log(`五星: ${gua.wuXingStar}`);
  console.log(`数据覆盖: ${summarizeYaoList(gua.yaoList)}`);
  console.log(`卦辞: ${gua.guaCi || '无'}`);
  console.log(`彖辞: ${gua.tuanCi || '无'}`);
  console.log(`爻辞条数: ${gua.yaoCi.filter(Boolean).length}/6`);
  if (gua.shenYao !== undefined) {
    console.log(`身爻: ${gua.shenYao}爻`);
  }

  console.log('爻位 | 爻值 | 动静 | 纳甲 | 纳音 | 五行 | 六亲 | 六兽 | 世应 | 星宿 | 锁泊 | 岁限');
  console.log('---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----');
  for (let i = 5; i >= 0; i--) {
    const yao = gua.yaoList[i];
    const yaoLabel = `${positionNames[i]}爻`;
    const moving = yao.isMoving ? '动' : '静';
    const range = formatRange(yao.suiXian);
    console.log(`${yaoLabel} | ${yao.yaoValue} | ${moving} | ${yao.naJia} | ${yao.naYin ?? '-'} | ${yao.wuXing} | ${yao.liuQin} | ${yao.liuShou} | ${yao.shiYing} | ${yao.xingXiu ?? '-'} | ${yao.suoBo ?? '-'} | ${range}`);
  }

  if (includeFuShen) {
    printFuShen('伏神', gua.fuShen);
    printFuShen('旁伏神', gua.pangFuShen);
  }
}

function printPan(sample: Sample): void {
  const pan: PanResult = decodePan(sample.yaoString, sample.options);

  console.log(`\n================ ${sample.label} ================`);
  console.log(`输入爻串: ${sample.yaoString}`);
  console.log(`起卦时间: ${formatTime(pan.queryTime)}`);
  console.log(`农历: ${pan.lunarDate.year}年${pan.lunarDate.isLeap ? '闰' : ''}${pan.lunarDate.month}月${pan.lunarDate.day}日`);
  console.log(`干支: ${pan.ganZhiYear.gz}年 ${pan.ganZhiMonth.gz}月 ${pan.ganZhiDay.gz}日 ${pan.ganZhiHour.gz}时`);
  console.log(`节气: ${pan.solarTerm}`);
  console.log(`旬空: 日空 ${pan.dayKong} ｜ 时空 ${pan.hourKong}`);
  console.log(`月建: ${pan.monthJian}`);
  console.log(`动爻数: ${pan.dongYaoCount}`);
  console.log(`断卦提示: ${pan.explanation}`);
  printShenSha(pan.shenSha);

  printGua('本卦', pan.benGua, true);
  printGua('之卦', pan.zhiGua, false);
  printGua('互卦', pan.huGua, false);
}

console.log('=== 新版排盘验证 ===');
console.log('说明: 这个脚本用于快速巡检当前数据结构，不再依赖旧版单一示例。');

for (const sample of samples) {
  printPan(sample);
}
