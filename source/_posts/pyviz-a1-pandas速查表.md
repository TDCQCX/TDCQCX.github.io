---
title: 附录 A1 · Pandas 速查表
date: 2026-09-26 10:00:00
permalink: /pyviz/a1-pandas-cheatsheet/
series: pyviz
chapter: 101
desc: 常用 API 速查，写代码时放在手边
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- 速查表
keywords: Python 数据分析, 数据可视化, 附录 A1 · Pandas 速查表, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 附录 A1 · Pandas 速查表
toc: true
comments: true
---
> 适用环境：Python 3.11.16 / pandas **3.0.6** / numpy 2.4.6
> 用法：**Ctrl+F 搜函数名**，找到就用。每条都配了能直接复制运行的代码。
> 代码里的 `df` 指 `../data/sales_clean.csv`（1064 行 × 14 列），
> `stu` 指 `../data/students.csv`，`ts` 指 `../data/timeseries.csv`。

---

## A1.0 先用这 6 行把环境搭好

后面的每一段代码都假设你已经跑过下面这块。**只跑一次**，不用重复。

```python
import numpy as np                      # 数值计算
import pandas as pd                     # 主角
import matplotlib.pyplot as plt         # 有些例子要画图

# 中文图表必须的两行，缺第二行负号会变成方块（详见 A2 速查表）
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False

# 让表格打印出来对齐、不被省略号截断
pd.set_option("display.unicode.east_asian_width", True)
pd.set_option("display.width", 300)
pd.set_option("display.max_columns", 60)
```

> 输出：
```text
```

```python
# 三张最常用的表，本节所有例子都基于它们
df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])   # 销售明细
stu = pd.read_csv("../data/students.csv")                              # 学生成绩
ts = pd.read_csv("../data/timeseries.csv", parse_dates=["日期"]).set_index("日期")

print(df.shape, stu.shape, ts.shape)
```

> 输出：
```text
(1064, 14) (300, 12) (1096, 3)
```

> ⚠️ **路径必须是 `../data/...`**：教程约定你在 `code` 目录里启动 Jupyter。
> 如果你看到 `FileNotFoundError`，先确认当前目录（A3 手册 B 节有排查步骤）。

---

## A1.1 数据读取

### A1.1.1 `pd.read_csv` 全部常用参数

| 参数 | 含义 | 常用取值 / 示例 |
|---|---|---|
| `sep` | 字段分隔符。默认 `","`，读 TSV 要用制表符 | `sep="\t"`、`sep=";"`、`sep=r"\s+"` |
| `delimiter` | `sep` 的老名字，功能完全一样 | `delimiter="\t"`（新代码统一用 `sep`） |
| `encoding` | 文件编码。中文 CSV 常见两种：UTF-8 和 GBK | `encoding="utf-8"`、`"utf-8-sig"`、`"gbk"` |
| `header` | 用第几行当列名。`0` 是第一行，`None` 表示没有表头 | `header=0`、`header=None`、`header=2` |
| `names` | 自己指定列名（和 `header=None` 搭配） | `names=["城市", "销售额"]` |
| `index_col` | 把哪一列设为行索引 | `index_col="订单编号"`、`index_col=0` |
| `usecols` | 只读这几列，**大文件提速第一招** | `usecols=["订单编号", "城市", "销售额"]` |
| `dtype` | 指定列的类型，避免 pandas 猜错 | `dtype={"客户年龄": "float32", "订单编号": str}` |
| `parse_dates` | 把这几列解析成日期类型 | `parse_dates=["订单日期"]` |
| `date_format` | 日期格式；多种格式混排时必须写 `"mixed"` | `date_format="mixed"`、`date_format="%Y-%m-%d"` |
| `na_values` | 除了默认空值，还把这些字符串当缺失值 | `na_values=["无", "N/A", "-", "未知"]` |
| `nrows` | 只读前 N 行，**看数据结构时必用** | `nrows=100` |
| `skiprows` | 跳过开头的行（表头上面有说明文字时用） | `skiprows=3`、`skiprows=[1, 2]` |
| `encoding_errors` | 遇到非法字节怎么办 | `encoding_errors="replace"`（最实用）/ `"ignore"` / `"strict"` |
| `chunksize` | 分块读，返回迭代器，**内存不够时的救命参数** | `chunksize=100_000` |
| `keep_default_na` | 是否把默认空值串（`""`、`NA`、`NULL`）当缺失 | `keep_default_na=False` |

`sep` / `names` / `header=None` 的用法：

```python
# 造一个制表符分隔、没有表头的文件，演示 sep + names
pd.DataFrame({"a": [1, 2], "b": [3, 4]}).to_csv(
    "_test/appendix/_a1_tab.txt", sep="\t", index=False, header=False)

# sep 指定分隔符，names 补上列名，header=None 表示文件里本来没有列名
print(pd.read_csv("_test/appendix/_a1_tab.txt", sep="\t", header=None,
                  names=["x", "y"]).to_dict("list"))
```

> 输出：
```text
{'x': [1, 2], 'y': [3, 4]}
```

`usecols` / `index_col` / `dtype` / `nrows` 一次性演示：

```python
small = pd.read_csv("../data/sales_clean.csv",
                    usecols=["订单编号", "城市", "客户年龄"],  # 只读 3 列，快很多
                    index_col="订单编号",                     # 订单号当行索引
                    dtype={"客户年龄": "float32"},             # 省内存的写法
                    nrows=3)                                  # 只读前 3 行
print(small)
print(small["客户年龄"].dtype)
```

> 输出：
```text
               城市  客户年龄
订单编号                     
SO20230300508  杭州      32.0
SO20231100279  成都      28.0
SO20231200633  杭州      31.0
float32
```

`skiprows` 的坑和正确写法：

```python
# skiprows=3 会把表头也一起跳过，列名就丢了 —— 这时要配 header=None
print(pd.read_csv("../data/sales_clean.csv", nrows=2, skiprows=3, header=None).shape)
# 想"保留表头、只跳过某几行数据"，用列表形式
print(pd.read_csv("../data/sales_clean.csv", nrows=2, skiprows=[1, 2])["订单编号"].tolist())
```

> 输出：
```text
(2, 14)
['SO20231200633', 'SO20241001045']
```

`na_values` 与「空字符串不是缺失值」：

```python
# 默认情况下，"杭州" 是正常值；把它写进 na_values 后就会被当成缺失
print(pd.read_csv("../data/sales_clean.csv", nrows=3, na_values=["杭州"])["城市"].isna().sum())
# 反过来：keep_default_na=False 会让 pandas 连空字符串都不当缺失
print(pd.read_csv("../data/sales.csv", nrows=3, keep_default_na=False)["客户性别"].tolist()[:3])
```

> 输出：
```text
2
['男', '女', '女']
```

`chunksize` 分块读大文件：

```python
total = 0
# 每次只把 300 行装进内存，累加完就丢掉，几 GB 的 CSV 也能算
for chunk in pd.read_csv("../data/sales_clean.csv", usecols=["销售额"], chunksize=300):
    total += len(chunk)
print("总行数:", total)
```

> 输出：
```text
总行数: 1064
```

`encoding_errors` 处理脏字节：

```python
# 造一个含非法字节的 csv（\ufffd 是替换字符，模拟编码坏掉的数据）
with open("_test/appendix/_a1_bad.csv", "w", encoding="utf-8") as f:
    f.write("城市,销售额\n北京,100\n上海\ufffd,200\n")
# replace: 坏字符换成占位符，程序继续跑（最实用）
print(pd.read_csv("_test/appendix/_a1_bad.csv", encoding_errors="replace")["城市"].tolist())
```

> 输出：
```text
['北京', '上海�']
```

### A1.1.2 `pd.read_excel`

```python
# 先看一个 Excel 文件里都有哪些工作表
print(pd.ExcelFile("../data/销售与会员.xlsx").sheet_names)
# sheet_name 可以是表名、序号，也可以是 None（一次性读全部工作表，返回字典）
print(pd.read_excel("../data/销售与会员.xlsx", sheet_name="销售明细").shape)
print(pd.read_excel("../data/销售与会员.xlsx", sheet_name=None).keys())
```

> 输出：
```text
['销售明细', '会员信息', '品类目标']
(300, 14)
dict_keys(['销售明细', '会员信息', '品类目标'])
```

| 参数 | 含义 | 示例 |
|---|---|---|
| `sheet_name` | 工作表：名字 / 序号 / `None`(全部) / 列表 | `sheet_name="会员信息"`、`sheet_name=0`、`sheet_name=None` |
| `skiprows` | 表头上面有空行、说明文字时跳过 | `skiprows=2` |
| `header` | 用第几行当表头 | `header=0`、`header=None` |
| `dtype` | 指定列类型（**证件号、手机号一定要用 `str`**，否则前导 0 会消失） | `dtype={"会员编号": str}` |
| `usecols` | 只读部分列 | `usecols="A:C"`（Excel 列字母也行） |
| `nrows` | 只读前 N 行 | `nrows=100` |
| `na_values` | 额外视为缺失的值 | `na_values=["无", "NA"]` |

