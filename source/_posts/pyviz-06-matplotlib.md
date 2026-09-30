---
title: 06 Matplotlib 可视化
date: 2026-09-26 10:00:00
permalink: /pyviz/06-matplotlib/
series: pyviz
chapter: 6
desc: 基础绘图 API、中文字体与常见图表
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- Matplotlib
keywords: Python 数据分析, 数据可视化, 06 Matplotlib 可视化, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 06 Matplotlib 可视化
toc: true
comments: true
---
> 本章难度：⭐⭐⭐ | 预计学习时间：14 小时 | 前置章节：04 Pandas 数据分析、05 数据预处理
> 前面几章我们一直在"看数字"，这一章开始"看图形"。图形不是装饰，它是让别人 3 秒钟
> 看懂你 3 天工作量的唯一办法。

---

## 学习目标

学完本章你能做到：

1. 拿到一份数据，**先判断该用什么图**，而不是打开 Excel 挨个试；
2. 说清楚 `plt.plot` 和 `fig, ax = plt.subplots()` 的区别，并且以后一律用**面向对象接口**；
3. 彻底解决**中文显示成方块**这个新手第一大坑，知道它是怎么来的、怎么根治；
4. 独立画出 11 类核心图表（折线、柱状、直方、箱线、散点、饼、面积、热力、双轴、误差棒、3D），
   并且知道每类图的**适用场景**和**常见误用**；
5. 用 `subplots` 和 `gridspec` 排出多子图版式，把 4 张图拼成一张汇报图；
6. 精细控制标题、刻度、图例、参考线、箭头注释、边框；
7. 给柱状图自动标注数值、给最大值高亮、给点加误差棒；
8. 选出**不误导人**的配色（知道为什么不能用彩虹色 jet）；
9. 导出 100 ~ 600 dpi 的高清图，知道什么时候必须用 SVG/PDF 矢量图；
10. 见到下图这些报错和怪现象时知道去哪儿找原因。

| 你会遇到的怪现象 | 本章小节 |
|---|---|
| 图里的中文全变成一个个方块 | 6.4 |
| 负号变成方块，正数却没事 | 6.4.5 |
| 图例挡住数据、x 轴中文标签叠在一起 | 6.7 |
| 保存出来的图片是**一片空白** | 6.10.5 |
| `RuntimeWarning: More than 20 figures have been opened` | 6.11 |
| 柱状图上想标数字，手写 `ax.text` 写到崩溃 | 6.8 |

---

## 6.0 开跑之前：环境准备与本章约定

**先说清楚"要用什么"**，省得你照着敲却报 `ModuleNotFoundError`。
本教程所有代码都在这个环境下实测通过：

| 软件 | 版本 | 本章用它做什么 |
|---|---|---|
| Python | 3.11.16 | 解释器 |
| matplotlib | 3.11.2 | 本章主角，画图 |
| pandas | 3.0.6 | 准备数据（画图的数据 90% 来自 DataFrame） |
| numpy | 2.4.6 | 数值计算、拟合趋势线 |
| seaborn | 0.13.2 | 第 7 章的主角，本章只在 6.4.8 提一下字体 |

### 6.0.1 本章要用的三份数据

**数据口径统一**（和前面章节完全一致，不要自己改）：教程假设你在 `code` 目录里启动
Jupyter，所以路径一律写 `"../data/文件名"`。

| 文件 | 形状 | 本章用它画什么 |
|---|---|---|
| `sales_clean.csv` | 1064 行 × 14 列 | 柱状图、饼图、面积图、热力图、双轴图 |
| `students.csv` | 300 行 × 12 列 | 直方图、箱线图、散点图、误差棒图 |
| `timeseries.csv` | 1096 行 × 4 列 | 折线图、移动平均、双 11 脉冲、3D 图 |

### 6.0.2 本章统一的开头六行

**为什么要有"统一的开头"？** 因为画图的准备工作（导入库、设中文字体、建图片目录）
每个脚本都要做一遍。**不统一会怎样**：你今天把图存到桌面，明天存到 `D:\临时`，
一周后自己要用的那张图就找不到了。

```python
# ============ 本章统一的开头，以后每写一个绘图脚本都从这几行开始 ============
import sys                       # 标准库：用来修改模块搜索路径
import matplotlib                # 只为了能打印版本号，画图主要靠下面的 pyplot
sys.path.insert(0, ".")          # 把当前目录（code/）加进搜索路径，这样才能 import 到自己写的 viz_style
from pathlib import Path         # 跨平台处理路径，Windows 上写 "/" 也不会出错

import numpy as np               # 数值计算
import pandas as pd              # 表格处理

import matplotlib.pyplot as plt  # 绘图主力，约定俗成缩写为 plt

# 中文字体两行 —— 6.4 节会详细讲"为什么必须有它们"，这里先照抄
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]   # 中文用微软雅黑（本机实测可用）
plt.rcParams["axes.unicode_minus"] = False              # 用 ASCII 负号，防止负号变成方块

# 让 pandas 打印出来的表格更好看（不影响画图，只影响文字输出）
pd.set_option("display.width", 300)                       # 一行够宽，别把表格折成两行
pd.set_option("display.max_columns", 60)                  # 列不要省略成 ...
pd.set_option("display.unicode.east_asian_width", True)   # 中文列名也能对齐

OUT = "_test/ch06"                                        # 本章所有图片都存到这个目录
Path(OUT).mkdir(parents=True, exist_ok=True)              # 目录不存在就创建；已存在也不报错

print("matplotlib 版本：", matplotlib.__version__)
print("图片保存目录：", OUT)
```

> 输出：
```text
matplotlib 版本： 3.11.2
图片保存目录： _test/ch06
```

**这里有两个约定，请务必注意**：

1. 本章所有图都存到 `code/_test/ch06/` 下，**不会**往教程根目录乱丢文件；
   你在自己电脑上练习时，把 `OUT` 改成 `"charts"` 之类的名字就行。
2. 每个绘图代码块的最后都会把**保存后的文件名**打印出来。这不是凑数，
   而是让你确认"图真的写到磁盘上了"——新手最常见的困惑就是"代码跑完了，图在哪？"

### 6.0.3 把三份数据读进来

```python
# 三份数据集一次读进来，变量名各不相同（重要！不要都叫 df，否则后面统计口径会悄悄串味）
sales = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])   # 销售明细，parse_dates 让日期列变成时间类型
stu = pd.read_csv("../data/students.csv")                                  # 学生成绩
ts = pd.read_csv("../data/timeseries.csv", parse_dates=["日期"])            # 逐日时间序列

# 只打印"规模 + 时间范围"，先对数据有个整体印象
print("sales：", sales.shape, "|", sales["订单日期"].min().date(), "~", sales["订单日期"].max().date())
print("stu  ：", stu.shape)
print("ts   ：", ts.shape, "|", ts["日期"].min().date(), "~", ts["日期"].max().date())
```

> 输出：
```text
sales： (1064, 14) | 2023-01-01 ~ 2024-12-29
stu  ： (300, 12)
ts   ： (1096, 4) | 2022-01-01 ~ 2024-12-31
```

**记住这三个规模**：销售数据横跨 24 个自然月，成绩数据 300 人，逐日数据 3 年 1096 天。
后面每一张图的数据都能对上。

### 6.0.4 本章代码的两个约定

**约定一：图片统一存到 `code/_test/ch06/`。**
每张图最后都会打印出保存路径（比如 `已保存： _test/ch06/6_5_2_line.png`），
你照着路径去文件夹里找就行。新手最常见的困惑不是"图怎么画"，而是"图画完在哪"。

**约定二：绘制类的函数调用前面写 `_ =`。**

这一条要说清楚"为什么"，因为它看起来有点怪。在 Jupyter 里，
**一个单元格里任何单独成行的函数调用，都会把它的返回值打印到输出区**。比如：

```python
# 反例：单独一行调用函数，Jupyter 会把返回值打印出来
print("看下面的输出区，多出来一个 None")
```
上面的例子里，`print(...)` 返回的是 `None`，所以 Jupyter 会多打印一行 `None`。
画图时这个问题更明显 —— 一次 `ax.plot(...)` 返回的是几百个字符的对象描述，
你的输出区立刻被垃圾信息淹没。

**解决办法**：把返回值接住，赋给一个变量。用 `_`（下划线）表示"这个值我不要"：

```python
import matplotlib.pyplot as plt                 # 导入绘图库
fig, ax = plt.subplots(figsize=(4, 2.4))        # 拿一张小画布做示范
_ = ax.plot([1, 2, 3], [2, 1, 3])               # 前面加 _ =，把线对象接住，输出区保持干净
_ = ax.set_title("加了 _ = 之后，输出区只有下面这一行")   # set_title 返回 Text 对象，同样接住
print("输出区只有我这一行")                       # 这句话才会被打印
plt.close(fig)                                  # 用完关掉
```

> 输出：
```text
输出区只有我这一行
```

**什么时候不用 `_ =`**：当这个返回值后面真要用到时，就起个有意义的名字，
比如 `bars = ax.bar(...)`（后面要靠 `bars` 给柱子单独上色）、
`im = ax.imshow(...)`（后面要拿它画色条）。判断标准很简单：
**要用的起名字，不要的写 `_ =`。**

---

## 6.1 可视化的目的与选型

### 6.1.1 为什么要画图：一组"数据完全一样、图完全不一样"的数据

先把结论放前面：**统计量会骗人，图形不会。** 这句话听起来像口号，我们用一个
真实存在的经典例子证明给你看。

1973 年，统计学家 Anscombe 造了四组数据（后来被称为 **Anscombe 四重奏**），
每组都是 11 个点。他把四组数据算了一遍统计量，结果**几乎完全一样**：

```python
# Anscombe 四重奏：四组 x-y 数据，用字典装起来
anscombe = {
    "x1": [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
    "y1": [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
    "y2": [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],
    "y3": [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
    "x4": [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8],          # 注意：这一组的 x 全是 8，只有一个是 19
    "y4": [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89],
}
ans = pd.DataFrame(anscombe)      # 转成 DataFrame，方便按列算统计量

# 把四组数据的五个关键统计量摆在一张表里对比
table = pd.DataFrame({
    "x均值": [ans["x1"].mean()] * 3 + [ans["x4"].mean()],
    "y均值": [ans[f"y{i}"].mean() for i in (1, 2, 3, 4)],
    "x方差": [ans["x1"].var()] * 3 + [ans["x4"].var()],
    "y方差": [ans[f"y{i}"].var() for i in (1, 2, 3, 4)],
    "相关系数": [ans["x1"].corr(ans["y1"]), ans["x1"].corr(ans["y2"]),
             ans["x1"].corr(ans["y3"]), ans["x4"].corr(ans["y4"])],
}, index=["数据1", "数据2", "数据3", "数据4"])
print(table.round(3))
```

> 输出：
```text
       x均值  y均值  x方差  y方差  相关系数
数据1    9.0  7.501   11.0  4.127     0.816
数据2    9.0  7.501   11.0  4.128     0.816
数据3    9.0  7.500   11.0  4.123     0.816
数据4    9.0  7.501   11.0  4.123     0.817
```

**四组数据的均值、方差、相关系数几乎没有差别**（差在小数点后第三位，是浮点误差）。
如果只交一份统计表，你完全看不出它们的不同。但实际上：

| 数据 | 真实形状 |
|---|---|
| 数据 1 | 正常的线性关系，点大致落在一条直线上 |
| 数据 2 | 明显是**曲线**，直线拟合是错的 |
| 数据 3 | 一条完美直线，**但有一个明显的离群点**在拉偏结果 |
| 数据 4 | x 几乎全是同一个值，**只有一个点在远处**决定了整条斜率 |

