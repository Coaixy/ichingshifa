# IchingShifa 项目索引

周易六爻筮法 TypeScript 库，当前源码、测试与构建配置位于仓库根目录。

## 项目结构

```text
ichingshifa/
├── package.json                # npm 包配置
├── bun.lock
├── tsconfig.json
├── vite.config.ts
├── README.md                   # 项目说明与 API 文档
├── src/
│   ├── index.ts                # 统一导出入口
│   ├── core/
│   │   ├── divination.ts       # 起卦方法
│   │   ├── decode.ts           # 纳甲排盘与卦象解码
│   │   ├── lunar.ts            # 农历、干支、旬空、节气
│   │   └── shensha.ts          # 神煞计算
│   ├── data/                   # 卦象、纳甲、甲子、六亲等静态数据
│   ├── utils/                  # 五行与列表辅助工具
│   └── types/                  # 类型定义
├── tests/
│   └── index.test.ts
├── docs/                       # 项目文档与卦理资料
├── dist/                       # 构建产物
├── test-verify.ts              # 本地验证脚本
└── LICENSE
```

## 核心模块

### `src/core/divination.ts`

起卦相关能力：
- `dayan()`：大衍筮法随机起卦
- `lueshifa()`：略筮法起卦
- `timeQiGua(options)`：按时间起卦
- `manualQiGua(input)`：手动输入六爻值
- `threeNumberQiGua()`、`numberArrayQiGua()`：数字起卦
- `getZhiGua()`、`getHuGua()`：计算之卦、互卦

### `src/core/decode.ts`

排盘与卦象解码：
- `decodePan(yaoString, options)`：生成完整排盘结果
- `decodeGua(yaoString, dayGanZhi)`：单卦解码
- `getGuaName(yaoString)`：获取卦名

### `src/core/lunar.ts`

农历与干支计算：
- `solarToLunar()`：公历转农历
- `getHourGanZhi()`：计算时柱
- `calcXunKong()`：计算旬空
- `getCurrentSolarTerm()`：获取节气

### `src/core/shensha.ts`

按日支、月令、季节、日干计算神煞，并将命中结果写入排盘输出。

## 依赖

主要依赖：
- `lunar-javascript` - 农历、干支与节气计算
- `typescript` - 类型系统与编译
- `vite` - 构建输出
- `vitest` - 测试

## 运行

```bash
bun install
bun run build
bun test
```

## 术语对照

| 中文 | English | 说明 |
|------|---------|------|
| 本卦 | BenGua | 原始卦象 |
| 之卦 | ZhiGua | 动爻变化后的卦象 |
| 互卦 | HuGua | 由中间四爻形成的卦 |
| 纳甲 | Najia | 将天干地支配入卦爻 |
| 六亲 | LiuQin | 父母、官鬼、妻财、兄弟、子孙 |
| 六兽 | LiuShou | 青龙、朱雀、勾陈、螣蛇、白虎、玄武 |
| 世爻 | Shi | 代表自己或主方 |
| 应爻 | Ying | 代表对方或客方 |
| 伏神 | FuShen | 卦中隐藏的爻 |
| 动爻 | DongYao | 老阴（6）或老阳（9），会变化 |
| 静爻 | JingYao | 少阳（7）或少阴（8），不变化 |
| 神煞 | ShenSha | 依日支、月令等规则推算的附加信息 |

## 编码规范

- 代码注释使用简体中文
- 变量命名使用拼音或英文
- 优先沿用现有函数式拆分与类型导出方式
- 修改导出 API 时，同步检查 `src/index.ts` 与 `README.md`