```python
# "品类目标" 表的前两行是说明文字，表头在第 3 行 —— 必须 skiprows=2
tgt = pd.read_excel("../data/销售与会员.xlsx", sheet_name="品类目标", skiprows=2)
print(tgt.shape, tgt.columns.tolist())
```

> 输出：
```text
(5, 3) ['商品类别', '负责人', '目标销售额']
```

### A1.1.3 `pd.read_json` / `read_sql` / `read_parquet`

```python
# JSON：默认按行解析；orient 参数要和写出去时一致
pd.DataFrame({"城市": ["北京", "上海"], "销售额": [100, 200]}).to_json(
    "_test/appendix/_a1_demo.json", orient="records", force_ascii=False)
print(pd.read_json("_test/appendix/_a1_demo.json").to_dict("list"))
```

> 输出：
```text
{'城市': ['北京', '上海'], '销售额': [100, 200]}
```

```python
import sqlite3

# read_sql：把 SQL 查询结果直接变成 DataFrame。
# 强烈建议写完整 SQL（含聚合、筛选），让数据库算，比读出来再用 pandas 算快得多。
# 注意：数据库里的城市名前后带空格（' 上海 '），要在 SQL 里用 TRIM 处理干净
with sqlite3.connect("../data/company.db") as con:
    q = "SELECT TRIM(城市) AS 城市, ROUND(SUM(销售额), 2) AS 总额 FROM sales GROUP BY TRIM(城市)"
    print(pd.read_sql(q, con).set_index("城市")["总额"].sort_values(ascending=False).to_dict())
```

> 输出：
```text
{'北京': 338951.64, '深圳': 288815.83, '广州': 261782.96, '杭州': 242979.88, '上海': 212927.65, '成都': 145536.91, '武汉':
   122399.77, '西安': 116427.91}
```

```python
# Parquet：列式存储，比 CSV 小、比 CSV 快，且自带数据类型，是本地分析的首选格式
df.head(100).to_parquet("_test/appendix/_a1_demo.parquet", index=False)
print(pd.read_parquet("_test/appendix/_a1_demo.parquet").shape)
# read_parquet 支持只读部分列：只取需要的列时，速度提升非常明显
print(pd.read_parquet("_test/appendix/_a1_demo.parquet", columns=["城市"]).columns.tolist())
```

> 输出：
```text
(100, 14)
['城市']
```

---

## A1.2 数据写出

### A1.2.1 五种写出方式对照

| 方法 | 适用场景 | 关键参数 |
|---|---|---|
| `to_csv` | 通用、可读、给别的软件用 | `index=False`（几乎总要用）、`encoding="utf-8-sig"`（Excel 打开不乱码）、`sep`、`na_rep` |
| `to_excel` | 给同事看、要格式/多工作表 | `sheet_name`、`index=False`、`startrow`、`freeze_panes` |
| `to_parquet` | **本地反复读写时首选**，小且快 | `compression="snappy"`、`index=False` |
| `to_json` | 给前端/接口用 | `orient="records"`（最通用）、`force_ascii=False`（中文不转义） |
| `to_sql` | 存进数据库 | `if_exists="replace"`/`"append"`、`index=False`、`dtype` |

```python
out = df.head(20)

out.to_csv("_test/appendix/_a1_out.csv", index=False, encoding="utf-8-sig")
out.to_excel("_test/appendix/_a1_out.xlsx", sheet_name="明细", index=False)
out.to_parquet("_test/appendix/_a1_out.parquet", index=False, compression="snappy")

import os
for f in ["_a1_out.csv", "_a1_out.xlsx", "_a1_out.parquet"]:
    print(f, os.path.getsize("_test/appendix/" + f), "字节")
```

> 输出：
```text
_a1_out.csv 2422 字节
_a1_out.xlsx 7118 字节
_a1_out.parquet 10410 字节
```

> 💡 20 行的表 Parquet 反而更大（它要存元数据）。数据量上千行以后
> Parquet 的体积和读取速度才会明显优于 CSV，选型看的是"行数"不是"习惯"。

一次写出多个工作表：

```python
# ExcelWriter 上下文管理器：一个文件里写多张表
with pd.ExcelWriter("_test/appendix/_a1_multi.xlsx") as w:
    df.head(5).to_excel(w, sheet_name="前5行", index=False)
    df.tail(5).to_excel(w, sheet_name="后5行", index=False)
print(pd.ExcelFile("_test/appendix/_a1_multi.xlsx").sheet_names)
```

> 输出：
```text
['前5行', '后5行']
```

### A1.2.2 格式选型建议（照这张表选就够）

| 你的需求 | 选它 | 理由 |
|---|---|---|
| 交给别人 / 在 Excel 里打开 | `to_csv(encoding="utf-8-sig")` 或 `to_excel` | `utf-8-sig` 带 BOM，Excel 双击不乱码 |
| 自己下次还要读回来 | `to_parquet` | 快、小、类型不丢 |
| 数据里有换行、逗号 | `to_csv`（默认会自动加引号） | 或改用 `to_parquet` |
| 要存几百万行 | `to_parquet` | CSV 会很大很慢 |
| 要给网页/App | `to_json(orient="records", force_ascii=False)` | 前端直接能解析 |
| 要存数据库给多人共享 | `to_sql` | 支持增量 `if_exists="append"` |

中文编码的直观对比：

```python
# 三种编码写同一个文件，看前 12 个字节就知道区别
df.head(3)[["城市", "销售额"]].to_csv("_test/appendix/_a1_utf8.csv",
                                      index=False, encoding="utf-8")
df.head(3)[["城市", "销售额"]].to_csv("_test/appendix/_a1_bom.csv",
                                      index=False, encoding="utf-8-sig")
for n in ["_a1_utf8.csv", "_a1_bom.csv"]:
    head = open("_test/appendix/" + n, "rb").read(9)     # 读原始字节
    print(n, head)
```

> 输出：
```text
_a1_utf8.csv b'\xe5\x9f\x8e\xe5\xb8\x82,\xe9\x94'
_a1_bom.csv b'\xef\xbb\xbf\xe5\x9f\x8e\xe5\xb8\x82'
```

> `utf-8-sig` 就是普通 UTF-8 前面多了 `EF BB BF` 三个字节（BOM）。
> Excel 靠这三个字节判断编码，所以加了它才不乱码。

---

## A1.3 查看数据：拿到表先做这 17 件事

```python
print("① 头几行"); print(df.head(3)[["订单编号", "城市", "销售额"]])
print("② 随机抽样（看整体面貌比 head 更可靠）")
print(df.sample(3, random_state=0)[["订单编号", "城市", "销售额"]])
```

> 输出：
```text
① 头几行
        订单编号  城市    销售额
0  SO20230300508  杭州   3313.80
1  SO20231100279  成都  15717.66
2  SO20231200633  杭州    853.09
② 随机抽样（看整体面貌比 head 更可靠）
          订单编号  城市   销售额
175  SO20230900987  成都   826.77
986  SO20230300198  成都  2306.61
686  SO20230200068  武汉   297.81
```

```python
print(df.shape)                            # (行数, 列数)
print(df.dtypes.to_string())               # 每列类型：pandas 3.0 里字符串是 str
print(df.columns.tolist()[:5])             # 列名
print(df.index[:3].tolist())               # 行索引
```

> 输出：
```text
(1064, 14)
订单编号               str
订单日期    datetime64[us]
省份区域               str
城市                   str
商品类别               str
商品名称               str
单价               float64
数量                 int64
折扣               float64
销售额             float64
客户年龄           float64
客户性别               str
支付方式               str
下单渠道               str
['订单编号', '订单日期', '省份区域', '城市', '商品类别']
[0, 1, 2]
```

| 方法 | 一句话作用 | 示例 |
|---|---|---|
| `head(n)` | 看前 n 行（默认 5） | `df.head(10)` |
| `tail(n)` | 看最后 n 行 | `df.tail(3)` |
| `sample(n)` | 随机抽 n 行，看分布比看头几行更靠谱 | `df.sample(5, random_state=0)` |
| `shape` | `(行, 列)` 元组 | `df.shape` |
| `info()` | 每列类型 + **非空数量** + 内存占用，最重要 | `df.info()` |
| `describe()` | 数值列统计摘要（count/mean/std/分位数） | `df.describe().round(2)` |
| `dtypes` | 只看类型 | `df.dtypes` |
| `columns` | 列名索引 | `df.columns.tolist()` |
| `index` | 行索引 | `df.index` |
| `nunique()` | 每列有多少个不重复值 | `df.nunique()` |
| `value_counts()` | 一列里每个值出现几次（**默认按频次降序**） | `df["城市"].value_counts()` |
| `isna()` | 是否缺失（缺失为 `True`） | `df.isna().sum()` |
| `notna()` | 是否非缺失 | `df["客户年龄"].notna().sum()` |
| `sum()` | 求和；对布尔列求和 = 数个数 | `df["销售额"].sum()` |
| `duplicated()` | 是否是重复行 | `df.duplicated().sum()` |
| `memory_usage()` | 每列占多少内存 | `df.memory_usage(deep=True)` |
| `T` | 转置（列太多时看结构方便） | `df.head(2).T` |

