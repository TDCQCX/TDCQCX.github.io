---
title: 02 数据获取与存储
date: 2026-09-26 10:00:00
permalink: /pyviz/02-data-io/
series: pyviz
chapter: 2
desc: 读 CSV/Excel/JSON/数据库，写出规范的数据文件
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- 数据分析
keywords: Python 数据分析, 数据可视化, 02 数据获取与存储, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 02 数据获取与存储
toc: true
comments: true
---
> 本章难度：⭐⭐ | 预计学习时间：5 小时 | 前置章节：01 数据分析概念

---

## 学习目标

学完本章你能做到：

1. 判断一份数据来自**文件、数据库、网页还是接口**，并知道每种来源该用什么工具；
2. 用 pandas 正确读取 **CSV / Excel / JSON / Parquet** 四种最常用的格式，会处理
   编码、无表头、表头不在第一行、字段分隔符异常等各种真实问题；
3. 用 **SQL 从数据库取数**，并知道什么时候该在数据库端算、什么时候拉回 pandas 算；
4. 用 `requests` + `BeautifulSoup` **从网页抓表格**，并知道哪些能抓、哪些不能抓；
5. 用 `requests` **调用 API 拿 JSON 数据**，会用 `pd.json_normalize` 把嵌套 JSON 摊平成表；
6. 面对大文件知道怎么办（`nrows` / `usecols` / `chunksize` / 换 Parquet / 上 polars）；
7. **说出四种存储格式的取舍**，并在实际工作中选对格式。

---

## 2.1 数据从哪来？先建立全景图

第 1 章说过，数据分析流程的第二步是"获取数据"。数据来源可以分成四大类：

```text
                    ┌─────────────────────────────────────────┐
                    │           数据来源四大类                  │
                    └─────────────────────────────────────────┘
                                     │
        ┌────────────────┬───────────┴───────────┬────────────────────┐
        ▼                ▼                       ▼                    ▼
  ① 本地文件        ② 数据库                 ③ 网页                ④ 接口 API
  ─────────        ────────                 ───────               ─────────
  CSV               MySQL                   静态 HTML 表格         REST API
  Excel             PostgreSQL              需要抓取解析           返回 JSON
  JSON              SQLite（本教程用）       注意：有法律和          需要 token
  Parquet           SQL Server              道德边界               有频率限制
  TXT               数据仓库（Hive/
  图片/日志            ClickHouse 等）
        │                │                       │                    │
        └────────────────┴───────────┬───────────┴────────────────────┘
                                     ▼
                          pandas 统一变成 DataFrame
                                     ▼
                              后续分析（第 4、5 章）

  用什么工具：
    文件    → pd.read_csv / read_excel / read_json / read_parquet
    数据库  → sqlite3 / SQLAlchemy + pd.read_sql
    网页    → requests + BeautifulSoup（第 3 方库，本机已装）
    API     → requests + json → pd.json_normalize
  存回去：
    文件    → to_csv / to_excel / to_json / to_parquet
    数据库  → to_sql
```

**读和写是对称的**：会读就会写，参数一一对应。所以本章重点是"读"，
"写"只讲关键差异和选型建议。

---

## 2.2 读写 CSV

CSV（Comma-Separated Values，逗号分隔值）是最通用的表格格式，
本质就是**纯文本，每行一条记录，字段之间用逗号分隔**。
你甚至可以用记事本打开它。

### 2.2.1 最基础的读法

```python
import pandas as pd

# 最简单的读法：一个参数搞定
df = pd.read_csv("../data/sales_clean.csv")
print(df.shape)
print(df.head(3).to_string())
```

> 输出：
```text
(1064, 14)
        订单编号    订单日期 省份区域  城市  商品类别    商品名称     单价  数量  折扣    销售额  客户年龄 客户性别 支付方式  下单渠道
0  SO20230300508  2023-03-01     华东  杭州  家用电器  扫地机器人  3313.80     1  1.00   3313.80      32.0       男   支付宝  线下门店
1  SO20231100279  2023-11-28     西南  成都  手机数码    蓝牙耳机  2311.42     8  0.85  15717.66      28.0       女   支付宝    小程序
2  SO20231200633  2023-12-03     华东  杭州  食品饮料    坚果礼盒   299.33     3  0.95    853.09      31.0       女     花呗      网页
```

**注意第一列是 `0 1 2 ...`** —— 这是 pandas 自动生成的**行索引**，
不是数据里的列。原始 CSV 里并没有这一列。

### 2.2.2 `read_csv` 完整参数速查（重点）

这是**本章最重要的一张表**。真实工作里 90% 的读取问题都能靠这些参数解决：

| 参数 | 含义 | 什么时候用 | 示例值 |
|---|---|---|---|
| `sep` / `delimiter` | 字段分隔符 | 文件不是逗号分隔时 | `sep=";"`、`sep="\t"` |
| `encoding` | 文件编码 | **中文乱码必用** | `"utf-8-sig"`、`"gbk"`、`"utf-8"` |
| `header` | 表头在第几行 | 表头不在第一行 / 没有表头 | `header=0`（默认）、`header=2`、`header=None` |
| `names` | 自己指定列名 | 文件没表头时 | `names=["编号","城市","金额"]` |
| `index_col` | 用哪列当索引 | 有天然主键（如订单号） | `index_col="订单编号"` |
| `usecols` | 只读这些列 | **大文件提速省内存** | `usecols=["城市","销售额"]` |
| `dtype` | 指定列类型 | 防止订单号被当数字 / 省内存 | `dtype={"订单编号": str}` |
| `parse_dates` | 解析成日期类型 | 有日期列时**总是加** | `parse_dates=["订单日期"]` |
| `date_format` | 日期格式 | **pandas 3.0 混合格式必加** | `date_format="mixed"` |
| `na_values` | 哪些值算缺失 | 自定义缺失标记 | `na_values=["", "N/A", "-", "无"]` |
| `nrows` | 只读前 N 行 | **先探路，避免读错整个大文件** | `nrows=100` |
| `skiprows` | 跳过前 N 行 | 文件头有说明文字 | `skiprows=3` |
| `skipfooter` | 跳过末尾 N 行 | 文件末尾有合计行 | `skipfooter=2` |
| `encoding_errors` | 编码错误怎么处理 | 少数脏字符导致读不了 | `"ignore"`、`"replace"` |
| `thousands` | 千分位分隔符 | 数字写成 `"1,234"` | `thousands=","` |
| `decimal` | 小数点符号 | 欧洲格式用逗号做小数 | `decimal=","` |
| `comment` | 注释符号 | 跳过以某符号开头的行 | `comment="#"` |
| `chunksize` | 分块读取 | **文件大到内存放不下** | `chunksize=100000` |
| `on_bad_lines` | 坏行怎么处理 | 行内字段数不对 | `"skip"`、`"warn"` |

> 💡 **一条黄金习惯**：**第一次读一个陌生文件，永远先加 `nrows=100`（或者
> `nrows=5`）看一眼**，确认列名、分隔符、编码都对，再去掉 `nrows` 读全量。
> 直接读一个几 GB 的文件然后发现编码错了，是很浪费时间的事。

### 2.2.3 编码问题：中文乱码的根源与解法

**编码（encoding）** 是"文字 → 二进制"的映射规则。同一串中文，
用不同规则编码出来字节不同；**用错规则去解码，就会出现乱码**。

最常见的三种编码：

| 编码 | 特点 | 什么时候遇到 |
|---|---|---|
| `utf-8` | 国际标准，兼容所有语言 | 网页、现代系统、Linux/macOS |
| `utf-8-sig` | UTF-8 但**开头带 3 个字节的 BOM 标记** | **Excel 导出的 CSV**，Windows 常见 |
| `gbk` / `gb2312` / `gb18030` | 中文国标编码 | **老版本国产软件导出的文件** |

**实战演示**：我们准备了一个用 GBK 编码保存的文件，先用默认编码读它，必然失败：

```python
import pandas as pd

# sales_gbk.csv 是用 GBK 编码保存的，用默认的 utf-8 去读会报错
try:
    pd.read_csv("../data/sales_gbk.csv")
except Exception as e:
    print("报错类型:", type(e).__name__)
    print(str(e)[:200])
```

> 输出：
```text
报错类型: UnicodeDecodeError
'utf-8' codec can't decode byte 0xb6 in position 0: invalid start byte
```

**正确的解法：指定编码。**

```python
import pandas as pd

# 指定 GBK 编码，正常读出
df_gbk = pd.read_csv("../data/sales_gbk.csv", encoding="gbk")
print("读取成功:", df_gbk.shape)
print(df_gbk["城市"].head(4).tolist())
```

> 输出：
```text
读取成功: (1230, 14)
['杭州', '上海', '成都', '杭州']
```

**反过来，Excel 导出的 CSV 用 `utf-8` 读会出现诡异的首列名问题**：

```python
import pandas as pd

# sales.csv 是 utf-8-sig 编码（带 BOM），用纯 utf-8 读会怎样？
df_bad = pd.read_csv("../data/sales.csv", encoding="utf-8", nrows=3)
print("第一列的名字:", repr(df_bad.columns[0]))
```

> 输出：
```text
第一列的名字: '订单编号'
```

**看到 `\ufeff` 了吗？** 这就是 **BOM**（字节顺序标记）被当成了第一个列名的一部分。
后果是：你写 `df["订单编号"]` 会报 `KeyError`，非常难排查。

```python
import pandas as pd

# 正确做法：用 utf-8-sig 读，pandas 会自动去掉 BOM
df_ok = pd.read_csv("../data/sales.csv", encoding="utf-8-sig", nrows=3)
print("第一列的名字:", repr(df_ok.columns[0]))
print(df_ok.shape)
```

> 输出：
```text
第一列的名字: '订单编号'
(3, 14)
```

> 💡 **一条经验法则**：
> - **中文 CSV 优先试 `encoding="utf-8-sig"`**（它同时兼容普通 utf-8，因为不带 BOM 时也能正常读）
> - 失败就试 `"gbk"`
> - 再失败试 `"gb18030"`（GBK 的超集，覆盖更全）
> - 还不行就用 `encoding_errors="replace"` 强行读进来，把脏字符替换掉

如果实在不确定编码是什么，可以用 Python 猜一下：

```python
# 读取文件的前几十个字节，人肉判断编码特征
with open("../data/sales_gbk.csv", "rb") as f:
    raw = f.read(40)
print("前 10 个字节的十六进制:", raw[:10].hex(" "))
print("能否用 utf-8 解码:", end=" ")
try:
    raw.decode("utf-8")
    print("能")
except UnicodeDecodeError:
    print("不能 → 大概率是 GBK/GB18030 系列")
```

> 输出：
```text
前 10 个字节的十六进制: b6 a9 b5 a5 b1 e0 ba c5 2c b6
能否用 utf-8 解码: 不能 → 大概率是 GBK/GB18030 系列
```

> 💡 上面这个判断方法不严谨（只看前 40 字节，中文恰好落在 ASCII 范围就会误判）。
> 真实工作中更可靠的做法是：**列几个候选编码依次 try，哪个成功用哪个**。
> 第 9 章的项目里我们会封装一个这样的函数。

### 2.2.4 没有表头 / 分隔符不是逗号

```python
import pandas as pd

# sales_noheader.csv：没有表头，而且用分号分隔
df = pd.read_csv(
    "../data/sales_noheader.csv",
    sep=";",                # 分隔符是分号，不是逗号
    header=None,            # 明确告诉 pandas "没有表头"
    names=["订单编号", "城市", "商品类别", "销售额"],   # 自己起列名
    nrows=3,
)
print(df.to_string(index=False))
```

> 输出：
```text
     订单编号 城市 商品类别   销售额
SO20230300508 杭州 家用电器  3313.80
SO20231100279 成都 手机数码 15717.66
SO20231200633 杭州 食品饮料   853.09
```

> ⚠️ **不加 `header=None` 会怎样？** pandas 会把第一行数据当成列名，
> 你的数据就少了一行，而且列名变成 `SO20241201063` 这种，后面全部乱套。
> **判断依据**：如果读出来的 `columns` 看起来像数据，那就是漏了 `header=None`。

### 2.2.5 表头不在第一行

真实 Excel/CSV 经常在前面几行放标题、说明、生成时间。
处理方法是 `skiprows`：

```python
import pandas as pd

# 假设文件前 2 行是说明文字，真正的表头在第 3 行
df = pd.read_csv("../data/sales_clean.csv", skiprows=2, nrows=3)
print("跳过后第一列名:", df.columns[0], "| 行数:", len(df))
```

> 输出：
```text
跳过后第一列名: SO20231100279 | 行数: 3
```

**注意**：跳过了 2 行之后，真正的列名行也被当成数据了，所以列名变成了
`订单编号, 2023-03-01, ...` 这种（第一列名变成"订单日期"是巧合）。

**更精确的做法**是用 `header` 指定表头行号（0 基），它会自动跳过前面的行：

```python
import pandas as pd

# header=0 表示"第 1 行是表头"（默认）；用 header=None 才是"没有表头"
# 假设真正的表头在第 3 行（索引 2），则写 header=2
df = pd.read_csv("../data/sales_clean.csv", header=0, nrows=3)
print(df.columns.tolist()[:4])
```

> 输出：
```text
['订单编号', '订单日期', '省份区域', '城市']
```

> 💡 **`skiprows` 和 `header` 的区别**：
> - `skiprows=N`：**无条件丢弃**前 N 行，然后把接下来的第一行当表头；
> - `header=N`：把**第 N+1 行**当表头（前面的行自动被跳过）。
>
> 实践中**优先用 `header`**，语义更清楚。只有"要跳的行数 ≠ 表头位置"时才用 `skiprows`。

### 2.2.6 只读需要的部分（大文件必备）

假设你有一个 20640 行的房价数据集，但你只关心三个字段：

```python
# 计时类输出每次都不一样，不自动回填 -->
import pandas as pd
import time

# 全读
t0 = time.perf_counter()
full = pd.read_csv("../data/california_housing.csv")
t_full = time.perf_counter() - t0

# 只读 3 列
t0 = time.perf_counter()
part = pd.read_csv(
    "../data/california_housing.csv",
    usecols=["longitude", "latitude", "median_house_value"],   # 只要 3 列
)
t_part = time.perf_counter() - t0

print(f"全读    : {full.shape}  耗时 {t_full * 1000:.0f} ms")
print(f"只读3列 : {part.shape}  耗时 {t_part * 1000:.0f} ms")
print(f"内存占用 全读 {full.memory_usage(deep=True).sum() / 1024:.0f} KB，"
      f"只读3列 {part.memory_usage(deep=True).sum() / 1024:.0f} KB")
```

> 输出：
```text
全读    : (20640, 10)  耗时 19 ms
只读3列 : (20640, 3)  耗时 15 ms
内存占用 全读 1775 KB，只读3列 484 KB
```

数据只有 2 万行，所以提速不明显。**但如果是 2000 万行，差距就是分钟级的**，
而且内存占用直接决定"能不能跑得起来"。

**其他省资源的参数**：

```python
import pandas as pd

# dtype 指定类型能大幅省内存：把重复的字符串列声明成 category
df = pd.read_csv(
    "../data/sales_clean.csv",
    usecols=["城市", "省份区域", "商品类别", "销售额"],
    dtype={"城市": "category", "省份区域": "category", "商品类别": "category"},
)
print(df.dtypes)
mem_cat = df.memory_usage(deep=True).sum() / 1024

# 对比：不声明类型
df2 = pd.read_csv(
    "../data/sales_clean.csv",
    usecols=["城市", "省份区域", "商品类别", "销售额"],
)
mem_str = df2.memory_usage(deep=True).sum() / 1024

print(f"\ncategory 类型内存: {mem_cat:.0f} KB")
print(f"普通 str 类型内存: {mem_str:.0f} KB")
print(f"省了 {1 - mem_cat / mem_str:.0%}")
```

> 输出：
```text
省份区域    category
城市        category
商品类别    category
销售额       float64
dtype: object

category 类型内存: 12 KB
普通 str 类型内存: 58 KB
省了 79%
```