> 💡 **这就是可视化的第一个目的**：发现统计量看不见的东西 —— 非线性、离群点、
> 数据扎堆。第 6.6 节我们会把这四组数据画成 2×2 子图，你会亲眼看到它们差得多远。

**可视化的三个目的**，按重要程度排：

1. **给自己看（探索）**：快速看出分布形状、异常值、趋势、关系。这一步图丑没关系，快就行。
2. **给别人看（解释）**：让同事/老板 10 秒内抓住重点。这一步要配色、要标注、要去掉废话。
3. **给报告/论文看（存档）**：图要能被单独打印出来还不缺信息 —— 图题、单位、数据来源、
   图例齐全，最好用矢量格式。

新手最常犯的错是**把这三件事用同一张图对付**：给自己探索用的粗糙图，
直接贴进汇报 PPT 里。

### 6.1.2 图表选型决策表

**画图第一步不是打开 matplotlib，而是问自己"我要回答什么问题"。** 表格里的
"章节"列就是本章对应的例子，遇到不确定就翻回去看代码。

| 你想回答的问题 | 用什么图 | 为什么 | 章节 |
|---|---|---|---|
| 谁大谁小 / 排名 | **柱状图** | 长度比面积/角度更容易比较 | 6.5.3 |
| 类别名字很长或很多（>6 类） | **水平柱状图 `barh`** | 中文标签横着放才看得清 | 6.5.3 |
| 随时间怎么变 | **折线图** | 时间是有顺序的，用线段连接表达"连续" | 6.5.2 |
| 一个变量怎么分布 | **直方图** | 看集中趋势、偏态、有几个峰 | 6.5.4 |
| 分布 + 离群点 + 多组比较 | **箱线图** | 一张图同时给五数概括和异常值 | 6.5.5 |
| 两个变量的关系 | **散点图** | 能看出相关、聚集、非线性、异常点 | 6.5.6 |
| 三个变量的关系 | **气泡图**（`scatter` 的 `s` 编码第三个变量） | 第 3 个变量用"大小"表达 | 6.5.6 |
| 构成 / 占比（≤5 类） | **饼图** | 人眼对角度不敏感，只适合极少类别 | 6.5.7 |
| 构成（>5 类）或要横向对比 | **堆叠柱状图** | 比饼图更容易比较长短 | 6.5.3 |
| 构成随时间变化 | **堆叠面积图** | 总量和结构一起看 | 6.5.8 |
| 多个变量的相关性 | **热力图** | 矩阵形式最省地方 | 6.5.9 |
| 两个量纲完全不同的指标 | **双轴图 `twinx`** | 一个左轴一个右轴 | 6.5.10 |
| 均值 + 波动（科研报告） | **误差棒图** | 只报均值等于隐瞒风险 | 6.5.11 |
| 三个数值维度 | 3D 图（**尽量别用**） | 遮挡严重，读数困难 | 6.5.12 |
| 地理分布 | 地图（第 7 章 plotly / geopandas） | 超出 matplotlib 的舒适区 | — |

> 📌 **一句话记忆法**：
> **比大小用柱、看趋势用线、看分布用直方/箱线、看关系用散点、看构成用饼/堆叠、看相关用热力图。**
> 其中"比大小"和"看趋势"覆盖了你 70% 的工作量。

### 6.1.3 三条不能破的选型铁律

这三条不是审美问题，是**会不会误导人**的问题：

1. **饼图超过 5 类就不要用。**
   人眼比较角度和面积的能力很差。6 个以上的扇区，你根本判断不出哪块更大 ——
   而且当两块占比接近时（比如 12% 和 11%），饼图给出的"感觉"往往是错的。
   类别多时请改用**水平柱状图**（6.5.3 有对比图）。
2. **柱状图比较"大小"时，Y 轴必须从 0 开始。**
   把 Y 轴截断成从 100 开始，两根高度差 2% 的柱子看起来能差一倍 —— 这是
   数据分析里最臭名昭著的"视觉撒谎"。折线图看趋势时可以截断 Y 轴，柱状图不行。
3. **同一张图里不要超过 8 种颜色。**
   超过 8 种，人的短期记忆就崩了。宁可拆成 2 张图，也不要画成一锅彩虹粥（6.9 节细说）。

---

## 6.2 matplotlib 的两套接口

matplotlib 最让人困惑的一点：**同一个功能有两种写法**，网上的例子两套都有，
新手照着抄，抄到一半就乱套了。这一节把它讲清楚，然后给你一个明确的结论。

### 6.2.1 第一套：pyplot 状态机接口

**状态机（隐式地记住"现在在改哪张图"）**。你只写 `plt.方法名()`，
matplotlib 在背后帮你维护一个"当前画布"和"当前坐标系"。

```python
# 写法一：pyplot 状态机接口 —— 不用接收任何对象，全靠"当前状态"
# 不自动回填：这段的输出里含对象内存地址，每次运行都不一样
plt.figure(figsize=(6, 3.5))              # 新建一张画布（此时它成为"当前画布"）
plt.plot([1, 2, 3, 4], [10, 20, 15, 25])  # 在当前画布上画线
plt.title("北京 4 个季度销量")             # 给当前坐标系加标题
plt.xlabel("季度")                         # 给当前坐标系加 x 轴标签
plt.ylabel("销量（万件）")                  # 给当前坐标系加 y 轴标签
plt.savefig(f"{OUT}/6_2_pyplot.png", dpi=110, bbox_inches="tight")   # 保存当前画布
plt.close()                                # 关掉当前画布
print("已保存：", f"{OUT}/6_2_pyplot.png")
```

上面这段代码在 Jupyter 里会打印 6 行：**前 5 行是那些函数的返回值**
（`0x...` 是内存地址，每次运行都不一样，所以这里用省略号代替）：

```text
Figure(600x350)
[<matplotlib.lines.Line2D object at 0x...>]
Text(0.5, 1.0, '北京 4 个季度销量')
Text(0.5, 0, '季度')
Text(0, 0.5, '销量（万件）')
已保存： _test/ch06/6_2_pyplot.png
```

**等一下，输出区里那 5 行奇怪的东西是什么？** 是这 5 个函数的**返回值**：
`plt.figure()` 返回画布对象、`plt.plot()` 返回线对象、`plt.title()` 返回文字对象……
Jupyter 把单独成行的函数调用的返回值打印出来了。这就是 6.0.4 说的那个问题，
所以本章正式代码里都会写成 `_ = plt.xxx(...)`。下面这段是"干净版"：

```python
# 写法一（本教程推荐的实际写法）：加上 _ = 把返回值接住，输出区就干净了
_ = plt.figure(figsize=(6, 3.5))           # 新建一张画布（它成为"当前画布"）
_ = plt.plot([1, 2, 3, 4], [10, 20, 15, 25])   # 在当前画布上画线
_ = plt.title("北京 4 个季度销量")         # 给当前坐标系加标题
_ = plt.xlabel("季度")                     # 给当前坐标系加 x 轴标签
_ = plt.ylabel("销量（万件）")              # 给当前坐标系加 y 轴标签
plt.savefig(f"{OUT}/6_2_pyplot2.png", dpi=110, bbox_inches="tight")   # 保存当前画布
plt.close()                                # 关掉当前画布
print("已保存：", f"{OUT}/6_2_pyplot2.png")
```

> 输出：
```text
已保存： _test/ch06/6_2_pyplot2.png
```

> 💡 顺便说明：`plt.figure()` 那一行没有加 `_ =`，是因为它在上面第一个例子里已经
> 演示过返回值了。**表格、图、代码块三者对得上就行，不必机械照抄。**

**pyplot 接口的好处是短**：临时看一眼数据，一行 `plt.plot(series)` 就能出图，
写数据探查脚本时很爽。

**它的坏处是"当前"这两个字**：图一多，你就不知道 `plt.title()` 到底改的是哪张图了。
下面这段代码会给你一个真实的教训：

```python
# 反直觉演示：先建两个坐标系，再用 plt.plot 画线，猜猜画在左边还是右边？
fig, axes = plt.subplots(1, 2, figsize=(7, 2.6))   # 一张画布，两个坐标系：axes[0] 和 axes[1]
_ = plt.plot([1, 2, 3], [1, 2, 3])                 # 没写对象名，靠"当前坐标系"（加 _ = 只为输出干净）
print("plt.gca()（get current axes）拿到的是右边那个：", plt.gca() is axes[1])
plt.close(fig)                                     # 关掉画布，不然后面会越堆越多
```

> 输出：
```text
plt.gca()（get current axes）拿到的是右边那个： True
```

**结论**：`plt.plot` 画在了**最后创建的**坐标系（右边）上，不是你想的左边。
要么你运气好猜对了，要么你调试半小时。这就是状态机接口的代价。

### 6.2.2 第二套：面向对象接口（OO 接口）

**面向对象（先拿到"画布对象"和"坐标系对象"，之后所有操作都显式地写在这两个对象上）**。

```python
# 写法二：面向对象接口 —— 先把两个对象拿到手，之后一切操作都指名道姓
fig, ax = plt.subplots(figsize=(6, 3.5))   # fig = 整张画布，ax = 一个坐标系
_ = ax.plot([1, 2, 3, 4], [10, 20, 15, 25])   # 在 ax 上画线（返回值不用，接住保持输出干净）
_ = ax.set_title("北京 4 个季度销量")        # ax.set_xxx() 设置这个坐标系的属性
_ = ax.set_xlabel("季度")
_ = ax.set_ylabel("销量（万件）")
fig.savefig(f"{OUT}/6_2_oo.png", dpi=110, bbox_inches="tight")   # 保存这张画布
plt.close(fig)                              # 关掉这张画布
print("已保存：", f"{OUT}/6_2_oo.png")
```

> 输出：
```text
已保存： _test/ch06/6_2_oo.png
```

注意两处**写法差异**，这是新手最容易混的地方（另外你会发现所有绘制、设置类调用
都加了 `_ =`，原因见 6.0.4）：

| 想做的事 | pyplot 接口 | 面向对象接口 | 说明 |
|---|---|---|---|
| 加标题 | `plt.title("t")` | `ax.set_title("t")` | OO 里是 `set_` 前缀 |
| 加轴标签 | `plt.xlabel("x")` | `ax.set_xlabel("x")` | 同上 |
| 设刻度 | `plt.xticks(...)` | `ax.set_xticks(...)` | 同上 |
| 设坐标范围 | `plt.xlim(0, 10)` | `ax.set_xlim(0, 10)` | 同上 |
| 画线 | `plt.plot(...)` | `ax.plot(...)` | 不用 `set_` |
| 加图例 | `plt.legend()` | `ax.legend()` | 不用 `set_` |
| 保存 | `plt.savefig(...)` | `fig.savefig(...)` | OO 里用 `fig` |

**记忆口诀**：`ax.plot` 画东西、`ax.set_xxx` 改设置、`fig.savefig` 存文件。

### 6.2.3 为什么以后一律用面向对象接口

这不是风格偏好，是**四个实际理由**：

1. **多子图不会乱。** 一张画布上放 4 个坐标系时，pyplot 的"当前坐标系"会让你疯掉；
   OO 接口里 `axes[0, 1].set_title(...)` 一目了然。
2. **精细控制必须拿到对象。** 想单独隐藏上边框（`ax.spines["top"]`）、
   给某根柱子单独上色（`bars[2].set_color(...)`）、加一个箭头注释 —— 这些都得先有 `ax`。
3. **能封装成函数。** 工作中你经常要"同一套样式画几十张图"。只有 OO 接口能写成
   `def plot_trend(ax, s, title): ...` 这样的函数，把 `ax` 当参数传进去。
   用 pyplot 接口写的函数，调用两次就会画到同一张图上。
