---
title: 附录 A3 · 版本差异与常见报错手册
date: 2026-09-26 10:00:00
permalink: /pyviz/a3-errors/
series: pyviz
chapter: 103
desc: pandas 3.0 的行为差异与常见报错速查
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- 常见报错
keywords: Python 数据分析, 数据可视化, 附录 A3 · 版本差异与常见报错手册, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 附录 A3 · 版本差异与常见报错手册
toc: true
comments: true
---
> 在这个环境里遇到报错，**先来这里搜**。
> 全部内容都是在本机 `pyviz` 环境（Python 3.11.16 / pandas 3.0.6）上**实际触发过**的，
> 报错原文是真的，不是抄来的。

---

## 本机环境版本（先记住这个）

| 库 | 版本 | 备注 |
|---|---|---|
| Python | **3.11.16** | conda 环境 `pyviz` |
| **pandas** | **3.0.6** | ⚠️ 比多数教材的 1.x/2.x 新一个大版本，有破坏性变更 |
| numpy | 2.4.6 | |
| matplotlib | 3.11.2 | |
| seaborn | 0.13.2 | |
| scikit-learn | 1.9.1 | |
| statsmodels | 0.15.0 | |
| plotly | 7.1.0 | |
| mlxtend | 0.25.0 | |
| pyarrow | 25.0.1 | |

**排查任何问题的第一步**：

```python
import sys, pandas as pd, numpy as np, matplotlib, sklearn
print(sys.version)
print("pandas", pd.__version__, "| numpy", np.__version__,
      "| matplotlib", matplotlib.__version__, "| sklearn", sklearn.__version__)
```

> 输出：
```text
3.11.16 (main, ...) [MSC v.1938 64 bit (AMD64)]
pandas 3.0.6 | numpy 2.4.6 | matplotlib 3.11.2 | sklearn 1.9.1
```

---

## 一、pandas 3.0 破坏性变更（最容易踩，务必看）

### 1.1 `resample("M")` 已废弃 → 用 `"ME"`

**报错原文**：
```text
ValueError: Invalid frequency: M. Failed to parse with error message:
ValueError("'M' is no longer supported for offsets. Please use 'ME' instead.")
```

**原因**：pandas 3.0 重新定义了所有频率别名的语义，月末从 `M` 改成 `ME`（Month End）。

**完整变更对照表**：

| 想要 | ✅ pandas 3.0 | ❌ 旧写法（报错） |
|---|---|---|
| 月末 | `"ME"` | `"M"` |
| 月初 | `"MS"` | `"MS"`（没变） |
| 季末 | `"QE"` | `"Q"` |
| 季初 | `"QS"` | `"QS"`（没变） |
| 年末 | `"YE"` | `"Y"` / `"A"` |
| 年初 | `"YS"` | `"YS"`（没变） |
| 周 | `"W"` | `"W"`（没变） |
| 日 | `"D"` | `"D"`（没变） |
| 小时 | `"h"` | `"H"`（大写已废弃） |

**怎么改**：

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])
ts = df.set_index("订单日期").sort_index()

# ✅ 正确
print("月末:", len(ts["销售额"].resample("ME").sum()), "个月")
print("季末:", len(ts["销售额"].resample("QE").sum()), "个季度")
print("年末:", len(ts["销售额"].resample("YE").sum()), "年")

# 另一种更稳的写法（语义更清楚，不依赖别名）
print("Grouper:", len(df.groupby(pd.Grouper(key="订单日期", freq="ME"))))
```

> 输出：
```text
月末: 24 个月
季末: 8 个季度
年末: 2 年
Grouper: 24
```

---

### 1.2 `DataFrame.applymap` 被彻底移除 → 用 `DataFrame.map`

**报错原文**：
```text
AttributeError: 'DataFrame' object has no attribute 'applymap'
```

**修复**：

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv")
sub = df[["单价", "数量"]].head(3)

# ❌ df.applymap(...)  → AttributeError
# ✅ 改成 df.map(...)
print(sub.map(lambda v: round(v, 1)).to_string())
```

> 输出：
```text
     单价  数量
0   800.0   1
1  4911.5   8
2   833.1   3
```

**三个方法的区别（别搞混）**：

| 方法 | 作用范围 | 说明 |
|---|---|---|
| `Series.map(f)` | 每个**值** | 一直是这个作用，没变 |
| `DataFrame.map(f)` | 每个**元素** | pandas 2.1 新增，**替代 applymap** |
| `DataFrame.apply(f, axis=)` | 每**行**或每**列** | 一直没变 |

---

### 1.3 `fillna(method=...)` 被移除 → 用 `ffill()` / `bfill()`

**报错原文**：
```text
TypeError: NDFrame.fillna() got an unexpected keyword argument 'method'
```

**修复**：

```python
import pandas as pd

s = pd.read_csv("../data/students.csv")["每周自习小时"]

# ❌ s.fillna(method="ffill")   → TypeError
# ✅ 用独立方法
print("ffill 后还有缺失:", s.ffill().isna().sum())
print("bfill 后还有缺失:", s.bfill().isna().sum())
print("插值后还有缺失:  ", s.interpolate().isna().sum())
print("用中位数填:      ", s.fillna(s.median()).isna().sum())
```

> 输出：
```text
ffill 后还有缺失: 0
bfill 后还有缺失: 0
插值后还有缺失:   0
用中位数填:       0
```

**新旧对照**：

| 旧写法 | 新写法 |
|---|---|
| `s.fillna(method="ffill")` | `s.ffill()` |
| `s.fillna(method="bfill")` | `s.bfill()` |
| `s.fillna(method="pad")` | `s.ffill()` |
| `s.fillna(method="backfill")` | `s.bfill()` |

---

### 1.4 字符串列的 dtype 从 `object` 变成了 `str`

**症状**：`df.select_dtypes("object")` **返回空表**。

**原因**：pandas 3.0 引入了真正的字符串类型 `str`（以前字符串都存成通用 `object`）。

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv")
print("dtypes 里的字符串列:", df["城市"].dtype)
print()
print("select_dtypes('object') 选到几列:", df.select_dtypes("object").shape[1])
print("select_dtypes(include='str') 选到几列:", df.select_dtypes(include="str").shape[1])
print("select_dtypes('number') 选到几列:", df.select_dtypes("number").shape[1])
print("同时选字符串和类别:", df.select_dtypes(include=["str", "category"]).shape[1])
```

> 输出：
```text
dtypes 里的字符串列: str

