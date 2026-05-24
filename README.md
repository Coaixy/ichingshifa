# iching-shifa

[![npm](https://img.shields.io/npm/v/iching-shifa)](https://www.npmjs.com/package/iching-shifa)

周易六爻筮法 TypeScript 库 - I Ching Six Lines Divination

## 功能

- **大衍筮法起卦** - 模拟传统蓍草起卦
- **时间起卦** - 按年月日时四柱起卦
- **手动输入起卦** - 输入 6 位爻值字符串（6/7/8/9）
- **纳甲排盘** - 完整六爻排盘（本卦 / 之卦 / 互卦、六亲、六兽、世应、伏神等）
- **神煞排盘** - 按日支 / 月令 / 季节 / 日干计算神煞，并输出独立 JSON 字段
- **纳音信息** - 本卦和之卦六爻输出 60 甲子纳音

## 安装

```bash
bun add iching-shifa
# 或
npm install iching-shifa
```

## 快速开始

```typescript
import { dayan, manualQiGua, decodePan, getGuaName } from 'iching-shifa';

// 大衍筮法随机起卦
const yao = dayan();
console.log(getGuaName(yao));

// 手动输入起卦
const yao2 = manualQiGua('787878');

// 完整排盘
const result = decodePan(yao, {
  year: 2024,
  month: 4,
  day: 15,
  hour: 14,
});

console.log(result.benGua.guaName);
console.log(result.zhiGua.guaName);
```

## API

### 起卦

| 方法 | 说明 |
|------|------|
| `dayan()` | 大衍筮法随机起卦 |
| `manualQiGua(input)` | 手动输入 6 位爻值 |
| `timeQiGua(options)` | 按时间起卦 |
| `threeNumberQiGua(a, b, c)` | 三数起卦 |
| `numberArrayQiGua(numbers)` | 数组起卦 |
| `getGuaName(yaoString)` | 获取卦名 |
| `getZhiGua(yaoString)` | 计算之卦 |
| `getHuGua(yaoString)` | 计算互卦 |
| `countMovingYao(yaoString)` | 统计动爻数量 |
| `getMovingYaoPositions(yaoString)` | 获取动爻位置 |

### 排盘

| 方法 | 说明 |
|------|------|
| `decodePan(yaoString, options)` | 完整排盘，返回 `PanResult` |
| `decodeGua(yaoString, dayGanZhi)` | 单卦解码 |

### 爻值

| 值 | 含义 | 动/静 |
|----|------|-------|
| 6 | 老阴 | 动爻（变阳） |
| 7 | 少阳 | 静爻 |
| 8 | 少阴 | 静爻 |
| 9 | 老阳 | 动爻（变阴） |

## JSON 输出结构

```typescript
interface PanResult {
  queryTime: { year, month, day, hour, minute };
  ganZhiYear: { tian, di, gz };
  ganZhiMonth: { tian, di, gz };
  ganZhiDay: { tian, di, gz };
  ganZhiHour: { tian, di, gz };
  lunarDate: { year, month, day, isLeap };
  solarTerm?: string;
  dayKong: string;
  hourKong: string;
  monthJian: string;
  shenSha: ShenShaMap;
  benGua: GuaPan;
  zhiGua: GuaPan;
  huGua: GuaPan;
  yaoString: string;
  dongYaoCount: number;
  explanation: string;
}

type ShenShaMap = Record<string, {
  targetDiZhi: string[];
  matches: {
    guaKey: 'benGua' | 'zhiGua' | 'huGua';
    position: number;
    diZhi: string;
    naJia: string;
  }[];
}>;

interface GuaPan {
  guaName: string;
  palace: string;
  palaceWuXing: string;
  palaceLevel: string;
  yaoList: YaoData[];
  guaCi: string;
  yaoCi: string[];
  tuanCi: string;
  shenYao?: number;
  fuShen?: FuShenData[];
  pangFuShen?: FuShenData[];
}

interface YaoData {
  position: number;
  yaoValue: number;
  isMoving: boolean;
  tianGan: string;
  diZhi: string;
  naJia: string;
  naYin?: string;
  wuXing: string;
  liuQin: string;
  liuShou: string;
  shiYing: string;
}
```

## 开发

```bash
bun install
bun run build
bun test
```

## 项目资料

- 筮法原理：[`docs/theory.md`](docs/theory.md)
- 古占例：[`docs/example.md`](docs/example.md)
- 占诀：[`docs/text.md`](docs/text.md)
- 更新日志：[`docs/update.md`](docs/update.md)
- 神煞资料：[`六爻常见神煞排法.md`](六爻常见神煞排法.md)

## 许可

MIT License

## 相关项目

- [ichingshifa](https://github.com/kentang2017/iching_shifa) - Python 原版库