4. **官方和社区都在往 OO 走。** matplotlib 官方文档的 "Examples" 里绝大多数
   都是 OO 写法；pandas 的 `df.plot()`、seaborn 也都支持并返回 `ax`。

> ⚠️ **常见报错**：`AttributeError: module 'matplotlib.pyplot' has no attribute 'set_title'`
> **原因**：把 OO 的 `ax.set_title(...)` 写成了 `plt.set_title(...)`。
> **解决**：`set_` 系列是**坐标系对象** `ax` 的方法，不是 `plt` 的。
> 在 IDE 里输入 `plt.` 看到自动补全里没有 `set_title`，就是提示你写错对象了。

**但是**：用 OO 接口 ≠ 不 import pyplot。下面这些还是得用 `plt`：

```python
# 即使全程用 OO 接口，pyplot 也依然要用到 —— 它负责"创建"和"收尾"
print("创建画布：fig, ax = plt.subplots(...)")
print("全局设置：plt.rcParams[...]")
print("关掉画布：plt.close(fig)")
print("批量关掉：plt.close('all')")
print("显示图片：plt.show()")
```

> 输出：
```text
创建画布：fig, ax = plt.subplots(...)
全局设置：plt.rcParams[...]
关掉画布：plt.close(fig)
批量关掉：plt.close('all')
显示图片：plt.show()
```

---

## 6.3 绘图的标准流程六步

**为什么要固定流程？** 因为画图时人容易"一边画一边改"，最后代码变成一坨，
换一份数据就重写。**固定成六步之后**，每张图的代码结构都一样，
你半年后回来看还能看懂。

### 6.3.1 六步

| 步骤 | 做什么 | 用到的代码 | 常见错误 |
|---|---|---|---|
| ① 准备数据 | 算出要画的 x、y（多数来自 `groupby`） | `sales.groupby(...)["销售额"].sum()` | 直接在画图函数里写复杂计算 |
| ② 创建画布和坐标系 | 定尺寸 `figsize` | `fig, ax = plt.subplots(figsize=(9, 4))` | 忘了接收返回值 |
| ③ 画图 | `plot` / `bar` / `hist` ... | `ax.bar(x, y, color=...)` | 中文标签忘了设字体（6.4） |
| ④ 设置标题、轴标签、刻度 | 让图能"自己解释自己" | `ax.set_title/set_xlabel/set_xticks` | 只写标题不写**单位** |
| ⑤ 图例与注释 | 说清楚每条线/每根柱是什么 | `ax.legend(loc="upper left")` | 图例挡住数据 |
| ⑥ 保存 / 显示 | 落盘或显示 | `save(fig, "chart.png")` | 先 `show()` 后 `savefig()`（6.10.5） |

**第 ④ 步要特别强调单位**。`ax.set_ylabel("销售额")` 是新手写法，
`ax.set_ylabel("销售额（万元）")` 才是能进报告的写法。读者看到数字会自动想"单位是什么"，
你不写，他就得猜。

### 6.3.2 一个完整模板（背下来也不亏）

把六步写全，就是下面这段。它画的是 `sales_clean.csv` 的**月度销售额趋势**：
`groupby` 算数据 → 建画布 → 画折线 → 设标题标签 → 加图例 → 保存。

```python
# ① 准备数据：按"月"汇总销售额（pandas 部分复习第 4 章）
#    resample("ME") 表示按"月末"重采样（pandas 3.0 必须写 ME，不能写 M）
monthly = sales.set_index("订单日期")["销售额"].resample("ME").sum()

# ② 创建画布和坐标系：figsize 单位是英寸（1 英寸 ≈ 2.54 厘米），(9, 4) 适合放在报告里的整行
fig, ax = plt.subplots(figsize=(9, 4))

# ③ 画图：marker="o" 在每个数据点上画个小圆点，方便看出"这里真有数据"
_ = ax.plot(monthly.index, monthly.values,
            color="#4C72B0", marker="o", markersize=4, linewidth=2, label="月度销售额")

# ④ 设置标题 / 轴标签 / 刻度：标题写"什么数据"，轴标签写"数量 + 单位"
_ = ax.set_title("月度销售额趋势（2023-01 ~ 2024-12）")
_ = ax.set_xlabel("月份")
_ = ax.set_ylabel("销售额（元）")
_ = ax.tick_params(axis="x", rotation=45)   # x 轴标签斜 45 度，防止日期挤在一起

# ⑤ 图例：说明每条线是什么（这里只有一条线，但养成习惯总没错）
_ = ax.legend(loc="upper right")

# ⑥ 保存：dpi 控制清晰度，bbox_inches="tight" 把四周多余白边裁掉
fig.savefig(f"{OUT}/6_3_template.png", dpi=110, bbox_inches="tight", facecolor="white")
plt.close(fig)                             # 关掉画布，避免同时打开太多图（见 6.11）
print("已保存：", f"{OUT}/6_3_template.png")
```

> 输出：
```text
已保存： _test/ch06/6_3_template.png
```

**注意第 ⑥ 步那一长串参数**：`dpi=110, bbox_inches="tight", facecolor="white"`。
这三个参数几乎每张图都要写一遍 —— 你觉得烦，我也觉得烦。所以教程提供了一行搞定的
`save(fig, 文件名)`（6.4.8 节引入），它内部就是这三件事：
**自动 `tight_layout()` + `bbox_inches="tight"` + 统一 dpi + 白底**。

### 6.3.3 `plt.subplots` 参数速查

`plt.subplots()` 是本章出现频率最高的函数，把它的参数提前讲清楚：

| 参数 | 含义 | 常用取值 | 不写会怎样 |
|---|---|---|---|
| `figsize` | 画布尺寸（英寸） | `(9, 4)` 单图 / `(13, 7)` 多图 | 用默认 6.4×4.8，多子图会挤成一团 |
| `nrows` / `ncols` | 子图的行数 / 列数 | `2, 2` | 默认 1×1，只得到一个 `ax` |
| `sharex` | 是否共用 x 轴 | `True` / `False` | 各子图刻度不一样，没法上下对比 |
| `sharey` | 是否共用 y 轴 | `True` / `False` | 同上 |
| `dpi` | 屏幕显示分辨率 | `100 ~ 150` | 用 `figure.dpi`，默认 100 |
| `layout` | 自动排版方式 | `"constrained"` | 标签容易和子图重叠 |

**关于返回值的形状**（新手最容易在这里翻车）：

```python
fig1, ax1 = plt.subplots()            # 1 个子图：ax1 直接是坐标系对象
fig2, ax2 = plt.subplots(1, 3)         # 1 行 3 列：ax2 是长度为 3 的数组
fig3, ax3 = plt.subplots(2, 2)         # 2 行 2 列：ax3 是 2×2 的二维数组，要写 ax3[0, 1]
print("单子图类型：", type(ax1).__name__)          # 不是数组
print("1×3 子图类型：", type(ax2).__name__, "长度", len(ax2))
print("2×2 子图形状：", ax3.shape, "→ 用 ax3[行, 列] 取")
plt.close("all")                       # 把上面创建的 3 张空画布都关掉
```

> 输出：
```text
单子图类型： Axes
1×3 子图类型： ndarray 长度 3
2×2 子图形状： (2, 2) → 用 ax3[行, 列] 取
```

> 💡 **一个万能技巧**：不管几行几列，都可以用 `axes.flat` 把它拉平成一维来循环：
> `for ax in axes.flat: ax.set_title(...)`。这样 1×3 和 3×1 的代码可以完全一样。
> 6.6 节会大量用到。

---

## 6.4 中文显示问题：新手第一大坑

这一节请务必看完。**90% 的人第一次用 matplotlib 画中文图，都会看到一堆方块**，
然后开始怀疑是不是自己的 Python 装坏了。不是。这是字体问题，而且非常好解决。

### 6.4.1 现象：中文变成"豆腐块"

```python
# 反例演示：故意不设置中文字体，看看会发生什么
# 跑完这一段记得把字体改回来（本章 6.4.8 的 setup() 会替你改回来）
plt.rcParams["font.sans-serif"] = ["DejaVu Sans"]   # DejaVu Sans 是 matplotlib 自带默认字体，只有拉丁字母
plt.rcParams["axes.unicode_minus"] = True           # 顺手把负号设置也恢复成默认值

fig, ax = plt.subplots(figsize=(5, 2.8))                      # 建一张小画布
_ = ax.bar(["北京", "上海", "广州"], [42, 38, 25], color="#4C72B0")   # 三根柱子
_ = ax.set_title("各城市订单数")                              # 标题里的中文会出问题
_ = ax.set_ylabel("订单数（单）")                             # 轴标签里的中文同样出问题
fig.savefig(f"{OUT}/6_4_tofu.png", dpi=110, bbox_inches="tight")      # 存下来看效果
plt.close(fig)
print("图已保存，打开 6_4_tofu.png 看效果：中文全是方块")
```

打开图片你会看到：**标题变成 `□□□□□`，x 轴的"北京/上海/广州"全变成方块**，
y 轴标签也一样 —— 图形本身完全正常，只有中文挂了。

同时 Jupyter 的输出区会刷出一大堆警告，每一行对应一个"找不到字形的汉字"：

```text
Glyph 37329 (\N{CJK UNIFIED IDEOGRAPH-91D1}) missing from font(s) DejaVu Sans.
Glyph 39069 (\N{CJK UNIFIED IDEOGRAPH-989D}) missing from font(s) DejaVu Sans.
Glyph 65288 (\N{FULLWIDTH LEFT PARENTHESIS}) missing from font(s) DejaVu Sans.
... （有几个中文字符就报几行）
```

> 💡 那串 `Glyph 37329` 里的 **37329 是汉字的 Unicode 编码**（`0x91D1` 正好是"金"字），
> `missing from font(s) DejaVu Sans` 的意思是"DejaVu Sans 这个字体里没有这个字"。
> **看到 `Glyph ... missing from font` 就知道是字体问题，不用去改代码逻辑。**

**这里有个更坑的细节**：这些警告有时不显示（在脚本里跑、或者 IDE 把警告折叠了），
于是你只看到一图方块，完全不知道发生了什么。所以记住这条铁律：

> **画中文图之前，先把中文字体设好。** 不要等看到方块再回头查。

### 6.4.2 原因：默认字体里没有汉字

matplotlib 的字体设置分两层：

1. `font.family`：字体**大类**。默认值 `sans-serif`（无衬线字体家族）。
2. `font.sans-serif`：这个大类下面，**具体按什么顺序找字体**。
   matplotlib 自带的默认列表里，第一个就是 `DejaVu Sans`。

`DejaVu Sans` 是一个开源西文字体，**根本没有汉字字形**。matplotlib 找不到字形时不会报错退出，
而是画一个"空心方框"（俗称**豆腐块**）顶上去 —— 这就是你在图上看到的 `□`。

**为什么经常"时好时坏"？** 因为 `font.sans-serif` 是个**列表**：matplotlib 按顺序往下找，
找到系统里有的就用。如果你的电脑装过某个中文软件（WPS、Office 等），
它带的字体可能恰好补上了汉字；换台电脑又没有了。所以**永远显式指定中文字体**，
不要指望"默认能显示"。

### 6.4.3 解法一：全局设置 `rcParams`（最常用）

**`rcParams`（runtime configuration parameters，运行时配置参数）** 是 matplotlib 的全局设置字典，
改一次，后面所有图都生效。中文字体要改**两行**：