```python
print(df.nunique().head(6).to_dict())            # 每列基数：基数=1 的列可以删
print(df["城市"].value_counts().head(4).to_dict())  # 频次分布，默认降序
print(int(df.isna().sum().sum()), int(df.duplicated().sum()))  # 缺失数、重复行数
```

> 输出：
```text
{'订单编号': 1064, '订单日期': 557, '省份区域': 6, '城市': 8, '商品类别': 5, '商品名称': 25}
{'上海': 196, '深圳': 175, '北京': 173, '广州': 150}
0 0
```

```python
# 哪一列有缺失、缺多少 —— 一行搞定
missing = df.isna().sum()
print(missing[missing > 0].to_dict())      # 干净数据返回空字典
# 学生表故意留了缺失，换成它就能看到
m2 = stu.isna().sum()
print(m2[m2 > 0].to_dict())
```

> 输出：
```text
{}
{'每周自习小时': 12, '期末成绩': 5}
```

> ⚠️ **`value_counts` 和 `isna` 的默认值**
> `value_counts()` 默认 `ascending=False`（多的在前）、`dropna=True`（**不统计缺失值**）。
> 想连缺失值一起看，写 `df["客户年龄"].value_counts(dropna=False)`。

---

## A1.4 选取与筛选

### A1.4.1 五种取数方式一览

| 写法 | 取什么 | 索引规则 | 例子 |
|---|---|---|---|
| `df["列名"]` | 一列 → Series | — | `df["销售额"]` |
| `df[["列1","列2"]]` | 多列 → DataFrame | **里面必须是列表，双层方括号** | `df[["城市","销售额"]]` |
| `df[条件]` | 满足条件的行 | 长度必须和行数一致 | `df[df["销售额"]>5000]` |
| `df.loc[行标签, 列名]` | 按**名字**取 | **切片含结尾** | `df.loc[0:3, "城市"]` |
| `df.iloc[行位置, 列位置]` | 按**位置**取 | **切片不含结尾**（和列表一样） | `df.iloc[0:3, 3]` |
| `df.at[行标签, 列名]` | 单个值，最快 | 只取一个 | `df.at[0, "城市"]` |
| `df.iat[行号, 列号]` | 单个值，按位置 | 只取一个 | `df.iat[0, 3]` |

```python
# loc 是"闭区间"：0:3 会取到索引 0,1,2,3 共 4 行
print(df.loc[0:3, "城市"].tolist())
# iloc 是"左闭右开"：0:3 只取位置 0,1,2 共 3 行 —— 最经典的踩坑点
print(df.iloc[0:3, 3].tolist())
# 单个值用 at / iat，比 loc / iloc 快
print(df.at[0, "城市"], df.iat[0, 3])
```

> 输出：
```text
['杭州', '成都', '杭州', '广州']
['杭州', '成都', '杭州']
杭州 杭州
```

### A1.4.2 布尔筛选、query、isin、between

```python
# 多个条件必须用 & (与) / | (或) / ~ (非)，且每个条件都要加括号
print(df[(df["销售额"] > 5000) & (df["城市"] == "北京")].shape)
print(df[(df["销售额"] > 5000) | (df["城市"] == "上海")].shape)
print(df[~(df["城市"] == "北京")].shape)
```

> 输出：
```text
(12, 14)
(259, 14)
(891, 14)
```

| 方法 | 作用 | 示例 |
|---|---|---|
| `df[条件]` | 布尔索引筛行 | `df[df["销售额"] > 5000]` |
| `query("表达式")` | 用字符串写条件，**不用重复写 `df["..."]`**，最易读 | `df.query("销售额 > 5000 and 城市 == '北京'")` |
| `isin(列表)` | 值在列表里 | `df[df["城市"].isin(["北京","上海"])]` |
| `between(a, b)` | 值在区间内（**含两端**） | `df[df["销售额"].between(1000, 2000)]` |
| `filter(like=/regex=/items=)` | 按**列名**筛列，不是筛行 | `df.filter(like="订单")` |
| `where(条件)` | 不满足的**置为 NaN**（保留行数） | `s.where(s <= 5000, 5000)` |
| `mask(条件)` | 满足的**置为 NaN**（和 where 相反） | `s.mask(s > 5000, 0)` |
| `nlargest(n, 列)` | 取最大 n 行 | `df.nlargest(3, "销售额")` |
| `nsmallest(n, 列)` | 取最小 n 行 | `df.nsmallest(3, "销售额")` |

```python
# query 里引用外部变量要加 @，这是它的独门优势
threshold = 5000
print(df.query("销售额 > @threshold and 城市 == '北京'").shape)
print(df[df["城市"].isin(["北京", "上海"])].shape)
print(df[df["销售额"].between(1000, 2000)].shape)
```

> 输出：
```text
(12, 14)
(369, 14)
(127, 14)
```

```python
# filter 筛的是"列名"，别和筛行搞混
print(df.filter(like="订单").columns.tolist())
print(df.filter(regex="城市|销售额").columns.tolist())
```

> 输出：
```text
['订单编号', '订单日期']
['城市', '销售额']
```

```python
# where / mask 不删行，只是把不符合的位置换成 NaN 或指定值
s = df["销售额"].head(5).round(2)
print(s.tolist())
print(s.where(s <= 5000, 5000).tolist())   # 大于 5000 的压成 5000
print(s.mask(s > 5000, 0).tolist())        # 大于 5000 的变成 0
```

> 输出：
```text
[3313.8, 15717.66, 853.09, 1006.24, 607.72]
[3313.8, 5000.0, 853.09, 1006.24, 607.72]
[3313.8, 0.0, 853.09, 1006.24, 607.72]
```

> ⚠️ **常见报错**：`ValueError: The truth value of a Series is ambiguous`
> **原因**：用了 Python 的 `and` / `or` / `not` 连接条件。
> **解决**：改成 `&` / `|` / `~`，并且每个条件都套一层括号。
> 详见 A3 手册 C 节。

---

## A1.5 排序与排名

| 方法 | 作用 | 示例 |
|---|---|---|
| `sort_values(by)` | 按**值**排序 | `df.sort_values("销售额", ascending=False)` |
| `sort_values([多列], ascending=[...])` | 多列不同方向排序 | `df.sort_values(["省份区域","销售额"], ascending=[True, False])` |
| `sort_index()` | 按**索引**排序（时间序列 resample 前必做） | `df.sort_index()` |
| `nlargest(n, 列)` | 最大的 n 行 | `df.nlargest(3, "销售额")` |
| `nsmallest(n, 列)` | 最小的 n 行 | `df.nsmallest(3, "销售额")` |
| `rank()` | 排名（返回名次，不是值） | `df["销售额"].rank(ascending=False)` |

```python
print(df.sort_values("销售额", ascending=False).head(3)["销售额"].round(2).tolist())
print(df.nlargest(3, "销售额")["销售额"].round(2).tolist())
print(df.nsmallest(3, "销售额")["销售额"].round(2).tolist())
```

> 输出：
```text
[51083.44, 29761.15, 27383.28]
[51083.44, 29761.15, 27383.28]
[9.11, 9.41, 10.32]
```

`rank` 的三个常用参数：

```python
# method="min" 并列取最小名次；pct=True 返回百分位（0~1）
print(df["销售额"].rank(ascending=False).head(5).tolist())          # 名次，值是浮点
print(df["销售额"].rank(ascending=False, method="min").head(5).tolist())
print(round(float(df["销售额"].rank(pct=True).max()), 3))            # 最大值的百分位
```

> 输出：
```text
[118.0, 14.0, 368.0, 322.0, 447.0]
[118.0, 14.0, 368.0, 322.0, 447.0]
1.0
```

> ⚠️ `df["销售额"].rank(pct=True).max()` 返回的是 **Python float**，不是 pandas 标量，
> 直接写 `.round(3)` 会报 `AttributeError: 'float' object has no attribute 'round'`。
> 用 `round(float(x), 3)`。详见 A3 手册 C 节。

---

## A1.6 增删改

