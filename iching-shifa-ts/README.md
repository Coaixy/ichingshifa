# iching-shifa

周易六爻筮法 TypeScript 库 - I Ching Six Lines Divination

## 功能

- **大衍筮法起卦** - 模拟传统蓍草起卦
- **时间起卦** - 按年月日时四柱起卦
- **手动输入起卦** - 输入6位爻值字符串（6/7/8/9）
- **纳甲排盘** - 完整的六爻排盘（本卦/之卦/互卦、六亲、六兽、世应、伏神等）

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
const yao = dayan();  // "778879"
console.log(getGuaName(yao));  // "履"

// 手动输入起卦
const yao2 = manualQiGua('787878');

// 完整排盘
const result = decodePan(yao, {
  year: 2024,
  month: 4,
  day: 15,
  hour: 14,
});

console.log(result.benGua.guaName);  // "革"
console.log(result.zhiGua.guaName);  // "既济"
```

## API

### 起卦

| 方法 | 说明 |
|------|------|
| `dayan()` | 大衍筮法随机起卦 |
| `manualQiGua(input)` | 手动输入6位爻值 |
| `getGuaName(yaoString)` | 获取卦名 |
| `getZhiGua(yaoString)` | 计算之卦 |
| `getHuGua(yaoString)` | 计算互卦 |

### 排盘

| 方法 | 说明 |
|------|------|
| `decodePan(yaoString, options)` | 完整排盘，返回 PanResult |
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
  ganZhiYear: { tian, di, gz };   // 年柱
  ganZhiMonth: { tian, di, gz };  // 月柱
  ganZhiDay: { tian, di, gz };    // 日柱
  ganZhiHour: { tian, di, gz };   // 时柱
  lunarDate: { year, month, day, isLeap };
  dayKong: string;      // 日空
  hourKong: string;     // 时空
  monthJian: string;    // 月建
  benGua: GuaPan;       // 本卦
  zhiGua: GuaPan;       // 之卦
  huGua: GuaPan;        // 互卦
  yaoString: string;    // 原始爻值
  dongYaoCount: number; // 动爻数
  explanation: string;  // 断卦说明
}

interface GuaPan {
  guaName: string;      // 卦名
  palace: string;       // 所属宫
  palaceWuXing: string; // 宫五行
  palaceLevel: string;  // 宫位(本宫/一世/.../游魂/归魂)
  yaoList: YaoData[];   // 六爻详情
  guaCi: string;        // 卦辞
  yaoCi: string[];      // 爻辞
  tuanCi: string;       // 彖辞
  shenYao?: number;     // 身爻
  fuShen?: FuShenData[];// 伏神
}

interface YaoData {
  position: number;     // 爻位 1-6
  yaoValue: number;     // 爻值 6/7/8/9
  isMoving: boolean;    // 是否动爻
  tianGan: string;      // 天干
  diZhi: string;        // 地支
  naJia: string;        // 纳甲
  wuXing: string;       // 五行
  liuQin: string;       // 六亲
  liuShou: string;      // 六兽
  shiYing: string;      // 世应标记
}
```

## 开发

```bash
# 安装依赖
bun install

# 构建
bun run build

# 测试
bun test

# 监听测试
bun test --watch
```

## 测试输出示例

```bash
$ bun test

 12 pass
 0 fail
 67 expect() calls
Ran 12 tests across 1 file. [33.00ms]
```

## 许可

MIT License

## 相关项目

- [ichingshifa](https://github.com/kentang2017/iching_shifa) - Python 原版库