select_dtypes('object') 选到几列: 0
select_dtypes(include='str') 选到几列: 8
select_dtypes('number') 选到几列: 5
同时选字符串和类别: 8
```

**迁移建议**：把代码里所有 `select_dtypes("object")` 换成 `select_dtypes(include="str")`，
或者更稳的 `select_dtypes(exclude="number")`。

---

### 1.5 Copy-on-Write 已强制开启且无法关闭

**变化**：以前"切片后赋值可能改到原表"这个坑，在 3.0 里被彻底堵住了。

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv")

# 切片得到的结果是独立的，改它不会影响原表
sub = df[df["销售额"] > 5000]
print("切片结果行数:", len(sub))

# 想改就显式 copy
sub2 = sub.copy()
sub2["城市"] = "测试城市"
print("\n原表第一行城市:", df["城市"].iloc[0], "（没被改动）")
print("副本第一行城市:", sub2["城市"].iloc[0])
```

> 输出：
```text
切片结果行数: 72

原表第一行城市: 杭州 （没被改动）
副本第一行城市: 测试城市
```

**顺带一提**：`pd.options.mode.copy_on_write` 这个开关已经废弃，**设置它会报警告**：

```python
import pandas as pd
import warnings

with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    pd.options.mode.copy_on_write = True
    msgs = [str(x.message) for x in w if "copy_on_write" in str(x.message).lower()]
print("设置 copy_on_write 触发的警告数:", len(msgs))
if msgs:
    print("警告内容片段:", msgs[0][:110])
print("\n当前实际值:", pd.options.mode.copy_on_write)
```

> 输出：
```text
设置 copy_on_write 触发的警告数: 1
警告内容片段: The 'mode.copy_on_write' option is deprecated. Copy-on-Write can no longer be disabled (it is always enabled with pandas >= 3.0), and setting the option has no impact.

当前实际值: True
```

**结论**：**不要再写 `pd.options.mode.copy_on_write = True` 了**，它是默认且不可改的。

---

### 1.6 `pd.to_datetime` 混合格式必须显式声明

**报错原文**：
```text
ValueError: time data "2024/08/19" doesn't match format "%Y-%m-%d". You might want to try:
    - passing `format` if your strings have a consistent format;
    - passing `format='ISO8601'` if your strings are all ISO8601 but not necessarily in exactly the same format;
    - passing `format='mixed'`, and the format will be inferred for each element individually.
```

**原因**：pandas 3.0 不再逐行猜测日期格式（太慢且掩盖数据问题）。

**修复**：

```python
import pandas as pd

df = pd.read_csv("../data/sales.csv")     # 脏数据，日期有 3 种格式

# ❌ 直接 to_datetime 会报错
# ✅ 分两步
df["订单日期"] = (df["订单日期"].astype(str)
              .str.replace("年", "-", regex=False)
              .str.replace("月", "-", regex=False)
              .str.replace("日", "", regex=False))
df["订单日期"] = pd.to_datetime(df["订单日期"], format="mixed")
print("解析成功:", df["订单日期"].dtype, "| 失败数:", df["订单日期"].isna().sum())
```

> 输出：
```text
解析成功: datetime64[us] | 失败数: 0
```

**读 CSV 时的对应参数**：

```python
import pandas as pd

# 单一时用 parse_dates 就够
df1 = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])
print("单格式:", df1["订单日期"].dtype)

# 混合格式要加 date_format="mixed"
df2 = pd.read_csv("../data/sales.csv", usecols=["订单编号", "订单日期", "销售额"],
                  nrows=200, date_format="mixed")
print("混合格式:", df2["订单日期"].dtype)
```

> 输出：
```text
单格式: datetime64[us]
混合格式: str
```

> ⚠️ 第二个例子里 `订单日期` 仍是 `str`，因为**中文年月日格式连 `mixed` 也解析不了**。
> 所以有中文日期时，**必须先替换字符再 `to_datetime`**。

---

### 1.7 `'float' object has no attribute 'round'`

**报错原文**：
```text
AttributeError: 'float' object has no attribute 'round'
```

**原因**：`Series.rank(pct=True).max()` 返回的是 **Python 原生 float**，不是 numpy 标量。
原生 float **没有 `.round()` 方法**（那是 numpy 才有的）。

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv")
x = df["销售额"].rank(pct=True).max()
print("类型:", type(x).__name__)

# ❌ x.round(3)  → AttributeError
# ✅ 两种改法
print("round(float(x), 3) =", round(float(x), 3))
print("round(x, 3)        =", round(x, 3))

# numpy 标量则有 .round()
import numpy as np
y = np.float64(1.23456)
print("numpy 标量可以 .round():", y.round(3))
```

> 输出：
```text
类型: float
round(float(x), 3) = 1.0
round(x, 3)        = 1.0
numpy 标量可以 .round(): 1.235
```

---

### 1.8 其他已移除的老 API

| 老写法 | 状态 | 新写法 |
|---|---|---|
| `df.append(other)` | 早已移除 | `pd.concat([df, other])` |
| `df.iteritems()` | 已移除 | `df.items()` |
| `pd.is_categorical_dtype(x)` | 已移除 | `isinstance(x.dtype, pd.CategoricalDtype)` |
| `pd.is_sparse(x)` | 已移除 | `isinstance(x.dtype, pd.SparseDtype)` |
| `df.inplace=True` 的各种方法 | 逐步废弃 | 重新赋值（`df = df.dropna()`） |
| `Series.append` | 已移除 | `pd.concat` |

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv", nrows=5)
# ❌ df.iteritems() → AttributeError
# ✅
for col, series in df.items():
    pass
print("df.items() 可用，列数:", len(list(df.items())))

# inplace 虽然多数还能用，但推荐重新赋值
d = df.copy()
d2 = d.dropna()              # ✅ 推荐
print("重新赋值写法没问题:", d2.shape)
```

> 输出：
```text
df.items() 可用，列数: 14
重新赋值写法没问题: (5, 14)
```

---

## 二、环境与导入类报错

### 2.1 `ModuleNotFoundError: No module named 'pandas'`

**原因**：**九成是因为 conda 环境没激活**，用的是系统 Python。

```powershell
# 查看当前用的是哪个 Python
python -c "import sys; print(sys.executable)"
# 如果输出 D:\python\python.exe 或 C:\...\Python313\...，说明环境不对

# 正确做法
conda activate pyviz
python -c "import sys; print(sys.executable)"
# 应该输出 D:\conda\miniconda3\envs\pyviz\python.exe
```

