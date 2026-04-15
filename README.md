# IchingShifa 周易六爻筮法

[![Python](https://img.shields.io/pypi/pyversions/ichingshifa)](https://pypi.org/project/ichingshifa/)
[![PyPI](https://img.shields.io/pypi/v/ichingshifa)](https://pypi.org/project/ichingshifa/)
[![npm](https://img.shields.io/npm/v/iching-shifa)](https://www.npmjs.com/package/iching-shifa)

周易六爻筮法库，实现传统大衍蓍草起卦算法，配合纳甲排盘。提供 **Python** 和 **TypeScript** 双版本。

![蓍草](https://upload.wikimedia.org/wikipedia/commons/a/af/French_Polished_Yarrow_stalks_from_LPKaster.jpg)

---

## 目录

- [功能特色](#功能特色)
- [Python 版](#python-版)
- [TypeScript 版](#typescript-版)
- [爻值说明](#爻值说明)
- [网页应用](#网页应用)
- [技术文档](#技术文档)
- [致谢](#致谢)
- [授权](#授权)

---

## 功能特色

| 功能 | 说明 |
|------|------|
| 大衍蓍草筮法 | 模拟真实蓍草起卦过程 |
| 按时间起卦 | 以指定或当前年月日时起卦 |
| 手动输入爻值 | 输入六爻数值（6/7/8/9）自动排盘 |
| 六十四卦数据库 | 完整卦辞、爻辞、彖辞 |
| 纳甲排盘 | 干支、五行、六亲、六兽、世应、伏神 |
| 农历换算 | 自动换算公历与农历干支 |

---

## Python 版

### 安装

```bash
pip install ichingshifa
```

### 快速开始

```python
from ichingshifa import ichingshifa

iching = ichingshifa.Iching()

# 随机大衍筮法起卦
iching.bookgua_details()

# 手动输入六爻值（初爻→上爻）
iching.mget_bookgua_details('789789')

# 指定年月日时起卦
iching.datetime_bookgua(2024, 8, 15, 14)

# 按当前时间起卦
iching.current_bookgua()

# 完整起卦信息（返回字典）
result = iching.qigua_now()
```

### API

| 方法 | 参数 | 说明 |
|------|------|------|
| `bookgua_details()` | — | 随机大衍筮法，显示完整排盘 |
| `mget_bookgua_details(lines)` | 6 位字符串 | 手动输入六爻值排盘 |
| `datetime_bookgua(y, m, d, h)` | 年月日时 | 按指定日期时间起卦 |
| `current_bookgua()` | — | 按当前时间起卦 |
| `decode_gua(lines, rizhi)` | 爻值、日柱干支 | 手动排本卦纳甲 |
| `qigua_now()` | — | 返回完整起卦字典 |
| `display_pan(y, m, d, h, minute)` | 年月日时分 | 打印格式化排盘图 |

### 排盘示例

```python
print(ichingshifa.Iching().display_pan(2023, 5, 27, 16, 0))
```

```
起卦时间︰2023年5月27日16时0分
农历︰二零二三年四月九日
干支︰癸卯年  丁巳月  乙酉日  甲申时

　　　　　　　夬卦　　　　　　　　　　　　革卦
六神    伏神        本卦                     伏神      之卦
　武             角 兄丁未土 　▅▅　▅▅           　　　虚 官丁未土 应▅▅　▅▅
　虎             亢 子丁酉金 世▅▅▅▅▅           　　　危 父丁酉金 　▅▅▅▅▅
　蛇             氐 妻丁亥水 　▅▅▅▅▅ 身         　　　室 兄丁亥水 世▅▅▅▅▅
　陈             房 兄甲辰土 　▅▅▅▅▅          妻戊午火  壁 兄己亥水 　▅▅▅▅▅
　雀   父乙巳火    心 官甲寅木 应▅▅▅▅▅ O         　　　奎 官己丑土 　▅▅　▅▅
　龙             尾 妻甲子水 　▅▅▅▅▅           　　　娄 子己卯木 　▅▅▅▅▅

【大衍筮法】
求得【夬之革】，动爻有【1】根。主要看【九二】九二：惕号，莫夜有戎，勿恤。
```

---

## TypeScript 版

### 安装

```bash
npm install iching-shifa
# 或
bun add iching-shifa
```

### 快速开始

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

console.log(result.benGua.guaName);  // 本卦名
console.log(result.zhiGua.guaName);  // 之卦名
```

### 导出函数

#### 起卦方法

| 函数 | 说明 |
|------|------|
| `dayan()` | 大衍筮法随机起卦，返回 6 位爻值字符串 |
| `timeQiGua(options)` | 按时间起卦 |
| `manualQiGua(input)` | 手动输入 6 位爻值 |
| `getZhiGua(yaoString)` | 计算之卦 |
| `getHuGua(yaoString)` | 计算互卦 |
| `isMovingYao(value)` | 判断是否动爻 |
| `countMovingYao(yaoString)` | 统计动爻数量 |
| `getMovingYaoPositions(yaoString)` | 获取动爻位置 |

#### 排盘方法

| 函数 | 说明 |
|------|------|
| `decodePan(yaoString, options)` | 完整排盘，返回 PanResult |
| `decodeGua(yaoString, dayGanZhi)` | 单卦解码 |
| `getGuaName(yaoString)` | 获取卦名 |

#### 农历/干支

| 函数 | 说明 |
|------|------|
| `solarToLunar(year, month, day)` | 公历转农历 |
| `getHourGanZhi(dayGan, hour)` | 获取时柱干支 |
| `calcXunKong(ganZhi)` | 计算旬空 |
| `getCurrentSolarTerm(month, day)` | 获取当前节气 |

#### 五行工具

| 函数 | 说明 |
|------|------|
| `ganZhiToWuXing(ganZhi)` | 干支转五行 |
| `getWuXingRelation(a, b)` | 获取五行生克关系 |
| `wuXingToLiuQin(yaoWuXing, guaWuXing)` | 五行转六亲 |

#### 数据常量

```typescript
import {
  TIAN_GAN,      // 天干
  DI_ZHI,        // 地支
  WU_XING,       // 五行
  JIAZI_60,      // 六十甲子
  GUA64_ORDER,   // 64 卦序
  BAGUA_XIANG,   // 八卦象
  LIU_SHOU,      // 六兽
  LIU_QIN,       // 六亲
  XINGXIU_28,    // 二十八宿
  JIEQI_NAMES,   // 节气名
  GUA_DESCRIPTIONS, // 卦辞爻辞
} from 'iching-shifa';
```

### 类型定义

```typescript
interface PanResult {
  queryTime: { year, month, day, hour, minute };
  ganZhiYear: GanZhi;   // 年柱
  ganZhiMonth: GanZhi;  // 月柱
  ganZhiDay: GanZhi;    // 日柱
  ganZhiHour: GanZhi;   // 时柱
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
  palaceLevel: string;  // 宫位
  yaoList: YaoData[];   // 六爻详情
  guaCi: string;        // 卦辞
  yaoCi: string[];      // 爻辞
  tuanCi: string;       // 彖辞
  fuShen?: FuShenData[];// 伏神
}

interface YaoData {
  position: number;     // 爻位 1-6
  yaoValue: number;     // 爻值 6/7/8/9
  isMoving: boolean;    // 是否动爻
  naJia: string;        // 纳甲
  wuXing: string;       // 五行
  liuQin: string;       // 六亲
  liuShou: string;      // 六兽
  shiYing: string;      // 世应标记
}
```

---

## 爻值说明

| 值 | 名称 | 阴阳 | 动/静 | 变化 |
|----|------|------|-------|------|
| 6 | 老阴 | 阴 | 动爻 | 变阳 |
| 7 | 少阳 | 阳 | 静爻 | 不变 |
| 8 | 少阴 | 阴 | 静爻 | 不变 |
| 9 | 老阳 | 阳 | 动爻 | 变阴 |

爻值字符串从初爻（下）到上爻排列，如 `"789789"` 表示初爻为少阳、二爻为少阴、三爻为老阳...

---

## 网页应用

Streamlit 网页排盘系统：[https://iching.streamlit.app](https://iching.streamlit.app)

---

## 技术文档

详细的筮法原理、纳甲说明、术语对照请参阅 [docs/theory.md](docs/theory.md)。

---

## 致谢

本项目基于 [kentang2017/ichingshifa](https://github.com/kentang2017/ichingshifa) 开发，感谢原作者的贡献。

---

## 授权

[MIT License](LICENSE)
