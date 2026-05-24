/**
 * 测试数字起卦：472，当前时间
 */
import { threeNumberQiGua, decodePan } from './src/index';

// 472 三数起卦
const yao = threeNumberQiGua(4, 7, 2);
console.log('=== 472 数字起卦测试 ===\n');
console.log('输入数字: 4, 7, 2');
console.log('爻字符串:', yao);
console.log('');

// 解析爻值
console.log('爻值解析:');
console.log('  第1数 4 % 8 = 4 → 震（上卦）');
console.log('  第2数 7 % 8 = 7 → 艮（下卦）');
console.log('  第3数 2 % 6 = 2 → 二爻动');
console.log('');

// 当前时间排盘
const now = new Date();
const pan = decodePan(yao, {
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  day: now.getDate(),
  hour: now.getHours(),
  minute: now.getMinutes(),
});

const posNames = ['初', '二', '三', '四', '五', '上'];

console.log('=== 排盘结果 ===\n');
console.log(`起卦时间: ${pan.queryTime.year}年${pan.queryTime.month}月${pan.queryTime.day}日 ${pan.queryTime.hour}时`);
console.log(`农历: ${pan.lunarDate.year}年${pan.lunarDate.isLeap ? '闰' : ''}${pan.lunarDate.month}月${pan.lunarDate.day}日`);
console.log(`干支: ${pan.ganZhiYear.gz}年 ${pan.ganZhiMonth.gz}月 ${pan.ganZhiDay.gz}日 ${pan.ganZhiHour.gz}时`);
console.log(`节气: ${pan.solarTerm}`);
console.log(`日空: ${pan.dayKong}  时空: ${pan.hourKong}`);
console.log('');

console.log('--- 本卦 ---');
console.log(`卦名: ${pan.benGua.guaName}`);
console.log(`所属宫: ${pan.benGua.palace}宫（${pan.benGua.palaceWuXing}）`);
console.log(`宫位: ${pan.benGua.palaceLevel}`);
console.log('');

console.log('爻位   纳甲    六亲   六兽   世应');
console.log('─────────────────────────────────────');
for (let i = 5; i >= 0; i--) {
  const y = pan.benGua.yaoList[i];
  const yaoSymbol = y.yaoValue === 7 || y.yaoValue === 9 ? '▅▅▅▅▅' : '▅▅ ▅▅';
  const moving = y.isMoving ? ' ○' : '  ';
  const shiying = y.shiYing === '世' || y.shiYing === '应' ? y.shiYing : '  ';
  console.log(`${posNames[i]}爻   ${y.naJia}${y.wuXing}  ${y.liuQin}  ${y.liuShou}  ${shiying}${moving} ${yaoSymbol}`);
}
console.log('');

console.log('--- 之卦（变卦） ---');
console.log(`卦名: ${pan.zhiGua.guaName}`);
console.log('');

console.log('--- 互卦 ---');
console.log(`卦名: ${pan.huGua.guaName}`);
console.log('');

console.log(`动爻数: ${pan.dongYaoCount}`);
console.log(`断卦提示: ${pan.explanation}`);