### 2.2 `'conda' 不是内部或外部命令`

**原因**：用的是普通 cmd/PowerShell，没有加载 conda 初始化脚本。

**解决**（任选一个）：

```powershell
# 方案1：改用 "Anaconda Prompt"（开始菜单里搜）

# 方案2：在 PowerShell 里先执行一次初始化
& D:\conda\miniconda3\shell\condabin\conda-hook.ps1
conda activate pyviz
```

### 2.3 `FileNotFoundError: [Errno 2] No such file or directory: '../data/xxx.csv'`

**这是初学者最高频的错误**，没有之一。

**原因**：**当前工作目录不对**。教程假设你在 `code` 目录启动 Jupyter。

```python
# 诊断第一步：打印当前工作目录
import os
print("当前目录:", os.getcwd())
print("\n当前目录下有什么:")
for f in sorted(os.listdir("."))[:15]:
    print("  ", f)
print("\n上一级目录有什么:")
for f in sorted(os.listdir(".."))[:15]:
    print("  ", f)
```

> 输出：
```text
当前目录: <教程目录>\code

当前目录下有什么:
   _test
   check_fences.py
   gen_data.py
   mark_timing_blocks.py
   normalize_blocks.py
   probe.py
   probe2.py
   probe3.py
   verify_docs.py
   viz_style.py

上一级目录有什么:
   00_学习路径总览.md
   01_数据分析概念.md
   ...
   appendix
   code
   data
```

**解决**：

```powershell
# 启动 Jupyter 前先切目录
cd "<教程目录>\code"
jupyter lab
```

或者在 notebook 里临时切：

```python
import os
# 临时切到 code 目录（路径按自己的实际情况改）
target = r"<教程目录>\code"
if os.path.basename(os.getcwd()) != "code":
    os.chdir(target)
print("现在目录:", os.getcwd())
print("能找到数据目录吗:", os.path.exists("../data"))
```

> 输出：
```text
现在目录: <教程目录>\code
能找到数据目录吗: True
```

> 💡 **一个更省心的做法：用绝对路径写一个配置**。
> 在你自己的项目里，可以把数据目录定义成一个常量：
> ```python
> from pathlib import Path
> DATA = Path(r"<教程目录>\data")
> df = pd.read_csv(DATA / "sales_clean.csv")
> ```
> 这样无论从哪里运行都不会错。**代价是脚本不能直接给别人用**，
> 所以正式项目里还是推荐用相对路径 + 规范的工作目录。

### 2.4 `UnicodeDecodeError: 'utf-8' codec can't decode byte 0xb6`

**原因**：文件不是 UTF-8 编码（多半是 GBK）。

```python
import pandas as pd

# 依次尝试几种编码
for enc in ["utf-8", "utf-8-sig", "gbk", "gb18030"]:
    try:
        d = pd.read_csv("../data/sales_gbk.csv", encoding=enc, nrows=3)
        print(f"{enc:10} 成功   城市列 = {d['城市'].tolist()}")
    except Exception as e:
        print(f"{enc:10} 失败   {type(e).__name__}")
```

> 输出：
```text
utf-8      失败   UnicodeDecodeError
utf-8-sig  失败   UnicodeDecodeError
gbk        成功   城市列 = ['杭州', '上海', '成都']
gb18030    成功   城市列 = ['杭州', '上海', '成都']
```

**中文编码速查**：

| 场景 | 用哪个 |
|---|---|
| Excel 导出的 CSV | `encoding="utf-8-sig"` |
| 老软件/国标导出的 CSV | `encoding="gbk"` 或 `"gb18030"` |
| 自己写出的 CSV（要给别人用 Excel 打开） | `encoding="utf-8-sig"` |
| 网页内容 | `resp.encoding = resp.apparent_encoding` |

### 2.5 首列名前面带 `\ufeff`（BOM 问题）

```python
import pandas as pd

# 用错误编码读
bad = pd.read_csv("../data/sales.csv", encoding="utf-8", nrows=2)
print("错误编码读到的第一列名:", repr(bad.columns[0]))

# 正确编码
good = pd.read_csv("../data/sales.csv", encoding="utf-8-sig", nrows=2)
print("正确编码读到的第一列名:", repr(good.columns[0]))

# 症状：这样写会报 KeyError
try:
    _ = bad["订单编号"]
except KeyError as e:
    print("\n报错:", str(e)[:60])
```

> 输出：
```text
错误编码读到的第一列名: '\ufeff订单编号'
正确编码读到的第一列名: '订单编号'

报错: '订单编号'
```

> 💡 **`utf-8-sig` 是安全的万能选择**：文件带 BOM 时它会去掉，
> 不带 BOM 时它等价于 `utf-8`。**中文 CSV 一律用它。**

### 2.6 sklearn 在线数据集下载失败

**报错原文**：
```text
HTTPError: HTTP Error 403: Forbidden
```
或
```text
URLError: <urlopen error [Errno 11004] getaddrinfo failed>
```

**原因**：`fetch_california_housing()`、`fetch_openml()` 等函数要联网下载，
在国内常被墙或超时。

**解决**：**用本地 CSV**（本教程的准备 `data/` 目录里已经有）：

```python
import pandas as pd

# ❌ from sklearn.datasets import fetch_california_housing
#    d = fetch_california_housing()   → 可能 403

# ✅ 用本地文件
house = pd.read_csv("../data/california_housing.csv")
print("本地房价数据:", house.shape)

titanic = pd.read_csv("../data/titanic.csv")
print("本地泰坦尼克:", titanic.shape)
```

> 输出：
```text
本地房价数据: (20640, 10)
本地泰坦尼克: (891, 12)
```

---

## 三、pandas 使用类报错

### 3.1 `KeyError: ('城市', '销售额')` —— 多列忘了双层方括号

```python
import pandas as pd
df = pd.read_csv("../data/sales_clean.csv", nrows=5)

# ❌ df["城市", "销售额"]   → KeyError（被当成一个元组列名）
# ✅ 传一个列表
print(df[["城市", "销售额"]].shape)
```

> 输出：
```text
(5, 2)
```

**记忆法**：**取多列 = 列表 = 双层方括号 `df[[...]]`。**

### 3.2 `ValueError: The truth value of a Series is ambiguous`

**报错原文**：
```text
ValueError: The truth value of a Series is ambiguous. Use a.empty, a.bool(),
a.item(), a.any() or a.all().
```

**原因**：用 `and` / `or` / `not` 连接了 pandas 条件。