| 操作 | 写法 | 注意 |
|---|---|---|
| 新增列（常量） | `df.assign(新列=1)` | `assign` 返回新表，不改原表 |
| 新增列（算出来） | `df.assign(金额=df["单价"] * df["数量"])` | 向量化，最快 |
| 新增列（引用刚加的列） | `df.assign(a=df["单价"]*2, b=lambda d: d["a"]+1)` | 后面的要用 `lambda d:` |
| 条件赋值 | `df.assign(等级=np.where(df["销售额"]>5000, "大单", "小单"))` | `np.where` 是向量化的 if |
| 插入到指定位置 | `df.insert(2, "新列", 值)` | 原地修改，返回 None |
| 删列 | `df.drop(columns=["客户性别"])` | **一定要写 `columns=`** |
| 删行 | `df.drop(index=[0, 1])` | 或 `df.drop([0,1], axis=0)` |
| 按条件删行 | `df[df["销售额"] > 100]` | 保留而不是删除，思路更简单 |
| 重命名列 | `df.rename(columns={"城市": "city"})` | 只改指定的，其余不动 |
| 批量改列名 | `df.rename(columns=str.lower)` / `lambda c: c.strip()` | 传函数 |
| 改类型 | `df.astype({"数量": "float64"})` | 转不了会报错，脏数据用 `to_numeric` |
| 转分类 | `df["城市"].astype("category")` | 省内存 + 固定取值顺序 |
| 替换值 | `df["客户性别"].replace({"男": "M", "女": "F"})` | 字典精确替换；正则要 `regex=True` |
| 填充缺失 | `df["客户年龄"].fillna(df["客户年龄"].mean())` | 新版推荐赋值而非 `inplace` |
| 删缺失行 | `df.dropna(subset=["销售额"])` | `subset` 限定只看某几列 |
| 插值填补 | `df["期末成绩"].interpolate()` | 时间序列/连续变量首选 |
| 截断异常值 | `df["销售额"].clip(lower=0, upper=5000)` | 把越界值压到边界 |
| 复制一份 | `df.copy()` | **改数据前先 `.copy()`**（CoW 时代必做） |

```python
print(df.assign(大单=np.where(df["销售额"] > 5000, "是", "否"))["大单"].value_counts().to_dict())
print(df.head(2).rename(columns={"城市": "city", "销售额": "amount"}).columns.tolist()[-2:])
print(df.drop(columns=["客户性别"]).shape)          # 删掉一列，列数 14 -> 13
```

> 输出：
```text
{'否': 992, '是': 72}
['支付方式', '下单渠道']
(1064, 13)
```

```python
print(df["城市"].astype("category").cat.categories[:4].tolist())   # 分类取值表
print(df["客户性别"].replace({"男": "M", "女": "F"}).head(3).tolist())
print(int(stu["每周自习小时"].isna().sum()), "->", int(stu["每周自习小时"].fillna(0).isna().sum()))
print(int(stu["期末成绩"].interpolate().isna().sum()))            # 线性插值补上 5 个缺失
print(df["销售额"].clip(lower=0, upper=5000).max())                # 压到上限
```

> 输出：
```text
['上海', '北京', '广州', '成都']
['M', 'F', 'F']
12 -> 0
0
5000.0
```

> 📌 **pandas 3.0 差异**：切片出来的子表**必须先 `.copy()` 再改**，
> 否则你的修改不会写回原表（有时还会被静默丢弃）。
> `inplace=True` 也逐步退出历史舞台，推荐 `df["列"] = df["列"].xxx()` 这种赋值写法。

---

## A1.7 分组聚合：数据分析的核心动作

### A1.7.1 groupby 的标准三步（split → apply → combine）

```python
# 最基础：按区域把销售额加起来
print(df.groupby("省份区域")["销售额"].sum().round(2).to_dict())
```

> 输出：
```text
{'华东': 437015.73, '华中': 106733.83, '华北': 324090.24, '华南': 509605.32, '西北': 83828.1, '西南': 130822.67}
```

```python
# 推荐写法：具名聚合，一次算多个指标，列名直接起中文
rep = df.groupby("省份区域")["销售额"].agg(总额="sum", 均值="mean", 单数="count")
print(rep.round(2).head(3))
```

> 输出：
```text
               总额     均值  单数
省份区域                          
华东      437015.73  1308.43   334
华中      106733.83  1462.11    73
华北      324090.24  1873.35   173
```

```python
# 分组 + 交叉表：多列分组得到多级索引，unstack 摊平成表格
print(df.groupby(["省份区域", "商品类别"])["销售额"].sum().unstack().round(0).iloc[:2, :3])
# 组内描述统计：一次看 count/mean/std/四分位
print(df.groupby("省份区域")["销售额"].describe().round(1).iloc[:2])
```

> 输出：
```text
商品类别  图书文娱  家用电器  手机数码
省份区域                          
华东        4444.0  178108.0  211084.0
华中         600.0   49176.0   48827.0
          count    mean     std   min    25%    50%     75%      max
省份区域                                                             
华东      334.0  1308.4  2825.6   9.1  147.7  359.5  1119.1  24914.2
华中       73.0  1462.1  2948.7  18.7  124.9  433.9  1318.6  17628.2
```

### A1.7.2 常用聚合函数速查

| 函数 | 含义 | 备注 |
|---|---|---|
| `sum` | 求和 | 默认跳过 NaN |
| `mean` / `median` | 均值 / 中位数 | 中位数抗异常值 |
| `count` / `size` | 非空个数 / 行数（含 NaN） | `count` 不计 NaN，`size` 计 |
| `nunique` | 去重计数 | 数"有多少个不同的客户" |
| `min` / `max` | 最小 / 最大 | 配合 `idxmin`/`idxmax` 定位 |
| `std` / `var` | 标准差 / 方差 | 默认样本口径 `ddof=1` |
| `first` / `last` | 第一个 / 最后一个 | 时间序列常用 |
| `quantile` | 分位数 | `quantile(.9)` |
| `agg(list)` | 把组内值收成列表 | 想细看某组明细时 |
| `agg("sum"/"mean")` | 字符串写函数名 | 一次多个：`agg(["sum","mean"])` |

```python
# 分组后一次算多个函数（列名是多级索引）
print(df.groupby("客户性别")["销售额"].agg(["sum", "mean"]).round(1))
```

> 输出：
```text
               sum    mean
客户性别                    
女        746518.0  1400.6
男        845577.9  1592.4
```

### A1.7.3 transform / filter / apply 三兄弟的区别

| 方法 | 返回什么 | 什么时候用 |
|---|---|---|
| `agg` | 每组**一行**（压缩） | 出汇总报表 |
| `transform` | **和原表一样长**，把组内结果广播回每行 | 加"占组内均值的比例"这类列 |
| `filter` | **筛掉整组** | "只保留订单数大于 180 的城市" |
| `apply` | 任意结果 | 上面的都不满足时才用（慢） |

```python
# transform：把"本行所在区域的平均销售额"贴回每一行
print(df.assign(区域均值=df.groupby("省份区域")["销售额"].transform("mean"))
        .loc[0:2, ["省份区域", "销售额", "区域均值"]].round(2))
# filter：按组的大小/条件筛整组
print(df.groupby("城市").filter(lambda g: len(g) > 180).shape)
# apply：自定义组内计算
print(df.groupby("城市")["销售额"].apply(lambda s: s.max() - s.min()).round(1).head(3))
```

> 输出：
```text
  省份区域    销售额  区域均值
0     华东   3313.80   1308.43
1     西南  15717.66   1321.44
2     华东    853.09   1308.43
(196, 14)
城市
上海    24503.8
北京    51072.9
广州    24533.5
Name: 销售额, dtype: float64
```

> ⚠️ `apply` 是"逐组跑 Python 函数"，比 `transform("mean")` 这种内置聚合慢几十倍。
> 能用 `agg` / `transform` 就绝不用 `apply`（A3 手册 F 节有对比）。

### A1.7.4 透视、交叉表、宽长转换、独热编码

| 函数 | 作用 | 一句话记住 |
|---|---|---|
| `pivot_table` | 透视表：行维度 × 列维度 × 聚合值 | Excel 数据透视表的代码版 |
| `crosstab` | 频次交叉表（数个数） | 专做"两个分类变量各多少组合" |
| `melt` | 宽表 → 长表 | 画图前必做的一步 |
| `pivot` | 长表 → 宽表 | 不聚合，要求组合唯一 |
| `get_dummies` | 独热编码 | 把"城市"变成 8 个 0/1 列，喂模型用 |

```python
# pivot_table：行=省份区域，列=商品类别，值=销售额合计
print(df.pivot_table(index="省份区域", columns="商品类别", values="销售额",
                     aggfunc="sum", fill_value=0).round(0).iloc[:2, :3])
# crosstab：默认数字数
print(pd.crosstab(df["客户性别"], df["支付方式"]).iloc[:, :3])
# 加 normalize="index" 变成行占比，比数字更容易比较
print(pd.crosstab(df["客户性别"], df["支付方式"], normalize="index").round(3).iloc[:, :2])
```