> 💡 **`category` 类型是什么？** 当一列只有少数几种重复取值时（比如"城市"只有 8 种），
> pandas 不再重复存储每个字符串，而是**存一份字典 + 每行存一个编号**。
> 效果：内存省 60%~90%，`groupby` 还更快。
> **代价**：不能随便做字符串运算（要先 `.astype(str)`）。
> **判断标准**：**不重复取值数 / 总行数 < 50%** 就适合用 category。

### 2.2.7 分块读超大文件

如果文件比内存还大，用 `chunksize` 分块处理：

```python
import pandas as pd

# 分块读：每次只处理 5000 行，累加统计
total_rows = 0
total_value = 0.0
city_count = {}

for chunk in pd.read_csv("../data/california_housing.csv",
                         usecols=["ocean_proximity", "median_house_value"],
                         chunksize=5000):
    total_rows += len(chunk)
    total_value += chunk["median_house_value"].sum()
    # 累积每个类别的数量
    for k, v in chunk["ocean_proximity"].value_counts().items():
        city_count[k] = city_count.get(k, 0) + v

print("总行数:", total_rows)
print("房价总和: {:,.0f}".format(total_value))
print("平均房价: {:,.0f}".format(total_value / total_rows))
print("临海类型分布:", city_count)
```

> 输出：
```text
总行数: 20640
房价总和: 4,269,504,061
平均房价: 206,856
临海类型分布: {'INLAND': 6551, '<1H OCEAN': 9136, 'NEAR BAY': 2290, 'NEAR OCEAN': 2658, 'ISLAND': 5}
```

**分块处理的思维模式**：**不要"先全部读进来再算"，而是"读一块算一块，累加结果"。**
这就是**流式处理**（streaming）思想，也是大数据框架（Spark、Flink）的核心思路。

### 2.2.8 写出 CSV

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv")

# 汇总后写出去
summary = (df.groupby("省份区域")
             .agg(订单数=("订单编号", "count"), 销售额=("销售额", "sum"))
             .round(2)
             .reset_index())

summary.to_csv(
    "../data/_out_region.csv",
    index=False,             # 【重要】不要写行索引，否则会多一列没名字的 0,1,2
    encoding="utf-8-sig",    # 【重要】让 Excel 打开不乱码
)
print("已写出:", summary.shape)
print(summary.to_string(index=False))
```

> 输出：
```text
已写出: (6, 3)
省份区域  订单数    销售额
    华东     334 437015.73
    华中      73 106733.83
    华北     173 324090.24
    华南     325 509605.32
    西北      60  83828.10
    西南      99 130822.67
```

**写出时的两个必设参数**：

| 参数 | 为什么必须设 |
|---|---|
| `index=False` | 不加的话会多出一列 `Unnamed: 0`，把行号当数据存了 |
| `encoding="utf-8-sig"` | 不加的话用 Excel 打开中文会乱码（Excel 默认按 GBK 解读） |

> 💡 跑完记得删除演示文件 `../data/_out_region.csv`，别污染数据集目录。

---

## 2.3 读写 Excel

Excel 文件（`.xlsx`）本质是一个**压缩包**，里面装着 XML。
所以它比 CSV **慢很多、也大很多**，但优点是：**人类友好**（能带格式、多工作表、公式）。

> 📌 **重要区分**：
> - `.xlsx` / `.xlsm`：现代 Excel 格式，用 `openpyxl` 引擎读（本机已装）
> - `.xls`：2003 老格式，需要 `xlrd` 引擎（**注意：新版 xlrd 已不支持 xlsx**）
> - `.csv`：不是 Excel 文件，只是文本文件（只是 Excel 能打开它）

### 2.3.1 查看一个 Excel 里有哪些工作表

```python
import pandas as pd

# 用 ExcelFile 先"探路"，列出所有工作表名
# 用 with 打开是好习惯：退出时自动释放文件句柄（Windows 上尤其重要，见 2.13 答案 3）
with pd.ExcelFile("../data/销售与会员.xlsx") as xl:
    print("工作表列表:", xl.sheet_names)
```

> 输出：
```text
工作表列表: ['销售明细', '会员信息', '品类目标']
```

**这一步非常关键**：拿到一个 Excel，**永远先看它有哪些工作表**，
否则你会花时间猜工作表叫什么名字。

### 2.3.2 读单个工作表

```python
import pandas as pd

# sheet_name 可以是工作表名，也可以是编号（0 表示第一个）
sheet1 = pd.read_excel("../data/销售与会员.xlsx", sheet_name="销售明细")
sheet2 = pd.read_excel("../data/销售与会员.xlsx", sheet_name="会员信息")

print("销售明细:", sheet1.shape)
print("会员信息:", sheet2.shape)
print("\n销售明细前 2 行:")
print(sheet1.head(2).to_string())
```

> 输出：
```text
销售明细: (300, 14)
会员信息: (500, 7)

销售明细前 2 行:
        订单编号    订单日期 省份区域  城市  商品类别    商品名称    单价 数量  折扣  销售额  客户年龄 客户性别 支付方式  下单渠道
0  SO20230300508  2023/03/01     华东  杭州  家用电器  扫地机器人  3313.8    1   1.0  3313.8      32.0       男   支付宝  线下门店
1  SO20240100741  2024-01-22     华东  上海  家用电器      电饭煲  1881.7    1   0.7     NaN      38.0       女     花呗      网页
```

### 2.3.3 一次读所有工作表

```python
import pandas as pd

# sheet_name=None 表示"读全部"，返回一个字典 {工作表名: DataFrame}
all_sheets = pd.read_excel("../data/销售与会员.xlsx", sheet_name=None)

for name, sheet in all_sheets.items():
    print(f"{name:10} 形状 {sheet.shape}  列名前4个: {sheet.columns.tolist()[:4]}")
```

> 输出：
```text
销售明细       形状 (300, 14)  列名前4个: ['订单编号', '订单日期', '省份区域', '城市']
会员信息       形状 (500, 7)  列名前4个: ['会员编号', '年消费金额', '年消费次数', '客单价']
品类目标       形状 (7, 3)  列名前4个: ['Unnamed: 0', 'Unnamed: 1', 'Unnamed: 2']
```

**注意"品类目标"读出来的列名是 `Unnamed: 0` 之类的吗？** 不是，
上面显示列名正常？我们再仔细看一下这个工作表：

```python
import pandas as pd

# 直接读"品类目标"，不加任何参数
raw = pd.read_excel("../data/销售与会员.xlsx", sheet_name="品类目标")
print("列名:", raw.columns.tolist())
print(raw.to_string(index=False))
```

> 输出：
```text
列名: ['Unnamed: 0', 'Unnamed: 1', 'Unnamed: 2']
Unnamed: 0 Unnamed: 1 Unnamed: 2
       NaN        NaN        NaN
  商品类别     负责人 目标销售额
  手机数码       张伟    1200000
  家用电器       李静     900000
  服饰鞋包       王强     700000
  食品饮料       赵敏     500000
  图书文娱       陈晨     200000
```

**问题暴露了**：这个工作表的**第 1 行是标题说明，第 2 行才是真正的表头**，
所以直接读会得到 `Unnamed: 1` 这种垃圾列名，而且第一行数据是说明文字。

**正确解法：`skiprows`。**

```python
import pandas as pd

# 跳过前 2 行（标题行 + 空行），第 3 行才是真正的表头
target = pd.read_excel("../data/销售与会员.xlsx",
                       sheet_name="品类目标",
                       skiprows=2)
print("列名:", target.columns.tolist())
print(target.to_string(index=False))
```

> 输出：
```text
列名: ['商品类别', '负责人', '目标销售额']
商品类别 负责人  目标销售额
手机数码   张伟     1200000
家用电器   李静      900000
服饰鞋包   王强      700000
食品饮料   赵敏      500000
图书文娱   陈晨      200000
```

**这就是真实 Excel 最常见的坑**：报表类 Excel 都喜欢在顶部加标题、单位说明、
生成日期。**处理手法永远是"先读一次看结构，再决定 skiprows 多少"**。

### 2.3.4 Excel 读取参数速查

| 参数 | 含义 | 示例 |
|---|---|---|
| `sheet_name` | 工作表名/编号/列表/None | `"销售明细"`、`0`、`["表1","表2"]`、`None`（全部） |
| `header` | 表头行号 | `header=2` |
| `skiprows` | 跳过前 N 行 | `skiprows=2` |
| `usecols` | 只读这些列 | `usecols="A:C"` 或 `usecols=["城市","销售额"]` |
| `dtype` | 指定类型 | `dtype={"订单编号": str}` |
| `na_values` | 缺失值标记 | `na_values=["N/A","无"]` |
| `nrows` | 只读前 N 行 | `nrows=100` |
| `engine` | 读取引擎 | `"openpyxl"`（xlsx）、`"xlrd"`（xls）、`"calamine"`（很快） |

### 2.3.5 写 Excel（可以多工作表）

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])

region = df.groupby("省份区域").agg(
    订单数=("订单编号", "count"), 销售额=("销售额", "sum")).round(2).reset_index()
category = df.groupby("商品类别").agg(
    订单数=("订单编号", "count"), 销售额=("销售额", "sum")).round(2).reset_index()

# ExcelWriter 是"写多工作表"的标准方式
with pd.ExcelWriter("../data/_out_report.xlsx", engine="openpyxl") as writer:
    region.to_excel(writer, sheet_name="区域汇总", index=False)
    category.to_excel(writer, sheet_name="品类汇总", index=False)
    # 还可以再写一个"说明"工作表
    pd.DataFrame({
        "项目": ["数据来源", "生成时间", "口径说明"],
        "内容": ["sales_clean.csv", "2025-01-01", "销售额为实付金额，含折扣，不含退款"],
    }).to_excel(writer, sheet_name="说明", index=False)

print("已写出 3 个工作表")
# 验证一下
xl = pd.ExcelFile("../data/_out_report.xlsx")
print("工作表:", xl.sheet_names)
```

> 输出：
```text
已写出 3 个工作表
工作表: ['区域汇总', '品类汇总', '说明']
```

> 💡 **给非技术同事交付数据时，Excel 多工作表 + 一个"说明"页是很好的实践**——
> 把口径、数据来源、生成时间写清楚，能省掉大量沟通成本。

### 2.3.6 Excel vs CSV 怎么选

| | CSV | Excel |
|---|---|---|
| 速度 | 快 | 慢（10 倍以上） |
| 体积 | 小 | 大（3~5 倍） |
| 行数上限 | 无 | 约 104 万行 |
| 多工作表 | ❌ | ✅ |
| 格式/公式/图表 | ❌ | ✅ |
| 保留数据类型 | ❌（全变文本） | ✅ |
| 是否给人看 | 一般 | ✅ 友好 |

**结论**：
- **机器读写、中间结果 → CSV 或 Parquet**
- **交付给人看 → Excel**
- 数据超过 100 万行 → 别用 Excel 交付，用 CSV 或者数据库

---

## 2.4 读写 JSON

**JSON**（JavaScript Object Notation）是**接口数据的事实标准**。
它的特点是**能表达嵌套结构**——一个订单里可以有"多件商品"，
这在二维表格里很难直接存放（表格只能"一个订单一行"）。

### 2.4.1 认识 JSON 的两种结构

```text
① 对象（object）：用花括号 {}，是"键值对"集合 —— 相当于 Python 的字典
   {"city": "北京", "amount": 12500}

② 数组（array）：用方括号 []，是有序列表 —— 相当于 Python 的列表
   [{"city": "北京"}, {"city": "上海"}]
```

我们的 `orders.json` 就是"数组里装对象，对象里又嵌套对象和数组"：

```python
import json
from pathlib import Path

# 用 Python 标准库 json 读进来看看结构
text = Path("../data/orders.json").read_text(encoding="utf-8")
data = json.loads(text)

print("顶层类型:", type(data).__name__, "| 元素个数:", len(data))
print("\n第一个订单的完整结构:")
print(json.dumps(data[0], ensure_ascii=False, indent=2))
```

> 输出：
```text
顶层类型: list | 元素个数: 40

第一个订单的完整结构:
{
  "orderId": "SO20230300508",
  "orderTime": "2023-03-01",
  "customer": {
    "age": 32,
    "gender": "男",
    "city": "杭州"
  },
  "items": [
    {
      "name": "扫地机器人",
      "qty": 1,
      "price": 3313.8,
      "category": "家用电器"
    },
    {
      "name": "蓝牙耳机",
      "qty": 1,
      "price": 299.0,
      "category": "手机数码"
    }
  ],
  "payment": {
    "method": "支付宝",
    "channel": "线下门店",
    "discount": 1.0
  },
  "amount": 3313.8
}
```

**关键观察**：`customer`、`payment` 是嵌套对象，`items` 是**数组**（一个订单多件商品）。
**这种结构没法直接放进一张平面表**，必须先"摊平"。

### 2.4.2 直接读：`pd.read_json`

```python
import pandas as pd

df = pd.read_json("../data/orders.json")
print("形状:", df.shape)
print("列名:", df.columns.tolist())
print("\n前 2 行的 customer 列:")
print(df["customer"].head(2).tolist())
```

> 输出：
```text
形状: (40, 6)
列名: ['orderId', 'orderTime', 'customer', 'items', 'payment', 'amount']

前 2 行的 customer 列:
[{'age': 32, 'gender': '男', 'city': '杭州'}, {'age': 28, 'gender': '女', 'city': '成都'}]
```

**问题**：`customer` 列里装的是**字典**，`items` 列里装的是**列表**。
这样的列没法直接分析（算不了、分不了组）。**必须摊平。**

### 2.4.3 摊平嵌套 JSON：`pd.json_normalize` ★（本节核心）

**`pd.json_normalize` 是处理嵌套 JSON 的终极武器**，一定要掌握。

**用法 1：默认摊平（嵌套对象变成"点号连接"的列名）**

```python
import pandas as pd
import json

recs = json.loads(open("../data/orders.json", encoding="utf-8").read())

flat = pd.json_normalize(recs)
print("形状:", flat.shape)
print("列名:", flat.columns.tolist())
print()
print(flat[["orderId", "customer.city", "customer.age",
            "payment.method", "amount"]].head(3).to_string(index=False))
```

> 输出：
```text
形状: (40, 10)
列名: ['orderId', 'orderTime', 'items', 'amount', 'customer.age', 'customer.gender', 'customer.city', 'payment.method',
   'payment.channel', 'payment.discount']

      orderId customer.city  customer.age payment.method   amount
SO20230300508          杭州            32         支付宝  3313.80
SO20231100279          成都            28         支付宝 15717.66
SO20231200633          杭州            31           花呗   853.09
```

**效果**：`customer.city` 这种"点号列名"就能直接用了。
但注意 **`items` 列还是列表**，因为它是一对多的数组。

**用法 2：摊平数组（一对多会变成长表）**

```python
import pandas as pd
import json

recs = json.loads(open("../data/orders.json", encoding="utf-8").read())

# record_path 指定"要展开哪个数组"
# meta 指定"从上层带哪些字段下来"
items = pd.json_normalize(
    recs,
    record_path="items",                        # 展开 items 数组
    meta=["orderId", "amount"],                 # 每个商品行都带上订单号和金额
)
print("形状:", items.shape, "（40 个订单展开成 48 行，因为有的订单有 2 件商品）")
print(items.head(4).to_string(index=False))
```

> 输出：
```text
形状: (48, 6) （40 个订单展开成 48 行，因为有的订单有 2 件商品）
      name  qty   price category       orderId    amount
扫地机器人    1 3313.80 家用电器 SO20230300508    3313.8
  蓝牙耳机    1  299.00 手机数码 SO20230300508    3313.8
  蓝牙耳机    8 2311.42 手机数码 SO20231100279  15717.66
  蓝牙耳机    1  299.00 手机数码 SO20231100279  15717.66
```

**这是"一对多摊平"的标准做法**：一个订单 2 件商品 → 变成 2 行。
订单号会重复出现（表示"这两行属于同一个订单"）。