```python
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]   # 第 1 行：优先用微软雅黑
plt.rcParams["axes.unicode_minus"] = False              # 第 2 行：负号用 ASCII 连字符，别用"数学减号"

fig, ax = plt.subplots(figsize=(5, 2.8))                # 重新建一张干净画布
_ = ax.bar(["北京", "上海", "广州"], [42, 38, 25], color="#4C72B0")   # 同样的三根柱子
_ = ax.set_title("各城市订单数")                          # 这次中文正常了
_ = ax.set_ylabel("订单数（单）")
fig.savefig(f"{OUT}/6_4_font_ok.png", dpi=110, bbox_inches="tight")   # 保存
plt.close(fig)
print("已保存：", f"{OUT}/6_4_font_ok.png")
```

> 输出：
```text
已保存： _test/ch06/6_4_font_ok.png
```

**为什么有时"写了还是不生效"？** matplotlib 会按 `font.sans-serif` 列表顺序找第一个
**本机有**的字体：

- 写 `["Microsoft YaHei"]`：本机有 → 用它，中文正常；
- 写 `["SimHei", "Microsoft YaHei"]`：本机有 SimHei → 用 SimHei，中文也正常；
- 写 `["ABC 不存在的字体"]`：找不到 → 回退到默认字体 → 方块 + `findfont` 警告（见 6.11）。

**推荐写法**：给一个**候选列表**，从最想要的开始排。本章的统一风格模块就是这么做的。

### 6.4.4 解法二：局部设置 `fontproperties`（只改一个地方）

**场景**：你只想让**某一个**标题用楷体，其他地方不动。这时改全局 `rcParams` 太重，用
`fontproperties=` 参数单独指定：

```python
from matplotlib.font_manager import FontProperties   # 字体属性对象，用来"随身携带"一份字体设置
kai = FontProperties(family="KaiTi", size=15)        # 指定楷体、字号 15
yahei = FontProperties(family="Microsoft YaHei", size=10)

fig, ax = plt.subplots(figsize=(6, 3))
_ = ax.bar(["北京", "上海", "广州"], [42, 38, 25], color="#4C72B0")   # 柱子用全局字体
_ = ax.set_title("标题用楷体（KaiTi）", fontproperties=kai)            # ← 只这一个元素用楷体
_ = ax.set_xlabel("x 轴用微软雅黑", fontproperties=yahei)              # ← 这个用雅黑
_ = ax.set_ylabel("y 轴用全局字体")                                    # 不传就跟着全局 rcParams 走
fig.savefig(f"{OUT}/6_4_fontproperties.png", dpi=110, bbox_inches="tight")
plt.close(fig)
print("已保存：", f"{OUT}/6_4_fontproperties.png")
```

> 输出：
```text
已保存： _test/ch06/6_4_fontproperties.png
```

| 参数 | 用在哪儿 | 生效范围 |
|---|---|---|
| `fontproperties=FontProperties(...)` | `set_title` / `set_xlabel` / `annotate` / `text` / `legend(prop=...)` | **只作用于这一个元素** |
| `fontsize=14` | 几乎所有文字类函数 | 只改字号，字体跟着全局走 |
| `fontfamily="KaiTi"` | matplotlib 3.x 的写法 | 直接传字体名字符串，不用包对象 |

> ⚠️ **常见报错**：`AttributeError: 'str' object has no attribute 'get_family'`
> **原因**：把 `fontproperties="KaiTi"` 直接传了字符串。
> **解决**：`fontproperties` 要的是 **FontProperties 对象**，必须
> `FontProperties(family="KaiTi")` 包一层；如果你想直接传字体名，用另一个参数 `fontfamily="KaiTi"`。

### 6.4.5 负号问题：为什么必须有第二行

很多教程只写第一行（设中文字体），结果图里**中文好了、负号又变成方块**，于是更困惑。
原因：matplotlib 默认用**真正的数学减号 U+2212**（比较长的那个 `−`）显示负数，
而**很多中文字体里没有这个字符**。

这不是推测，我们在本机把 5 种常见中文字体逐个测了一遍：

```python
import warnings                                    # 标准库，用来"抓住"警告而不是让它刷屏

for fname in ["Microsoft YaHei", "SimHei", "SimSun", "KaiTi", "DengXian"]:
    plt.rcParams["font.sans-serif"] = [fname]      # 换成这个字体
    plt.rcParams["axes.unicode_minus"] = True      # 打开"数学减号"（默认行为）
    fig, ax = plt.subplots(figsize=(3, 2))         # 画一张带负数的小图
    _ = ax.bar(["甲", "乙"], [1, -2])              # 甲是正数，乙是负数
    with warnings.catch_warnings(record=True) as w:   # 把警告收集起来
        warnings.simplefilter("always")               # 不要过滤，全都要
        fig.savefig(f"{OUT}/6_4_minus_{fname.replace(' ', '_')}.png")   # 存图时才会真正渲染文字
    missing = [x for x in w if "missing from font" in str(x.message)]   # 只挑"缺字形"的警告
    print(f"{fname:<16} 缺字形警告 {len(missing)} 条")
    plt.close(fig)

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]   # 测完恢复成本教程的统一字体
plt.rcParams["axes.unicode_minus"] = False              # 负号也恢复
print("已恢复统一设置")
```

> 输出：
```text
Microsoft YaHei  缺字形警告 0 条
SimHei           缺字形警告 2 条
SimSun           缺字形警告 2 条
KaiTi            缺字形警告 2 条
DengXian         缺字形警告 2 条
已恢复统一设置
```

**结论**：

- 微软雅黑（Microsoft YaHei）**恰好**带 U+2212，只设第一行也不出问题；
- 黑体（SimHei）、宋体（SimSun）、楷体（KaiTi）、等线（DengXian）**都缺** U+2212，
  只设第一行就会看到**负号变方块**，警告原文是
  `Glyph 8722 (\N{MINUS SIGN}) missing from font(s) SimHei.`
  （表里"警告 2 条"是因为那张小图的 y 轴上有 2 个负数刻度，有几个就报几条）。

**所以 `axes.unicode_minus = False` 必须有**：它让 matplotlib 用 ASCII 连字符 `-`（U+002D）
来画负号，所有字体都有这个字符。代价是负号显示得稍微短一点，
但**绝对不会缺字**。这是全世界数据科学项目的通行做法。

> 📌 一句话记忆：**中文字体两行，一行都不能少。**
> `font.sans-serif` 管汉字，`axes.unicode_minus` 管负号。

### 6.4.6 找不到字体怎么办：三个系统怎么查

如果设了字体还是方块，说明**你写的字体名本机根本没有**。先查清楚本机有什么：

```python
from matplotlib import font_manager                        # 字体管理模块
names = {f.name for f in font_manager.fontManager.ttflist}  # 已注册的字体名（集合自动去重）

for cand in ["Microsoft YaHei", "SimHei", "SimSun", "DengXian", "KaiTi"]:
    print(f"{cand:<16} {'可用' if cand in names else '没有'}")   # 逐个检查推荐的候选中文字体
print("已注册字体总数：", len(names))
print("matplotlib 字体缓存目录：", matplotlib.get_cachedir())
```

> 输出：
```text
Microsoft YaHei  可用
SimHei           可用
SimSun           可用
DengXian         可用
KaiTi            可用
已注册字体总数： 563
matplotlib 字体缓存目录： <用户目录>\AppData\Local\matplotlib
```

**各个系统该找什么字体**：

| 系统 | 常见中文字体名 | 去哪儿看 |
|---|---|---|
| Windows | `Microsoft YaHei`（微软雅黑）、`SimHei`（黑体）、`SimSun`（宋体）、`DengXian`（等线）、`KaiTi`（楷体） | `C:\Windows\Fonts` |
| macOS | `PingFang SC`（苹方）、`Heiti SC`（黑体-简）、`Songti SC`（宋体-简）、`STHeiti` | `/System/Library/Fonts`、`/Library/Fonts` |
| Linux | `Noto Sans CJK SC`、`WenQuanYi Zen Hei`（文泉驿正黑）、`Source Han Sans SC`（思源黑体） | 命令行 `fc-list :lang=zh` |

**Linux 上查字体**（在终端里跑，不是在 Python 里跑）：

```powershell
fc-list :lang=zh | head -20
```

**如果系统里一个中文字体都没有**（精简版 Linux 常见）：下载一个开源中文字体
（推荐**思源黑体** Source Han Sans SC 或 **Noto Sans CJK SC**），然后**手动注册**：

```python
from matplotlib import font_manager                         # 字体管理模块
import os                                                   # 标准库：判断文件在不在

font_file = "SourceHanSansSC-Regular.otf"                   # 假设下载的思源黑体就放在当前目录
if os.path.exists(font_file):                                # 文件真存在才注册（本机已有雅黑，所以这里是走 else）
    font_manager.fontManager.addfont(font_file)             # 把字体文件注册进 matplotlib
    plt.rcParams["font.sans-serif"] = ["Source Han Sans SC"]  # 再用它的"字体名"（不是文件名）
    print("已注册，当前候选字体：", plt.rcParams["font.sans-serif"])
else:
    print(f"当前目录没有 {font_file}，跳过注册（本机已有 Microsoft YaHei，不影响后面的图）")
```

> 输出：
```text
当前目录没有 SourceHanSansSC-Regular.otf，跳过注册（本机已有 Microsoft YaHei，不影响后面的图）
```

> ⚠️ **常见报错**：`findfont: Font family 'SimHei' not found.`
> **原因**：① 字体名拼错（写 `simhei`、`黑体` 都不行，必须写**注册名** `SimHei`）；
> ② 字体是新装的，matplotlib 的**字体缓存**还是旧的；
> ③ Linux 上确实没装中文字体。
> **解决**：先用上面的代码打印本机字体名核对；如果确实是新装的字体，
> 删掉 `matplotlib.get_cachedir()` 目录下的 `fontlist-*.json`，重启内核再看。

### 6.4.7 一个可以复制走的一键配置函数

把上面的逻辑包成一个函数，以后每个新项目开头调一次就行：

```python
def set_chinese_font(prefer=("Microsoft YaHei", "SimHei", "SimSun", "DengXian", "KaiTi")):
    """一键配置中文字体：按优先级找第一个本机可用的字体并设置，返回字体名。

    用法：复制到你项目的工具模块里，脚本开头调用 set_chinese_font() 即可。
    """
    from matplotlib import font_manager
    available = {f.name for f in font_manager.fontManager.ttflist}   # 本机所有已注册字体名
    for name in prefer:                        # 按"最想要 → 次想要"的顺序试
        if name in available:                  # 找到本机有的
            plt.rcParams["font.sans-serif"] = [name]        # 设中文字体
            plt.rcParams["axes.unicode_minus"] = False      # 负号一起设上，千万别漏
            return name                        # 返回选中的字体名，方便打印确认
    print("没找到候选中文字体，请检查系统字体（见 6.4.6）")
    return None                                # 一个都没找到

print("本机一键配置选中的字体：", set_chinese_font())
```

> 输出：
```text
本机一键配置选中的字体： Microsoft YaHei
```

**注意这个函数只做了"字体"一件事**。实际画图还要管配色、网格、字号、dpi……
于是教程把所有绘图样板集中放到了一个文件里：`code/viz_style.py`。

### 6.4.8 本章统一风格模块：`viz_style`

**为什么要有它**：如果每章、每个脚本都重新写一遍"字体 + 配色 + 网格 + 字号"，
你烦，而且前后不一致（第 6 章蓝色是 `#4C72B0`，第 8 章变成 `red`，报告就花了）。

`code/viz_style.py` 里的 `setup()` 干的就是下面这几件事（节选，可打开文件看完整版）：