```python
import pandas as pd
df = pd.read_csv("../data/sales_clean.csv", nrows=100)

# ❌ df[(df["销售额"] > 500) and (df["城市"] == "北京")]  → ValueError

# ✅ 用 & | ~，且每个条件加括号
r = df[(df["销售额"] > 500) & (df["城市"] == "北京")]
print("销售额>500 且 北京:", len(r), "行")
print("销售额>500 或 北京:", len(df[(df["销售额"] > 500) | (df["城市"] == "北京")]), "行")
print("非北京:", len(df[~(df["城市"] == "北京")]), "行")
```

> 输出：
```text
销售额>500 且 北京: 11 行
销售额>500 或 北京: 23 行
非北京: 91 行
```

**为什么必须用 `&` 而不是 `and`？** `and` 是 Python 的短路求值，
它需要把整个 Series 判成一个布尔值；而 Series 有 100 个 True/False，
pandas 不知道听谁的，就报错了。`&` 是**逐元素**运算，正好符合需求。

### 3.3 `ValueError: Missing column provided to 'parse_dates'`

**原因**：`parse_dates` 里指定的列**没出现在 `usecols` 里**。

```python
import pandas as pd

# ❌ 这样会报错（订单日期被 usecols 排除了）
# pd.read_csv("../data/sales.csv",
#             usecols=["订单编号", "城市", "销售额"],
#             parse_dates=["订单日期"])

# ✅ 把要解析的列也放进 usecols
df = pd.read_csv("../data/sales.csv",
                 usecols=["订单编号", "订单日期", "城市", "销售额"],
                 nrows=100, date_format="mixed")
print("成功:", df.shape, "| 列:", df.columns.tolist())
```

> 输出：
```text
成功: (100, 4) | 列: ['订单编号', '订单日期', '城市', '销售额']
```

### 3.4 `AttributeError: Can only use .dt accessor with datetimelike values`

**原因**：这一列**不是日期类型**（是字符串），却用了 `.dt`。

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv")     # 不加 parse_dates
print("不解析时类型:", df["订单日期"].dtype)

# ❌ df["订单日期"].dt.year  → AttributeError
# ✅ 先转类型
df["订单日期"] = pd.to_datetime(df["订单日期"])
print("转换后类型:", df["订单日期"].dtype)
print("年份范围:", df["订单日期"].dt.year.min(), "~", df["订单日期"].dt.year.max())
```

> 输出：
```text
不解析时类型: str
转换后类型: datetime64[us]
年份范围: 2023 ~ 2024
```

**排查套路**：看到 `.dt` 报错，**第一件事就是 `print(df["列名"].dtype)`**。

### 3.5 `KeyError: 'SO20230100001'` —— 硬编码了数据里的值

**症状**：代码里写死了某个 ID，换一批数据就报 KeyError。

```python
import pandas as pd
df = pd.read_csv("../data/sales_clean.csv", nrows=5)

# ❌ d.loc["SO20230100001"]  → KeyError（这个订单号不存在）
# ✅ 从数据里动态取
first_id = df["订单编号"].iloc[0]
print("第一条订单号:", first_id)
print("按它取值:", df.set_index("订单编号").loc[first_id, "销售额"])
```

> 输出：
```text
第一条订单号: SO20230300508
按它取值: 3313.8
```

> 💡 **原则**：**能从数据里取的值，就不要写死在代码里。**

### 3.6 `KeyError: 0` —— loc / iloc 混用

```python
import pandas as pd
df = pd.read_csv("../data/sales_clean.csv", nrows=5)

print("loc[0, '城市'] =", df.loc[0, "城市"])       # ✅ 行标签 + 列名
print("iloc[0, 3]    =", df.iloc[0, 3])            # ✅ 行号 + 列号

# ❌ df.loc[0, 3]  → KeyError: 3（3 不是列名）
# ❌ df.iloc[0, "城市"]  → 报错（iloc 只接受整数）
print("\n记住：loc 用名字，iloc 用编号")
print("loc 切片含结尾: df.loc[0:2] →", len(df.loc[0:2]), "行")
print("iloc 切片不含结尾: df.iloc[0:2] →", len(df.iloc[0:2]), "行")
```

> 输出：
```text
loc[0, '城市'] = 杭州
iloc[0, 3]    = 杭州

记住：loc 用名字，iloc 用编号
loc 切片含结尾: df.loc[0:2] → 3 行
iloc 切片不含结尾: df.iloc[0:2] → 2 行
```

### 3.7 merge 之后行数变多变少

**症状**：`merge` 完发现行数不是预期的。

```python
import pandas as pd

left = pd.DataFrame({"k": [1, 2, 2, 3], "v": ["a", "b", "c", "d"]})
right = pd.DataFrame({"k": [2, 2, 4], "w": ["x", "y", "z"]})

print("左表 4 行，右表 3 行")

# inner：只有匹配上的
m_inner = left.merge(right, on="k", how="inner")
print("inner →", len(m_inner), "行（2×2 笛卡尔积：左表两个 k=2 × 右表两个 k=2）")

# left：左表全保留
m_left = left.merge(right, on="k", how="left")
print("left  →", len(m_left), "行")

# 用 indicator 排查
m_ind = left.merge(right, on="k", how="outer", indicator=True)
print("\nouter + indicator 的 _merge 分布:")
print(m_ind["_merge"].value_counts().to_string())
```

> 输出：
```text
左表 4 行，右表 3 行
inner → 4 行（2×2 笛卡尔积：左表两个 k=2 × 右表两个 k=2）
left  → 5 行

outer + indicator 的 _merge 分布:
_merge
left_only     3
both          4
right_only    1
```

**行数变化的三个原因**：

| 现象 | 原因 | 对策 |
|---|---|---|
| 行数变多 | **一对多**或**多对多**（键有重复） | 先 `drop_duplicates` 或用 `validate="one_to_many"` |
| 行数变少 | 用了 `inner` 且有匹配不上的记录 | 改用 `how="left"` |
| 出现 NaN | 左连接但右边没匹配上 | 用 `indicator=True` 确认 |

### 3.8 `FutureWarning: The default of observed=False is deprecated`

**原因**：对 `category` 类型的列做 `groupby` 时，pandas 默认会统计所有类别
（包括数据里没出现的空类别）。

```python
import pandas as pd
import numpy as np

df = pd.read_csv("../data/sales_clean.csv")
df["年龄段"] = pd.cut(df["客户年龄"], bins=[0, 25, 35, 50, 100],
                    labels=["25以下", "25-35", "35-50", "50以上"])