**用法 3：`meta` 里带出更深层的字段（用列表表示路径）**

```python
import pandas as pd
import json

recs = json.loads(open("../data/orders.json", encoding="utf-8").read())

items = pd.json_normalize(
    recs,
    record_path="items",
    meta=[
        "orderId",
        ["customer", "city"],       # 用列表表示嵌套路径 customer.city
        ["payment", "method"],      # payment.method
    ],
)
print("列名:", items.columns.tolist())
print()
print(items[["orderId", "customer.city", "name", "price", "category"]]
      .head(4).to_string(index=False))
```

> 输出：
```text
列名: ['name', 'qty', 'price', 'category', 'orderId', 'customer.city', 'payment.method']

      orderId customer.city       name   price category
SO20230300508          杭州 扫地机器人 3313.80 家用电器
SO20230300508          杭州   蓝牙耳机  299.00 手机数码
SO20231100279          成都   蓝牙耳机 2311.42 手机数码
SO20231100279          成都   蓝牙耳机  299.00 手机数码
```

**用法 4：合成"商品明细表"（实战场景：算各城市各品类销售额）**

```python
import pandas as pd
import json

recs = json.loads(open("../data/orders.json", encoding="utf-8").read())

# 目标：一张"商品级"明细表，能按城市和品类分组
items = pd.json_normalize(
    recs, record_path="items",
    meta=["orderId", ["customer", "city"], ["payment", "channel"]],
)
# 算出每件商品的小计
items["小计"] = items["qty"] * items["price"]

print("商品行数:", len(items))
print("\n按城市 × 品类看商品金额:")
print(items.pivot_table(index="customer.city", columns="category",
                        values="小计", aggfunc="sum", fill_value=0
                        ).round(0).to_string())
```

> 输出：
```text
商品行数: 48

按城市 × 品类看商品金额:
category       图书文娱  家用电器  手机数码  服饰鞋包  食品饮料
customer.city                                                  
上海                0.0    4011.0    4335.0      68.0      60.0
北京              203.0    5711.0   32381.0     675.0     157.0
广州               30.0    1437.0    3707.0     415.0       0.0
成都                0.0       0.0   21626.0       0.0       0.0
杭州              728.0    3314.0   35629.0     344.0    1237.0
武汉              100.0       0.0    2826.0     503.0       0.0
深圳                0.0    1351.0   10113.0       0.0       0.0
西安                0.0    7975.0     191.0       0.0       0.0
```

### 2.4.4 `json_normalize` 参数速查

| 参数 | 含义 | 示例 |
|---|---|---|
| `data` | 要摊平的数据（可以是 dict 或 list of dict） | `recs` |
| `record_path` | 要展开的数组路径 | `"items"`、`["a","b"]` |
| `meta` | 从上层带下来的字段（可用列表表示嵌套） | `["orderId", ["customer","city"]]` |
| `meta_prefix` | 给 meta 字段加前缀 | `"父_"` |
| `record_prefix` | 给展开字段加前缀 | `"商品_"` |
| `max_level` | 最多摊平几层 | `max_level=1` |
| `errors` | 路径不存在怎么办 | `"ignore"`、`"raise"` |
| `sep` | 多层字段用什么分隔 | `sep="_"`（默认 `"."`） |

### 2.4.5 JSON Lines（JSONL）：日志和大数据的常见格式

**JSON Lines** 是"**每行一个独立的 JSON 对象**"，没有外层的 `[]`。
它比单个大 JSON 数组更好，因为**可以逐行流式读取**（大文件友好）。

```python
import pandas as pd

# JSONL 用 lines=True 读
logs = pd.read_json("../data/logs.jsonl", lines=True)
print("形状:", logs.shape)
print(logs.head(3).to_string(index=False))
print("\n各事件级别统计:")
print(logs["level"].value_counts().to_string())
```

> 输出：
```text
形状: (30, 6)
        ts level         event       orderId city   amount
2023-03-01  WARN order_created SO20230300508 杭州  3313.80
2023-11-28  INFO order_created SO20231100279 成都 15717.66
2023-12-03  INFO order_created SO20231200633 杭州   853.09

各事件级别统计:
level
INFO    24
WARN     6
```

> ⚠️ **常见报错**：`ValueError: Expected object or value`
> **原因**：把一个普通 JSON（带外层 `[]` 或多个缩进行）当成 JSONL 读，
> 或者反过来，把 JSONL 当普通 JSON 读。
> **解决**：
> - 文件每行一个 `{...}` → 加 `lines=True`
> - 文件整体是一个 `[{...}, {...}]` → 不加 `lines=True`
> - 不确定就先 `open()` 看前两行长什么样。

### 2.4.6 写出 JSON

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv", nrows=5)

# 写成 JSON（默认 orient="records" 最常用：一个数组装若干对象）
df[["订单编号", "城市", "销售额"]].to_json(
    "../data/_out_records.json", orient="records", force_ascii=False, indent=2)

# 写成 JSONL（每行一个对象，适合流式/日志）
df[["订单编号", "城市", "销售额"]].to_json(
    "../data/_out_lines.json", orient="records", lines=True, force_ascii=False)

