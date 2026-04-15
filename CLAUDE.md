# IchingShifa 项目索引

周易六爻筮法 Python 库，实现传统大衍蓍草起卦算法，配合纳甲排盘、AI 分析的 Streamlit 网页应用。

## 项目结构

```
ichingshifa/
├── app.py                      # Streamlit 网页应用主入口
├── system_prompts.json         # AI 系统提示配置
├── requirements.txt            # Python 依赖
├── packages.txt                # 系统依赖（用于部署）
│
├── src/ichingshifa/            # 核心库
│   ├── __init__.py
│   ├── ichingshifa.py          # 主算法：Iching 类，六爻起卦、纳甲排盘
│   ├── jieqi.py                # 节气计算（基于 ephem 天文库）
│   ├── d.py                    # 数据字典：卦爻辞、数字卦等
│   ├── cerebras_client.py      # Cerebras AI 客户端封装
│   └── data.pkl                # 序列化数据：64 卦、8 宫卦、六亲等
│
├── docs/                       # 文档
│   ├── about.md                # 关于
│   ├── example.md              # 古占例
│   ├── text.md                 # 占诀
│   └── update.md               # 更新日志
│
├── data/                       # 图片资源
│   ├── results.png             # 排盘示例图
│   └── stalk.jpg               # 蓍草图
│
├── .streamlit/
│   └── config.toml             # Streamlit 主题配置（暗色主题）
│
├── .devcontainer/
│   └── devcontainer.json       # GitHub Codespaces / VS Code 容器配置
│
└── .github/workflows/          # CI/CD 工作流
```

## 核心模块

### ichingshifa.py - Iching 类

主要方法：

| 方法 | 说明 |
|------|------|
| `bookgua_details()` | 随机大衍筮法起卦，显示完整排盘 |
| `mget_bookgua_details(lines)` | 手动输入六爻值（6/7/8/9 字符串）排盘 |
| `datetime_bookgua(y,m,d,h)` | 按指定日期时间起卦 |
| `current_bookgua()` | 按当前时间起卦 |
| `display_pan(y,m,d,h,mi)` | 生成格式化排盘文本 |
| `display_pan_m(y,m,d,h,mi,lines)` | 手动输入爻值的格式化排盘 |
| `decode_gua(lines, rizhi)` | 手动排本卦纳甲 |
| `qigua_now()` | 返回完整起卦字典 |

爻值含义：
- `6` = 老阴（动爻，阴变阳）
- `7` = 少阳（静爻）
- `8` = 少阴（静爻）
- `9` = 老阳（动爻，阳变阴）

### jieqi.py - 节气计算

基于 `ephem` 天文库计算 24 节气，用于确定八宫卦的旺衰状态。

### cerebras_client.py - AI 客户端

封装 Cerebras API，支持多种模型（Qwen 3、DeepSeek R1、Llama 4 等）。

## 依赖

主要依赖：
- `streamlit` - 网页框架
- `sxtwl` - 农历/干支转换
- `ephem` - 天文历算
- `cn2an` - 中文数字转换
- `bidict` - 双向字典
- `pendulum` - 日期时间处理
- `cerebras-cloud-sdk` - AI API

## 运行

```bash
# 本地开发
streamlit run app.py

# 或使用 Dev Container / Codespaces
# 自动启动在端口 8501
```

## 部署

项目配置为 Streamlit Cloud 部署：
- 入口文件：`app.py`（根目录）
- 系统依赖：`packages.txt`
- Python 依赖：`requirements.txt`
- API Key：通过 `.streamlit/secrets.toml` 或环境变量 `CEREBRAS_API_KEY`

## 术语对照

| 中文 | 英文 | 说明 |
|------|------|------|
| 本卦 | BenGua | 原始卦象 |
| 之卦 | ZhiGua | 变卦（动爻变化后） |
| 纳甲 | Najia | 将天干地支配入卦爻 |
| 六亲 | LiuQin | 父母、官鬼、妻财、兄弟、子孙 |
| 六兽 | LiuShou | 青龙、朱雀、勾陈、螣蛇、白虎、玄武 |
| 世爻 | Shi | 代表自己/主方 |
| 应爻 | Ying | 代表对方/客方 |
| 伏神 | FuShen | 卦中隐藏的爻 |
| 动爻 | DongYao | 老阴(6)/老阳(9)，会变化 |
| 静爻 | JingYao | 少阳(7)/少阴(8)，不变化 |

## 编码规范

- 代码注释使用繁体中文
- 变量命名使用拼音或英文
- 数据结构大量使用字典和列表
- `data.pkl` 包含预计算的卦象数据，避免修改