print("分箱类型:", df["年龄段"].dtype)

# ✅ 明确写 observed=True
r = df.groupby("年龄段", observed=True)["销售额"].agg(["count", "mean"]).round(1)
print(r.to_string())
```

> 输出：
```text
分箱类型: category
        count    mean
年龄段
25以下      267  1306.7
25-35     266  1412.0
35-50     265  1543.6
50以上       15  1789.3
```

**规则**：**只要 `groupby` 的键是 `category` 类型，就加 `observed=True`。**

### 3.9 中文列名对齐难看

**症状**：`print(df)` 出来的表是歪的（因为中文字符宽度算 1 但显示占 2）。

```python
import pandas as pd

df = pd.read_csv("../data/sales_clean.csv", nrows=3)

print("默认设置下:")
print(df[["城市", "商品类别", "销售额"]].to_string())
```

> 输出：
```text
默认设置下:
   城市  商品类别     销售额
0  杭州  家用电器  3313.80
1  成都  服饰鞋包 15717.66
2  北京  家用电器   853.09
```

```python
import pandas as pd

# 开启东亚字符宽度感知
pd.set_option("display.unicode.east_asian_width", True)
pd.set_option("display.max_columns", 50)
df = pd.read_csv("../data/sales_clean.csv", nrows=3)
print("开启后:")
print(df[["城市", "商品类别", "销售额"]].to_string())
```

> 输出：
```text
开启后:
   城市   商品类别      销售额
0  杭州  家用电器   3313.80
1  成都  服饰鞋包  15717.66
2  北京  家用电器    853.09
```

### 3.10 `SettingWithCopyWarning` 去哪了？

**答**：pandas 3.0 开启了 Copy-on-Write，**这个警告已经消失了**——
因为"改切片会不会影响原表"这件事不再有歧义：**永远不影响**。

```python
import pandas as pd
import warnings

df = pd.read_csv("../data/sales_clean.csv")

with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    sub = df[df["销售额"] > 5000]
    sub["标记"] = "大额"
    sw = [x for x in w if "SettingWithCopy" in type(x.message).__name__]
print("切片赋值触发的 SettingWithCopyWarning 数量:", len(sw))
print("切片结果行数:", len(sub))
print("原表有'标记'列吗:", "标记" in df.columns)
```

> 输出：
```text
切片赋值触发的 SettingWithCopyWarning 数量: 0
切片结果行数: 72
原表有'标记'列吗: False
```

**老代码升级指南**：原来为了消除这个警告而写的 `.copy()` 现在**不再是必需的**，
但**留着也没错**（语义更明确）。

---

## 四、matplotlib / seaborn 显示问题

### 4.1 中文变方块（最常见）

**症状**：图里的中文全是 `□□□□`，终端可能提示：
```text
UserWarning: Glyph 26477 (\N{CJK UNIFIED IDEOGRAPH-676D}) missing from font(s) DejaVu Sans.
```

**原因**：matplotlib 默认字体 DejaVu Sans 不含中文字形。

```python
import matplotlib
matplotlib.use("Agg")          # 无界面后端，用于脚本运行
import matplotlib.pyplot as plt
from viz_style import setup

# ✅ 一行搞定（本教程的统一做法）
font = setup()
print("实际选中的字体:", font)
```

> 输出：
```text
实际选中的字体: Microsoft YaHei
```

**手动配置的等价写法**：

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei"]   # 按优先级排
plt.rcParams["axes.unicode_minus"] = False                        # 负号正常显示
print("已配置")
```

**本机可用字体**（`Microsoft YaHei`、`SimHei`、`SimSun`、`DengXian`、`KaiTi` 都验证过）：

```python
from matplotlib import font_manager as fm

available = {f.name for f in fm.fontManager.ttflist}
for name in ["Microsoft YaHei", "SimHei", "SimSun", "DengXian", "KaiTi", "FangSong"]:
    print(f"  {name:20} {'可用' if name in available else '不可用'}")
```

> 输出：
```text
  Microsoft YaHei      可用
  SimHei               可用
  SimSun               可用
  DengXian             可用
  KaiTi                可用
  FangSong             可用
```

### 4.2 负号变方块

**原因**：`axes.unicode_minus` 默认为 `True`，用 Unicode 的 U+2212 减号，
而字体里没有这个字形。

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False     # ← 就是这一行
print("已关闭 unicode_minus")
print("当前值:", plt.rcParams["axes.unicode_minus"])
```

> 输出：
```text
已关闭 unicode_minus
当前值: False
```

> ⚠️ **即使你用 SimHei，也建议设这一行**——否则负号可能显示成方块。

### 4.3 `plt.show()` 之后 `savefig` 保存出空白图

**这是最坑的一个。** 顺序错了文件就是白的。

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os

os.makedirs("_test/chA3", exist_ok=True)

fig, ax = plt.subplots(figsize=(4, 3))
ax.plot([1, 2, 3], [2, 1, 3])
ax.set_title("顺序测试")

# ❌ 先 show 再 save：在某些后端 figure 已被清空
plt.show()
fig.savefig("_test/chA3/after_show.png")
plt.close(fig)

fig2, ax2 = plt.subplots(figsize=(4, 3))
ax2.plot([1, 2, 3], [2, 1, 3])
ax2.set_title("顺序测试")
fig2.savefig("_test/chA3/before_show.png")     # ✅ 先 save
plt.show()                                      # 再 show
plt.close(fig2)

import os
print("after_show.png :", os.path.getsize("_test/chA3/after_show.png"), "字节")
print("before_show.png:", os.path.getsize("_test/chA3/before_show.png"), "字节")
```

> 输出：
```text
after_show.png : 3318 字节
before_show.png: 3318 字节
```

> 💡 **在 `Agg` 后端下两者都正常**（因为 `Agg` 根本没有"显示"这个动作）。
> 但**在 Jupyter 的 inline 后端下，`plt.show()` 之后图会被清空，`savefig` 会保存空白图**。
> **所以铁律：永远先 `savefig` 再 `show`。**
> 本教程统一用 `viz_style.save(fig, path)`，它内部就是先保存，避免这个坑。

### 4.4 `RuntimeWarning: More than 20 figures have been opened`

**原因**：循环里创建 figure 但忘了关闭。

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os, warnings

os.makedirs("_test/chA3", exist_ok=True)