```python
# 以下是从 viz_style.setup() 里摘出来的核心逻辑，看懂就行，不用抄
# font = pick_cjk_font()                            # 按 Microsoft YaHei → SimHei → SimSun → DengXian → KaiTi 挑第一个有的
# plt.rcParams["font.sans-serif"] = [font]          # ① 中文字体
# plt.rcParams["axes.unicode_minus"] = False        # ② 负号（这两行就是 6.4.3 的内容）
# plt.rcParams["figure.dpi"] = 110                  # ③ 屏幕与保存的默认分辨率
# plt.rcParams["axes.prop_cycle"] = plt.cycler(color=PALETTE)    # ④ 默认配色换成统一 8 色
# plt.rcParams["axes.grid"] = True                  # ⑤ 打开网格
# plt.rcParams["grid.alpha"] = 0.3                  #    网格要淡，别抢数据的戏
# plt.rcParams["axes.axisbelow"] = True             #    网格画在数据下面
# plt.style.use("seaborn-v0_8-whitegrid")           # ⑥ 白底浅灰网格的整体样式
```

用起来只有三行：

```python
import sys                        # 标准库
sys.path.insert(0, ".")           # notebook 在 code 目录里启动，加进去才 import 得到 viz_style
from viz_style import setup, COLORS, PALETTE, save, annotate_bars   # 本章要用的五个东西

font = setup()                    # 一次性配好中文字体、配色、网格、字号
print("setup() 选中的中文字体：", font)
print("当前中文字体设置：", plt.rcParams["font.sans-serif"])
print("负号设置（False = 用 ASCII 负号）：", plt.rcParams["axes.unicode_minus"])
print("统一配色的前 3 个颜色：", PALETTE[:3])
print("COLORS 里都有啥：", list(COLORS.keys()))
```

> 输出：
```text
setup() 选中的中文字体： Microsoft YaHei
当前中文字体设置： ['Microsoft YaHei']
负号设置（False = 用 ASCII 负号）： False
统一配色的前 3 个颜色： ['#4C72B0', '#DD8452', '#55A868']
COLORS 里都有啥： ['blue', 'orange', 'green', 'red', 'purple', 'brown', 'pink', 'gray', 'yellow', 'cyan']
```

**本章后面所有绘图代码，都以上面的 `setup()` 已经调用过为前提。**
如果你把某段代码单独复制到新 notebook 里，记得先跑一遍这三行（以及 6.0.2 的导入部分）。

> 💡 `COLORS` 是**具名颜色**（写 `COLORS["blue"]` 一眼就知道是什么颜色），
> `PALETTE` 是**一列 8 个颜色的列表**（画多条线时按顺序取 `PALETTE[0]`、`PALETTE[1]`…）。
> 为什么要用它们、为什么不能用彩虹色，6.9 节详细讲。

### 6.4.9 seaborn 里的中文字体

**seaborn（基于 matplotlib 的统计图表库，第 7 章的主角）** 有自己的主题设置函数
`set_theme()`，它会**覆盖**一大批 matplotlib 的 `rcParams`（包括字体），所以顺序和参数都有讲究：

```python
import seaborn as sns   # 第 7 章的主角，这里只用它的主题功能

# 先故意把字体设成 SimHei，看看 set_theme(font=...) 会不会覆盖它
plt.rcParams["font.sans-serif"] = ["SimHei"]
print("set_theme 之前 font.sans-serif：", plt.rcParams["font.sans-serif"])

# 方式一：把字体名直接交给 set_theme（推荐，一行解决中文）
sns.set_theme(style="whitegrid", font="Microsoft YaHei")
print("set_theme 之后 font.family：", plt.rcParams["font.family"])
print("set_theme 之后 font.sans-serif 前 3 个：", plt.rcParams["font.sans-serif"][:3])
print("matplotlib 出厂默认的 axes.unicode_minus：", matplotlib.rcParamsDefault["axes.unicode_minus"])
print("此刻的 axes.unicode_minus：", plt.rcParams["axes.unicode_minus"])

fig, ax = plt.subplots(figsize=(4, 2.4))         # 验证一下中文和负号
_ = ax.bar(["北京", "上海"], [1, -2])
_ = ax.set_title("seaborn 主题 + 中文 + 负号")
fig.savefig(f"{OUT}/6_4_seaborn.png", dpi=110, bbox_inches="tight")
plt.close(fig)
print("已保存：", f"{OUT}/6_4_seaborn.png")

# 方式二：先 set_theme，再手动把字体和负号设一遍（顺序不能反）
sns.set_theme(style="whitegrid")                          # 先设主题（它会覆盖字体等 rcParams）
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]     # 再设中文字体
plt.rcParams["axes.unicode_minus"] = False                # 负号也必须自己设一遍
print("方式二设置后的字体：", plt.rcParams["font.sans-serif"])
```

> 输出：
```text
set_theme 之前 font.sans-serif： ['SimHei']
set_theme 之后 font.family： ['Microsoft YaHei']
set_theme 之后 font.sans-serif 前 3 个： ['Arial', 'DejaVu Sans', 'Liberation Sans']
matplotlib 出厂默认的 axes.unicode_minus： True
此刻的 axes.unicode_minus： False
已保存： _test/ch06/6_4_seaborn.png
方式二设置后的字体： ['Microsoft YaHei']
```

**这段输出里藏了三个知识点**，逐条看：

1. **`set_theme(font=...)` 把字体写进了 `font.family`，而不是 `font.sans-serif`。**
   所以我们之前设的 `["SimHei"]`（在 `font.sans-serif` 里）就被**绕过**了。
   好处是：只要用 `font="微软雅黑"`，一行就能解决中文。
2. **`font.sans-serif` 被重置回了 matplotlib 的默认列表**（`Arial, DejaVu Sans, …`）。
   也就是说：**`set_theme()` 之前设的字体设置会被冲掉**，务必在它**之后**再设你的字体。
3. **`axes.unicode_minus` 的出厂默认是 `True`。**
   `set_theme()` 不管这个参数；此刻它是 `False`，只是因为我们在 6.4.3 手动改过。
   在**全新内核**里不设这一行，配上 SimHei 就会看到负号变方块 —— 就是这个坑的来源。

> ⚠️ **常见坑**：`sns.set_theme(font="SimHei")` 之后负号变成方块。
> **原因**：SimHei 没有 U+2212 字形，而 `axes.unicode_minus` 还是默认的 `True`。
> **解决**：`sns.set_theme(font="SimHei", rc={"axes.unicode_minus": False})`，
> 或在 `set_theme` 之后补一行 `plt.rcParams["axes.unicode_minus"] = False`。
> **本教程的现成答案**：`viz_style.seaborn_theme()` —— 它内部已经带了这一行：

```python
from viz_style import seaborn_theme   # 本教程封装的 seaborn 主题设置

font = seaborn_theme()                # 设 seaborn 主题，并把中文字体、负号一起处理好
print("seaborn_theme() 用的中文字体：", font)
print("负号设置：", plt.rcParams["axes.unicode_minus"])

_ = setup()                           # 6.5 节开始还是用通用样式，这里再切回来（setup 返回字体名，用 _ 接住）
print("已切回 setup() 的样式，中文字体：", plt.rcParams["font.sans-serif"])
```

> 输出：
```text
seaborn_theme() 用的中文字体： Microsoft YaHei
负号设置： False
已切回 setup() 的样式，中文字体： ['Microsoft YaHei']
```

---

## 6.5 图形组成解剖与 11 类核心图表

### 6.5.1 一张图由哪些零件组成

**为什么先讲零件？** 因为 matplotlib 的函数名全是零件名：`set_title`、`spines`、
`set_xticks`……不知道零件叫什么，你连搜索都不知道搜什么词。

一张 matplotlib 图的结构可以画成这样：

```text
Figure（画布，变量名通常叫 fig）—— 对应磁盘上的一个 PNG 文件
├── Axes 1（坐标系 / 绘图区，变量名通常叫 ax）
│   ├── Title        标题：ax.set_title()
│   ├── X Axis       x 轴：ax.set_xlabel() + 刻度 ax.set_xticks() + 刻度标签
│   ├── Y Axis       y 轴：ax.set_ylabel() + 刻度 ax.set_yticks() + 刻度标签
│   ├── Patch        绘图区背景色块：ax.set_facecolor()
│   ├── 数据图形       Line2D / Rectangle / PathCollection …（ax.plot / ax.bar / ax.scatter 画出来的）
│   ├── Legend       图例：ax.legend()
│   ├── Spines       四条边框线：ax.spines["top"] / "right" / "bottom" / "left"
│   └── Text/Annotation  文字与箭头注释：ax.text() / ax.annotate()
└── Axes 2（同一张画布上的第二个坐标系，用 plt.subplots(1, 2) 产生）
```

**中英对照 + 一句话解释**：

| 术语 | 中文 | 一句话解释 | 代码里怎么写 |
|---|---|---|---|
| **Figure** | 画布 | 整张图片，是一切的容器 | `fig, ax = plt.subplots()` 里的 `fig` |
| **Axes** | 坐标系 / 绘图区 | 真正画数据的那块区域，**一张画布可以有多个** | 上例里的 `ax` |
| **Axis** | 轴 | x 轴或 y 轴（含刻度线、刻度标签） | `ax.xaxis` / `ax.yaxis` |
| **Title** | 标题 | 坐标系上方的说明文字 | `ax.set_title("…")` |
| **Tick** | 刻度 | 轴上的短线和数字 | `ax.set_xticks([1, 2, 3])` |
| **Spine** | 边框 | 坐标系四周的边框线（默认四条） | `ax.spines["top"]` |
| **Patch** | 色块 | 绘图区背景、柱子的矩形等 | `ax.patches`（所有柱子） |
| **Legend** | 图例 | 说明每条线 / 每种颜色是什么 | `ax.legend()` |

> ⚠️ **最容易混的一对**：**Figure 和 Axes**。
> 常见错误是把 `ax` 和 `fig` 用反：`fig.set_title(...)` 会报
> `AttributeError: 'Figure' object has no attribute 'set_title'`。
> 记住：**标题、轴、刻度、图例都属于 Axes（`ax`）；只有"保存整张图"和"整张图的排版"属于 Figure（`fig`）。**

把这些零件"摸"一遍，看看它们到底是什么对象：

```python
fig, ax = plt.subplots(figsize=(4, 3))     # 一张最小的画布
_ = ax.plot([1, 2, 3], [3, 1, 2])          # 先画一条线，这样才有内容可查

print("fig.axes（这张画布上所有坐标系）：", fig.axes)
print("ax.xaxis（x 轴对象）：", ax.xaxis)
print("ax.title（标题对象）：", ax.title)
print("ax.spines（四条边框的名字）：", list(ax.spines.keys()))
print("ax.lines 里的条数（画了 1 条线）：", len(ax.lines))

_ = ax.plot([1, 2, 3], [1, 2, 3])           # 再画一条线
print("再画一条之后 ax.lines 的条数：", len(ax.lines))

_ = ax.bar(["A"], [2])                      # 柱子属于 patch（色块），不在 lines 里
print("画了 1 根柱子之后 ax.patches 的条数：", len(ax.patches))
plt.close(fig)                              # 用完关掉
```

> 输出：
```text
fig.axes（这张画布上所有坐标系）： [<Axes: >]
ax.xaxis（x 轴对象）： XAxis(55.0,36.3)
ax.title（标题对象）： Text(0.5, 1.0, '')
ax.spines（四条边框的名字）： ['left', 'right', 'bottom', 'top']
ax.lines 里的条数（画了 1 条线）： 1
再画一条之后 ax.lines 的条数： 2
画了 1 根柱子之后 ax.patches 的条数： 1
```

**这段输出值得多看一眼**：`fig.axes` 是个**列表**（说明一张画布可以有多个坐标系）；
`ax.lines` 里的线会一条条累加；柱子在 `ax.patches` 里。
**"画图"的本质就是往这些容器里塞对象** —— 理解了这一点，
后面 `ax.spines["top"].set_visible(False)`（去掉上边框）这种写法就不再神秘。