> 输出：
```text
商品类别  图书文娱  家用电器  手机数码
省份区域                          
华东        4444.0  178108.0  211084.0
华中         600.0   49176.0   48827.0
支付方式  微信支付  支付宝  花呗
客户性别                    
女             179     234    53
男             182     221    55
支付方式  微信支付  支付宝
客户性别                  
女           0.336   0.439
男           0.343   0.416
```

```python
# get_dummies：独热编码。dtype=int 让结果好看又好存
print(pd.get_dummies(df["客户性别"], dtype=int).head(3))
# melt：宽转长。3 行 × 2 个指标 = 6 行
print(pd.melt(df.head(3), id_vars=["订单编号"], value_vars=["单价", "销售额"]).shape)
```

> 输出：
```text
   女  男
0   0   1
1   1   0
2   1   0
(6, 3)
```

---

## A1.8 合并连接：merge / concat / join

### A1.8.1 merge 的四种 how（示意图）

```text
  左表 A                    右表 B
  左外连接(left)            右外连接(right)
   ┌────────┐               ┌────────┐
   │  A ┌───┼───┐ B         │  A ┌───┼───┐ B
   │    │███████│  ← A全部  │    │███████│  ← B全部
   │    └───┼───┘  + 匹配的 │    └───┼───┘  + 匹配的
   └────────┘       B       └────────┘       A

  内连接(inner)             全外连接(outer)
   ┌────────┐               ┌────────┐
   │  A ┌───┼───┐ B         │  A ┌───┼───┐ B
   │    │███│   │  ← 只留  │    │███████│  ← 两边
   │    └───┼───┘    交集   │    └───┼───┘    全都要
   └────────┘               └────────┘
```

| `how` | 保留哪些行 | 什么时候用 | 行数变化 |
|---|---|---|---|
| `"inner"` | 两边**都**匹配上的 | 只分析有完整信息的记录 | 通常变少 |
| `"left"` | 左表全部 + 右表匹配的 | **最常用**：给主表贴标签 | ≥ 左表行数 |
| `"right"` | 右表全部 + 左表匹配的 | 少见，等于把左右换个位置 | ≥ 右表行数 |
| `"outer"` | 两边全部，缺的填 NaN | 找"只在一侧存在"的异常记录 | 最多 |
| `cross` | 笛卡尔积 | 造组合（每城市 × 每月份） | m×n |

```python
# 左表：订单；右表：城市等级字典
customers = pd.DataFrame({"城市": ["北京", "上海", "火星"], "城市等级": ["一线", "一线", "未知"]})
print(df[["订单编号", "城市"]].head(3).merge(customers, on="城市", how="left"))
# indicator=True 会多出一列 _merge，一眼看出每行是从哪边来的
print(df[["订单编号", "城市"]].head(3).merge(customers, on="城市", how="left",
                                              indicator=True)["_merge"].tolist())
```

> 输出：
```text
        订单编号  城市 城市等级
0  SO20230300508  杭州      NaN
1  SO20231100279  成都      NaN
2  SO20231200633  杭州      NaN
['left_only', 'left_only', 'left_only']
```

四种 `how` 的行数对比（用刻意设计的小表，一眼看清差别）：

```python
left = pd.DataFrame({"k": [1, 2, 2, 3], "v": ["a", "b", "c", "d"]})
right = pd.DataFrame({"k": [2, 2, 3, 4], "w": ["x", "y", "z", "q"]})
for how in ["inner", "left", "right", "outer"]:
    m = left.merge(right, on="k", how=how, indicator=True)
    print(f"{how:>5}: {len(m)} 行  {m['_merge'].value_counts().to_dict()}")
```

> 输出：
```text
inner: 5 行  {'both': 5, 'left_only': 0, 'right_only': 0}
 left: 6 行  {'both': 5, 'left_only': 1, 'right_only': 0}
right: 6 行  {'both': 5, 'right_only': 1, 'left_only': 0}
outer: 7 行  {'both': 5, 'left_only': 1, 'right_only': 1}
```

| merge 参数 | 作用 | 示例 |
|---|---|---|
| `on` | 两边列名相同的连接键 | `on="订单编号"` |
| `left_on` / `right_on` | 两边列名不同时分别指定 | `left_on="客户ID", right_on="ID"` |
| `how` | 连接方式 | `"left"`（默认是 `"inner"`！） |
| `suffixes` | 同名列的区分后缀 | `suffixes=("_左", "_右")` |
| `indicator` | 加 `_merge` 列标出来源 | `indicator=True` |
| `validate` | 校验关系，防止行数意外膨胀 | `validate="many_to_one"` |
| `left_index`/`right_index` | 用索引当连接键 | `left_index=True` |

> ⚠️ **merge 后行数变多/变少是最常见的坑**
> 变多：连接键在右表不唯一（一对多会**成倍**膨胀）。
> 变少：用了 `inner` 且左表有匹配不上的键。
> 排查固定套路：加 `indicator=True` 看 `_merge` 分布，再加 `validate="many_to_one"` 让 pandas 帮你报错。
> 详见 A3 手册 C 节。

### A1.8.2 concat / join / combine_first

```python
# concat 纵向拼（上下接）：ignore_index 重新编号，否则索引会重复
print(pd.concat([df.head(2), df.tail(2)], ignore_index=True).shape)
# concat 横向拼（左右接）：axis=1，必须靠索引对齐
print(pd.concat([df.head(3), df.tail(3)], axis=1).shape)
# join：以索引为准的快捷合并
a = df.set_index("订单编号")[["销售额"]].head(3)
b = df.set_index("订单编号")[["数量"]].head(3)
print(a.join(b).shape)
# combine_first：a 的缺失位置用 b 的值补上
print(a.combine_first(pd.DataFrame({"销售额": [1.0]}, index=["X"])).shape)
```

> 输出：
```text
(4, 14)
(6, 28)
(3, 2)
(4, 1)
```

| 方法 | 方向 | 对齐依据 | 备注 |
|---|---|---|---|
| `pd.concat([a, b])` | 纵向（默认 `axis=0`） | 列名 | 用 `ignore_index=True` 重排索引 |
| `pd.concat([a, b], axis=1)` | 横向 | 索引 | 索引不一致会填 NaN |
| `a.join(b)` | 横向 | 索引 | 语法比 merge 短 |
| `a.combine_first(b)` | 叠放 | 索引 + 列名 | a 有值用 a，a 缺的用 b |

---

## A1.9 字符串 `.str` 方法全表

只要一列是字符串类型（pandas 3.0 里 dtype 显示为 `str`），就能用 `.str`。
**注意**：`.str` 遇到缺失值会返回 NaN，不会报错。