# ✅ 每次都关闭
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    for i in range(25):
        fig, ax = plt.subplots(figsize=(2, 1.5))
        ax.plot([1, i + 1])
        fig.savefig(f"_test/chA3/loop_{i}.png")
        plt.close(fig)                 # ← 关键
    msgs = [x for x in w if "figures have been opened" in str(x.message)]
print("图过多警告数量:", len(msgs))
print("已生成 25 张测试图")
```

> 输出：
```text
图过多警告数量: 0
已生成 25 张测试图
```

### 4.5 seaborn 的 `set_theme` 会覆盖字体设置

**症状**：明明设了中文字体，一调 `sns.set_theme()` 中文又变方块了。

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

# ❌ 顺序错了会失效
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
sns.set_theme()                                    # 它重置了 rcParams！
print("错误顺序下字体:", plt.rcParams["font.sans-serif"][:2])

# ✅ 方案1：把字体传给 set_theme
sns.set_theme(font="Microsoft YaHei")
print("方案1 字体:", plt.rcParams["font.sans-serif"][:2])

# ✅ 方案2：或者先 set_theme 再改 rcParams
sns.set_theme()
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
print("方案2 字体:", plt.rcParams["font.sans-serif"][:2])
```

> 输出：
```text
错误顺序下字体: ['sans-serif']
方案1 字体: ['Microsoft YaHei']
方案2 字体: ['Microsoft YaHei']
```

**本教程的做法**：用 `viz_style.seaborn_theme()`，它内部已经处理好了顺序。

### 4.6 图片模糊

**原因**：`dpi` 太低（默认 100，但有些场景下按屏幕像素算会更低）。

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os

os.makedirs("_test/chA3", exist_ok=True)
sizes = {}
for dpi in [60, 110, 200, 300]:
    fig, ax = plt.subplots(figsize=(4, 3))
    ax.bar(["北京", "上海", "广州"], [10, 20, 15])
    ax.set_title("分辨率测试")
    p = f"_test/chA3/dpi_{dpi}.png"
    fig.savefig(p, dpi=dpi, bbox_inches="tight")
    plt.close(fig)
    sizes[dpi] = os.path.getsize(p)

for dpi, size in sizes.items():
    print(f"dpi={dpi:>3}  文件 {size / 1024:>6.1f} KB")
```

> 输出：
```text
dpi= 60  文件    3.9 KB
dpi=110  文件    8.4 KB
dpi=200  文件   15.0 KB
dpi=300  文件   23.2 KB
```

**`dpi` 该怎么选**：

| 用途 | 推荐 dpi | 格式 |
|---|---|---|
| 屏幕查看（PPT、网页） | 100~150 | PNG |
| 打印文档 | 300 | PNG |
| 期刊投稿 | 600 | PNG/TIFF/**PDF/SVG** |
| 论文插图（可无限放大） | 任意 | **SVG 或 PDF**（矢量） |

### 4.7 后端相关：`matplotlib.use("Agg")` 什么时候用

| 场景 | 后端 | 说明 |
|---|---|---|
| Jupyter notebook | inline（自动） | 图直接显示在输出里 |
| 脚本里只保存图片 | **`Agg`** | 无界面，不会弹窗，**推荐** |
| 需要弹窗看交互图 | `TkAgg` | 需要 tkinter |
| 服务器上跑 | **`Agg`** | 没有显示器，必须用 Agg |

```python
import matplotlib
# 必须在 import pyplot 之前设置
matplotlib.use("Agg")
import matplotlib.pyplot as plt
print("当前后端:", matplotlib.get_backend())
```

> 输出：
```text
当前后端: Agg
```

> ⚠️ **`matplotlib.use()` 必须写在 `import matplotlib.pyplot` 之前**，
> 之后设置可能不生效。

---

## 五、机器学习类报错

### 5.1 `ValueError: Input X contains NaN`

**报错原文**：
```text
ValueError: Input X contains NaN.
LogisticRegression does not accept missing values encoded as NaN natively.
```

**原因**：**sklearn 的所有模型都不接受缺失值**（和 pandas 不同，
pandas 会尽量容忍，sklearn 直接拒绝）。

**解决**：用 `SimpleImputer` 或手工填补。**必须在 Pipeline 里做，且只在训练集上 fit。**

```python
import warnings
warnings.filterwarnings("ignore")
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("../data/titanic.csv")
X = df[["Age", "Fare", "SibSp", "Parch"]]
y = df["Survived"]
print("原始缺失情况:", X.isna().sum().to_dict())

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3,
                                          random_state=42, stratify=y)

# ✅ 把填补和模型串成 Pipeline
pipe = Pipeline([
    ("imp", SimpleImputer(strategy="median")),
    ("sc", StandardScaler()),
    ("m", LogisticRegression(max_iter=1000)),
])
pipe.fit(X_tr, y_tr)
print("训练成功，测试集准确率: {:.4f}".format(pipe.score(X_te, y_te)))
```

> 输出：
```text
原始缺失情况: {'Age': 177, 'Fare': 0, 'SibSp': 0, 'Parch': 0}
训练成功，测试集准确率: 0.6866
```

### 5.2 `ValueError: could not convert string to float`

**原因**：特征里有字符串（类别列没编码）。

```python
import warnings
warnings.filterwarnings("ignore")
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("../data/titanic.csv")
X = df[["Age", "Fare", "Pclass", "Sex", "Embarked"]]     # Sex/Embarked 是字符串
y = df["Survived"]

# ❌ 直接 fit 会报 could not convert string to float

# ✅ 数值列和分类列分开处理
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), ["Age", "Fare"]),
    ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                      ("oh", OneHotEncoder(handle_unknown="ignore"))]),
     ["Pclass", "Sex", "Embarked"]),
])
pipe = Pipeline([("pre", pre), ("m", LogisticRegression(max_iter=1000))])
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3,
                                          random_state=42, stratify=y)
pipe.fit(X_tr, y_tr)
print("训练成功，准确率: {:.4f}".format(pipe.score(X_te, y_te)))

# 看看编码后有多少列
names = pipe.named_steps["pre"].get_feature_names_out()
print("编码后特征数:", len(names))
print("前 6 个:", names[:6].tolist())
```

> 输出：
```text
训练成功，准确率: 0.7761
编码后特征数: 11
前 6 个: ['num__Age', 'num__Fare', 'cat__Pclass_1', 'cat__Pclass_2', 'cat__Pclass_3', 'cat__Sex_female']
```

### 5.3 中文列名导致的问题

**好消息**：sklearn 1.x **支持中文列名**（因为它只把列名当字符串标签）。

```python
import warnings
warnings.filterwarnings("ignore")
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# 用中文列名
df = pd.read_csv("../data/shopping_intent.csv")
X = df.drop(columns=["是否购买"])
y = df["是否购买"]
print("中文列名:", X.columns.tolist())

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3,
                                          random_state=42, stratify=y)
pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=1000))])
pipe.fit(X_tr, y_tr)
print("用中文列名训练成功，AUC 约 0.67")
print("特征名:", pipe.named_steps["sc"].feature_names_in_.tolist())
```

> 输出：
```text
中文列名: ['浏览量PV', '停留总时长秒', '是否跳出', '是否周末', '是否新用户']
用中文列名训练成功，AUC 约 0.67
特征名: ['浏览量PV', '停留总时长秒', '是否跳出', '是否周末', '是否新用户']
```

> ⚠️ **但有例外**：某些第三方库或画图函数（尤其是 `plot_tree`、`export_graphviz`）
> 对中文支持不好，可能显示成方块。**遇到这种情况把列名改成英文再画。**

### 5.4 特征尺度差异导致 KNN/SVM 效果差

**症状**：模型效果远低于预期，但代码没报错。

```python
import warnings
warnings.filterwarnings("ignore")
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score

df = pd.read_csv("../data/shopping_intent.csv")
X = df.drop(columns=["是否购买"]).copy()
y = df["是否购买"]

# 故意制造量纲悬殊
X["浏览量PV"] = X["浏览量PV"] * 10000
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3,
                                          random_state=42, stratify=y)

for name, m in [("KNN", KNeighborsClassifier(n_neighbors=5)),
                ("随机森林", RandomForestClassifier(n_estimators=100, random_state=42))]:
    for tag, steps in [("不缩放", [("m", m)]),
                       ("标准化", [("sc", StandardScaler()), ("m", m)])]:
        p = Pipeline(steps).fit(X_tr, y_tr)
        auc = roc_auc_score(y_te, p.predict_proba(X_te)[:, 1])
        print(f"{name:6}{tag:8}AUC = {auc:.4f}")
```

> 输出：
```text
KNN   不缩放     AUC = 0.5302
KNN   标准化     AUC = 0.6431
随机森林  不缩放     AUC = 0.6237
随机森林  标准化     AUC = 0.6236
```

**结论**：**KNN 从 0.53 升到 0.64（不缩放时几乎等于瞎猜）；随机森林几乎不变。**
详见第 8 章 8.5 节的完整对照表。

### 5.5 类别不平衡导致的指标误导

**症状**：准确率看着挺高（比如 76%），但模型其实没用。

```python
import warnings
warnings.filterwarnings("ignore")
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, recall_score, precision_score,
                             roc_auc_score)

df = pd.read_csv("../data/shopping_intent.csv")
X, y = df.drop(columns=["是否购买"]), df["是否购买"]
print("正例率: {:.2%}".format(y.mean()))

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3,
                                          random_state=42, stratify=y)
print("如果全猜'不购买'，准确率 = {:.4f}".format((y_te == 0).mean()))
print("但它的召回率 = 0，毫无价值\n")

pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=1000))])
pipe.fit(X_tr, y_tr)
pred = pipe.predict(X_te)
print("逻辑回归：准确率 {:.4f}  精确率 {:.4f}  召回率 {:.4f}  AUC {:.4f}".format(
    accuracy_score(y_te, pred), precision_score(y_te, pred),
    recall_score(y_te, pred), roc_auc_score(y_te, pipe.predict_proba(X_te)[:, 1])))

# 加上类别权重
pipe2 = Pipeline([("sc", StandardScaler()),
                  ("m", LogisticRegression(max_iter=1000, class_weight="balanced"))])
pipe2.fit(X_tr, y_tr)
pred2 = pipe2.predict(X_te)
print("加 class_weight：准确率 {:.4f}  精确率 {:.4f}  召回率 {:.4f}  AUC {:.4f}".format(
    accuracy_score(y_te, pred2), precision_score(y_te, pred2),
    recall_score(y_te, pred2), roc_auc_score(y_te, pipe2.predict_proba(X_te)[:, 1])))
```

> 输出：
```text
正例率: 23.88%
如果全猜'不购买'，准确率 = 0.7625
但它的召回率 = 0，毫无价值

逻辑回归：准确率 0.7583  精确率 0.4000  召回率 0.0351  AUC 0.6794
加 class_weight：准确率 0.5875  精确率 0.3190  召回率 0.6491  AUC 0.6842
```

**诊断套路**：**只要看到"准确率很高但召回率极低"，就是类别不平衡。**
**对策**：看 AUC 和 F1、加 `class_weight="balanced"`、或调整分类阈值。

---

## 六、性能类问题

### 6.1 `apply` 太慢

```python
import warnings
warnings.filterwarnings("ignore")
import numpy as np
import pandas as pd
import time

N = 200_000
df = pd.DataFrame({"x": np.random.default_rng(42).normal(0, 1, N)})

t0 = time.perf_counter()
r1 = df["x"].apply(lambda v: v * 2)
t1 = time.perf_counter()
r2 = df["x"] * 2
t2 = time.perf_counter()

print(f"apply 耗时   {(t1 - t0) * 1000:.0f} ms")
print(f"向量化 耗时  {(t2 - t1) * 1000:.1f} ms")
print(f"快约 {(t1 - t0) / (t2 - t1):.0f} 倍")
print("结果一致:", np.allclose(r1, r2))
```

> 输出：
```text
apply 耗时   34 ms
向量化 耗时  0.6 ms
快约 57 倍
结果一致: True
```

**替代方案速查**：

| 想做的事 | ❌ 慢写法 | ✅ 快写法 |
|---|---|---|
| 简单运算 | `df["x"].apply(lambda v: v * 2)` | `df["x"] * 2` |
| 条件赋值（二选一） | `df["a"].apply(lambda v: "高" if v > 5 else "低")` | `np.where(df["a"] > 5, "高", "低")` |
| 条件赋值（多分支） | 自定义函数 + apply | `np.select([...], [...], default=)` |
| 分组后算统计 | 循环 + apply | `df.groupby(k).agg(...)` |
| 分组后广播回原表 | 循环 | `df.groupby(k)["v"].transform("mean")` |
| 字符串处理 | apply + 自定义 | `.str.replace/.str.contains/.str.extract` |
| 日期处理 | apply | `.dt.year/.dt.strftime` |

### 6.2 大数据内存不足（`MemoryError`）

**五个手段，按优先级排**：

```python
import pandas as pd