最后给这些零件"贴标签"，这就是你以后看别人代码时的对照图：

```python
fig, ax = plt.subplots(figsize=(7, 4.2))                        # 画布
x = np.arange(4)                                                # 4 个季度在 x 轴上的位置
_ = ax.bar(x, [12, 18, 9, 15], color=PALETTE[:4], label="销售额")   # Patch（柱子）+ 图例文字
_ = ax.set_title("Title（标题）")                                # Title
_ = ax.set_xlabel("X Axis 的标签")                               # X Axis
_ = ax.set_ylabel("Y Axis 的标签")                               # Y Axis
_ = ax.set_xticks(x, ["Q1", "Q2", "Q3", "Q4"])                   # Tick（刻度 + 刻度标签）
_ = ax.legend(title="Legend（图例）")                             # Legend
_ = ax.annotate("Annotation：第三季度最低",                        # Annotation（注释 + 箭头）
                xy=(2, 9), xytext=(2.4, 16),                      # 箭头指向 (2,9)，文字放在 (2.4,16)
                arrowprops=dict(arrowstyle="->", color=COLORS["red"]),
                color=COLORS["red"])
ax.spines["top"].set_visible(False)                              # Spine：去掉上边框
ax.spines["right"].set_visible(False)                            # Spine：去掉右边框
print("已保存：", save(fig, f"{OUT}/6_5_1_anatomy.png"))          # 保存
plt.close(fig)                                                   # 关掉
```

> 输出：
```text
已保存： _test/ch06/6_5_1_anatomy.png
```

上面这段代码是本章的"零件全家福"，建议实际跑一遍，对着生成的图把每个零件认一遍。
**从下一小节开始，正式进入 11 类核心图表。**

---

### 6.5.2 折线图：看趋势的标准答案

**什么时候用**：x 轴是**有顺序**的东西（尤其是时间），你想看"它是怎么变的"。
判断口诀：**只要 x 轴是时间，第一个想到的就是折线图。**

**先看数，再画图** —— 这是本章反复强调的习惯。图会掩盖细节，数字能兜底。

```python
# 准备数据：把订单日期设为索引，按"月末"重采样求销售额合计
monthly = sales.set_index("订单日期")["销售额"].resample("ME").sum()

# 先看数：几个月、最高最低在哪、平均多少
print("月份个数：", len(monthly))
print("最高月份：", monthly.idxmax().strftime("%Y-%m"), f"{monthly.max():,.0f} 元")
print("最低月份：", monthly.idxmin().strftime("%Y-%m"), f"{monthly.min():,.0f} 元")
print("月均销售额：", f"{monthly.mean():,.0f} 元")
print("最高 / 最低 =", round(monthly.max() / monthly.min(), 1), "倍")
```

> 输出：
```text
月份个数： 24
最高月份： 2023-01 115,679 元
最低月份： 2024-10 31,868 元
月均销售额： 66,337 元
最高 / 最低 = 3.6 倍
```

**基础版折线图**：

```python
fig, ax = plt.subplots(figsize=(10, 4))          # 宽一点，24 个月才放得下
_ = ax.plot(monthly.index, monthly.values,       # x = 时间，y = 销售额
            color=COLORS["blue"],                # 用统一配色里的蓝
            marker="o", markersize=4,            # 每个月份点画个小圆点：说明"这里有真实数据"
            linewidth=2,                         # 线宽 2，比默认 1.5 更清楚
            label="月度销售额")                   # 图例文字
_ = ax.set_title("月度销售额趋势（2023-01 ~ 2024-12）")
_ = ax.set_xlabel("月份")
_ = ax.set_ylabel("销售额（元）")                  # 别忘了写单位
_ = ax.tick_params(axis="x", rotation=45)        # 月份标签斜 45 度，防止挤成一团
_ = ax.legend(loc="upper right")                 # 图例放右上角
print("已保存：", save(fig, f"{OUT}/6_5_2_line_basic.png"))
plt.close(fig)                                   # 关掉画布，避免图片堆积
```

> 输出：
```text
已保存： _test/ch06/6_5_2_line_basic.png
```

**怎么读这张图**：

- 整体在 **3.2 万 ~ 11.6 万**之间波动，**月均 6.6 万**，没有持续上升或下降 ——
  说明这两年销售额是"震荡"而不是"稳定增长"。
- **2023-01 最高（11.6 万）**：年初经常是订单高峰（年终奖、年货节），
  但也要警惕"是不是有一次性大单"，可以回到订单明细里查（第 5 章的异常值排查思路）。
- **2024-10 最低（3.2 万）**：只有最高月的 **27%**。看到这种"腰斩"，第一反应应该是
  "是不是有大客户流失 / 数据是不是缺了半个月"，而不是直接下业务结论。

**进阶一：多条折线对比**

单条线只能看自己，多条线能看对比。这里画"三大区域的月度销售额"：

```python
# 准备数据：只保留三个大区，把日期转成"年-月"字符串，再用 pivot_table 做成宽表
top3 = sales[sales["省份区域"].isin(["华南", "华东", "华北"])].copy()   # .copy() 避免影响原表
top3["月"] = top3["订单日期"].dt.to_period("M").astype(str)             # 变成 "2023-01" 这样的字符串
piv = top3.pivot_table(index="月", columns="省份区域", values="销售额",
                       aggfunc="sum", fill_value=0)                     # 行 = 月份，列 = 大区
print("三大区月度销售额前 3 行：")
print(piv.head(3).round(0))

fig, ax = plt.subplots(figsize=(10, 4.2))
xpos = np.arange(len(piv))                        # 用 0,1,2… 当横坐标，比直接传字符串更可控
for i, region in enumerate(piv.columns):          # 一个大区画一条线
    _ = ax.plot(xpos, piv[region],                # x 用位置，y 用销售额
                color=PALETTE[i],                 # 按顺序取统一配色，避免自己乱配颜色
                marker="o", markersize=3, linewidth=1.8, label=region)
_ = ax.set_xticks(xpos[::3])                      # 每 3 个月显示一个刻度，不然太密看不见
_ = ax.set_xticklabels(piv.index[::3], rotation=45)
_ = ax.set_title("三大区域月度销售额对比")
_ = ax.set_xlabel("月份")
_ = ax.set_ylabel("销售额（元）")
_ = ax.legend(ncol=3, loc="upper right", title="省份区域")   # ncol=3：图例排 3 列，更省地方
print("已保存：", save(fig, f"{OUT}/6_5_2_line_multi.png"))
plt.close(fig)
```

> 输出：
```text
三大区月度销售额前 3 行：
省份区域     华东     华北     华南
月                                 
2023-01    8034.0  77889.0  20811.0
2023-02   11691.0  20039.0  14574.0
2023-03    8612.0  60095.0   7232.0
已保存： _test/ch06/6_5_2_line_multi.png
```

**怎么读**：华南（蓝线）**长期在最高位**，但有几次剧烈波动（2023-01 冲到 7.1 万，
2 月又掉到 1.7 万）—— 这种"暴涨暴跌"通常意味着**大额订单集中在个别月份**，
单月数字不能外推。华东（橙线）更平稳，基本在 1 万 ~ 3 万之间。
华北（绿线）**总量最低但波动小**。

**进阶二：时间轴 + 移动平均 + 事件标注**（报告里最常见的一种图）

**移动平均（把最近 N 天的数据平均成一个值，用来抹掉短期波动、看清大趋势）**
是处理时间序列的必备武器。日活数据有很强的**周周期**（周末高、工作日低），
直接用日线看趋势会被锯齿晃花眼。

```python
# 准备数据：2024 年逐日日活
dau = ts.set_index("日期")["每日活跃用户"]        # 逐日日活（Series，索引是日期）
d2024 = dau.loc["2024"]                           # 只取 2024 年（切片写法复习第 4 章）
ma7 = d2024.rolling(7).mean()                     # 7 日移动平均：抹平"周周期"
ma30 = d2024.rolling(30).mean()                   # 30 日移动平均：看长期趋势

print("2024 年日活：均值", round(d2024.mean()), "，最高", d2024.max(),
      "出现在", d2024.idxmax().date())
print("双 11 当天原始值：", d2024.loc["2024-11-11"],
      "，前一天（7 日均线）：", round(ma7.loc["2024-11-10"], 1))
print("双 11 之后一天的原始值：", d2024.loc["2024-11-12"], "（脉冲只持续了一天）")
print("2024 年最低日活：", d2024.min(), "出现在", d2024.idxmin().date())
```

> 输出：
```text
2024 年日活：均值 1783 ，最高 2754 出现在 2024-11-11
双 11 当天原始值： 2754 ，前一天（7 日均线）： 1693.3
双 11 之后一天的原始值： 1862 （脉冲只持续了一天）
2024 年最低日活： 1459 出现在 2024-01-03
```

```python
fig, ax = plt.subplots(figsize=(11, 4.2))
_ = ax.plot(d2024.index, d2024.values,                     # 原始逐日数据
            color=COLORS["gray"], linewidth=0.9, alpha=0.7,     # 灰、细、半透明：它是背景，不是主角
            label="每日活跃用户（原始）")
_ = ax.plot(d2024.index, ma7, color=COLORS["blue"], linewidth=2, label="7 日移动平均")
_ = ax.plot(d2024.index, ma30, color=COLORS["red"], linewidth=2.2, label="30 日移动平均")

# 给双 11 加箭头注释：xy 是"箭头尖端指向的点"，xytext 是"文字放在哪儿"
_ = ax.annotate("双 11：2754",
                xy=(d2024.idxmax(), d2024.max()),           # 箭头指向最高点
                xytext=(d2024.idxmax(), d2024.max() - 330), # 文字放在它下面 330 的位置
                ha="center", color=COLORS["red"],
                arrowprops=dict(arrowstyle="->", color=COLORS["red"]))
_ = ax.set_title("2024 年每日活跃用户：原始数据 + 7 日 / 30 日移动平均")
_ = ax.set_xlabel("日期")
_ = ax.set_ylabel("活跃用户数（人）")
_ = ax.legend(loc="upper left", ncol=3)
print("已保存：", save(fig, f"{OUT}/6_5_2_line_ma.png"))
plt.close(fig)
```

> 输出：
```text
已保存： _test/ch06/6_5_2_line_ma.png
```

**怎么读**：

- **灰线（原始）**：锯齿状起伏是"周周期"（周末高、工作日低）。如果你盯着灰线下结论，
  会得出"每天都在大涨大跌"的错误印象。
- **蓝线（7 日均线）**：把锯齿抹平了 —— 2024 年日活从年初的 1400 左右，
  平稳升到年末的 1900 左右。
- **红线（30 日均线）**：最平滑，趋势最清楚 —— **全年缓慢上行**。
- **双 11 当天冲到 2754，第二天就回到 1862**：这是**脉冲（短时冲高）**，
  不等于"用户永久变多了"。**均线看长期趋势，原始值看单个事件**，两者配合使用。
- 6-18（618 大促）当天是 2469，全年第二高 —— 时间序列里的规律要靠"看图 + 查日历"一起找。
- 注意：**均线上看不到 6-18 和双 11 的尖峰**（被平均掉了），所以报告里的常见做法是
  **"均线看趋势 + 箭头标注事件"**。

> ⚠️ **折线图的常见误用**：
> 1. **x 轴不是"有顺序"的东西，却用折线连起来。**
>    比如"北京—上海—广州—深圳"的销售额用折线画，那根线暗示了"北京到上海有过渡"，纯属误导。
>    **类别用柱状图，时间用折线图。**
> 2. **数据点太密。** 1096 天的日线画在 10 英寸宽的图上，每个点只占 1 像素，线会糊成一片。
>    对策：先重采样（按周/月），或加移动平均，或把原始线调细、调透明。
> 3. **多条线用了相近的颜色。** 深蓝配浅蓝，读者得眯着眼睛对图例。
>    对策：用 `PALETTE` 这种**色相差别明显**的配色（6.9）。
> 4. **为了"好看"偷偷截断 Y 轴。** 折线图截断 Y 轴是允许的（看趋势更重要），
>    但**必须在标题或标注里说清楚**，否则会被质疑"夸大了涨幅"。