| 方法 | 作用 | 例子（结果是 `"订单编号"` / `"城市"` 列上的效果） |
|---|---|---|
| `str.len()` | 字符个数 | `df["城市"].str.len()` |
| `str.lower()` / `str.upper()` | 转小写 / 大写 | `df["城市"].str.upper()` |
| `str.title()` / `str.capitalize()` | 词首大写 / 首字母大写 | `s.str.title()` |
| `str.strip()` / `lstrip()` / `rstrip()` | 去两端 / 左 / 右空格 | `df["城市"].str.strip()` |
| `str.contains(pat)` | 是否包含（支持正则） | `df["商品名称"].str.contains("手机\|耳机", regex=True)` |
| `str.startswith()` / `endswith()` | 开头 / 结尾 | `df["城市"].str.startswith("北").sum()` |
| `str.match()` / `fullmatch()` | 正则从头匹配 / 完全匹配 | `s.str.fullmatch(r"\d{3}")` |
| `str.find()` / `rfind()` | 首次 / 末次出现位置（找不到 -1） | `s.str.find("A")` |
| `str.index()` / `rindex()` | 同上，但找不到会报错 | `s.str.index("A")` |
| `str.count(pat)` | 出现次数 | `s.str.count(",")` |
| `str.replace(a, b)` | 替换 | `df["城市"].str.replace("北京", "北京市", regex=False)` |
| `str.slice(起, 止)` | 按位置切片 | `df["订单编号"].str.slice(2, 6)` |
| `str.split(sep)` | 切成列表 | `s.str.split("-")` |
| `str.rsplit()` / `str.partition()` / `str.rpartition()` | 从右切 / 切成三段 | `s.str.partition("-")` |
| `str.split(expand=True)` | 切成**多列** | `df["商品名称"].str.split(" ", expand=True)` |
| `str.cat(others, sep)` | 拼接多列/多值 | `df["a"].str.cat(df["b"], sep="-")` |
| `str.join(sep)` | 把列表元素拼成串 | `s.str.split("-").str.join("")` |
| `str.get(i)` | 取列表/分组的第 i 个 | `s.str.get(0)` |
| `str.extract(pat)` | 正则**提取**捕获组 | `s.str.extract(r"(\d+)年")` |
| `str.extractall(pat)` | 提取所有匹配（返回多行） | `s.str.extractall(r"\d")` |
| `str.findall(pat)` | 找出全部匹配（列表） | `s.str.findall(r"[\u4e00-\u9fa5]+")` |
| `str.zfill(n)` / `str.pad(n)` | 左补 0 / 补字符到 n 位 | `pd.Series([1, 22]).astype(str).str.zfill(4)` |
| `str.center()` / `ljust()` / `rjust()` | 居中 / 左对齐 / 右对齐 | `s.str.center(10, "*")` |
| `str.repeat(n)` | 重复 n 次 | `s.str.repeat(3)` |
| `str.wrap(n)` | 按宽度折行 | `s.str.wrap(10)` |
| `str.swapcase()` | 大小写互换 | `s.str.swapcase()` |
| `str.casefold()` | 更彻底的小写（处理德语 ß 等） | `s.str.casefold()` |
| `str.normalize("NFKC")` | Unicode 规范化（全角→半角） | `s.str.normalize("NFKC")` |
| `str.encode()` / `str.decode()` | 编解码 | `s.str.encode("utf-8")` |
| `str.translate()` | 按字符映射表替换 | `s.str.translate(str.maketrans("ab", "AB"))` |
| `str.removeprefix()` / `str.removesuffix()` | 去前缀 / 后缀 | `s.str.removeprefix("SO")` |
| `str.isalpha()` / `isnumeric()` / `isdigit()` / `isdecimal()` | 是否全字母 / 数字 / 数字 / 十进制数 | `s.str.isdigit()` |
| `str.isalnum()` / `isspace()` / `islower()` / `isupper()` / `istitle()` | 其它判断 | `s.str.isspace()` |
| `str.isascii()` | 是否全是 ASCII 字符（**判断有没有中文的好帮手**） | `s.str.isascii()` |
| `str.get_dummies(sep)` | 按分隔符做独热编码 | `s.str.get_dummies(sep=",")` |

```python
print(df["商品名称"].head(3).tolist())            # 先看看长什么样
print(df["商品名称"].str.contains("手机|耳机", regex=True).sum())
print(df["商品名称"].str.extract(r"(\D+)")[0].head(3).tolist())   # 提取非数字部分
print(df["订单编号"].str.slice(2, 6).head(3).tolist())            # 从订单号里切出年份
print(df["城市"].str.len().head(3).tolist())
print(df["城市"].str.startswith("北").sum())
print(df["商品名称"].str.findall(r"[\u4e00-\u9fa5]+").head(2).tolist())
```

> 输出：
```text
['扫地机器人', '蓝牙耳机', '坚果礼盒']
119
['扫地机器人', '蓝牙耳机', '坚果礼盒']
['2023', '2023', '2023']
[2, 2, 2]
173
[['扫地机器人'], ['蓝牙耳机']]
```

> ⚠️ **去掉空格用 `str.strip()`**：`sales.csv` 里有 61 行的城市名前后带空格，
> 不 strip 会让"北京"和"北京 "被当成两个不同的城市（这是第 5 章的经典练习题）。

---

## A1.10 时间 `.dt` 属性全表 + `resample` 频率别名

### A1.10.1 `.dt` 属性速查

前提：这一列的 dtype 必须是 `datetime64[ns]` / `datetime64[us]`。
不是日期类型会报 `AttributeError: Can only use .dt accessor with datetimelike values`。

| 属性 | 含义 | 示例值 |
|---|---|---|
| `dt.year` / `month` / `day` | 年 / 月 / 日 | `df["订单日期"].dt.year` → `2023` |
| `dt.hour` / `minute` / `second` / `microsecond` / `nanosecond` | 时 / 分 / 秒 / 微秒 / 纳秒 | `s.dt.hour` |
| `dt.quarter` | 季度（1~4） | `s.dt.quarter` → `1` |
| `dt.week` / `weekofyear` | 一年中第几周 | `s.dt.week` |
| `dt.dayofweek` / `weekday` | 星期几（**周一=0**） | `s.dt.dayofweek` → `2` |
| `dt.day_name()` | 星期几的英文名 | `'Wednesday'` |
| `dt.month_name()` | 月份英文名 | `'March'` |
| `dt.dayofyear` / `day_of_year` | 一年中第几天 | `s.dt.dayofyear` |
| `dt.days_in_month` / `daysinmonth` | 当月天数 | `s.dt.days_in_month` |
| `dt.is_leap_year` | 是否闰年 | `True` |
| `dt.is_month_start` / `is_month_end` | 是否月初 / 月末 | `s.dt.is_month_end` |
| `dt.is_quarter_start` / `is_quarter_end` | 是否季初 / 季末 | `s.dt.is_quarter_end` |
| `dt.is_year_start` / `is_year_end` | 是否年初 / 年末 | `s.dt.is_year_end` |
| `dt.date` | 只取日期部分（Python date 对象） | `s.dt.date` |
| `dt.time` | 只取时间部分 | `s.dt.time` |
| `dt.strftime(格式)` | 格式化成字符串 | `s.dt.strftime("%Y-%m")` → `'2023-03'` |
| `dt.to_period("M")` | 转成"月份周期" | `Period('2023-03', 'M')` |
| `dt.to_pydatetime()` | 转成 Python datetime 对象 | `s.dt.to_pydatetime()` |
| `dt.days` / `seconds` / `microseconds` / `nanoseconds` | 时间差的分量（**Timedelta 专用**） | `(s - s.min()).dt.days` |
| `dt.total_seconds()` | 时间差总秒数（Timedelta 专用） | `td.dt.total_seconds()` |
| `dt.components` | 时间差拆成 days/hours/... 的表 | `td.dt.components` |
| `dt.normalize()` | 把时间部分归零（当天 00:00） | `s.dt.normalize()` |
| `dt.floor("h")` / `dt.ceil("h")` / `dt.round("h")` | 向下 / 向上 / 就近取整到整点 | `s.dt.floor("h")` |
| `dt.asfreq("D")` | 改频率 | `s.dt.asfreq("D")` |
| `dt.tz` / `tz_localize()` / `tz_convert()` | 时区查看 / 本地化 / 转换 | `s.dt.tz_localize("Asia/Shanghai")` |
| `dt.isocalendar()` | ISO 年/周/星期表 | `s.dt.isocalendar()` |
| `dt.unit` / `dt.freq` | 时间精度 / 频率 | `s.dt.unit` |

```python
print(df["订单日期"].dt.year.value_counts().to_dict())      # 各年份订单数
print(df["订单日期"].dt.day_name().head(3).tolist())        # 星期几（英文）
print(df["订单日期"].dt.month_name().head(3).tolist())      # 月份名
print(df["订单日期"].dt.dayofweek.head(3).tolist())         # 周一=0
print(df["订单日期"].dt.quarter.head(3).tolist())
print(df["订单日期"].dt.is_month_end.head(3).tolist())
print(df["订单日期"].dt.to_period("M").head(3).tolist())
print(df["订单日期"].dt.strftime("%Y-%m").head(3).tolist())
```

> 输出：
```text
{2024: 533, 2023: 531}
['Wednesday', 'Tuesday', 'Sunday']
['March', 'November', 'December']
[2, 1, 6]
[1, 4, 4]
[False, False, False]
[Period('2023-03', 'M'), Period('2023-11', 'M'), Period('2023-12', 'M')]
['2023-03', '2023-11', '2023-12']
```

### A1.10.2 `resample` 频率别名表（⚠️ 含 pandas 3.0 变更）

| 想做什么 | 正确别名 | **pandas 3.0 不能再用** |
|---|---|---|
| 按日 | `D` | — |
| 按周（周日为周期末） | `W` | — |
| 按月末 | `ME` | ~~`M`~~ 报错 |
| 按月初 | `MS` | — |
| 按季末 | `QE` | ~~`Q`~~ 报错 |
| 按季初 | `QS` | — |
| 按年末 | `YE` | ~~`Y`~~ 报错 |
| 按年初 | `YS` | — |
| 按小时 | `h` | ~~`H`~~ |
| 按分钟 | `min` | ~~`T`~~ |
| 按 15 分钟 | `15min` | — |
| 按月末 + `DEC` 结尾 | `ME-DEC`（财年） | — |

```python
ts_sales = df.set_index("订单日期")["销售额"]      # 把日期设为索引才能 resample
print(ts_sales.resample("ME").sum().round(0).head(3).to_dict())    # 月 ✅
print(ts_sales.resample("QE").sum().round(0).to_dict())            # 季 ✅
print(ts_sales.resample("YE").sum().round(0).to_dict())            # 年 ✅
print(ts_sales.resample("W").sum().round(0).head(3).to_dict())     # 周 ✅
```