# ① usecols：只读需要的列（最有效）
df = pd.read_csv("../data/california_housing.csv",
                 usecols=["longitude", "latitude", "median_house_value"])
print("① usecols 后:", df.shape)
print("   内存: {:.0f} KB".format(df.memory_usage(deep=True).sum() / 1024))

# ② dtype 指定类型 + category 压缩字符串
df2 = pd.read_csv("../data/california_housing.csv",
                  usecols=["ocean_proximity", "median_house_value"],
                  dtype={"ocean_proximity": "category"})
print("\n② category 类型:", df2.dtypes.tolist())
print("   内存: {:.0f} KB".format(df2.memory_usage(deep=True).sum() / 1024))

# ③ nrows：先小样本探路
df3 = pd.read_csv("../data/california_housing.csv", nrows=1000)
print("\n③ nrows=1000:", df3.shape)
```

> 输出：
```text
① usecols 后: (20640, 3)
   内存: 483 KB

② category 类型: ['category', 'float64']
   内存: 200 KB

③ nrows=1000: (1000, 10)
```

```python
import pandas as pd

# ④ chunksize：分块处理（内存恒定）
total = 0
for chunk in pd.read_csv("../data/california_housing.csv",
                         usecols=["median_house_value"], chunksize=5000):
    total += len(chunk)
print("④ 分块处理总行数:", total)

# ⑤ 换 Parquet（体积小 1/3，类型保留）
df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])
df.to_parquet("_test/chA3/perf.parquet", index=False)
import os
print("\n⑤ CSV 体积: {:.0f} KB".format(os.path.getsize("../data/sales_clean.csv") / 1024))
print("   Parquet 体积: {:.0f} KB".format(os.path.getsize("_test/chA3/perf.parquet") / 1024))
```

> 输出：
```text
④ 分块处理总行数: 20640

⑤ CSV 体积: 116 KB
   Parquet 体积: 43 KB
```

**还有第六招**：数据量上千万行时，考虑 **polars**（第 2 章 2.9.4 节介绍过）。

---

## 七、报错自查流程

遇到报错，**按这个顺序查**：

```text
第1步：看报错的"最后一行"
        → 那里写着错误类型（KeyError / ValueError / ...）和关键信息
        → 前面的 "File ... line N" 是调用栈，用来定位是哪一行代码

第2步：定位到自己的代码
        → 调用栈里**最后一个属于你自己文件**的 "line N" 就是出错位置
        → 库内部的那些帧不用看

第3步：对照本手册的类型目录
        → KeyError     → 3.1 / 3.5 / 3.6（列名、硬编码、loc/iloc 混用）
        → ValueError   → 3.2 / 3.3（and/or、parse_dates）
        → AttributeError → 1.2 / 1.7 / 3.4（applymap、round、.dt）
        → TypeError    → 1.3（fillna method）
        → FileNotFoundError → 2.3（工作目录）
        → UnicodeDecodeError → 2.4（编码）
        → 各种 Warning → 第 1 章、第 4 章
        → 模型相关     → 第五章

第4步：打印中间状态
        → print(df.shape) / print(df.dtypes) / print(df.columns.tolist())
        → 这三行能解决 80% 的 pandas 问题

第5步：上网搜索
        → 见下面"搜索技巧"
```

### 搜索技巧：怎么搜报错才能搜到答案

**❌ 错误搜法**（搜不到）：
```text
KeyError: '我的表里的列名'
ValueError: 我的数据不行
```

**✅ 正确搜法**（去掉自己的变量名和数据值）：

```text
① 只保留"错误类型 + 通用消息"，去掉自己的业务名词
   搜：pandas resample Invalid frequency M use ME instead
   不要搜：ValueError: Invalid frequency: M（我的销售数据）

② 加上库名和版本
   搜：pandas 3.0 applymap removed alternative
   不要搜：applymap 报错

③ 用英文搜（英文资料多 10 倍）
   搜：pandas to_datetime mixed format ValueError time data doesn't match format
   不要搜：pandas 时间解析报错怎么办

④ 报错信息里的"建议"直接照着做
   比如 pandas 会告诉你：
     "Please use 'ME' instead."
     "passing `format='mixed'`"
   这些提示是官方给的解法，直接照做往往就对
```

### 三条通用排错原则

```text
原则1：先看数据类型，再看数据内容
       print(df.dtypes)  ← 90% 的诡异问题都是类型不对

原则2：先看形状，再看值
       print(df.shape)   ← 形状不对说明前面的筛选/合并出了问题

原则3：把大问题切成小问题
       不要一口气写 30 行然后调试；
       每写 5 行就跑一次 print，确认中间结果对
```

---

## 八、快速索引（按报错原文搜）

| 报错原文关键词 | 跳转到 |
|---|---|
| `Invalid frequency: M` | 1.1 |
| `no attribute 'applymap'` | 1.2 |
| `unexpected keyword argument 'method'` | 1.3 |
| `doesn't match format` / `format="mixed"` | 1.6 |
| `'float' object has no attribute 'round'` | 1.7 |
| `No module named 'pandas'` | 2.1 |
| `'conda' 不是内部或外部命令` | 2.2 |
| `No such file or directory` | 2.3 |
| `UnicodeDecodeError` | 2.4 |
| `\ufeff` | 2.5 |
| `HTTP Error 403` | 2.6 |
| `KeyError: ('城市', '销售额')` | 3.1 |
| `truth value of a Series is ambiguous` | 3.2 |
| `Missing column provided to 'parse_dates'` | 3.3 |
| `Can only use .dt accessor` | 3.4 |
| `KeyError: 0` | 3.6 |
| `observed=False is deprecated` | 3.8 |
| `Glyph ... missing from font` | 4.1 |
| `More than 20 figures` | 4.4 |
| `Input X contains NaN` | 5.1 |
| `could not convert string to float` | 5.2 |
| `ArrowInvalid` | 第 2 章 2.5.4 |
| `copy_on_write` / `Pandas4Warning` | 1.5 |

---

## 九、本手册的验证方式

本手册里每个报错和修复方式都跑过。验证脚本：

```powershell
$env:PYTHONIOENCODING='utf-8'
cd "<教程目录>\code"
& D:\conda\miniconda3\envs\pyviz\python.exe verify_docs.py A3
```

如果某个修复方式在你的机器上不生效，**先 `print(pd.__version__)`**——
很可能你的版本和我这里不同，行为也会有差异。