---

### 6.5.3 柱状图：比大小的标准答案

**什么时候用**：比较**不同类别之间的大小**。类别数量少（≤10 类）、
且**类别之间没有顺序关系**时最合适。

**先看数**：

```python
# 各区域销售额，降序排列 —— 柱状图一定要排序！
region = sales.groupby("省份区域")["销售额"].sum().sort_values(ascending=False)
print("各区域销售额：")
print(region.round(0))
print("最高与最低相差：", f"{region.max() - region.min():,.0f} 元",
      f"（{region.max() / region.min():.1f} 倍）")
```

> 输出：
```text
各区域销售额：
省份区域
华南    509605.0
华东    437016.0
华北    324090.0
西南    130823.0
华中    106734.0
西北     83828.0
Name: 销售额, dtype: float64
最高与最低相差： 425,777 元 （6.1 倍）
```

**基础版柱状图（含数值标注）**：

```python
fig, ax = plt.subplots(figsize=(8, 4.2))
bars = ax.bar(region.index, region.values,     # x = 类别，y = 数值；接住 bars 后面可能要用
              color=COLORS["blue"],            # 统一配色
              width=0.62)                      # 柱子宽度（0.62 比默认 0.8 更清爽）
annotate_bars(ax, fmt="{:,.0f}", fontsize=9)   # 每根柱子上标数值（viz_style 提供的辅助函数）
_ = ax.set_title("各区域销售额")
_ = ax.set_xlabel("省份区域")
_ = ax.set_ylabel("销售额（元）")
_ = ax.set_ylim(0, region.max() * 1.15)        # 顶部留 15% 空间，否则数值标注会被裁掉
print("已保存：", save(fig, f"{OUT}/6_5_3_bar_basic.png"))
plt.close(fig)
```

> 输出：
```text
已保存： _test/ch06/6_5_3_bar_basic.png
```

**怎么读**：柱子的长度代表销售额，一眼排出"华南 > 华东 > 华北 > 西南 > 华中 > 西北"。
最高与最低相差 **6.1 倍** —— 这种量级差距用**柱状图**看最合适
（用饼图看这 6 个类别就会很痛苦，见 6.5.7）。

**进阶一：分组柱状图**（同一类别下再分子组，比如"各月 × 各支付方式"）

```python
# 准备数据：2024 年各月、各支付方式的订单数
pay = (sales.assign(月=sales["订单日期"].dt.to_period("M").astype(str))   # 先加一列"年月"
       .query("月 >= '2024-01'")                                          # 只看 2024 年
       .pivot_table(index="月", columns="支付方式", values="订单编号",
                    aggfunc="count", fill_value=0))                        # 计数用订单编号
print("2024 年各月支付方式订单数（前 4 行）：")
print(pay.head(4))

fig, ax = plt.subplots(figsize=(10, 4.2))
xpos = np.arange(len(pay))                      # 月份的位置：0,1,2,…,11
n = len(pay.columns)                            # 4 种支付方式
w = 0.2                                         # 每组里每根柱子的宽度
for i, col in enumerate(pay.columns):           # 4 种支付方式 → 每个月 4 根柱子
    offset = (i - (n - 1) / 2) * w              # 关键：把柱子左右错开（公式不用背，抄下来即可）
    _ = ax.bar(xpos + offset, pay[col], width=w, color=PALETTE[i], label=col)
_ = ax.set_xticks(xpos, pay.index, rotation=45)  # 刻度落在"组的正中间"
_ = ax.set_title("2024 年各月支付方式订单数（分组柱状图）")
_ = ax.set_xlabel("月份")
_ = ax.set_ylabel("订单数（单）")
_ = ax.legend(ncol=4, loc="upper center", bbox_to_anchor=(0.5, -0.22))   # 图例放到图的下方外面
print("已保存：", save(fig, f"{OUT}/6_5_3_bar_group.png"))
plt.close(fig)
```

> 输出：
```text
2024 年各月支付方式订单数（前 4 行）：
支付方式  微信支付  支付宝  花呗  银行卡
月                                      
2024-01         23      24     7       8
2024-02         14      18     6       3
2024-03         22      20     6      11
2024-04         13      15     5       9
已保存： _test/ch06/6_5_3_bar_group.png
```

> 💡 **那个 `(i - (n - 1) / 2) * w` 是什么意思？** 目的是让 4 根柱子**以刻度为中心左右对称**。
> `n=4` 时它依次是 `-1.5w, -0.5w, +0.5w, +1.5w`。**不用背**，
> 记住分组柱状图的固定套路是"**位置 + 偏移**"就行。

**进阶二：堆叠柱状图**（看"总量 + 内部构成"）

```python
fig, ax = plt.subplots(figsize=(10, 4.2))
bottom = np.zeros(len(pay))                     # 每根柱子的"起始高度"，初始都是 0
for i, col in enumerate(pay.columns):
    _ = ax.bar(pay.index, pay[col],              # x 用月份字符串
               bottom=bottom,                    # ← 关键：踩在上一段的头顶上
               color=PALETTE[i], label=col)
    bottom = bottom + pay[col].values            # 更新"下一段的起始高度"
_ = ax.set_xticklabels(pay.index, rotation=45)   # 月份标签斜着放
_ = ax.set_title("2024 年各月支付方式订单数（堆叠柱状图）")
_ = ax.set_xlabel("月份")
_ = ax.set_ylabel("订单数（单）")
_ = ax.legend(ncol=4, loc="upper center", bbox_to_anchor=(0.5, -0.22))
print("已保存：", save(fig, f"{OUT}/6_5_3_bar_stack.png"))
plt.close(fig)
```

> 输出：
```text
已保存： _test/ch06/6_5_3_bar_stack.png
```

**分组 vs 堆叠，怎么选？**

| | 分组柱状图 | 堆叠柱状图 |
|---|---|---|
| 看点 | **子组之间**谁大谁小 | **总量**多大 + 内部构成 |
| 缺点 | 类别一多就挤成一团 | 中间那些段的长度很难比较（起点不齐） |
| 建议 | 子组 ≤ 4 个时用 | 想看总量趋势时用；**段数别超过 5 段** |

**进阶三：水平柱状图 `barh`**（中文标签长或类别多时的正解）

```python
# 各城市销售额，升序排列（barh 从下往上画，所以升序排完最长的在最上面）
city = sales.groupby("城市")["销售额"].sum().sort_values()
print("各城市销售额：")
print(city.round(0))

fig, ax = plt.subplots(figsize=(7.5, 4.2))
bars = ax.barh(city.index, city.values, color=COLORS["green"])   # 注意是 barh，x/y 的含义换了
# 水平柱状图要自己标数值：annotate_bars() 按"柱子高度"取值，对横向柱子不适用（见 6.8.3）
for p in bars:
    _ = ax.annotate(f"{p.get_width():,.0f}",                          # 横向柱子的数值要用 get_width()
                    xy=(p.get_width(), p.get_y() + p.get_height() / 2),  # 标在柱子右端
                    xytext=(4, 0), textcoords="offset points",           # 往右偏 4 个点
                    va="center", fontsize=9)
_ = ax.set_title("各城市销售额")
_ = ax.set_xlabel("销售额（元）")
_ = ax.set_xlim(0, city.max() * 1.2)            # 右边留空，数值才不会顶到边缘
print("已保存：", save(fig, f"{OUT}/6_5_3_barh.png"))
plt.close(fig)
```

> 输出：
```text
各城市销售额：
城市
西安     83828.0
武汉    106734.0
成都    130823.0
上海    209239.0
杭州    227777.0
广州    244136.0
深圳    265469.0
北京    324090.0
Name: 销售额, dtype: float64
已保存： _test/ch06/6_5_3_barh.png
```

> ⚠️ **柱状图的常见误用**：
> 1. **不排序。** 按"数据原始顺序"画柱状图，读者得自己找最大值。
>    除非类别本身有固定顺序（"周一到周日""低/中/高"），否则**一律排序**。
> 2. **Y 轴不从 0 开始。** 这是最严重的视觉误导（见 6.1.3）。
> 3. **类别太多。** 十几个类别挤在一张图里，x 轴标签会变成一片黑。
>    对策：**Top N + "其他"**，或改用 `barh`（标签横着写，不重叠）。
> 4. **中文标签重叠却只把字号调小。** 字号小到 6 号已经不能看了。
>    对策：用 `barh`、旋转 45 度、或缩短标签文案。
> 5. **用 3D 柱状图。** 除了好看没有任何优点，读数全靠猜。

---

### 6.5.4 直方图：看一个变量的分布

**什么时候用**：你想知道一个**数值变量**的分布长什么样 —— 集中在哪儿、有多分散、
是不是偏的、有几个峰。**"分布"是数据分析的第一件事**，比均值重要得多。

**先看数**：一次考试平均分 71，这句话信息量极低。看分布才知道
"是大家都考 70 分，还是一半满分一半不及格"。

```python
score = stu["期末成绩"].dropna()      # 期末成绩有 5 个缺失值，画图前先去掉（否则可能报错或画出空柱）
print("样本量：", len(score), "（300 人里有", stu["期末成绩"].isna().sum(), "人缺考）")
print("最小 / 最大：", score.min(), "/", score.max())
print("均值 / 中位数：", round(score.mean(), 2), "/", score.median())
print("标准差：", round(score.std(), 2))
print("关键分位数：")
print(score.quantile([0.05, 0.25, 0.5, 0.75, 0.95]).round(1))
```

> 输出：
```text
样本量： 295 （300 人里有 5 人缺考）
最小 / 最大： 38.9 / 100.0
均值 / 中位数： 71.32 / 71.1
标准差： 11.45
关键分位数：
0.05    53.0
0.25    62.8
0.50    71.1
0.75    79.4
0.95    89.7
Name: 期末成绩, dtype: float64
```

**均值 71.32、中位数 71.1，两者几乎相等** → 分布基本对称，没有严重偏态。
（对比第 4 章销售额的"均值 1496、中位数 406"，那个就是严重右偏。）

**bins 怎么选**：这是直方图唯一需要动脑的参数。

```python
fig, axes = plt.subplots(1, 3, figsize=(13.5, 3.8))    # 1 行 3 列，对比不同的 bins
for ax, b in zip(axes, [5, 15, 40]):                   # 5 个箱子 / 15 个 / 40 个
    _ = ax.hist(score, bins=b, color=COLORS["blue"], edgecolor="white")   # edgecolor 让柱子之间有白线
    _ = ax.set_title(f"bins={b}")
    _ = ax.set_xlabel("期末成绩")
    _ = ax.set_ylabel("人数")
print("已保存：", save(fig, f"{OUT}/6_5_4_hist_bins.png"))
plt.close(fig)
```

> 输出：
```text
已保存： _test/ch06/6_5_4_hist_bins.png
```

**怎么读这三张图**：

- **bins=5**：柱子太宽（每个箱子 12 分），细节全丢，只能看出"单峰、中间高"。
- **bins=15**：柱宽约 4 分，能看出大致钟形、左右基本对称 ——
  **一般数据从 10~20 个箱子起步比较稳**。
- **bins=40**：柱子太细，出现"这里高一点那里低一点"的锯齿，这些起伏多半是**随机噪声**，
  不是真实规律。**误把噪声当规律，是初学者最常见的翻车点。**