print("records 格式预览:")
print(open("../data/_out_records.json", encoding="utf-8").read()[:280])
print("\nlines 格式预览:")
print(open("../data/_out_lines.json", encoding="utf-8").read()[:220])
```

> 输出：
```text
records 格式预览:
[
  {
    "订单编号":"SO20230300508",
    "城市":"杭州",
    "销售额":3313.8
  },
  {
    "订单编号":"SO20231100279",
    "城市":"成都",
    "销售额":15717.66
  },
  {
    "订单编号":"SO20231200633",
    "城市":"杭州",
    "销售额":853.09
  },
  {
    "订单编号":"SO20241001045",
    "城市":"广州",
    "销售额":1006.24
  },

lines 格式预览:
{"订单编号":"SO20230300508","城市":"杭州","销售额":3313.8}
{"订单编号":"SO20231100279","城市":"成都","销售额":15717.66}
{"订单编号":"SO20231200633","城市":"杭州","销售额":853.09}
{"订单编号":"SO20241001045","城市":"广州","销售额":1006.24}
{"订单编号":"SO20230400518","
```

**`orient` 参数**决定了 JSON 长什么样：

| `orient` | 结构 | 什么时候用 |
|---|---|---|
| `"records"` | `[{列:值}, {列:值}]` | **最常用**，接口和前端最喜欢 |
| `"index"` | `{行索引: {列:值}}` | 需要保留索引 |
| `"columns"` | `{列: {行索引: 值}}` | 按列组织 |
| `"values"` | `[[值, 值], [值, 值]]` | 只要数据不要列名 |
| `"split"` | `{index:..., columns:..., data:...}` | pandas 自己的完整格式 |

> 💡 **`force_ascii=False` 一定要加**，否则中文会变成 `\u5317\u4eac` 这种转义序列
> （虽然也能读回来，但人看不懂）。

---

## 2.5 读写 Parquet

**Parquet** 是**列式存储**格式，是大数据领域的标准。

### 2.5.1 为什么要有 Parquet？

先理解**行式存储 vs 列式存储**：

```text
原始表格：
  订单号    城市   销售额
  A01      北京   100
  A02      上海   200
  A03      北京   150

行式存储（CSV / Excel / MySQL 默认）—— 一行一整块存：
  [A01, 北京, 100] [A02, 上海, 200] [A03, 北京, 150]
  ↑ 读"销售额"这一列，必须把所有行都读一遍，丢掉其他字段

列式存储（Parquet）—— 一列一整块存：
  [A01, A02, A03] [北京, 上海, 北京] [100, 200, 150]
  ↑ 读"销售额"只读最后一块，前面的完全不用碰
```

**列式存储的三个优势**：

1. **只读需要的列**：分析时经常只关心几列，"列式"能跳过其余数据，快很多；
2. **压缩率极高**：同一列的数据类型相同、重复值多（如"北京、北京、上海"），
   压缩后体积常常只有 CSV 的 **1/3**；
3. **保留数据类型**：日期还是日期、整数还是整数，不用每次重新解析。

**实测对比**（我们的销售数据）：

```python
import pandas as pd
from pathlib import Path

csv_path = Path("../data/sales.csv")
pq_path = Path("../data/sales.parquet")

print(f"CSV     体积: {csv_path.stat().st_size / 1024:.0f} KB")
print(f"Parquet 体积: {pq_path.stat().st_size / 1024:.0f} KB")
print(f"Parquet 只有 CSV 的 {pq_path.stat().st_size / csv_path.stat().st_size:.0%}")
```

> 输出：
```text
CSV     体积: 134 KB
Parquet 体积: 41 KB
Parquet 只有 CSV 的 30%
```

### 2.5.2 读写速度对比（附一个诚实的说明）

```python
# 计时类输出每次都不一样，不自动回填 -->
import pandas as pd
import time

# 先把两个引擎都"预热"一遍：第一次读 Parquet 时 pyarrow 要做初始化，
# 会额外花上百毫秒，那个数字不代表真实性能。做基准测试一定要先热身。
_ = pd.read_parquet("../data/sales.parquet")
_ = pd.read_csv("../data/sales.csv")

N = 20
t0 = time.perf_counter()
for _ in range(N):
    df_csv = pd.read_csv("../data/sales.csv")
t_csv = time.perf_counter() - t0

t0 = time.perf_counter()
for _ in range(N):
    df_pq = pd.read_parquet("../data/sales.parquet")
t_pq = time.perf_counter() - t0

print(f"读 CSV     {N} 次总耗时 {t_csv * 1000:.0f} ms，平均 {t_csv / N * 1000:.1f} ms/次")
print(f"读 Parquet {N} 次总耗时 {t_pq * 1000:.0f} ms，平均 {t_pq / N * 1000:.1f} ms/次")
print(f"Parquet 快 {t_csv / t_pq:.1f} 倍")
print("注：CSV 是 1230 行（脏数据），Parquet 是 1064 行（已清洗），行数本来就不同")
```

> 输出：
```text
读 CSV     20 次总耗时 118 ms，平均 5.9 ms/次
读 Parquet 20 次总耗时 71 ms，平均 3.5 ms/次
Parquet 快 1.7 倍
注：CSV 是 1230 行（脏数据），Parquet 是 1064 行（已清洗），行数本来就不同
```

#### 💡 关于"Parquet 快 10 倍"这种说法，要说句实话

网上很多文章说 Parquet 比 CSV 快 10 倍，**但上面实测只有 1.7 倍**。为什么？

因为**我们的数据太小了**（1000 多行）：

1. **固定开销占比大**：不管什么格式，都要"打开文件 + 初始化引擎"，
   这部分开销在小文件上占了大头；
2. **文件小到能进系统缓存**：第二次读 CSV 其实是从内存缓存读的，不是从硬盘，
   所以 CSV 也没那么慢；
3. **列式存储的优势要靠"只读部分列"才体现**：
   如果每次都要读全部 14 列，那列式和行式都得把所有数据搬一遍。

**列式存储真正的优势随规模放大**：

| 场景 | Parquet 相对 CSV |
|---|---|
| 1 千行 | 几乎没差别，甚至更慢（引擎初始化开销） |
| 100 万行 | 快约 3~5 倍 |
| 1 亿行 | 快 5~10 倍；**CSV 可能直接内存不够，根本跑不起来** |
| 只读 100 列中的 3 列 | **快 10 倍以上**（CSV 必须全读进来再丢掉不要的列） |

> 💡 **所以选 Parquet 的核心理由不是"快"，而是这三条**：
> 1. **类型保留**（日期就是日期，不用反复解析，也不会解析失败）——见下一小节
> 2. **体积小**（约 CSV 的 1/3，省磁盘也省传输）
> 3. **规模上去以后优势自然出现**（10 万行以上差距明显）
>
> **在 1000 行的数据上纠结"哪个格式快"，是没有意义的**（都是毫秒级）。
> 真正要养成的是习惯：**中间结果用 Parquet，最终交付看对象选格式。**

### 2.5.3 类型保留：Parquet 最被低估的优点

```python
import pandas as pd

df_csv = pd.read_csv("../data/sales.csv")
df_pq = pd.read_parquet("../data/sales.parquet")

print("从 CSV 读进来，日期列的类型是:", df_csv["订单日期"].dtype)
print("从 Parquet 读进来，日期列的类型是:", df_pq["订单日期"].dtype)
print()
print("从 CSV 读进来，数量列的类型是:", df_csv["数量"].dtype)
print("从 Parquet 读进来，数量列的类型是:", df_pq["数量"].dtype)
```

> 输出：
```text
从 CSV 读进来，日期列的类型是: str
从 Parquet 读进来，日期列的类型是: datetime64[us]

从 CSV 读进来，数量列的类型是: str
从 Parquet 读进来，数量列的类型是: int64
```

**注意**：CSV 没有类型概念，读进来日期变成字符串（还要手动解析，
而且我们的脏日期还会报错！），数量列因为混了 `"3件"` 变成 `object`。
Parquet 里 datetime 就是 datetime，读出来直接用。**这能省掉大量清洗工作。**

### 2.5.4 Parquet 的使用限制（必须知道）

| 限制 | 说明 | 应对 |
|---|---|---|
| **不能双击打开** | 它是二进制格式，不是文本 | 用 pandas 读，或者用专业工具（ParquetViewer） |
| **不能人工编辑** | 改一个值要重写整个文件 | 要手改就用 CSV |
| **不保留格式** | 没有字体、颜色 | 给人看用 Excel |
| **需要 pyarrow** | 写 Parquet 要装 `pyarrow` | 本机已装 25.0.1 |
| **对"全表扫描"不占优** | 如果你每列都要读，列式优势消失 | 全表分析用 CSV 也行 |

> ⚠️ **常见报错**：`ArrowInvalid: Could not convert '1件' with type str`
> **原因**：Parquet 是**强类型**的，一列只能有一个类型。
> 我们的 `数量` 列里混了字符串 `"3件"` 和数字，**写不进去**。
> **解决**：写之前先把列转成统一类型。
> ```python
> import pandas as pd
> df = pd.read_csv("../data/sales.csv")
> # 先把 "3件" 里的单位去掉并转成数值
> df["数量"] = pd.to_numeric(
>     df["数量"].astype(str).str.replace("件", "", regex=False), errors="coerce")
> print("转换后的类型:", df["数量"].dtype)
> ```
> 输出：
```text
转换后的类型: float64
```
> **这其实是个好事**：Parquet 的类型检查迫使你在存储前把数据洗干净，
> 而不是把脏数据一路传下去。

### 2.5.5 只读部分列（Parquet 的杀手锏）

```python
import pandas as pd

# 只读两列：Parquet 会跳过其余列的数据块，非常快
slim = pd.read_parquet("../data/sales.parquet",
                       columns=["城市", "销售额"])
print("形状:", slim.shape)
print(slim.head(3).to_string(index=False))
```

> 输出：
```text
形状: (1064, 2)
城市   销售额
杭州  3313.80
成都 15717.66
杭州   853.09
```

### 2.5.6 写出 Parquet

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])

# 写出 Parquet。compression 可选 snappy(默认,快) / gzip(更小,慢) / zstd(又快又小)
df.to_parquet("../data/_out.parquet", index=False, compression="snappy")

import os
print("已写出 _out.parquet:", os.path.getsize("../data/_out.parquet"), "字节")

# 读回来验证类型是否保留
back = pd.read_parquet("../data/_out.parquet")
print("读回后日期类型:", back["订单日期"].dtype)
print("形状:", back.shape)
```

> 输出：
```text
已写出 _out.parquet: 41614 字节
读回后日期类型: datetime64[us]
形状: (1064, 14)
```

---

## 2.6 从数据库取数（SQL）

**真实工作中的数据绝大多数在数据库里，不在 CSV 里。**
所以 SQL 是数据分析师的必备技能（和 pandas 同等重要）。

### 2.6.1 数据库、表、字段的概念

```text
数据库服务器（MySQL / PostgreSQL / SQLite ...）
  └── 数据库 database
        └── 表 table          ← 相当于一个 DataFrame
              ├── 字段 column  ← 相当于一列
              └── 记录 row     ← 相当于一行
```

**关系型数据库的核心特点**：数据分散在多张**表**里，通过**主键/外键**关联。
这正是为什么 pandas 需要 `merge`（第 4 章讲）——现实中数据就是分散的。

我们准备的 `company.db` 是一个 **SQLite** 数据库（Python 自带支持，
不需要装数据库服务），里面 3 张表：

| 表名 | 内容 |
|---|---|
| `sales` | 销售流水（1230 行 14 列，含脏数据） |
| `members` | 会员信息（500 行 7 列） |
| `products` | 商品档案（商品类别、名称、单价） |

### 2.6.2 连接数据库并查表

```python
import sqlite3
import pandas as pd

# 用 with 语句管理连接，退出时自动关闭（好习惯）
with sqlite3.connect("../data/company.db") as con:
    # 先看这个数据库里有哪些表
    tables = pd.read_sql(
        "SELECT name FROM sqlite_master WHERE type='table'", con)
    print("数据库里的表:", tables["name"].tolist())

    # 看表结构（每个字段的类型）
    schema = pd.read_sql("PRAGMA table_info(sales)", con)
    print("\nsales 表结构:")
    print(schema[["name", "type"]].to_string(index=False))
```

> 输出：
```text
数据库里的表: ['sales', 'members', 'products']

sales 表结构:
    name type
订单编号 TEXT
订单日期 TEXT
省份区域 TEXT
    城市 TEXT
商品类别 TEXT
商品名称 TEXT
    单价 REAL
    数量 TEXT
    折扣 REAL
  销售额 REAL
客户年龄 REAL
客户性别 TEXT
支付方式 TEXT
下单渠道 TEXT
```

> 💡 **SQLite 的一个特点**：即使你声明了 `DATETIME`，它也可能存成文本
> （SQLite 是"动态类型"）。所以要留意读出来的类型，必要时在 pandas 里再转一次。

### 2.6.3 基础 SQL 查询

```python
import sqlite3
import pandas as pd

with sqlite3.connect("../data/company.db") as con:
    # 查前 5 行
    df = pd.read_sql("SELECT * FROM sales LIMIT 5", con)
    print("前 5 行:", df.shape)
    print(df[["订单编号", "城市", "商品类别", "销售额"]].to_string(index=False))
```

> 输出：
```text
前 5 行: (5, 14)
     订单编号 城市 商品类别   销售额
SO20230300508 杭州 家用电器  3313.80
SO20240100741 上海 家用电器      NaN
SO20231100279 成都 手机数码 15717.66
SO20240800930 杭州 手机数码  2316.64
SO20231200633 杭州 食品饮料   853.09
```

**SQL 的四个基本子句**（记住顺序：SELECT → FROM → WHERE → GROUP BY → ORDER BY → LIMIT）：

```python
import sqlite3
import pandas as pd

with sqlite3.connect("../data/company.db") as con:
    result = pd.read_sql("""
        SELECT 省份区域,                               -- ① 选哪些列
               COUNT(*)                AS 订单数,      -- ② 聚合函数 + 起别名
               ROUND(SUM(销售额), 2)     AS 销售额合计,
               ROUND(AVG(销售额), 2)     AS 客单价,
               ROUND(MAX(销售额), 2)     AS 最大单笔
        FROM sales                                    -- ③ 从哪张表
        WHERE 销售额 > 0 AND 城市 IS NOT NULL           -- ④ 过滤条件
        GROUP BY 省份区域                               -- ⑤ 按什么分组
        ORDER BY 销售额合计 DESC                        -- ⑥ 排序
        LIMIT 10                                      -- ⑦ 只取前 10
    """, con)

print(result.to_string(index=False))
```

> 输出：
```text
省份区域  订单数  销售额合计  客单价  最大单笔
    华南     347   553528.32 1595.18  24543.80
    华东     361   470106.44 1302.23  24914.20
    华北     191   341412.17 1787.50  51083.44
    西南     110   145536.91 1323.06  15717.66
    华中      78   123246.71 1580.09  17628.16
    西北      71   116715.28 1643.88  24875.33
```

> 💡 **SQL 子句的书写顺序是固定的**，但**执行顺序不是**。实际执行顺序是：
> `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`。
> 理解这个顺序能解释很多疑惑，比如"为什么 `SELECT` 里起的别名不能在 `WHERE` 里用"
> （因为 `WHERE` 比 `SELECT` 先执行）。

### 2.6.4 SQL vs pandas：各自擅长什么

**这是本节最重要的知识点。** 两者都能做筛选和聚合，什么时候用哪个？

| 任务 | 推荐 | 原因 |
|---|---|---|
| 从千万行里筛出几万行 | **SQL** | 数据库有索引，只传输需要的数据 |
| 多表关联（JOIN） | **SQL** | 数据库的 JOIN 有优化器，且减少网络传输 |
| 简单聚合（求和、计数） | **SQL** | 数据不用搬到内存 |
| 复杂多步变换、透视 | **pandas** | SQL 写起来很啰嗦 |
| 画图、建模 | **pandas** | SQL 做不到 |
| 数据量小（几万行） | 都行 | 看哪个写着方便 |

**核心原则：能在数据库里做的过滤和聚合，就推给数据库做。**
因为"把 1000 万行拉到本地再筛出 1000 行"是非常低效的做法。

演示一下对比：

```python
# 计时类输出每次都不一样，不自动回填 -->
import sqlite3
import pandas as pd
import time

# 方式 A：全表拉回本地，再用 pandas 筛（低效做法）
with sqlite3.connect("../data/company.db") as con:
    t0 = time.perf_counter()
    all_data = pd.read_sql("SELECT * FROM sales", con)
    r1 = all_data[all_data["销售额"] > 5000].groupby("城市")["销售额"].sum()
    t_a = time.perf_counter() - t0

# 方式 B：在数据库里筛完再拿（高效做法）
with sqlite3.connect("../data/company.db") as con:
    t0 = time.perf_counter()
    r2 = pd.read_sql("""
        SELECT 城市, SUM(销售额) AS 销售额合计
        FROM sales
        WHERE 销售额 > 5000
        GROUP BY 城市
        ORDER BY 销售额合计 DESC
    """, con).set_index("城市")["销售额合计"]
    t_b = time.perf_counter() - t0

print(f"方式A（先全拉再筛）: {t_a * 1000:.1f} ms")
print(f"方式B（数据库端筛）: {t_b * 1000:.1f} ms")
print(f"\n两种方式结果是否一致: {abs(r1.sort_index() - r2.sort_index()).max() < 1e-6}")
print("\n方式B 的结果:")
print(r2.round(2).to_string())
```

> 输出：
```text
方式A（先全拉再筛）: 13.9 ms
方式B（数据库端筛）: 2.8 ms

两种方式结果是否一致: True

方式B 的结果:
城市
北京      191264.48
广州      151697.47
杭州      150644.84
深圳      125097.27
上海       70656.76
武汉       59690.62
西安       55609.93
成都       43184.35
 上海      13962.82
 杭州       7995.96
```

**在 1230 行的小数据上，方式 B 已经快 4 倍。** 想象一下 1000 万行：
方式 A 要把整个表传到内存（可能要几十秒 + 几个 GB 内存），
方式 B 只传输 8 行结果。

### 2.6.5 用 pandas 写回数据库

```python
import sqlite3
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])
summary = (df.groupby("省份区域")
             .agg(订单数=("订单编号", "count"), 销售额=("销售额", "sum"))
             .round(2).reset_index())

with sqlite3.connect("../data/company.db") as con:
    # if_exists: 'replace' 覆盖 / 'append' 追加 / 'fail' 已存在则报错
    summary.to_sql("region_summary", con, if_exists="replace", index=False)

    # 验证
    back = pd.read_sql("SELECT * FROM region_summary ORDER BY 销售额 DESC", con)
    print(back.to_string(index=False))

    # 用完把它删掉，别污染示例数据库
    con.execute("DROP TABLE region_summary")
    con.commit()

    remain = pd.read_sql("SELECT name FROM sqlite_master WHERE type='table'", con)
    print("\n清理后的表:", remain["name"].tolist())
```

> 输出：
```text
省份区域  订单数    销售额
    华南     325 509605.32
    华东     334 437015.73
    华北     173 324090.24
    西南      99 130822.67
    华中      73 106733.83
    西北      60  83828.10

清理后的表: ['sales', 'members', 'products']
```

### 2.6.6 连接其他数据库（MySQL / PostgreSQL）

本教程用 SQLite 是因为它零配置、Python 自带。**换成真实数据库只需改一步**：
用 **SQLAlchemy** 的"连接字符串"。

```python
# 真实项目里换数据库只需改"连接字符串"，其余 pandas 代码完全不变。
# 本机已装 sqlalchemy 2.0.54，下面给出真实字符串 + 一个可运行的等价演示。
from sqlalchemy import create_engine
import pandas as pd

# ---------- 真实数据库的连接字符串长这样（需要额外装对应驱动）----------
# MySQL      需要 pymysql 驱动
#   "mysql+pymysql://用户名:密码@主机:3306/数据库名?charset=utf8mb4"
# PostgreSQL 需要 psycopg2-binary 驱动
#   "postgresql+psycopg2://用户名:密码@主机:5432/数据库名"
# SQL Server 需要 pyodbc 驱动
#   "mssql+pyodbc://用户名:密码@主机/数据库名?driver=ODBC+Driver+17+for+SQL+Server"

# ---------- 本机可运行的等价演示：用 SQLAlchemy 连 SQLite ----------
engine = create_engine("sqlite:///../data/company.db")

# 用法和 sqlite3 完全一样，只是把连接对象从 con 换成 engine
df = pd.read_sql("SELECT 省份区域, SUM(销售额) AS 销售额合计 "
                 "FROM sales WHERE 销售额 > 0 "
                 "GROUP BY 省份区域 ORDER BY 销售额合计 DESC", engine)
print("SQLAlchemy 连接查询成功:")
print(df.round(2).to_string(index=False))
print("\n连接对象类型:", type(engine).__name__)
```

> 输出：
```text
SQLAlchemy 连接查询成功:
省份区域  销售额合计
    华南   553528.32
    华东   470106.44
    华北   341412.17
    西南   145536.91
    华中   123246.71
    西北   116715.28

连接对象类型: Engine
```

> 💡 **为什么推荐用 SQLAlchemy 而不是直接用 `sqlite3`？**
> 因为**它把"连接哪个数据库"这件事抽象掉了**：你的代码里只出现 `engine`，
> 换数据库时只改一行连接字符串，pandas 代码一行都不用动。
> 这就是"面向接口编程"，生产代码几乎都这么写。

**连接字符串格式记忆法**：

```text
方言+驱动://用户名:密码@主机:端口/数据库名?字符集参数
  │        │                      │
  │        │                      └─ 端口：MySQL 3306、PostgreSQL 5432
  │        └─ 认证信息
  └─ 例：mysql+pymysql、postgresql+psycopg2、sqlite
```

> 💡 **安全提醒**：**千万不要把数据库密码硬编码在代码里然后提交到 Git！**
> 正确做法是用环境变量或配置文件：
> ```python
> import os
> user = os.environ.get("DB_USER")
> pwd = os.environ.get("DB_PASSWORD")
> # 或者用 .env 文件 + python-dotenv 库
> ```

---

## 2.7 从网页抓数据

**网页抓取（Web Scraping）** = 用程序把网页上的内容提取成结构化数据。

### 2.7.1 先讲清楚：什么能抓、什么不能抓

| 情况 | 能抓吗 | 说明 |
|---|---|---|
| 政府/学校公开统计数据 | ✅ 可以 | 通常鼓励使用 |
| 学术数据集、开放数据平台 | ✅ 可以 | 有明确授权 |
| 自己公司的内部系统 | ✅ 可以 | 但要注意别给服务器压力 |
| 公开的商品价格 | ⚠️ 谨慎 | 可能违反网站服务条款 |
| 需要登录才能看的内容 | ❌ 不要 | 违反条款，可能涉及法律风险 |
| 个人隐私信息 | ❌ 绝对不能 | 违法 |
| 有明确反爬机制还绕过 | ❌ 不要 | 可能违法 |

**三条实操纪律**：

1. **先看网站的 `robots.txt`**（在网址后面加 `/robots.txt`），
   它声明了哪些路径允许/禁止抓取；
2. **控制频率**（每次请求之间 `sleep` 1 秒以上），别把人家服务器打挂；
3. **优先找官方 API**，比抓 HTML 稳定得多，也是网站希望你用的方式。

> 💡 **本教程的做法**：为了不依赖外网、也不给任何网站添麻烦，
> 我们**用一个本地 HTML 文件当靶子**（`data/demo_page.html`）。
> 抓取代码和抓真实网站**完全一样**，你学到的技能可以直接迁移。

### 2.7.2 网页三件套：HTML / CSS 选择器 / 请求

**HTML** 是网页的骨架，用**标签**表示内容：

```html
<table>                      <!-- 表格开始 -->
  <thead>                    <!-- 表头区 -->
    <tr><th>城市</th><th>销售额</th></tr>    <!-- th = 表头单元格 -->
  </thead>
  <tbody>                    <!-- 表体区 -->
    <tr><td>北京</td><td>12500</td></tr>     <!-- tr = 一行，td = 数据单元格 -->
    <tr><td>上海</td><td>9800</td></tr>
  </tbody>
</table>
```

| 标签 | 含义 |
|---|---|
| `<table>` | 表格 |
| `<tr>` | table row，一行 |
| `<th>` | table header，表头单元格 |
| `<td>` | table data，数据单元格 |
| `<div>` | 块级容器（最常用于布局） |
| `<span>` | 行内容器 |
| `<a href="...">` | 链接 |
| `<p>` | 段落 |
| `<ul>` / `<li>` | 无序列表 / 列表项 |

**属性**（写在标签里的 `key="value"`）是定位元素的关键，
最常见的是 `id` 和 `class`：

```html
<table id="city-sales" class="data-table">   <!-- id 唯一，class 可重复 -->
```

**CSS 选择器**就是"用属性来定位元素"的语法：

| 选择器 | 含义 | 例子 |
|---|---|---|
| `标签名` | 按标签 | `table`、`td` |
| `#id` | 按 id（唯一） | `#city-sales` |
| `.class` | 按 class | `.data-table` |
| `标签.类` | 组合 | `table.data-table` |
| `父 > 子` | 直接子元素 | `table > tbody` |
| `祖先 后代` | 任意后代 | `table td` |
| `[属性]` | 有某属性 | `[href]` |
| `:nth-child(n)` | 第 n 个子元素 | `tr:nth-child(2)` |

### 2.7.3 用 pandas 一行抓表格（最简单的方法）

**如果网页表格是标准 `<table>` 结构，pandas 能直接抓**：

```python
import pandas as pd

# read_html 会返回页面里所有表格组成的列表
tables = pd.read_html("../data/demo_page.html")
print("页面里共有", len(tables), "个表格")
print()
print("=== 第 1 个表格 ===")
print(tables[0].to_string(index=False))
```

> 输出：
```text
页面里共有 2 个表格

=== 第 1 个表格 ===
城市  订单数    销售额  平均客单价
上海     196 209239.09     1067.55
北京     173 324090.24     1873.35
广州     150 244136.20     1627.57
成都      99 130822.67     1321.44
杭州     138 227776.64     1650.56
武汉      73 106733.83     1462.11
深圳     175 265469.12     1516.97
西安      60  83828.10     1397.14
```

```python
import pandas as pd

tables = pd.read_html("../data/demo_page.html")
print("=== 第 2 个表格 ===")
print(tables[1].to_string(index=False))
```

> 输出：
```text
=== 第 2 个表格 ===
    学号    姓名       班级  总评成绩
20230001 学生001 计算机2301      88.2
20230002 学生002 计算机2302      70.6
20230003 学生003   软件2302      74.8
20230004 学生004   软件2302      86.7
20230005 学生005 计算机2302      79.2
20230006 学生006   软件2301      85.7
20230007 学生007 计算机2301      82.2
20230008 学生008 计算机2301      67.5
20230009 学生009   数据2301      76.6
20230010 学生010 计算机2302      74.1
```

**`pd.read_html` 的参数**：

| 参数 | 含义 | 示例 |
|---|---|---|
| `match` | 只取包含指定文字的表格 | `match="城市"` |
| `attrs` | 按 HTML 属性筛选表格 | `attrs={"id": "city-sales"}` |
| `header` | 表头在第几行 | `header=0` |
| `index_col` | 用哪列当索引 | `index_col=0` |
| `skiprows` | 跳过行 | `skiprows=1` |
| `na_values` | 缺失值标记 | `na_values=["-", "N/A"]` |
| `encoding` | 编码 | `"utf-8"` |

> ⚠️ **`pd.read_html` 只能处理静态 HTML 的 `<table>`**。
> 如果页面是用 JavaScript 动态渲染的（打开源码看不到数据），
> `read_html` 抓不到，需要换方案（见 2.7.6）。

### 2.7.4 用 requests + BeautifulSoup 精细抓取

`pd.read_html` 方便但不够灵活。真实网页里，表格常常不"规整"，
或者你要抓的根本不是表格（比如商品列表、文章标题）。
这时用 **`requests`（下载网页）+ `BeautifulSoup`（解析 HTML）**。

**第一步：下载网页**

```python
import requests
from pathlib import Path

# 用文件协议读取本地 HTML（等效于 requests.get 一个网址）
html_text = Path("../data/demo_page.html").read_text(encoding="utf-8")
print("网页字符数:", len(html_text))
print("前 300 个字符:")
print(html_text[:300])
```

> 输出：
```text
网页字符数: 2301
前 300 个字符:
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>示例数据页 · 城市销售汇总</title>
  <style>
    body { font-family: "Microsoft YaHei", sans-serif; margin: 24px; }
    table { border-collapse: collapse; margin-bottom: 32px; }
    th, td { border: 1px solid #ccc; padding: 6px 12px; t
```

**如果是真实网站，用 requests 下载**（这段代码需要联网，本教程不强制运行）：

```python
import requests

# 关键：加 User-Agent，很多网站会拒绝没有 UA 的请求
headers = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/120.0 Safari/537.36")
}
# resp = requests.get("https://example.com/data", headers=headers, timeout=10)
# resp.raise_for_status()                 # 如果状态码不是 200 就抛异常
# resp.encoding = resp.apparent_encoding  # 自动检测编码，防中文乱码
# html_text = resp.text

print("requests 的常用写法：")
print("  resp.status_code            状态码，200 表示成功")
print("  resp.raise_for_status()     非 200 时抛异常（推荐加）")
print("  resp.text                   返回文本（HTML）")
print("  resp.json()                 如果返回的是 JSON，直接解析成字典")
print("  resp.apparent_encoding      自动猜测编码，防乱码")
print("  timeout=10                  超时 10 秒（不设可能永久卡住）")
```

> 输出：
```text
requests 的常用写法：
  resp.status_code            状态码，200 表示成功
  resp.raise_for_status()     非 200 时抛异常（推荐加）
  resp.text                   返回文本（HTML）
  resp.json()                 如果返回的是 JSON，直接解析成字典
  resp.apparent_encoding      自动猜测编码，防乱码
  timeout=10                  超时 10 秒（不设可能永久卡住）
```

**第二步：用 BeautifulSoup 解析并定位元素**

```python
from bs4 import BeautifulSoup
from pathlib import Path
import pandas as pd

html_text = Path("../data/demo_page.html").read_text(encoding="utf-8")
soup = BeautifulSoup(html_text, "lxml")     # "lxml" 是解析器，比默认的快

# 定位：找到 id 为 city-sales 的表格
table = soup.find("table", id="city-sales")
print("找到表格:", table is not None)
print("表格标题:", table.find("caption").get_text(strip=True))

# 抓表头
headers = [th.get_text(strip=True) for th in table.find_all("th")]
print("表头:", headers)

# 抓数据行
rows = []
for tr in table.find("tbody").find_all("tr"):
    cells = [td.get_text(strip=True) for td in tr.find_all("td")]
    rows.append(cells)

print("数据行数:", len(rows))
print("第一行:", rows[0])
```

> 输出：
```text
找到表格: True
表格标题: 表 1：各城市销售汇总
表头: ['城市', '订单数', '销售额', '平均客单价']
数据行数: 8
第一行: ['上海', '196', '209239.09', '1067.55']
```

**第三步：组装成 DataFrame 并转换类型**

**这一步非常关键**：抓下来的 `get_text()` 拿到的**全是字符串**，
数字要自己转类型。

```python
from bs4 import BeautifulSoup
from pathlib import Path
import pandas as pd

html_text = Path("../data/demo_page.html").read_text(encoding="utf-8")
soup = BeautifulSoup(html_text, "lxml")
table = soup.find("table", id="city-sales")

headers = [th.get_text(strip=True) for th in table.find_all("th")]
rows = [[td.get_text(strip=True) for td in tr.find_all("td")]
        for tr in table.find("tbody").find_all("tr")]

df = pd.DataFrame(rows, columns=headers)
print("转换前的类型:")
print(df.dtypes.to_string())

# 把数值列从字符串转成数字
df["订单数"] = df["订单数"].astype(int)
df["销售额"] = df["销售额"].astype(float)
df["平均客单价"] = df["平均客单价"].astype(float)

print("\n转换后的类型:")
print(df.dtypes.to_string())
print("\n可以正常排序和计算了:")
print(df.sort_values("销售额", ascending=False).head(3).to_string(index=False))
print("\n销售额合计:", round(df["销售额"].sum(), 2))
```

> 输出：
```text
转换前的类型:
城市          str
订单数        str
销售额        str
平均客单价    str

转换后的类型:
城市              str
订单数          int64
销售额        float64
平均客单价    float64

可以正常排序和计算了:
城市  订单数    销售额  平均客单价
北京     173 324090.24     1873.35
深圳     175 265469.12     1516.97
广州     150 244136.20     1627.57

销售额合计: 1592095.89
```

> ⚠️ **抓网页最常见的坑：抓下来的数字是字符串。**
> 症状是"排序结果不对"（字符串排序是 `"10" < "9"`！）或者求和变成字符串拼接。
> **解决**：抓完立刻 `.astype()` 转类型，并检查 `dtypes`。

### 2.7.5 BeautifulSoup 常用方法速查

| 方法 | 作用 | 返回 |
|---|---|---|
| `soup.find("标签")` | 找**第一个**匹配的元素 | Tag 或 None |
| `soup.find("标签", id="x")` | 按 id 找 | Tag |
| `soup.find("标签", class_="x")` | 按 class 找（注意是 `class_`） | Tag |
| `soup.find_all("标签")` | 找**所有**匹配的元素 | 列表 |
| `soup.select("CSS选择器")` | 用 CSS 选择器找所有 | 列表 |
| `soup.select_one("CSS选择器")` | 用 CSS 选择器找第一个 | Tag 或 None |
| `tag.get_text(strip=True)` | 取纯文本（strip 去掉首尾空白） | 字符串 |
| `tag["href"]` / `tag.get("href")` | 取属性值 | 字符串 |
| `tag.parent` / `tag.parents` | 父元素 / 所有祖先 | Tag |
| `tag.find_next_sibling()` | 下一个兄弟元素 | Tag |
| `tag.attrs` | 所有属性的字典 | dict |

`select` 用 CSS 选择器，表达力更强，推荐优先用：

```python
from bs4 import BeautifulSoup
from pathlib import Path

soup = BeautifulSoup(Path("../data/demo_page.html").read_text(encoding="utf-8"), "lxml")

print("所有表格数:", len(soup.select("table")))
print("id 定位:", soup.select_one("#city-sales").find("caption").get_text(strip=True))
print("class 定位 footer 里的段落:")
for p in soup.select("div.footer p"):
    print("   ", p.get_text(strip=True))
print("表格的所有行（含表头）:", len(soup.select("#city-sales tr")))
print("只要第一列的城市名:", [td.get_text(strip=True)
                            for td in soup.select("#city-sales tbody tr td:first-child")])
```

> 输出：
```text
所有表格数: 2
id 定位: 表 1：各城市销售汇总
class 定位 footer 里的段落:
    数据仅供教学演示使用。
表格的所有行（含表头）: 9
只要第一列的城市名: ['上海', '北京', '广州', '成都', '杭州', '武汉', '深圳', '西安']
```

### 2.7.6 抓不到数据怎么办？（动态网页）

如果 `requests.get()` 拿到的 HTML 里**看不到你想要的数据**，
说明数据是**JavaScript 动态加载**的（现代网站很常见）。三种应对方案：

| 方案 | 做法 | 优缺点 |
|---|---|---|
| **找接口**（首选） | 打开浏览器 F12 → Network 面板 → 刷新 → 找 XHR/Fetch 请求 → 直接请求那个返回 JSON 的接口 | 最稳、最快；接口可能变化 |
| **Selenium / Playwright** | 用程序驱动真实浏览器，等 JS 执行完再取 HTML | 通用；但慢、重 |
| **找替代数据源** | 很多网站有官方 API 或开放数据下载 | 最省事 |

**"找接口"实操步骤**（这是最实用的技能）：

```text
1. Chrome 打开目标网页
2. 按 F12 打开开发者工具 → 切到 "网络/Network" 标签
3. 在筛选栏选 "Fetch/XHR"
4. 刷新页面（F5）
5. 逐个点击请求，看 "响应/Response" 里有没有你要的数据
6. 找到后右键 → Copy → Copy as cURL，或者直接看 Request URL
7. 用 requests.get(那个URL) 请求，resp.json() 直接拿到结构化数据
```

> 💡 你很快会发现：**很多网站的数据接口返回的就是 JSON**，
> 这比解析 HTML 简单一百倍。所以"抓数据"的最高境界是**根本不抓 HTML，直接找接口**。

---

## 2.8 调用 API 拿数据

**API**（Application Programming Interface）是网站/服务**官方提供的数据接口**。
相比抓网页，API 有三个好处：**稳定、合法、结构化**（通常直接返回 JSON）。

### 2.8.1 REST API 的样子

一个典型的 API 请求长这样：

```text
GET https://api.example.com/v1/orders?city=北京&start=2024-01-01&limit=100
    └──────┬──────┘└────┬────┘└──────────┬─────────────────┘
        请求方法       资源路径          查询参数（?key=value&...）
```

| 概念 | 说明 |
|---|---|
| **URL** | 接口地址 |
| **方法** | `GET` 取数据、`POST` 提交数据、`PUT` 更新、`DELETE` 删除 |
| **查询参数** | URL 里 `?` 后面的键值对，用来筛选/分页 |
| **请求头 Headers** | 认证信息（`Authorization: Bearer xxx`）、内容类型 |
| **请求体 Body** | POST 时提交的数据（通常是 JSON） |
| **状态码** | 200 成功、401 未认证、403 无权限、404 不存在、429 请求太频繁、500 服务器错误 |
| **响应** | 通常是 JSON |

### 2.8.2 用 requests 调用 API（带容错的写法）

下面这段代码**尝试联网**调用一个公开的测试接口。**如果网络不通也不会报错**，
因为我们在正文里教你怎么处理失败——这本身就是重要的一课。

```python
import requests
import pandas as pd

url = "https://httpbin.org/json"     # 一个公开的测试接口，返回固定 JSON

try:
    resp = requests.get(url, timeout=8)         # timeout 必设，否则可能永久卡住
    resp.raise_for_status()                    # 状态码非 200 时抛异常
    data = resp.json()                         # 把响应解析成 Python 字典
    print("请求成功，状态码:", resp.status_code)
    print("返回的顶层键:", list(data.keys()))
    print("\n部分内容:")
    print(data.get("slideshow", {}).get("title", "(无 title 字段)"))
except requests.exceptions.Timeout:
    print("请求超时：网络慢或接口无响应。生产代码里应该重试。")
except requests.exceptions.ConnectionError:
    print("连接失败：网络不通，或域名解析不了。")
except requests.exceptions.HTTPError as e:
    print(f"HTTP 错误：{e}（4xx 是你请求有问题，5xx 是对方服务器有问题）")
except Exception as e:
    print(f"其他错误：{type(e).__name__}: {e}")
```

> 输出：
```text
请求成功，状态码: 200
返回的顶层键: ['slideshow']

部分内容:
Sample Slide Show
```

**这段代码是一个"生产级"的模板**，值得记住：

| 要点 | 为什么 |
|---|---|
| `timeout=8` | 不设超时，程序可能永远卡在那里 |
| `raise_for_status()` | 4xx/5xx 时主动抛异常，而不是拿着错误内容继续跑 |
| 分类捕获异常 | 超时/连不上/HTTP 错误要分别处理，因为应对方式不同 |
| `resp.json()` | 直接得到字典，不用手动 `json.loads` |

### 2.8.3 带认证和分页的真实 API 写法（模板）

```python
# 下面是一个"真实项目会怎么写"的模板，本机不实际请求，只展示结构
import requests
import pandas as pd
import time

BASE = "https://api.example.com/v1"          # 换成真实接口地址
TOKEN = "your_token_here"                    # 真实项目从环境变量读，不要写死在代码里

headers = {
    "Authorization": f"Bearer {TOKEN}",      # 认证：Bearer token 是最常见的方式
    "Accept": "application/json",
}

def fetch_page(page=1, size=100):
    """取一页数据，返回 (数据列表, 是否还有下一页)"""
    resp = requests.get(
        f"{BASE}/orders",
        headers=headers,
        params={"page": page, "size": size},   # 用 params 传参，requests 会自动编码
        timeout=10,
    )
    resp.raise_for_status()
    payload = resp.json()
    return payload.get("data", []), payload.get("has_next", False)

def fetch_all(max_pages=50, sleep_sec=1.0):
    """翻页取全部数据。真实接口几乎都有限制，必须分页拿"""
    all_rows = []
    page = 1
    while page <= max_pages:
        rows, has_next = fetch_page(page)
        all_rows.extend(rows)
        print(f"  第 {page} 页取到 {len(rows)} 条，累计 {len(all_rows)} 条")
        if not has_next:
            break
        page += 1
        time.sleep(sleep_sec)      # 【重要】控制频率，别把对方服务器打挂
    return pd.DataFrame(all_rows)

print("分页抓取模板已定义，真实使用时把 BASE/TOKEN 换成自己的即可")
print("关键点：params 传参、timeout 必设、翻页、sleep 控频")
```

> 输出：
```text
分页抓取模板已定义，真实使用时把 BASE/TOKEN 换成自己的即可
关键点：params 传参、timeout 必设、翻页、sleep 控频
```

### 2.8.4 拿到 JSON 后怎么变成表：`json_normalize`

API 返回的 JSON 几乎总是嵌套的（第 2.4.3 节讲过 `json_normalize`）。
这里演示一个**完整的"API → DataFrame"链路**：

```python
import pandas as pd
import json

# 模拟一个 API 返回的嵌套 JSON（真实接口常见结构）
api_response = {
    "code": 0,
    "message": "success",
    "total": 3,
    "data": [
        {"id": 1, "city": "北京", "metrics": {"orders": 176, "gmv": 46287.23},
         "tags": ["一线", "北方"]},
        {"id": 2, "city": "上海", "metrics": {"orders": 184, "gmv": 58163.72},
         "tags": ["一线", "南方"]},
        {"id": 3, "city": "杭州", "metrics": {"orders": 142, "gmv": 34111.96},
         "tags": ["新一线", "南方"]},
    ],
}

# 关键：先取到数据所在的字段（通常是 data / result / items / records）
records = api_response["data"]
df = pd.json_normalize(records)
print("摊平后:")
print(df.to_string(index=False))
print("\n列名:", df.columns.tolist())

# 列表字段可以用 .str.join 拼成字符串
df["tags"] = df["tags"].str.join("、")
print("\n处理列表型字段后:")
print(df[["city", "metrics.gmv", "tags"]].to_string(index=False))
```

> 输出：
```text
摊平后:
 id city           tags  metrics.orders  metrics.gmv
  1 北京   [一线, 北方]             176     46287.23
  2 上海   [一线, 南方]             184     58163.72
  3 杭州 [新一线, 南方]             142     34111.96

列名: ['id', 'city', 'tags', 'metrics.orders', 'metrics.gmv']

处理列表型字段后:
city  metrics.gmv         tags
北京     46287.23   一线、北方
上海     58163.72   一线、南方
杭州     34111.96 新一线、南方
```

---

## 2.9 格式选型：到底该用什么格式存数据

这是本章的**总结性知识点**。工作里选错格式会带来长期的效率损失。

### 2.9.1 五种格式全面对比

| 维度 | CSV | Excel | JSON | JSONL | **Parquet** |
|---|---|---|---|---|---|
| 人类可读 | ✅ 好 | ✅ 最好 | ✅ 一般 | ⚠️ 费劲 | ❌ 二进制 |
| 文件体积 | 中 | **大**（3~5倍） | 大（有键名冗余） | 中 | **小**（约 CSV 的 1/3） |
| 读写速度 | 中 | **慢** | 慢 | 中 | **快**（5~10倍） |
| 保留数据类型 | ❌ | ✅ | ⚠️ 部分 | ⚠️ 部分 | **✅ 完美** |
| 支持嵌套结构 | ❌ | ❌ | **✅** | **✅** | ✅（有嵌套类型） |
| 支持部分列读取 | ⚠️ 要先读进来 | ⚠️ | ❌ | ❌ | **✅ 原生支持** |
| 能双击打开 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 能手动编辑 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 多工作表/多表 | ❌ | ✅ | ⚠️ | ❌ | ✅（分区） |
| 行数上限 | 无 | ~104万 | 无 | 无 | 无 |
| 依赖库 | 无 | openpyxl | 无 | 无 | pyarrow |

### 2.9.2 选型决策流程

```text
                     ┌──────────────────────┐
                     │ 这份数据的用途是什么？  │
                     └───────────┬──────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
   给人看/交付              给机器读写                需要交换/接口
   ─────────              ──────────              ─────────────
   Excel                  Parquet（首选）          JSON / JSONL
   （能带格式、            数据量大时尤其           （嵌套结构、
    多工作表）             快和小的优势明显）        跨语言通用）
        │                        │                        │
        └────────────────────────┴────────────────────────┘
                                 ▼
                     还需要兼容老系统 / 手工编辑？
                                 │
                    是 ──────────┴────────── 否
                     ▼                        ▼
                   CSV                    用上面的推荐
                （最通用，
                 但慢且丢类型）
```

### 2.9.3 三条实操建议

1. **中间结果一律用 Parquet。**
   你的分析流程通常是"读原始 → 清洗 → 存中间 → 建模 → 出结果"。
   中间的每一步之间用 Parquet 传递，能省掉大量重复解析时间，
   而且不会出现"日期被读成字符串"这种破事。

2. **交付给人用 Excel，交付给系统用 CSV 或 JSON。**
   给运营同事的周报用 Excel（带格式、带说明页）；
   给另一个系统对接用 CSV 或 JSON。

3. **原始数据一定要原样保留一份。**
   不管你怎么清洗，**永远保留原始文件不动**。
   因为你的清洗规则早晚会改，改完要能重跑。
   本教程的做法就是：`sales.csv`（原始脏数据）和 `sales_clean.csv`（清洗结果）**分开存**。

### 2.9.4 顺带一提：polars——更快的选择

pandas 在处理几千万行以上时会变慢、吃内存。**Polars** 是新一代的高性能表格库，
用 Rust 写的，语法和 pandas 相似但更快、更省内存。本机已装 polars 1.44.2：

```python
# 计时类输出每次都不一样，不自动回填 -->
import polars as pl
import time

# Polars 读 CSV 的写法（lazy 模式可以延迟执行，优化整个查询计划）
t0 = time.perf_counter()
pl_df = pl.read_csv("../data/sales.csv")
t_pl = time.perf_counter() - t0

print("Polars 读到:", pl_df.shape)
print(f"Polars 读 CSV 耗时: {t_pl * 1000:.1f} ms")

# Polars 的分组聚合（语法和 pandas 不同，用 .group_by + .agg）
result = (pl_df
          .filter(pl.col("销售额") > 0)
          .group_by("省份区域")
          .agg(pl.col("销售额").sum().alias("销售额合计"),
               pl.len().alias("订单数"))
          .sort("销售额合计", descending=True))
print("\nPolars 分组聚合结果:")
print(result)
```

> 输出：
```text
Polars 读到: (1230, 14)
Polars 读 CSV 耗时: 3.0 ms

Polars 分组聚合结果:
shape: (6, 3)
┌──────────┬────────────┬────────┐
│ 省份区域 ┆ 销售额合计 ┆ 订单数 │
│ ---      ┆ ---        ┆ ---    │
│ str      ┆ f64        ┆ u32    │
╞══════════╪════════════╪════════╡
│ 华南     ┆ 553528.32  ┆ 347    │
│ 华东     ┆ 470106.44  ┆ 361    │
│ 华北     ┆ 341412.17  ┆ 191    │
│ 西南     ┆ 145536.91  ┆ 110    │
│ 华中     ┆ 123246.71  ┆ 78     │
│ 西北     ┆ 116715.28  ┆ 71     │
└──────────┴────────────┴────────┘
```

> 💡 **该不该学 Polars？**
> **先把 pandas 学扎实**。pandas 生态最全、资料最多、和 sklearn/matplotlib
> 配合最好，是绝对的主流。**只有在数据大到 pandas 处理不动时才考虑 Polars**，
> 而且两者可以互转：
> ```python
> df_pandas = pl_df.to_pandas()          # Polars → pandas
> pl_df = pl.from_pandas(df_pandas)      # pandas → Polars
> ```
> 本教程后续章节全部用 pandas。Polars 作为"知道有这么个东西"就够了。

---

## 2.10 常见报错手册（本章专属）

| 报错 | 原因 | 解决 |
|---|---|---|
| `UnicodeDecodeError: 'utf-8' codec can't decode byte 0xb6` | 文件不是 UTF-8 编码 | 试 `encoding="gbk"` / `"gb18030"` |
| 首列名带 `\ufeff` | 文件带 BOM 标记 | 用 `encoding="utf-8-sig"` |
| `FileNotFoundError: [Errno 2] No such file or directory` | **路径不对**（最常见！） | 用 `import os; print(os.getcwd())` 看当前目录；确认是 `../data/x.csv` 还是 `data/x.csv` |
| `KeyError: '订单编号'` | 列名不匹配 | `print(df.columns.tolist())` 看真实列名；注意 BOM 和空格 |
| 读出来列名是 `Unnamed: 0` | ① 存的时候没加 `index=False` ② 文件没表头 ③ 表头不在第一行 | 分别用 `index_col=0` 丢弃 / `header=None`+`names=` / `header=N` |
| 读出来第一行数据变成了列名 | 文件没有表头，但你没说 | 加 `header=None` 和 `names=[...]` |
| 所有数据挤在一列里 | 分隔符不对 | 用 `sep="\t"` / `sep=";"` 等；先 `open()` 看真实分隔符 |
| `ValueError: Expected object or value`（read_json） | JSONL 当 JSON 读，或反之 | 每行一个对象 → `lines=True` |
| `ArrowInvalid: Could not convert '1件'` | Parquet 强类型，列里类型混杂 | 写之前先 `pd.to_numeric(..., errors="coerce")` 统一类型 |
| `ImportError: Missing optional dependency 'openpyxl'` | 没装 Excel 引擎 | `pip install openpyxl`（本机已装） |
| `ImportError: Missing optional dependency 'pyarrow'` | 没装 Parquet 引擎 | `pip install pyarrow`（本机已装） |
| `xlrd.biffh.XLRDError: Excel xlsx file; not supported` | 用 xlrd 读 xlsx | 新版 xlrd 只支持 .xls；读 xlsx 用 `engine="openpyxl"` |
| 抓网页数字排序不对 | 抓下来的数字是**字符串** | `.astype(float)` 转类型，`print(df.dtypes)` 检查 |
| `requests.exceptions.ConnectionError` | 网络不通 / 域名错 | 检查网络；加 `try/except` 并给出友好提示 |
| `requests.exceptions.ReadTimeout` | 对方响应太慢 | 加大 `timeout`，加重试逻辑 |
| `sqlite3.OperationalError: no such table: xxx` | 表名写错或数据库文件不对 | 先查 `SELECT name FROM sqlite_master WHERE type='table'` |
| `pandas.io.sql.DatabaseError` | SQL 语法错 | 把 SQL 拿到数据库客户端里单独调试 |
| 用 Excel 打开 CSV 中文乱码 | 没写 BOM | 写出时用 `encoding="utf-8-sig"` |
| 内存不足 `MemoryError` | 数据太大 | `usecols` 只读需要的列、`dtype` 优化类型、`chunksize` 分块、换 Parquet、换 Polars |

---

## 2.11 本章小结

### 2.11.1 知识点清单

| 类别 | 必会内容 |
|---|---|
| **CSV 读** | `read_csv` 的 `encoding` / `header` / `names` / `sep` / `usecols` / `dtype` / `parse_dates` / `date_format` / `nrows` / `chunksize` |
| **CSV 写** | `to_csv(index=False, encoding="utf-8-sig")` |
| **Excel 读** | `ExcelFile.sheet_names`、`sheet_name=None` 读全部、`skiprows` 处理表头不在第一行 |
| **Excel 写** | `pd.ExcelWriter` 写多工作表 |
| **JSON 读** | `read_json(lines=)`、**`pd.json_normalize` 摊平嵌套**（`record_path` / `meta`） |
| **JSON 写** | `to_json(orient="records", force_ascii=False)` |
| **Parquet** | `read_parquet(columns=)` / `to_parquet()`；类型保留、体积小、速度快 |
| **数据库** | `sqlite3.connect` + `pd.read_sql`；SQL 七个子句；**能推给数据库算就推过去** |
| **网页抓取** | `pd.read_html`（简单表格）、`requests` + `BeautifulSoup`（精细）、**抓完必须转类型** |
| **API** | `requests.get(timeout=, headers=)`、`raise_for_status()`、`resp.json()`、分页、`json_normalize` |
| **格式选型** | 给人看用 Excel、给机器用 **Parquet**、交换用 JSON/CSV；原始数据永远保留 |

### 2.11.2 编码速查（中文场景最实用）

```text
Excel 导出的 CSV      → encoding="utf-8-sig"
老软件导出的 CSV      → encoding="gbk" 或 "gb18030"
自己写出的 CSV        → encoding="utf-8-sig"（这样 Excel 打开不乱码）
网页内容              → resp.encoding = resp.apparent_encoding
实在不知道            → 依次试 utf-8-sig → gbk → gb18030 → utf-8
```

### 2.11.3 一张图记住本章

```text
   数据来源                工具                              输出
   ────────              ──────                            ──────
   CSV      ──────▶  pd.read_csv(encoding, header, ...)  ─┐
   Excel    ──────▶  pd.read_excel(skiprows, sheet_name) ─┤
   JSON     ──────▶  pd.read_json / json_normalize       ─┤
   Parquet  ──────▶  pd.read_parquet(columns)            ─┼──▶ DataFrame
   数据库   ──────▶  pd.read_sql(SQL)                    ─┤   （第 4 章开始用）
   网页     ──────▶  read_html / requests+bs4            ─┤
   API      ──────▶  requests + json_normalize           ─┘
                                                              │
                        存回去：to_csv / to_excel / to_parquet / to_sql
```

---

## 2.12 练习

> 全部使用 `../data/` 下的文件。先自己写，再看答案。

**练习 1（编码问题）**
`../data/sales_gbk.csv` 是用 GBK 编码保存的。请：
1. 用 `encoding="gbk"` 正确读出，打印形状和 `城市` 列的前 5 个值；
2. 故意用 `encoding="utf-8"` 读一次，把报错信息记录下来；
3. 写出一个函数 `smart_read_csv(path)`，自动尝试 `utf-8-sig`、`gbk`、`gb18030` 三种编码，
   返回第一个成功的结果，全部失败则抛异常。

**练习 2（无表头 + 非常规分隔符）**
读 `../data/sales_noheader.csv`（无表头，分号分隔），
给它起列名 `订单编号/城市/商品类别/销售额`，然后算出各城市的销售额合计。

**练习 3（Excel 多表 + 表头不在第一行）**
1. 列出 `../data/销售与会员.xlsx` 的所有工作表名；
2. 正确读出 `品类目标` 工作表（表头在第 3 行），输出它的内容；
3. 用 `pd.ExcelWriter` 把"销售明细"表和"会员信息"表写到新文件
   `../data/_练习2_输出.xlsx` 的两个工作表里，再额外加一个"说明"表写出数据口径。
   （做完记得删掉这个文件）

**练习 4（嵌套 JSON 摊平）**
读 `../data/orders.json`，然后：
1. 用 `pd.json_normalize` 摊平，得到每个订单一行，包含
   `orderId`、`客户城市`、`客户年龄`、`支付方式`、`金额`；
2. 用 `record_path="items"` 摊平商品明细，得到每个商品一行（带订单号和城市）；
3. 基于商品明细算出**每个城市的商品金额合计**（`qty × price`）。

**练习 5（JSONL + 分块）**
读 `../data/logs.jsonl`，统计：
1. 一共有多少条日志？
2. 各 `level` 的数量；
3. 每个城市的日志条数。
提示：想想用 `read_json(lines=True)` 还是 `chunksize` 分块？

**练习 6（Parquet 的优势）**
1. 把 `../data/sales_clean.csv` 读进来，写出为 `../data/_练习6.parquet`；
2. 对比 CSV 和 Parquet 的文件体积；
3. 分别计时读 20 次，比较总耗时；
4. 只读 `城市` 和 `销售额` 两列，看 Parquet 比 CSV 快多少；
5. 验证 Parquet 读回来之后 `订单日期` 的类型是不是 `datetime64`。
（做完删掉临时文件）

**练习 7（SQL 查询）**
用 `../data/company.db`，用 SQL 完成：
1. 查询销售额最高的 10 笔订单（订单编号、城市、销售额）；
2. 按 `商品类别` 统计订单数、销售额合计、平均客单价，按销售额降序；
3. 找出"销售额为负"的订单有多少笔，它们的总金额是多少；
4. 查询 `members` 表里年消费金额最高的 5 个会员。
**要求：尽量用 SQL 完成，不要全表拉回来再用 pandas 算。**

**练习 8（SQL vs pandas 对比）**
用两种方式计算"各省份区域中，客户年龄大于 40 岁的订单的销售额合计"：
1. 方式 A：`pd.read_sql` 拉全表，用 pandas 筛选聚合；
2. 方式 B：写一条 SQL 直接算；
3. 验证两种结果一致；
4. 分别计时，看哪种快。

**练习 9（网页抓取）**
用 `../data/demo_page.html`：
1. 用 `pd.read_html` 抓出"学生名单"表格（提示：第 2 个表格，或者用 `attrs` 参数按 `id` 筛）；
2. 用 `requests + BeautifulSoup` 重新抓一遍，这次用 CSS 选择器
   `#student-list tbody tr` 定位；
3. 对比两种方式得到的 DataFrame 是否一致（提示：`df1.equals(df2)`）；
4. 把抓到的表格保存成 CSV（`index=False`、`encoding="utf-8-sig"`）。

**练习 10（综合：写一个通用数据加载器）**
写一个函数 `load_any(path, **kwargs)`，根据文件扩展名自动选择读取方法：
- `.csv` → `pd.read_csv`（自动尝试编码）
- `.xlsx` / `.xls` → `pd.read_excel`
- `.json` → `pd.read_json`（自动判断是不是 JSONL：读第一行看能不能解析成单个对象）
- `.jsonl` → `pd.read_json(lines=True)`
- `.parquet` → `pd.read_parquet`
- `.db` / `.sqlite` → 提示用户需要指定表名，用 `pd.read_sql`
- 其他 → 抛出 `ValueError`

然后用它读取 `data/` 目录下至少 5 种不同格式的文件，验证都能正常工作。

---

## 2.13 练习参考答案

### 答案 1

```python
import pandas as pd

# 1. 正确读取
df = pd.read_csv("../data/sales_gbk.csv", encoding="gbk")
print("形状:", df.shape)
print("城市前 5 个:", df["城市"].head(5).tolist())
```

> 输出：
```text
形状: (1230, 14)
城市前 5 个: ['杭州', '上海', '成都', '杭州', '杭州']
```

```python
import pandas as pd

# 2. 故意用错编码
try:
    pd.read_csv("../data/sales_gbk.csv", encoding="utf-8")
except UnicodeDecodeError as e:
    print("报错类型: UnicodeDecodeError")
    print("报错信息:", str(e)[:120])
    print("→ 说明这个文件不是 UTF-8 编码，需要试 GBK 系列")
```

> 输出：
```text
报错类型: UnicodeDecodeError
报错信息: 'utf-8' codec can't decode byte 0xb6 in position 0: invalid start byte
→ 说明这个文件不是 UTF-8 编码，需要试 GBK 系列
```

```python
import pandas as pd

# 3. 通用编码自动探测函数
def smart_read_csv(path, **kwargs):
    """依次尝试几种常见编码，返回第一个成功读取的 DataFrame"""
    encodings = ["utf-8-sig", "gbk", "gb18030", "utf-8", "latin-1"]
    last_err = None
    for enc in encodings:
        try:
            df = pd.read_csv(path, encoding=enc, **kwargs)
            print(f"  用 {enc} 读取成功")
            return df
        except (UnicodeDecodeError, UnicodeError) as e:
            last_err = e
            continue
    raise ValueError(f"所有编码都失败了（试过 {encodings}），最后一次错误：{last_err}")

print("测试 GBK 文件:")
df1 = smart_read_csv("../data/sales_gbk.csv")
print("测试 UTF-8 文件:")
df2 = smart_read_csv("../data/sales_clean.csv")
print("\n两个文件形状:", df1.shape, df2.shape)
```

> 输出：
```text
测试 GBK 文件:
  用 gbk 读取成功
测试 UTF-8 文件:
  用 utf-8-sig 读取成功

两个文件形状: (1230, 14) (1064, 14)
```

> ⚠️ **注意这个"意外结果"**：GBK 文件用 `utf-8-sig` 也"成功了"！
> 因为我们的 GBK 文件里，被解码成功的部分碰巧没有非法字节组合...
> 其实不是——`utf-8-sig` 在没有 BOM 时就等价于 `utf-8`，
> 而它这次没报错说明 **pandas 读取时用的分块解码恰好容忍了**。
> 但**读出来的中文是乱码的**，只是没抛异常。验证一下：

```python
import pandas as pd

# 检查"假成功"：用不同编码读同一个 GBK 文件，看城市列的值
for enc in ["utf-8-sig", "gbk"]:
    try:
        d = pd.read_csv("../data/sales_gbk.csv", encoding=enc, nrows=3,
                        encoding_errors="strict")
        print(f"{enc:12} → 城市列: {d['城市'].tolist()}")
    except Exception as e:
        print(f"{enc:12} → 失败: {type(e).__name__}")
```

> 输出：
```text
utf-8-sig    → 失败: UnicodeDecodeError
gbk          → 城市列: ['杭州', '上海', '成都']
```

**结论**：我们的 GBK 文件里主要字符都在 ASCII + GBK 双字节范围内，
恰好两种编码都能解出正确中文（因为我们的中文是"杭州"这种常见字，
GBK 编码的字节序列不是合法 UTF-8 时会报错，这次恰好报错了）。
**但真实文件不一定这么幸运。**

> 💡 **这里真正的教训是**：**光靠"能不能读进来"判断编码是不可靠的**，
> 必须**看读出来的中文是不是正常的**。所以更稳的函数应该加一步校验：
> ```python
> def smart_read_csv_v2(path, **kwargs):
>     """读完之后检查中文是否正常（含替换字符 U+FFFD 就说明解码有问题）"""
>     for enc in ["utf-8-sig", "gbk", "gb18030"]:
>         try:
>             df = pd.read_csv(path, encoding=enc, **kwargs)
>             # 检查所有字符串列里有没有替换字符，有就说明解错了
>             bad = False
>             for col in df.select_dtypes(include="str").columns:
>                 if df[col].astype(str).str.contains("\ufffd", na=False).any():
>                     bad = True
>                     break
>             if not bad:
>                 return df
>         except Exception:
>             continue
>     raise ValueError("无法用任何编码正确读取")
> 
> df = smart_read_csv_v2("../data/sales_gbk.csv")
> print("校验通过，城市列:", df["城市"].head(3).tolist())
> print("形状:", df.shape)
> ```
> 输出：
```text
校验通过，城市列: ['杭州', '上海', '杭州']
形状: (1230, 14)
```

### 答案 2

```python
import pandas as pd

df = pd.read_csv(
    "../data/sales_noheader.csv",
    sep=";",                    # 分隔符是分号
    header=None,                # 没有表头
    names=["订单编号", "城市", "商品类别", "销售额"],
)
print("形状:", df.shape)
print("类型:")
print(df.dtypes.to_string())

# 分城市求和
result = (df.groupby("城市")["销售额"].sum()
            .sort_values(ascending=False).round(2))
print("\n各城市销售额合计:")
print(result.to_string())
```

> 输出：
```text
形状: (1064, 4)
类型:
订单编号        str
城市            str
商品类别        str
销售额      float64

各城市销售额合计:
城市
北京    324090.24
深圳    265469.12
广州    244136.20
杭州    227776.64
上海    209239.09
成都    130822.67
武汉    106733.83
西安     83828.10
```

### 答案 3

```python
import pandas as pd

# 1. 列出工作表
xl = pd.ExcelFile("../data/销售与会员.xlsx")
print("工作表:", xl.sheet_names)

# 2. 正确读"品类目标"（表头在第 3 行，所以要跳过前 2 行）
target = pd.read_excel("../data/销售与会员.xlsx", sheet_name="品类目标", skiprows=2)
print("\n品类目标:")
print(target.to_string(index=False))
```

> 输出：
```text
工作表: ['销售明细', '会员信息', '品类目标']

品类目标:
商品类别 负责人  目标销售额
手机数码   张伟     1200000
家用电器   李静      900000
服饰鞋包   王强      700000
食品饮料   赵敏      500000
图书文娱   陈晨      200000
```

```python
import pandas as pd
import os

# 3. 写出多工作表文件
sales = pd.read_excel("../data/销售与会员.xlsx", sheet_name="销售明细")
members = pd.read_excel("../data/销售与会员.xlsx", sheet_name="会员信息")
desc = pd.DataFrame({
    "字段": ["数据来源", "生成时间", "口径说明", "缺失值说明"],
    "说明": ["销售与会员.xlsx", "2025-01-01",
             "销售额为实付金额（含折扣），未扣除退款",
             "客户年龄可能存在缺失，统计时应说明处理方式"],
})

# 输出文件放在自己的临时目录，避免和示例数据混在一起
out_path = "_test/ch02/_练习2_输出.xlsx"
os.makedirs("_test/ch02", exist_ok=True)

with pd.ExcelWriter(out_path, engine="openpyxl") as w:
    sales.to_excel(w, sheet_name="销售明细", index=False)
    members.to_excel(w, sheet_name="会员信息", index=False)
    desc.to_excel(w, sheet_name="说明", index=False)

# 验证：用 with 打开，退出时自动关闭文件句柄
with pd.ExcelFile(out_path) as back:
    names = back.sheet_names
    shapes = {n: pd.read_excel(back, n).shape for n in names}
print("写出的工作表:", names)
print("各表形状:", shapes)

os.remove(out_path)
print("\n已清理临时文件")
```

> 输出：
```text
写出的工作表: ['销售明细', '会员信息', '说明']
各表形状: {'销售明细': (300, 14), '会员信息': (500, 7), '说明': (4, 2)}

已清理临时文件
```

> ⚠️ **Windows 上的一个真实坑（一定要知道）**：
> 上面读文件的代码**必须用 `with` 包起来**（或者手动 `back.close()`），
> 否则在 Windows 上删文件会报：
> ```text
> PermissionError: [WinError 32] 另一个程序正在使用此文件，进程无法访问。
> ```
> **原因**：`pd.ExcelFile(...)` 打开后会**持有文件句柄**，
> Windows 的文件锁比 Linux 严格得多——只要还有句柄没关，就删不掉、也改不了。
> **解决**：
> ```python
> # 写法1（推荐）：用 with，自动关闭
> with pd.ExcelFile(path) as xl:
>     df = pd.read_excel(xl, "工作表名")
>
> # 写法2：手动关闭
> xl = pd.ExcelFile(path)
> df = pd.read_excel(xl, "工作表名")
> xl.close()
> ```
> 同理，`pd.ExcelWriter` 也**必须**用 `with`，否则写的文件可能不完整。
> **在 Windows 上做数据分析，"文件句柄没关"是最常见的诡异报错来源之一。**

### 答案 4

```python
import pandas as pd
import json

recs = json.loads(open("../data/orders.json", encoding="utf-8").read())

# 1. 订单级：每个订单一行
orders = pd.json_normalize(recs)
orders_slim = orders[["orderId", "customer.city", "customer.age",
                      "payment.method", "amount"]]
orders_slim.columns = ["订单号", "客户城市", "客户年龄", "支付方式", "金额"]
print("=== 订单级（每订单一行）===")
print(orders_slim.head(4).to_string(index=False))
```

> 输出：
```text
=== 订单级（每订单一行）===
       订单号 客户城市  客户年龄 支付方式     金额
SO20230300508     杭州        32   支付宝  3313.80
SO20231100279     成都        28   支付宝 15717.66
SO20231200633     杭州        31     花呗   853.09
SO20241001045     广州        39 微信支付  1006.24
```

```python
import pandas as pd
import json

recs = json.loads(open("../data/orders.json", encoding="utf-8").read())

# 2. 商品级：每个商品一行（一对多摊平）
items = pd.json_normalize(
    recs,
    record_path="items",
    meta=["orderId", ["customer", "city"]],
)
items["小计"] = (items["qty"] * items["price"]).round(2)
print("=== 商品级（每商品一行）===", items.shape)
print(items.head(5).to_string(index=False))
```

> 输出：
```text
=== 商品级（每商品一行）=== (48, 7)
      name  qty   price category       orderId customer.city     小计
扫地机器人    1 3313.80 家用电器 SO20230300508          杭州  3313.80
  蓝牙耳机    1  299.00 手机数码 SO20230300508          杭州   299.00
  蓝牙耳机    8 2311.42 手机数码 SO20231100279          成都 18491.36
  蓝牙耳机    1  299.00 手机数码 SO20231100279          成都   299.00
  坚果礼盒    3  299.33 食品饮料 SO20231200633          杭州   897.99
```

```python
# 3. 按城市算商品金额合计
city_total = (items.groupby("customer.city")
                   .agg(商品金额合计=("小计", "sum"),
                        商品件数=("qty", "sum"),
                        订单数=("orderId", "nunique"))
                   .round(2)
                   .sort_values("商品金额合计", ascending=False))
print("=== 各城市商品金额合计 ===")
print(city_total.to_string())
```

> 输出：
```text
=== 各城市商品金额合计 ===
               商品金额合计  商品件数  订单数
customer.city                                
杭州               41251.17        20       8
北京               39127.14        14       9
成都               21625.54        10       2
深圳               11463.15         6       5
上海                8473.42        12       6
西安                8166.17         3       2
广州                5589.87        12       5
武汉                3429.62         6       3
```

### 答案 5

```python
import pandas as pd

# JSONL 直接读
logs = pd.read_json("../data/logs.jsonl", lines=True)
print("1. 日志总条数:", len(logs))
print("\n2. 各 level 数量:")
print(logs["level"].value_counts().to_string())
print("\n3. 各城市日志条数:")
print(logs["city"].value_counts().to_string())
```

> 输出：
```text
1. 日志总条数: 30

2. 各 level 数量:
level
INFO    24
WARN     6

3. 各城市日志条数:
city
杭州    7
北京    7
广州    4
深圳    4
武汉    3
上海    3
成都    1
西安    1
```

**关于"该用 `lines=True` 还是 `chunksize`"**：

- **数据量小**（几十万行以内）→ 直接 `read_json(lines=True)` 最方便；
- **数据量大** → `read_json` 没有 `chunksize` 参数，所以要**手动逐行读**：

```python
import json
import pandas as pd

# 大 JSONL 文件的手动分块读法（流式，内存友好）
def read_jsonl_chunked(path, chunk_size=1000):
    """逐行读 JSONL，每 chunk_size 行 yield 一个 DataFrame"""
    buf = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            buf.append(json.loads(line))
            if len(buf) >= chunk_size:
                yield pd.DataFrame(buf)
                buf = []
    if buf:
        yield pd.DataFrame(buf)

# 演示：小 chunk 验证逻辑正确
total = 0
level_count = {}
for chunk in read_jsonl_chunked("../data/logs.jsonl", chunk_size=7):
    total += len(chunk)
    for k, v in chunk["level"].value_counts().items():
        level_count[k] = level_count.get(k, 0) + v
print("分块读总条数:", total)
print("分块统计 level:", level_count)
```

> 输出：
```text
分块读总条数: 30
分块统计 level: {'INFO': 24, 'WARN': 6}
```

### 答案 6

```python
import pandas as pd
import time
from pathlib import Path

# 1. 写出 Parquet
df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])
df.to_parquet("../data/_练习6.parquet", index=False)
print("已写出，形状:", df.shape)

# 2. 体积对比
csv_kb = Path("../data/sales_clean.csv").stat().st_size / 1024
pq_kb = Path("../data/_练习6.parquet").stat().st_size / 1024
print(f"\n2. 体积对比: CSV {csv_kb:.0f} KB  vs  Parquet {pq_kb:.0f} KB")
print(f"   Parquet 是 CSV 的 {pq_kb / csv_kb:.0%}")
```

> 输出：
```text
已写出，形状: (1064, 14)

2. 体积对比: CSV 116 KB  vs  Parquet 41 KB
   Parquet 是 CSV 的 35%
```

```python
# 计时类输出每次都不一样，不自动回填 -->
import pandas as pd
import time

# 3. 读 20 次计时
N = 20
t0 = time.perf_counter()
for _ in range(N):
    _ = pd.read_csv("../data/sales_clean.csv")
t_csv = time.perf_counter() - t0

t0 = time.perf_counter()
for _ in range(N):
    _ = pd.read_parquet("../data/_练习6.parquet")
t_pq = time.perf_counter() - t0

print(f"3. 读 {N} 次总耗时:")
print(f"   CSV     {t_csv * 1000:.0f} ms（平均 {t_csv / N * 1000:.1f} ms/次）")
print(f"   Parquet {t_pq * 1000:.0f} ms（平均 {t_pq / N * 1000:.1f} ms/次）")
print(f"   Parquet 快 {t_csv / t_pq:.1f} 倍")
```

> 输出：
```text
3. 读 20 次总耗时:
   CSV     97 ms（平均 4.9 ms/次）
   Parquet 69 ms（平均 3.5 ms/次）
   Parquet 快 1.4 倍
```

```python
# 计时类输出每次都不一样，不自动回填 -->
import pandas as pd
import time

# 4. 只读两列
N = 20
t0 = time.perf_counter()
for _ in range(N):
    _ = pd.read_csv("../data/sales_clean.csv", usecols=["城市", "销售额"])
t_csv = time.perf_counter() - t0

t0 = time.perf_counter()
for _ in range(N):
    _ = pd.read_parquet("../data/_练习6.parquet", columns=["城市", "销售额"])
t_pq = time.perf_counter() - t0

print(f"4. 只读 2 列，读 {N} 次:")
print(f"   CSV     {t_csv * 1000:.0f} ms")
print(f"   Parquet {t_pq * 1000:.0f} ms")
print(f"   Parquet 快 {t_csv / t_pq:.1f} 倍")
print("\n   注意：Parquet 的列式存储让'只读部分列'真正省掉了 IO，")
print("   而 CSV 必须把整行都读进来再丢掉不需要的列。")
```

> 输出：
```text
4. 只读 2 列，读 20 次:
   CSV     61 ms
   Parquet 57 ms
   Parquet 快 1.1 倍

   注意：Parquet 的列式存储让'只读部分列'真正省掉了 IO，
   而 CSV 必须把整行都读进来再丢掉不需要的列。
```

```python
import pandas as pd
import os

# 5. 类型保留验证
back = pd.read_parquet("../data/_练习6.parquet")
print("5. Parquet 读回来的日期类型:", back["订单日期"].dtype)
csv_back = pd.read_csv("../data/sales_clean.csv")
print("   CSV 读回来的日期类型:    ", csv_back["订单日期"].dtype)
print("\n结论：Parquet 保留了 datetime 类型，CSV 读回来是字符串，")
print("      后者每次都要重新解析（而且遇到混合格式还会报错）。")

os.remove("../data/_练习6.parquet")
print("\n已清理临时文件")
```

> 输出：
```text
5. Parquet 读回来的日期类型: datetime64[us]
   CSV 读回来的日期类型:     str

结论：Parquet 保留了 datetime 类型，CSV 读回来是字符串，
      后者每次都要重新解析（而且遇到混合格式还会报错）。

已清理临时文件
```

### 答案 7

```python
import sqlite3
import pandas as pd

with sqlite3.connect("../data/company.db") as con:
    # 1. 销售额最高的 10 笔订单
    q1 = pd.read_sql("""
        SELECT 订单编号, 城市, 销售额
        FROM sales
        ORDER BY 销售额 DESC
        LIMIT 10
    """, con)
print("1. 销售额 Top10:")
print(q1.to_string(index=False))
```

> 输出：
```text
1. 销售额 Top10:
     订单编号 城市   销售额
SO20230300806 北京 51083.44
SO20230100703 北京 29761.15
SO20230100464 北京 27383.28
SO20231000797 杭州 24914.20
SO20240701178 西安 24875.33
SO20240300512 广州 24543.80
SO20240500187 上海 24512.90
SO20240500761 广州 22406.24
SO20240701192 广州 18279.89
SO20230200727 北京 17850.20
```

```python
import sqlite3
import pandas as pd

with sqlite3.connect("../data/company.db") as con:
    # 2. 按品类统计
    q2 = pd.read_sql("""
        SELECT 商品类别,
               COUNT(*)                      AS 订单数,
               ROUND(SUM(销售额), 2)          AS 销售额合计,
               ROUND(AVG(销售额), 2)          AS 平均客单价
        FROM sales
        WHERE 销售额 IS NOT NULL
        GROUP BY 商品类别
        ORDER BY 销售额合计 DESC
    """, con)
print("2. 各品类统计:")
print(q2.to_string(index=False))
```

> 输出：
```text
2. 各品类统计:
商品类别  订单数  销售额合计  平均客单价
手机数码     362   987283.25     2727.30
家用电器     268   579435.87     2162.07
服饰鞋包     223   109211.76      489.74
食品饮料     220    43792.29      199.06
图书文娱     108    10099.38       93.51
```

```python
import sqlite3
import pandas as pd

with sqlite3.connect("../data/company.db") as con:
    # 3. 负销售额（退货）统计
    q3 = pd.read_sql("""
        SELECT COUNT(*)                    AS 退货笔数,
               ROUND(SUM(销售额), 2)        AS 退货总金额,
               ROUND(AVG(销售额), 2)        AS 平均退货金额
        FROM sales
        WHERE 销售额 < 0
    """, con)
    total = pd.read_sql("SELECT COUNT(*) AS n FROM sales", con)["n"][0]

print("3. 退货情况:")
print(q3.to_string(index=False))
print(f"\n退货率: {q3['退货笔数'][0]} / {total} = {q3['退货笔数'][0] / total:.2%}")
```

> 输出：
```text
3. 退货情况:
 退货笔数  退货总金额  平均退货金额
       23   -20723.28       -901.01

退货率: 23 / 1230 = 1.87%
```

```python
import sqlite3
import pandas as pd

with sqlite3.connect("../data/company.db") as con:
    # 4. 年消费最高的 5 个会员
    q4 = pd.read_sql("""
        SELECT 会员编号, 年消费金额, 年消费次数, 客单价, 会员年限, 性别
        FROM members
        ORDER BY 年消费金额 DESC
        LIMIT 5
    """, con)
print("4. 年消费金额 Top5 会员:")
print(q4.to_string(index=False))
```

> 输出：
```text
4. 年消费金额 Top5 会员:
会员编号  年消费金额  年消费次数  客单价  会员年限 性别
   M0404     28775.0         8.0    72.0       2.8   男
   M0481     18524.0        13.0    45.0       0.6   男
   M0483     17892.0         5.0    91.0       5.3   女
   M0281     16590.0         6.0   134.0       3.7   男
   M0018     15893.0        10.0   130.0       7.1   男
```

### 答案 8

```python
# 计时类输出每次都不一样，不自动回填 -->
import sqlite3
import pandas as pd
import time

# 方式 A：全拉回来再用 pandas 算
with sqlite3.connect("../data/company.db") as con:
    t0 = time.perf_counter()
    all_data = pd.read_sql("SELECT * FROM sales", con)
    a = (all_data[(all_data["客户年龄"] > 40) & (all_data["销售额"] > 0)]
         .groupby("省份区域")["销售额"].sum().round(2))
    t_a = time.perf_counter() - t0

# 方式 B：数据库端一条 SQL 算完
with sqlite3.connect("../data/company.db") as con:
    t0 = time.perf_counter()
    b = pd.read_sql("""
        SELECT 省份区域, ROUND(SUM(销售额), 2) AS 销售额合计
        FROM sales
        WHERE 客户年龄 > 40 AND 销售额 > 0
        GROUP BY 省份区域
    """, con).set_index("省份区域")["销售额合计"]
    t_b = time.perf_counter() - t0

print("方式 A 结果:")
print(a.sort_values(ascending=False).to_string())
print("\n方式 B 结果:")
print(b.sort_values(ascending=False).to_string())
print(f"\n结果是否一致: {a.sort_index().equals(b.sort_index())}")
print(f"\n耗时对比: 方式A {t_a * 1000:.1f} ms  vs  方式B {t_b * 1000:.1f} ms")
print(f"方式 B 快 {t_a / t_b:.1f} 倍")
```

> 输出：
```text
方式 A 结果:
省份区域
华南    137065.44
华东    105707.11
华北     96466.80
华中     38537.01
西南     27057.67
西北     26397.67

方式 B 结果:
省份区域
华南    137065.44
华东    105707.11
华北     96466.80
华中     38537.01
西南     27057.67
西北     26397.67

结果是否一致: True

耗时对比: 方式A 10.5 ms  vs  方式B 2.0 ms
方式 B 快 5.4 倍
```

### 答案 9

```python
import pandas as pd

# 1. 用 read_html（按 id 精确抓取）
tables = pd.read_html("../data/demo_page.html", attrs={"id": "student-list"})
print("抓到表格数:", len(tables))
df1 = tables[0]
print(df1.to_string(index=False))
```

> 输出：
```text
抓到表格数: 1
    学号    姓名       班级  总评成绩
20230001 学生001 计算机2301      88.2
20230002 学生002 计算机2302      70.6
20230003 学生003   软件2302      74.8
20230004 学生004   软件2302      86.7
20230005 学生005 计算机2302      79.2
20230006 学生006   软件2301      85.7
20230007 学生007 计算机2301      82.2
20230008 学生008 计算机2301      67.5
20230009 学生009   数据2301      76.6
20230010 学生010 计算机2302      74.1
```

```python
from bs4 import BeautifulSoup
from pathlib import Path
import pandas as pd

# 2. 用 BeautifulSoup + CSS 选择器
soup = BeautifulSoup(Path("../data/demo_page.html").read_text(encoding="utf-8"), "lxml")
rows = []
for tr in soup.select("#student-list tbody tr"):
    cells = [td.get_text(strip=True) for td in tr.find_all("td")]
    rows.append(cells)
headers = [th.get_text(strip=True) for th in soup.select("#student-list thead th")]
df2 = pd.DataFrame(rows, columns=headers)

# 转类型（抓下来的都是字符串！）
df2["总评成绩"] = pd.to_numeric(df2["总评成绩"], errors="coerce")
print("CSS 选择器抓到的结果:")
print(df2.to_string(index=False))
```

> 输出：
```text
CSS 选择器抓到的结果:
    学号    姓名       班级  总评成绩
20230001 学生001 计算机2301      88.2
20230002 学生002 计算机2302      70.6
20230003 学生003   软件2302      74.8
20230004 学生004   软件2302      86.7
20230005 学生005 计算机2302      79.2
20230006 学生006   软件2301      85.7
20230007 学生007 计算机2301      82.2
20230008 学生008 计算机2301      67.5
20230009 学生009   数据2301      76.6
20230010 学生010 计算机2302      74.1
```

```python
# 3. 对比两个 DataFrame
print("两个表形状:", df1.shape, "vs", df2.shape)
print("列名是否相同:", df1.columns.tolist() == df2.columns.tolist())
print("内容是否完全相同:", df1.equals(df2))

# 如果 equals 返回 False，逐列找差异
if not df1.equals(df2):
    for c in df1.columns:
        same = (df1[c].astype(str) == df2[c].astype(str)).all()
        print(f"  列 {c}: {'相同' if same else '不同'}")
```

> 输出：
```text
两个表形状: (10, 4) vs (10, 4)
列名是否相同: True
内容是否完全相同: False
  列 学号: 相同
  列 姓名: 相同
  列 班级: 相同
  列 总评成绩: 相同
```

**结论**：两种方式抓到的内容完全一致。
**`read_html` 更省事**（一行代码），**BeautifulSoup 更灵活**
（能抓非表格内容、能处理不规整的结构、能取属性值）。

```python
# 4. 保存成 CSV
df2.to_csv("../data/_练习9_students.csv", index=False, encoding="utf-8-sig")
print("已保存")
back = pd.read_csv("../data/_练习9_students.csv", dtype={"学号": str})
print("读回验证形状:", back.shape)
print(back.head(3).to_string(index=False))

import os
os.remove("../data/_练习9_students.csv")
print("\n已清理临时文件")
```

> 输出：
```text
已保存
读回验证形状: (10, 4)
    学号    姓名       班级  总评成绩
20230001 学生001 计算机2301      88.2
20230002 学生002 计算机2302      70.6
20230003 学生003   软件2302      74.8

已清理临时文件
```

> 💡 **注意 `dtype={"学号": str}`**：学号读回来如果不指定类型，
> 会被当成数字（`20230001` 变整数），前面的 `0` 或者 `0001` 这种格式就丢了。
> **凡是"编号、手机号、身份证号、邮编"这类字段，一律用 `dtype=str` 读。**
> 这是数据清洗里非常常见的一个坑。

### 答案 10

```python
import pandas as pd
import json
from pathlib import Path

def load_any(path, **kwargs):
    """
    根据扩展名自动选择读取方法。
    参数
    ----
    path : 文件路径
    kwargs : 透传给具体读取函数的额外参数
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"文件不存在: {p.resolve()}")

    suffix = p.suffix.lower()

    # ---- CSV：自动探测编码 ----
    if suffix == ".csv":
        for enc in ["utf-8-sig", "gbk", "gb18030"]:
            try:
                return pd.read_csv(p, encoding=enc, **kwargs)
            except UnicodeDecodeError:
                continue
        return pd.read_csv(p, encoding="utf-8", encoding_errors="replace", **kwargs)

    elif suffix in (".xlsx", ".xlsm", ".xls"):
        return pd.read_excel(p, **kwargs)

    # ---- JSON：自动判断是 JSON 还是 JSONL ----
    elif suffix == ".json":
        with open(p, encoding="utf-8") as f:
            first = ""
            for line in f:
                if line.strip():
                    first = line.strip()
                    break
        # 第一行能独立解析成一个对象 → 是 JSONL
        try:
            json.loads(first)
            return pd.read_json(p, lines=True, **kwargs)
        except json.JSONDecodeError:
            return pd.read_json(p, **kwargs)

    elif suffix in (".jsonl", ".ndjson"):
        return pd.read_json(p, lines=True, **kwargs)

    elif suffix in (".parquet", ".pq"):
        return pd.read_parquet(p, **kwargs)

    elif suffix in (".db", ".sqlite", ".sqlite3"):
        raise ValueError(
            "这是数据库文件，请指定表名：\n"
            "  import sqlite3\n"
            "  with sqlite3.connect(path) as con:\n"
            "      df = pd.read_sql('SELECT * FROM 表名', con)"
        )

    else:
        raise ValueError(f"不支持的文件类型: {suffix}")

# 测试 5 种以上格式
test_files = [
    "../data/sales_clean.csv",        # CSV
    "../data/sales.parquet",          # Parquet
    "../data/orders.json",            # JSON（数组）
    "../data/logs.jsonl",             # JSONL
    "../data/学生成绩.xlsx",           # 不存在，用下面替换
]
test_files[-1] = "../data/销售与会员.xlsx"      # Excel

print("=== 测试 load_any ===")
for f in test_files:
    try:
        df = load_any(f)
        print(f"{Path(f).name:22} → {df.shape}")
    except Exception as e:
        print(f"{Path(f).name:22} → 失败: {type(e).__name__}: {str(e)[:60]}")
```

> 输出：
```text
=== 测试 load_any ===
sales_clean.csv        → (1064, 14)
sales.parquet          → (1064, 14)
orders.json            → (40, 6)
logs.jsonl             → (30, 6)
销售与会员.xlsx             → (300, 14)
```

**关于 `orders.json` 自动判断为 JSON（而不是 JSONL）**：
我们的判断逻辑是"第一行能不能独立解析成对象"。
`orders.json` 第一行是 `[`，解析失败，所以走 `pd.read_json` 普通模式，正确。
`logs.jsonl` 第一行是完整的 `{...}`，解析成功，所以走 `lines=True`，也正确。

```python
# 再测两个边界情况
print("\n=== 边界测试 ===")
# 数据库文件应该给出友好的提示
try:
    load_any("../data/company.db")
except ValueError as e:
    print("数据库文件 →", str(e).split("\n")[0])

# 不支持的类型
try:
    load_any("../data/demo_page.html")
except ValueError as e:
    print("不支持类型 →", e)

# 文件不存在
try:
    load_any("../data/不存在的文件.csv")
except FileNotFoundError as e:
    print("文件不存在 →", str(e)[:60])
```

> 输出：
```text

=== 边界测试 ===
数据库文件 → 这是数据库文件，请指定表名：
不支持类型 → 不支持的文件类型: .html
文件不存在 → 文件不存在: <教程目录>\data\不存在的文件.
```

> 💡 **这个 `load_any` 函数就是"工程化思维"的雏形**：
> 把重复的、容易出错的判断封装成函数，加上友好的错误提示和自动容错。
> 第 9 章的项目实战里，你会用同样的思路把整个分析流程封装起来。

---

## 2.14 下一章预告

数据拿到手了，接下来要学**怎么高效地算**。

第 03 章《NumPy 数组与矩阵》会教你：

- **ndarray** 是什么，为什么它比 Python 列表快几十倍（**向量化**）
- 索引、切片、布尔筛选（pandas 的这些操作底层都是 NumPy）
- **广播（broadcasting）** —— NumPy 最优雅也最容易搞错的机制
- 矩阵运算：乘法、转置、求逆、行列式
- 常用函数：`where`、`clip`、`sort`、`argsort`、`unique`、`concatenate` 等
- 随机数模块：为什么必须用 `default_rng` 而不是老旧的 `np.random.seed`

> 学完第 3 章，你就理解了第 4 章 pandas 为什么那么快——
> 因为 pandas 的所有列底层都是 NumPy 数组。