> 输出：
```text
{Timestamp('2023-01-31 00:00:00'): 115679.0, Timestamp('2023-02-28 00:00:00'): 62860.0, Timestamp('2023-03-31
   00:00:00'): 81994.0}
{Timestamp('2023-03-31 00:00:00'): 260533.0, Timestamp('2023-06-30 00:00:00'): 168113.0, Timestamp('2023-09-30
   00:00:00'): 169248.0, Timestamp('2023-12-31 00:00:00'): 227244.0, Timestamp('2024-03-31 00:00:00'): 202003.0,
   Timestamp('2024-06-30 00:00:00'): 205162.0, Timestamp('2024-09-30 00:00:00'): 187820.0, Timestamp('2024-12-31
   00:00:00'): 171974.0}
{Timestamp('2023-12-31 00:00:00'): 825138.0, Timestamp('2024-12-31 00:00:00'): 766958.0}
{Timestamp('2023-01-01 00:00:00'): 510.0, Timestamp('2023-01-08 00:00:00'): 17509.0, Timestamp('2023-01-15 00:00:00'):
   78098.0}
```

> ⚠️ **最常见的新版报错**
> `ValueError: Invalid frequency: M. ... Please use 'ME' instead.`
> 老教材、老博客里全是 `resample("M")`，在 pandas 3.0 里直接报错。
> 记忆方法：**M 已经"属于"月初（Month Start 是 MS）之外的含义了，
> 月末一律加 E（End）：ME / QE / YE**。详见 A3 手册 A 节。

### A1.10.3 `date_range` / `to_period` / `Timedelta`

```python
# 造日期序列：freq 用同一套别名
print(len(pd.date_range("2024-01-01", "2024-12-31", freq="ME")))       # 12 个月末
print(pd.date_range("2024-01-01", periods=3, freq="D").tolist())
# to_period：把时间戳变"周期"。用 Period 做分组键，输出比 Timestamp 干净得多
monthly_p = ts_sales.resample("ME").sum().to_period("M")
print(monthly_p.head(3).round(2).tolist())
# 时间差：两个 Timestamp 相减得到 Timedelta
print((pd.Timestamp("2024-12-31") - pd.Timestamp("2024-01-01")).days)
print((pd.Timestamp("2024-01-02 12:00") - pd.Timestamp("2024-01-01 00:00")).total_seconds())
```

> 输出：
```text
12
[Timestamp('2024-01-01 00:00:00'), Timestamp('2024-01-02 00:00:00'), Timestamp('2024-01-03 00:00:00')]
[115678.79, 62860.35, 81993.68]
365
129600.0
```

> 输出：
```text
12
[Timestamp('2024-01-01 00:00:00'), Timestamp('2024-01-02 00:00:00'), Timestamp('2024-01-03 00:00:00')]
[Period('2023-01', 'M'), Period('2023-02', 'M'), Period('2023-03', 'M')]
365
129600.0
```

| 类/函数 | 作用 | 例子 |
|---|---|---|
| `pd.Timestamp` | 单个时间点 | `pd.Timestamp("2024-01-01")` |
| `pd.Timedelta` | 一段时间 | `pd.Timedelta(days=7)` |
| `pd.date_range` | 生成日期序列 | `pd.date_range("2024-01-01", periods=7, freq="D")` |
| `pd.to_datetime` | 字符串 → 日期 | `pd.to_datetime(s, format="mixed")` |
| `pd.to_timedelta` | 数字/字符串 → 时间差 | `pd.to_timedelta("1 days 02:00")` |
| `Series.dt` | 日期属性访问器 | `df["订单日期"].dt.year` |
| `Series.resample` | 按时间频率重采样 | `s.resample("ME").sum()` |

---

## A1.11 统计函数速查

```python
# 一次拿到 9 个统计量；取其中几个常用值看，避免输出太长
st = df["销售额"].agg(["sum", "mean", "median", "std", "var",
                       "min", "max", "skew", "kurt"]).round(3)
print(st[["sum", "mean", "median", "std", "skew"]].to_dict())
print(df["支付方式"].mode().tolist())
print(df["销售额"].quantile([.25, .5, .75]).round(2).to_dict())
print(df.corr(numeric_only=True).loc["单价", "销售额"].round(3))
```

> 输出：
```text
{'sum': 1592095.89, 'mean': 1496.331, 'median': 413.025, 'std': 3367.49, 'skew': 6.383}
['支付宝']
{0.25: 156.56, 0.5: 413.02, 0.75: 1306.19}
0.746
```

| 函数 | 含义 | 白话 |
|---|---|---|
| `sum()` | 求和 | 加起来 |
| `mean()` | 均值 | 加起来除以个数，**怕极端值** |
| `median()` | 中位数 | 排队站中间的那个，**不怕极端值** |
| `mode()` | 众数 | 出现最多的值（返回 Series，可能多个） |
| `std()` | 标准差 | 波动大小，和原始数据**同量纲** |
| `var()` | 方差 | 标准差的平方，**不同量纲** |
| `min()` / `max()` | 最小 / 最大 | 极值 |
| `quantile(q)` | 分位数 | `q=0.5` 就是中位数 |
| `describe()` | 一次出 8 个统计量 | 报告首选 |
| `corr()` | 相关系数矩阵 | 线性相关强弱，范围 -1~1 |
| `corrwith(other)` | 和另一个序列/表的相关系数 | `df.corrwith(df["销售额"])` |
| `cov()` | 协方差 | 同向变动程度，量纲受单位影响 |
| `skew()` | 偏度 | `>0` 右偏（长尾在右边，收入/销售额典型） |
| `kurt()` | 峰度 | `>0` 尖峰厚尾（极端值多） |
| `cumsum()` / `cumprod()` / `cummax()` / `cummin()` | 累计和 / 积 / 最大 / 最小 | 累计曲线 |
| `diff()` | 一阶差分（后一个减前一个） | 看每天增长量 |
| `pct_change()` | 环比变化率 | `(今天-昨天)/昨天` |
| `shift(n)` | 整体下移 n 行 | 造"上一期"列做同比 |
| `idxmin()` / `idxmax()` | 最小 / 最大值的索引 | 定位极值在哪一行 |
| `rolling(n)` | 移动窗口 | 移动平均 |
| `expanding()` | 扩张窗口（从第一行到现在） | 累计均值 |
| `ewm(span=n)` | 指数加权 | 近期数据权重更高 |
| `value_counts()` | 频次统计（对 Series） | 分类变量第一件事 |
| `nunique()` | 去重计数 | 有几个不同的值 |
| `abs()` | 绝对值 | 处理负销售额 |

```python
print(df["销售额"].cumsum().iloc[-1].round(2))
print(df.sort_values("订单日期")["销售额"].diff().dropna().head(3).round(2).tolist())
print(df.sort_values("订单日期")["销售额"].pct_change().dropna().head(3).round(4).tolist())
print(df["销售额"].expanding().mean().iloc[-1].round(2))
print(df[["单价", "销售额"]].cov().round(1))
```

> 输出：
```text
1592095.89
[-419.83, -13.98, 148.67]
[-0.9028, -0.3092, 4.7605]
1496.33
             单价        销售额
单价    1536309.4   3115681.9
销售额  3115681.9  11339991.4
```

> 💡 `std(ddof=1)` 是**样本标准差**（除以 n-1），`std(ddof=0)` 是**总体标准差**（除以 n）。
> pandas 默认 `ddof=1`，和 Excel 的 `STDEV.S` 一致，和 `STDEV.P` 不一致 —— 对不上数时先查这里。

---

## A1.12 窗口函数：rolling / expanding / ewm

| 方法 | 窗口 | 权重 | 典型用途 |
|---|---|---|---|
| `rolling(window=n)` | 固定长度 n，**滑动** | 等权 | 7 日移动平均、30 日均线 |
| `expanding()` | 从开头到当前行，**不断变长** | 等权 | 累计均值、累计最大回撤 |
| `ewm(span=n)` | 全部历史，**指数衰减** | 越近越重 | 平滑指标、监控告警基线 |

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `window` | 窗口长度（行数或 `"7D"` 这类时间字符串） | `7`、`30`、`"7D"` |
| `min_periods` | 至少要有几个数才出结果 | `1`（开头不留 NaN） |
| `center` | 窗口是否居中（把当前点放中间） | `False` 默认 / `True` 用于平滑曲线 |
| `closed` | 时间窗口的闭区间方向（时间窗口时用） | `"right"`（默认）/ `"left"` / `"both"` |
| `win_type` | 窗口形状（高斯、汉宁等） | `"gaussian"` |
| `on` | 用哪一列当时间轴（DataFrame 上用时间窗口时必填） | `on="订单日期"` |
| `span`（仅 ewm） | 衰减跨度，越大越平滑 | `7`、`30` |
| `alpha`（仅 ewm） | 平滑系数，`alpha = 2/(span+1)` | `0.2` |
| `halflife`（仅 ewm） | 半衰期 | `"3D"` |
| `adjust`（仅 ewm） | 是否做偏差修正 | `True` 默认 |