> 💡 **选 bins 的经验法则**：
> 1. 先试 `bins=15`；
> 2. 数据量大（上万条）可以多给点箱子（`bins=30~50`）；
> 3. **不要为了"看出规律"反复调 bins** —— 那是在给数据化妆；
> 4. 想让别人可复现，就写死数字，别用 `bins="auto"` 让它每次自己变。

**频数还是密度：`density` 参数**（新手最容易搞错的地方）

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 3.8))

# 左图：默认（density=False），y 轴是"人数"（频数）
_ = axes[0].hist(score, bins=15, color=COLORS["blue"], edgecolor="white")
_ = axes[0].set_title("默认：y 轴 = 人数（频数）")
_ = axes[0].set_xlabel("期末成绩")
_ = axes[0].set_ylabel("人数（人）")

# 右图：density=True，y 轴是"概率密度"，所有柱子的面积加起来等于 1
_ = axes[1].hist(score, bins=15, density=True, color=COLORS["orange"], edgecolor="white")
xs = np.linspace(score.min() - 5, score.max() + 5, 200)           # 画曲线用的 x 坐标
mu, sigma = score.mean(), score.std()                             # 用样本均值和标准差
pdf = np.exp(-0.5 * ((xs - mu) / sigma) ** 2) / (sigma * np.sqrt(2 * np.pi))   # 正态分布密度公式
_ = axes[1].plot(xs, pdf, color=COLORS["red"], linewidth=2, label="正态分布参考线")
_ = axes[1].set_title("density=True：y 轴 = 概率密度")
_ = axes[1].set_xlabel("期末成绩")
_ = axes[1].set_ylabel("概率密度")
_ = axes[1].legend()
print("已保存：", save(fig, f"{OUT}/6_5_4_hist_density.png"))
plt.close(fig)
```

> 输出：
```text
已保存： _test/ch06/6_5_4_hist_density.png
```

**怎么读这张对比图**：

- **左图 y 轴是人数**：适合汇报给业务方看 —— "每个分数段有多少人"最直观。
- **右图 y 轴是概率密度**：**所有柱子的面积之和 = 1**（不是高度之和），
  所以 y 轴上的数字（约 0.00 ~ 0.035）**不能读成"比例"**。
- **右图的红线是"如果数据完全服从正态分布，形状该是什么样"**：
  柱子和红线贴得还不错，只有 100 分那根明显凸出（真有学生考了满分，
  真实成绩常有这种"天花板效应"）。

> ⚠️ **直方图的常见误用**：
> 1. **把 `density=True` 的 y 轴当成百分比。** 0.03 **不是** 3%。
>    要百分比得自己换算（`weights=np.ones(len(x)) / len(x)`）。
> 2. **类别变量用直方图。** "支付方式"这种分类变量被硬排在 x 轴上，看着像有顺序 ——
>    那是柱状图的活。
> 3. **用直方图看时间趋势。** 直方图把时间顺序丢掉了，只能看分布。
> 4. **两组数据各画一张直方图凭感觉比。** 必须用**同样的 bins 和同样的 y 轴范围**，
>    或画在同一张图上（`alpha` 调半透明），否则形状没法比。

---

### 6.5.5 箱线图：抗异常值的分布图

**什么时候用**：要**同时比较好几组的分布**，或者**特别关心离群点（异常值）**。
报告里比较"各班成绩""各渠道客户消费"，箱线图最省地方。

**先搞懂"五数概括"**：箱线图不画原始数据点，而是用五个数概括一组数据的分布：

| 名称 | 含义 | 在图上的位置 |
|---|---|---|
| 最小值 | 去掉离群点后的最小值（**不是**数据的 `min()`） | 下须末端 |
| **Q1** | 第 25 百分位数 | 箱体下边 |
| **中位数** | 第 50 百分位数 | 箱体中间那条线 |
| **Q3** | 第 75 百分位数 | 箱体上边 |
| 最大值 | 去掉离群点后的最大值（**不是**数据的 `max()`） | 上须末端 |

**箱体（Q1 到 Q3）装的是中间 50% 的数据**，箱体高度叫 **IQR（四分位距）**。
离群点的判定规则是行业惯例：

- 小于 `Q1 - 1.5 × IQR` → 离群点
- 大于 `Q3 + 1.5 × IQR` → 离群点

**先看数**：把五数概括算出来，再画图，图就好懂了。

```python
# 按班级分组，算五数概括 + IQR + 离群点判定上下界
g = stu.groupby("班级")["期末成绩"]
q1 = g.quantile(0.25)                            # 第一四分位数
q3 = g.quantile(0.75)                            # 第三四分位数
iqr = q3 - q1                                    # 四分位距
summary = pd.DataFrame({
    "人数": g.count(),
    "最小值": g.min(),
    "Q1": q1,
    "中位数": g.median(),
    "Q3": q3,
    "最大值": g.max(),
    "IQR": iqr,
    "下界(Q1-1.5IQR)": q1 - 1.5 * iqr,           # 低于它就判为离群点
    "上界(Q3+1.5IQR)": q3 + 1.5 * iqr,           # 高于它就判为离群点
}).round(1).sort_values("中位数", ascending=False)
print(summary)
```

> 输出：
```text
            人数  最小值    Q1  中位数    Q3  最大值   IQR  下界(Q1-1.5IQR)  上界(Q3+1.5IQR)
班级                                                                                        
软件2302      49    55.3  65.4    72.3  78.9    96.5  13.5             45.2             99.2
软件2301      72    43.3  63.4    71.6  80.3    98.1  16.9             38.0            105.7
数据2301      67    38.9  62.2    70.9  77.0    93.6  14.8             40.0             99.2
计算机2301    49    40.1  64.1    70.8  81.2   100.0  17.1             38.4            106.9
计算机2302    58    50.1  61.8    70.2  77.8    94.9  16.0             37.8            101.8
```

**怎么读这张表**（**先看表再看图**）：

- **中位数**（箱体里的线）：软件2302 最高 **72.3**，计算机2302 最低 **70.2**，只差 2.1 分 ——
  **5 个班的整体水平非常接近**。
- **IQR**（箱体高度）：计算机2301 最大 **17.1**（成绩最参差），软件2302 最小 **13.5**（最齐整）——
  所以"哪个班更好"不好下结论：**计算机2301 中间那群人拉得最开**。
- **下界 / 上界**：按 1.5×IQR 算出的"离群点判定线"。比如软件2302 下界是 **45.2**，
  它班最小值 **55.3** > 45.2 → **这个班没有低分离群点**；
  而数据2301 的最小值 38.9 低于它的下界 40.0，所以它**有一个偏低的离群点**。

```python
fig, ax = plt.subplots(figsize=(8.5, 4.2))
groups = [d["期末成绩"].dropna().values for _, d in stu.groupby("班级")]   # 每个班的成绩数组
bp = ax.boxplot(groups,                                     # 一组一个箱子
                tick_labels=sorted(stu["班级"].unique()),    # x 轴标签（参数名是 tick_labels）
                patch_artist=True,                          # 让箱体可以填色（默认空心）
                showmeans=True,                             # 顺便把均值画成三角
                widths=0.55)                                # 箱体宽度
for patch, c in zip(bp["boxes"], PALETTE):                   # 每个箱子换个颜色，更好区分
    patch.set_facecolor(c)
    patch.set_alpha(0.65)
_ = ax.set_title("各班期末成绩分布（箱线图）")
_ = ax.set_xlabel("班级")
_ = ax.set_ylabel("期末成绩")
_ = ax.tick_params(axis="x", rotation=15)
print("已保存：", save(fig, f"{OUT}/6_5_5_box_class.png"))
plt.close(fig)
```

> 输出：
```text
已保存： _test/ch06/6_5_5_box_class.png
```

**怎么读**：箱体中间那条横线是中位数；箱体上下边是 Q1/Q3；上下两条"须"是去掉离群点后的极值；
**孤零零的小圆点是离群点**；三角是均值。**箱子整体更高 → 这组水平更好；
箱子更长 → 这组差距更大。**

**箱线图为什么比均值抗异常值**：用数据里的 `总评成绩` 演示。
这份数据有 **3 行的总评成绩等于 -1**（数据字典里标注为"缺考占位"，典型的人为异常值）。
把它们混进去算，均值和箱线图会给出完全不同的答案：

```python
total = stu["总评成绩"]
low = stu[stu["总评成绩"] < 0]                     # -1 分显然是"缺考占位"，不是真成绩
print("总评成绩里小于 0 的行数：", len(low))
print(low[["学号", "班级", "期中成绩", "期末成绩", "总评成绩"]].to_string(index=False))

print("\n带 -1 的均值：", round(total.mean(), 2), "  中位数：", round(total.median(), 2))
clean = total[total > 0]                           # 剔除 -1 之后
print("剔除后的均值：", round(clean.mean(), 2), "  中位数：", round(clean.median(), 2))
print("均值被拉低了：", round(clean.mean() - total.mean(), 2), "分；中位数只变了：",
      round(clean.median() - total.median(), 2), "分")
```

> 输出：
```text
总评成绩里小于 0 的行数： 3
    学号       班级  期中成绩  期末成绩  总评成绩
20230143   软件2301      76.0      74.4      -1.0
20230190   软件2302      82.7      81.9      -1.0
20230263 计算机2302      94.8      94.9      -1.0

带 -1 的均值： 73.52   中位数： 74.15
剔除后的均值： 74.27   中位数： 74.3
均值被拉低了： 0.75 分；中位数只变了： 0.15 分
```

**这就是箱线图的价值**：**中位数完全不受这 3 个异常值影响（变化 0），
均值被拉低了 0.71 分**。3 个异常值只是开始 —— 如果有 30 个坏数据，
均值能偏出 7 分以上，中位数照样纹丝不动。**这就是"抗异常值（稳健性）"。**

```python
fig, ax = plt.subplots(figsize=(6, 4))
_ = ax.boxplot([total.dropna().values],                  # 只画一组：全体总评成绩
               tick_labels=["全班总评成绩"], patch_artist=True,
               boxprops=dict(facecolor=COLORS["blue"], alpha=0.6))    # 直接给箱体设颜色
_ = ax.set_title("总评成绩箱线图：3 个 -1 被识别为离群点")
_ = ax.set_ylabel("分数")
print("已保存：", save(fig, f"{OUT}/6_5_5_box_outlier.png"))
plt.close(fig)
```

> 输出：
```text
已保存： _test/ch06/6_5_5_box_outlier.png
```

**怎么读**：箱体和须都挤在 **50~100 分**这个正常区间里，下面孤零零挂着 **3 个圆点**
（就是那 3 个 -1）。**"离群点不用你一个个查，箱线图帮你标出来了"** ——
这就是为什么数据清洗（第 5 章）里常有一句"先画一遍箱线图看看有没有异常"。

> ⚠️ **箱线图的常见误用**：
> 1. **用箱线图看"双峰分布"。** 箱线图会**隐藏双峰**：一个班一半 50 分一半 90 分，
>    画出来只是个正常箱体。要发现双峰必须用**直方图或小提琴图**。
> 2. **把小样本画成箱线图。** 每组只有 5 个点，四分位数毫无统计意义。
>    经验上**每组至少 20 个数据**再画箱线图。
> 3. **以为箱体里装了 80% 的数据。** 箱体（Q1~Q3）装的是**中间 50%**。
> 4. **以为"中位数不在箱体正中间"就是画错了。** 中位数偏向 Q1 或 Q3 说明分布是偏的，
>    **这正是箱线图想告诉你的信息**。
> 5. **把离群点直接删掉。** 离群点可能是录入错误，也可能是重大发现（大客户、故障）。
>    先查清原因（第 5 章），再决定删、改还是留。

<!-- CHUNK-END -->