```python
s = df.sort_values("订单日期")["销售额"]           # 必须先按时间排序，否则窗口是乱的
print(s.rolling(7).mean().dropna().head(3).round(2).tolist())          # 默认 min_periods=window
print(s.rolling(7, min_periods=1).mean().head(3).round(2).tolist())    # 开头也有数
print(s.ewm(span=7).mean().iloc[-1].round(2))
print(s.rolling(7, center=True).mean().dropna().shape)
```

> 输出：
```text
[360.11, 294.98, 301.71]
[465.04, 255.12, 180.49]
896.7
(1058,)
```

```python
# 时间窗口：window 也可以写 "7D"，这时要先用 set_index 让索引是时间
ts2 = df.set_index("订单日期").sort_index()
# 同一天可能有多笔订单，所以 "7D" = 最近 7 个自然日内的所有订单之和
last7 = ts2["销售额"].rolling("7D").sum()
print(last7.shape, int(last7.isna().sum()))          # min_periods 默认 1，所以没有 NaN
print(round(float(last7.iloc[0]), 2), round(float(last7.iloc[-1]), 2))
```

> 输出：
```text
(1064,) 0
465.04 9583.69
```

> 💡 时间窗口 `"7D"` 是"最近 7 个**自然日**"，而 `rolling(7)` 是"最近 7 **行**"。
> 数据不是每天一行时（比如订单流水），两者结果完全不同，用错了移动平均就没有业务含义。

---

## A1.13 缺失值速查

| 任务 | 写法 | 说明 |
|---|---|---|
| 有多少缺失 | `df.isna().sum()` | 每列统计；`df.isna().sum().sum()` 是总数 |
| 缺失比例 | `df.isna().mean().round(3)` | 超过 0.5 的列通常直接删 |
| 看哪些行有缺失 | `df[df.isna().any(axis=1)]` | `any(axis=1)` = 这一行只要有一个缺失就 True |
| 删缺失行 | `df.dropna()` | 只要有一个缺失就删整行 |
| 删指定列的缺失行 | `df.dropna(subset=["销售额"])` | 最常用：只关心目标列 |
| 删缺失列 | `df.dropna(axis=1)` | 谨慎，容易删掉有用信息 |
| 全空才删 | `df.dropna(how="all")` | 默认 `how="any"` |
| 填常数 | `df.fillna(0)` / `fillna("未知")` | 分类列常用"未知" |
| 填均值/中位数 | `df["客户年龄"].fillna(df["客户年龄"].mean())` | 数值列；有异常值时用中位数 |
| 前向/后向填充 | `df.ffill()` / `df.bfill()` | 时间序列；**pandas 3.0 只能用这两个** |
| 限制填充行数 | `df.ffill(limit=2)` | 最多连续填 2 个 |
| 线性插值 | `df["期末成绩"].interpolate()` | 连续变量、时间序列 |
| 按时间插值 | `df.interpolate(method="time")` | 索引是时间时更准 |
| 组内填充 | `df.groupby("班级")["每周自习小时"].transform(lambda s: s.fillna(s.median()))` | 用本班中位数填本班，比全局均值合理 |
| 标记缺失再填充 | `df.assign(年龄缺失=df["客户年龄"].isna())` | 缺失本身可能就是信息（"没填"=不愿意说） |

```python
print(int(stu.isna().sum().sum()))
print(stu.isna().sum()[stu.isna().sum() > 0].to_dict())
print(int(stu["每周自习小时"].fillna(stu["每周自习小时"].median()).isna().sum()))
print(int(stu["每周自习小时"].ffill().isna().sum()))
print(int(stu.groupby("班级")["每周自习小时"]
          .transform(lambda x: x.fillna(x.median())).isna().sum()))
```

> 输出：
```text
17
{'每周自习小时': 12, '期末成绩': 5}
0
0
0
```

> ⚠️ **空字符串 ≠ 缺失值**
> `sales.csv` 的 `客户性别` 有 22 行是 `""`（空字符串）。
> `df.isna().sum()` 统计不到它们！必须自己转：
> `df["客户性别"].replace("", np.nan)`，然后再 `isna()` 才看得见。
> 详见 A4 术语表的"缺失值 vs 空字符串 vs 零值"。

---

## A1.14 最常用的 25 个操作 Top 25

按真实工作里的使用频率排序。**背下来这 25 条，日常 90% 的活都能干**。

| # | 操作 | 一行代码 |
|---|---|---|
| 1 | 读 CSV | `df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])` |
| 2 | 看前几行 | `df.head()` |
| 3 | 看结构（类型+缺失+内存） | `df.info()` |
| 4 | 看数值摘要 | `df.describe().round(2)` |
| 5 | 看每列缺失情况 | `df.isna().sum()` |
| 6 | 看分类变量分布 | `df["城市"].value_counts()` |
| 7 | 选一列 | `df["销售额"]` |
| 8 | 选多列 | `df[["城市", "销售额"]]` |
| 9 | 条件筛行 | `df[df["销售额"] > 5000]` |
| 10 | 多条件筛行 | `df[(df["销售额"] > 5000) & (df["城市"] == "北京")]` |
| 11 | 可读的条件筛行 | `df.query("销售额 > 5000 and 城市 == '北京'")` |
| 12 | 按值排序 | `df.sort_values("销售额", ascending=False)` |
| 13 | 取 Top N | `df.nlargest(10, "销售额")` |
| 14 | 新增计算列 | `df.assign(金额=df["单价"] * df["数量"])` |
| 15 | 条件新增列 | `df.assign(大单=np.where(df["销售额"] > 5000, "是", "否"))` |
| 16 | 分组求和 | `df.groupby("省份区域")["销售额"].sum()` |
| 17 | 分组多指标（具名聚合） | `df.groupby("省份区域")["销售额"].agg(总额="sum", 均值="mean")` |
| 18 | 分组占比（广播回原表） | `df.assign(占比=df["销售额"] / df.groupby("省份区域")["销售额"].transform("sum"))` |
| 19 | 透视表 | `df.pivot_table(index="省份区域", columns="商品类别", values="销售额", aggfunc="sum", fill_value=0)` |
| 20 | 交叉表 | `pd.crosstab(df["客户性别"], df["支付方式"], normalize="index")` |
| 21 | 连接两张表 | `df.merge(customers, on="城市", how="left")` |
| 22 | 上下拼接 | `pd.concat([df1, df2], ignore_index=True)` |
| 23 | 按月汇总 | `df.set_index("订单日期")["销售额"].resample("ME").sum()` |
| 24 | 移动平均 | `df.sort_values("订单日期")["销售额"].rolling(7).mean()` |
| 25 | 存成 CSV/Parquet | `df.to_csv("out.csv", index=False, encoding="utf-8-sig")` |

把 20~25 这几条串起来，就是一份完整的小分析：

```python
# 一次跑完：按月汇总 → 求环比 → 找最大的那个月
monthly = df.set_index("订单日期")["销售额"].resample("ME").sum()
report = monthly.to_frame("销售额").assign(
    环比=lambda d: d["销售额"].pct_change().round(4))
print(report.head(3).round(2))
print("最旺的月份:", report["销售额"].idxmax().strftime("%Y-%m"),
      round(float(report["销售额"].max()), 0))
```

> 输出：
```text
               销售额     环比
订单日期                    
2023-01-31 115678.79    NaN
2023-02-28  62860.35  -0.46
2023-03-31  81993.68   0.30
最旺的月份: 2023-01 115679.0
```

---

## 小结

- 拿到数据的固定顺序：`head` → `info` → `describe` → `isna().sum()` → `value_counts()`。
- 取数三兄弟：`[]` 筛行、`loc` 按名字、`iloc` 按位置；**loc 切片含结尾，iloc 不含**。
- 多条件一定用 `&` / `|` / `~` 加括号，不要用 `and` / `or` / `not`。
- 聚合优先写 `groupby().agg(新列名=("列", "函数"))` 具名聚合。
- `resample` 的月末/季末/年末是 `ME` / `QE` / `YE`，写 `M` / `Q` / `Y` 会报错。
- `.str` 处理文本、`.dt` 处理日期，两者遇到缺失都返回 NaN 而不报错。
- 缺失值、空字符串、零值是三件不同的事，先分清再处理。

> 相关的两个附录：**A2 可视化速查表**（画图）、**A3 版本差异与常见报错手册**（报错了查这里）。
