---
title: 07 Seaborn 与 Plotly 进阶可视化
date: 2026-09-26 10:00:00
permalink: /pyviz/07-seaborn-plotly/
series: pyviz
chapter: 7
desc: 统计图与交互图，更高层的可视化方案
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- Seaborn
- Plotly
keywords: Python 数据分析, 数据可视化, 07 Seaborn 与 Plotly 进阶可视化, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 07 Seaborn 与 Plotly 进阶可视化
toc: true
comments: true
---
> 本章难度：⭐⭐⭐ | 预计学习时间：12 小时 | 前置章节：06 Matplotlib 可视化

第 6 章你学的是 **Matplotlib** —— 绘图的"手动挡"：图怎么画你说了算，但每一处细节都要自己写。
这一章学两个**更高层**的库：**Seaborn** 让你一行代码画出漂亮的统计图，
**Plotly** 让你画出能用鼠标玩的交互图。

---

## 学习目标

学完本章你能做到：

1. 说清楚 Matplotlib / Seaborn / Plotly 三个库各自的分工，拿到一个需求知道该用哪个；
2. 用 `sns.set_theme()` 一行配好风格、字号和**中文字体**，不再出方块字；
3. 用 Seaborn 画关系图（散点/折线）、分布图（直方/核密度/ECDF）、
   分类图（箱线/小提琴/条形/计数）、回归图、矩阵热力图；
4. 用**分面图**按类别把一张图拆成多张子图（`relplot` / `displot` / `catplot` / `FacetGrid`）；
5. 用 `pairplot`、`jointplot` 一次看清多个变量的两两关系；
6. 知道 `sns.barplot` 默认画的是**均值**而不是总和，不再画错图；
7. 用 Plotly Express 画交互式散点图、折线图、柱状图、热力图，
   并做出**随时间播放的动画气泡图**和 **3D 交互图**；
8. 把 Plotly 图导出成独立 HTML 分享给别人，并知道什么时候导出会失败、怎么绕开。

---

## 7.1 三个库的分工与选型

### 7.1.1 它们各自是什么

| 库 | 定位 | 什么时候用 | 典型产物 |
|---|---|---|---|
| **Matplotlib** | 底层绘图库，什么都能画，控制最细 | 需要精细控制、出论文插图、给报告做高度定制的图 | PNG / PDF / SVG |
| **Seaborn** | 基于 Matplotlib 的**统计图表高层封装**，默认就好看 | 探索性分析、快速看分布和关系、分面图 | PNG（也能存 PDF） |
| **Plotly** | **交互式**绘图库，图能在浏览器里缩放/悬浮显示数值 | 做仪表板、网页展示、给别人交互探索、做动画 | 独立 HTML |

**一句话理解这三层关系**：

```
Plotly          独立的一套（自带 JavaScript 引擎，跑在浏览器里）
    ↑ 完全不同的体系
Seaborn         站在 Matplotlib 肩膀上的"高层封装"
    ↓ 底层依赖
Matplotlib      地基：画布、坐标轴、图元
```

### 7.1.2 最重要的一条认知：Seaborn 底层就是 Matplotlib

这句话不是"大概类似"，而是字面意义上的：**Seaborn 的每个画图函数最后都在调用 Matplotlib 的对象**。

这条认知直接带来三个好消息：

1. 第 6 章学的 `plt.rcParams` 中文字体设置、`savefig`、`subplots` 子图、
   `ax.set_title()` 这些知识**全部适用**，不用重学；
2. Seaborn 的函数大多数有一个 `ax=` 参数，可以直接把图画到你已经创建好的某个子图上；
3. Seaborn 画完之后，你还能用 Matplotlib 的方法继续微调（加参考线、改标题、标注数值）。

所以遇到 Seaborn 没有的功能，**退回去用 Matplotlib 补**是完全正常的做法。

### 7.1.3 怎么选：一段决策建议

- **只是自己想看懂数据**（探索性分析）→ 用 **Seaborn**。
  一行 `sns.scatterplot(...)` 就带了配色、图例、透明度，比 Matplotlib 省一半代码。
- **要交出去、要反复调整细节**（论文插图、公司报告模板）→ 用 **Matplotlib**。
  每一根线、每一个刻度你都能控制，尺寸单位能精确到英寸。
- **要给别人"玩"这张图**（仪表板、网页、汇报时当场缩放）→ 用 **Plotly**。
  唯一的代价是输出是 HTML，不能直接贴进 Word。
- **做动态演示**（如"55 年各国发展变化"）→ **Plotly 的动画**几乎没有替代品。
- **做统计图又要分面**（一张图拆成 12 张小图）→ **Seaborn 的分面图**
  比 Matplotlib 手写 `subplots` 循环省事得多。

> 💡 **实用组合**：先用 Seaborn 快速探索（几秒钟一张图，看几十张），
> 确定了要讲哪张图之后，再用 Matplotlib 精修或者用 Plotly 做成交互版。

### 7.1.4 本章的通用准备代码

下面这段代码本章每一节都建立在它之上（和 Jupyter 一样，从上往下顺序执行）。
它做了三件事：导入库、配好中文字体、把四个数据集读进来。

```python
import sys                          # 用来改模块搜索路径
sys.path.insert(0, ".")             # notebook 在 code 目录里启动，让 import 能找到 viz_style

import os                           # 后面要建目录、拼路径
import numpy as np                  # 数值计算
import pandas as pd                 # 表格处理
import matplotlib.pyplot as plt     # 第 6 章学过的底层绘图库

# 教程统一的绘图风格模块：中文字体、配色、网格一次性配好
from viz_style import setup, save, COLORS, PALETTE, seaborn_theme

font = setup()                      # 配置 matplotlib，返回本机选中的中文字体名
print("matplotlib 使用的中文字体：", font)

# 本章所有图片、HTML 中间产物都放这里，不弄脏 code 目录
os.makedirs("_test/ch07", exist_ok=True)
print("产物目录已就绪：_test/ch07/")
```

> 输出：
```text
matplotlib 使用的中文字体： Microsoft YaHei
产物目录已就绪：_test/ch07/
```

```python
# 本章四个数据集反复使用，集中读一次。
# 注意：四个变量名各不相同，避免"变量名复用污染"（见写作规范 6.5）
sales = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])  # 清洗后的销售数据 1064 行
stu = pd.read_csv("../data/students.csv")          # 学生成绩 300 行（含缺失与异常值）
ts = pd.read_csv("../data/timeseries.csv", parse_dates=["日期"])   # 逐日时间序列 1096 行
gap = pd.read_csv("../data/gapminder.csv")         # 公开数据集，多变量 + 做动画用

for name, d in [("sales", sales), ("stu", stu), ("ts", ts), ("gap", gap)]:
    print(f"{name:<6} {d.shape[0]:>5} 行 × {d.shape[1]:>2} 列")
```

> 输出：
```text
sales   1064 行 × 14 列
stu      300 行 × 12 列
ts      1096 行 ×  4 列
gap     1704 行 ×  6 列
```

```python
import seaborn as sns                  # 本章主角之一：统计图表
import plotly                          # 用来打印版本号
import plotly.express as px            # 本章主角之二：Plotly 的高层接口（推荐入门）
import plotly.graph_objects as go      # Plotly 的底层接口，7.11 详细讲
import plotly.io as pio                # Plotly 的输入输出模块（renderer、导出）

print("seaborn   ", sns.__version__)   # 注意：不同版本参数名有差异，见各小节的 📌 提示
print("plotly    ", plotly.__version__)
print("matplotlib", plt.matplotlib.__version__)
print("pandas    ", pd.__version__)

# 用教程封装好的 seaborn 主题（内部就是 sns.set_theme + 中文字体，原理见 7.2.4）
theme_font = seaborn_theme()
print("seaborn 主题使用的中文字体：", theme_font)
```

> 输出：
```text
seaborn    0.13.2
plotly     7.1.0
matplotlib 3.11.2
pandas     3.0.6
seaborn 主题使用的中文字体： Microsoft YaHei
```

> 说明：上面两行字体名之所以一样，是因为 `setup()` 和 `seaborn_theme()` 都用
> `viz_style.pick_cjk_font()` 从同一份候选列表里挑字体，本机实测选中 **Microsoft YaHei**。

---

## 7.2 Seaborn 主题系统

### 7.2.1 `set_theme()` 一行解决四件事

Matplotlib 要改默认样子，你得一个个改 `rcParams`。Seaborn 把这些打包成一个函数：

```python
# set_theme 一行就能同时设定 5 件事，参数名和含义如下
sns.set_theme(
    context="notebook",                 # 整体字号与线宽：默认档，"自己屏幕上看"用这个
    style="whitegrid",                  # 风格：白底 + 浅灰虚线网格
    palette="colorblind",               # 配色方案：色盲友好，正式报告首选
    font="Microsoft YaHei",             # ⭐ 中文字体名，不传这个中文就变方块（见 7.2.4）
    rc={"axes.unicode_minus": False},   # 再额外覆盖任意 matplotlib 参数：负号用 ASCII 减号
)
print("一行设完：context / style / palette / font / rc")
print("当前 font.family =", plt.rcParams["font.family"],
      "| 当前前 3 色 =", sns.color_palette().as_hex()[:3])
```

> 输出：
```text
一行设完：context / style / palette / font / rc
当前 font.family = ['Microsoft YaHei'] | 当前前 3 色 = ['#0173b2', '#de8f05', '#029e73']
```

| 参数 | 作用 | 常用取值 |
|---|---|---|
| `style` | 背景与网格风格 | `"whitegrid"`（默认，推荐）`"white"` `"dark"` `"darkgrid"` `"ticks"` |
| `palette` | 配色方案（一组颜色） | `"deep"`（默认）`"muted"` `"pastel"` `"bright"` `"dark"` `"colorblind"` |
| `font` | **字体名**，中文字体的关键就在这 | `"Microsoft YaHei"`、`"SimHei"` |
| `context` | 整体字号与线宽，控制"图的用途" | `"paper"` `"notebook"`（默认）`"talk"` `"poster"` |
| `rc` | 追加/覆盖任意 `rcParams` | `{"axes.unicode_minus": False}` |

### 7.2.2 5 种 `style` 长什么样

Seaborn 内置 5 种风格。它们的区别就是**背景色 + 有没有网格 + 网格是实线还是虚线**：

```python
styles = ["white", "whitegrid", "dark", "darkgrid", "ticks"]   # seaborn 内置的 5 种风格

for s in styles:
    # ⚠️ 每换一次风格都要重新传 font：set_theme 会把之前的设置全部重置（原因见 7.2.4）
    sns.set_theme(style=s, font=theme_font)
    fig, ax = plt.subplots(figsize=(4.6, 3.2))    # 风格对"之后新建的画布"生效，所以要在 set_theme 之后建
    sns.scatterplot(data=sales, x="单价", y="销售额", ax=ax,
                    color=COLORS["blue"], s=16, alpha=0.6)     # s 是点的大小
    ax.set_title(f'style="{s}"')
    save(fig, f"_test/ch07/theme_{s}.png")        # 用教程统一的保存函数（高清 + 紧凑裁剪）
    plt.close(fig)                               # 立刻关掉画布，避免一次打开太多导致内存警告

# 循环结束时风格停在 "ticks"，恢复成本章统一的设置，后面的图才不会风格突变
sns.set_theme(style="whitegrid", font=theme_font, rc={"axes.unicode_minus": False})
print("5 种风格已分别保存：_test/ch07/theme_white.png ... theme_ticks.png")
```

> 输出：
```text
5 种风格已分别保存：_test/ch07/theme_white.png ... theme_ticks.png
```

**怎么选**：

| style | 样子 | 适合 |
|---|---|---|
| `whitegrid` | 白底 + 浅灰虚线网格 | **默认推荐**，数值好读，投屏和打印都清楚 |
| `white` | 纯白底、无网格 | 报告里要自己加少量辅助线时 |
| `darkgrid` | 灰底 + 白网格 | 屏幕演示（seaborn 老版本默认值） |
| `dark` | 深灰底、无网格 | 深色 PPT 背景 |
| `ticks` | 白底 + 坐标轴上带小刻度线 | 偏学术论文风格 |

### 7.2.3 4 种 `context`：控制"这张图给谁看"

`context` 不改变图形状，只改**字号和线宽**。记住一个判断：

- 图在**自己屏幕**上看 → `notebook`（默认）
- 图在**论文/PDF**里 → `paper`（最小）
- 图要**投影到大屏**给别人讲 → `talk`
- 图要做成**海报**、远距离也能看清 → `poster`

```python
# 打印四种 context 下的关键字号，亲眼看一下差别
for ctx in ["paper", "notebook", "talk", "poster"]:
    sns.set_theme(context=ctx, style="whitegrid", font=theme_font)
    # round(..., 1) 是因为 rcParams 里存的是浮点数，直接打印会出现 18.000000000000004 这种尾巴
    print(f"{ctx:<9} 标题 {round(plt.rcParams['axes.titlesize'], 1):>5} pt   "
          f"轴标签 {round(plt.rcParams['axes.labelsize'], 1):>5} pt   "
          f"刻度 {round(plt.rcParams['xtick.labelsize'], 1):>5} pt")

# 演示用：做汇报大屏时换成 talk，同样的代码字号立刻变大
sns.set_theme(context="talk", style="whitegrid", font=theme_font)
fig, ax = plt.subplots(figsize=(9, 5.5))
sns.barplot(data=sales, x="省份区域", y="销售额", estimator="sum", errorbar=None,
            hue="省份区域", legend=False, palette="colorblind", ax=ax)
ax.set_title("华东与华南是销售主力（context=\"talk\" 适合投屏）")
ax.set_ylabel("销售额合计（元）")
save(fig, "_test/ch07/context_talk.png")
plt.close(fig)

# 讲完就切回默认，后面所有小节都用 notebook 字号
sns.set_theme(context="notebook", style="whitegrid", font=theme_font)
print("已保存 _test/ch07/context_talk.png，并切回 context=\"notebook\"")
```

> 输出：
```text
paper     标题   9.6 pt   轴标签   9.6 pt   刻度   8.8 pt
notebook  标题  12.0 pt   轴标签  12.0 pt   刻度  11.0 pt
talk      标题  18.0 pt   轴标签  18.0 pt   刻度  16.5 pt
poster    标题  24.0 pt   轴标签  24.0 pt   刻度  22.0 pt
Text(0.5, 1.0, '华东与华南是销售主力（context="talk" 适合投屏）')
Text(0, 0.5, '销售额合计（元）')
_test/ch07/context_talk.png
已保存 _test/ch07/context_talk.png，并切回 context="notebook"
```

### 7.2.4 中文字体：必须用 `font=` 参数传进去

这是本章最容易出错、也最值得单独讲的一点。

第 6 章我们设中文字体是这样：

```python
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]   # 直接改 matplotlib 的字体列表
```

但 `sns.set_theme()` **会重设整个 matplotlib 配置**，包括字体。所以：

- 如果你先设 `rcParams` 再调 `set_theme()`，字体设置会被**冲掉**；
- 正确做法是把字体名通过 `font=` 参数**交给 set_theme 去设**。

看一个实测例子（`font.family` 是 matplotlib 决定用哪个字体的开关）：

```python
sns.set_theme(style="whitegrid")                          # 先不传 font
print("① 没传 font：", plt.rcParams["font.family"])

sns.set_theme(style="whitegrid", font=theme_font)         # 把中文字体名交给 set_theme
print("② 传了 font：", plt.rcParams["font.family"])

sns.set_theme(style="darkgrid")                           # 只改风格，忘了再传一次 font
print("③ 只改 style：", plt.rcParams["font.family"])      # 打回原形了！

sns.set_theme(style="whitegrid", font=theme_font,
              rc={"axes.unicode_minus": False})           # 恢复；顺便让负号用 ASCII 减号
print("④ 恢复后：", plt.rcParams["font.family"],
      "| unicode_minus =", plt.rcParams["axes.unicode_minus"])
```

> 输出：
```text
① 没传 font： ['sans-serif']
② 传了 font： ['Microsoft YaHei']
③ 只改 style： ['sans-serif']
④ 恢复后： ['Microsoft YaHei'] | unicode_minus = False
```

第 ③ 步为什么危险？因为 `font.family` 变回 `['sans-serif']` 之后，
matplotlib 会去用 `font.sans-serif` 列表里的第一个字体（本机是 **Arial**），
而 Arial 里**没有汉字**，所有中文会变成空心方块。
这种问题不会报错，只会静默地把图毁掉，最容易白忙一场。

我们用警告机制把这件事"抓"出来看看真实情况：

```python
import warnings                                    # Python 标准库，用来捕获警告

sns.set_theme(style="whitegrid")                   # 故意不传 font，制造"中文变方块"
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")                # 让警告全部进列表，而不是被默认过滤掉
    fig, ax = plt.subplots(figsize=(4, 2.6))
    ax.set_title("中文标题")
    save(fig, "_test/ch07/font_broken.png")        # 这张图上的中文就是方块
    plt.close(fig)

print("matplotlib 发出的警告条数：", len(caught))
for w in caught[:3]:                               # 只打印前 3 条，格式如下
    print("  ", w.category.__name__, ":", w.message)

sns.set_theme(style="whitegrid", font=theme_font)  # 修好，后面的图恢复正常
print("重新传 font 后 font.family =", plt.rcParams["font.family"])
```

> 输出：
```text
```

> ⚠️ **常见"不报错的错误"**：图的标题、轴标签全变成小方块 `□□□`
> **原因**：调用 `set_theme()` 时没传 `font=`，中文字体被重置成 Arial。
> **解决**：每次调用 `set_theme()` 都带上 `font="Microsoft YaHei"`；
> 更省事的办法是用教程封装好的 `viz_style.seaborn_theme()`，
> 它内部就是 `sns.set_theme(style="whitegrid", font=pick_cjk_font(), rc={...})`。
> **自查方法**：`plt.rcParams["font.family"]` 里应该出现中文字体名，出现 `sans-serif` 就有问题。

> 📌 **版本差异**：老教程里的 `sns.set()`、`sns.set_style()`、`sns.set_palette()`
> 在 seaborn 0.13.2 上**仍然能用**（实测无警告），但它们各管一块，
> 容易漏设字体。新代码统一用 `sns.set_theme()` 一个入口更清楚。

> 📌 **关于 seaborn 自带的弃用警告**：本机是 seaborn 0.13.2 + matplotlib 3.11，
> 画箱线图时终端可能刷出
> `MatplotlibDeprecationWarning: vert: bool was deprecated in Matplotlib 3.11`。
> 这是 **seaborn 内部**还在调用 matplotlib 的旧参数，不是你写错了，
> **不影响出图**，可以忽略。写代码时用 `warnings.simplefilter("ignore")` 屏蔽即可。

---

## 7.3 关系图：看两个（或多个）变量之间的关系

**关系图**回答的问题是"X 变大时 Y 怎么变"。Seaborn 有三个函数干这件事：

| 函数 | 层级 | 一句话区别 |
|---|---|---|
| `sns.scatterplot` | Axes 级 | 画到**一个**坐标轴上，可以和其他图叠加 |
| `sns.lineplot` | Axes 级 | 折线图，**会自动按 x 聚合**并画置信区间 |
| `sns.relplot` | Figure 级 | 散点/折线的**分面版**，多一个 `col=`/`row=` |

> **Axes 级 vs Figure 级**（重要概念）：
> - **Axes 级**函数（`scatterplot`、`lineplot`、`histplot`、`boxplot`…）返回一个
>   `Axes` 对象，接受 `ax=` 参数，所以你可以自己 `subplots` 然后一张张画进去。
> - **Figure 级**函数（`relplot`、`displot`、`catplot`、`lmplot`）返回一个
>   `FacetGrid` 对象，它**自己管理整张画布和所有子图**，所以不能传 `ax=`，
>   要保存得用 `save(g.figure, ...)`。

### 7.3.1 `sns.scatterplot`：散点图，一次编码 5 个维度

散点图是探索数据的第一把刀。Seaborn 的厉害之处是**一个函数带三个额外的视觉通道**：

| 参数 | 视觉通道 | 能表达的变量类型 |
|---|---|---|
| `x` / `y` | 位置 | 连续型（也能放类别） |
| `hue` | **颜色** | 类别型（或连续型，自动变渐变色） |
| `size` | **点的大小** | 连续型或类别型 |
| `style` | **点的形状** | 类别型（一般不超过 4 种，否则难分辨） |
| `alpha` | 透明度 | 不是变量，是手动设置，解决点重叠 |
| `sizes` | `size` 的映射范围 | 元组，如 `(15, 220)` |

```python
fig, ax = plt.subplots(figsize=(9.5, 6))     # 先自己建画布：这就是"Axes 级"函数的用法

sns.scatterplot(
    data=sales,                # 数据来源，统一用 data= 传进去
    x="单价", y="销售额",        # 必填：横轴、纵轴各放哪一列
    hue="商品类别",             # 第 3 个维度 → 颜色
    size="数量",               # 第 4 个维度 → 点的大小
    style="下单渠道",           # 第 5 个维度 → 点的形状
    sizes=(12, 200),           # 点径映射范围：数量最小时 12、最大时 200
    alpha=0.7,                 # 半透明，点重叠时能看出密度
    ax=ax,                     # 画到我们建好的这个坐标轴上
)

ax.set_title("一张散点图放 5 个维度：单价 × 销售额（颜色=类别，大小=数量，形状=渠道）")
ax.set_xlabel("单价（元）")
ax.set_ylabel("销售额（元）")
sns.move_legend(ax, "upper left", bbox_to_anchor=(1.02, 1))   # 图例移出画布，别压住数据点
save(fig, "_test/ch07/rel_scatter.png")
plt.close(fig)
print("已保存 _test/ch07/rel_scatter.png")
```

> 输出：
```text
Text(0.5, 1.0, '一张散点图放 5 个维度：单价 × 销售额（颜色=类别，大小=数量，形状=渠道）')
Text(0.5, 0, '单价（元）')
Text(0, 0.5, '销售额（元）')
_test/ch07/rel_scatter.png
已保存 _test/ch07/rel_scatter.png
```

**读图要点**：单价和销售额明显正相关（写作规范里给出的实测相关系数是 **0.746**），
点大致排成斜向的"扇形"——因为销售额 ≈ 单价 × 数量 × 折扣，所以单价高的时候，
销售额的下限也被抬高了。

> ⚠️ **常见问题**：图例把数据点挡住了 / 图例太大
> **解决**：用 `sns.move_legend(ax, "upper left", bbox_to_anchor=(1.02, 1))`
> 把图例挪到画布外面。注意**不要**在 `sns.scatterplot` 里直接写 `legend=False`
> 就完事，那样连"哪个颜色是哪个类别"都看不到了。

> 📌 **维度不是越多越好**：`hue` + `size` + `style` 三个一起用，
> 图例会变成一大块，读者要来回对照才能读懂。实际报告里**最多用 2 个额外通道**，
> 其余的维度留到分面图（7.8 节）里去表达。

### 7.3.2 `sns.lineplot`：会自动聚合的折线图

这是 Seaborn 折线图和 Matplotlib `ax.plot` 最本质的区别：

> **如果同一个 x 对应多个 y，`sns.lineplot` 会自动把 y 求均值，并在周围画出 95% 置信区间。**

置信区间（confidence interval，简称 CI）的白话解释：**用 bootstrap 重采样 1000 次，
算出"均值大概在哪个范围内波动"**，带子越宽说明该点的数据越少、越不确定。

我们的 `sales` 里"折扣"只有 6 档，但每档有上百条订单，正好能演示这个行为：

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 5), sharey=True)   # 1 行 2 列子图，共用 y 轴

# 左图：默认行为 —— 每个折扣档算均值，再画 95% 置信区间
sns.lineplot(data=sales, x="折扣", y="销售额", hue="商品类别",
             marker="o", errorbar=("ci", 95), n_boot=1000, ax=axes[0])
axes[0].set_title("默认：每个折扣档的均值 + 95% 置信区间")

# 右图：关掉聚合的不确定性显示，只留均值折线
sns.lineplot(data=sales, x="折扣", y="销售额", hue="商品类别",
             marker="o", errorbar=None, ax=axes[1])
axes[1].set_title("errorbar=None：只画均值，不画置信带")

for ax in axes:
    ax.set_xlabel("折扣")
    ax.set_ylabel("销售额均值（元）")
    ax.legend(fontsize=8, title=None)      # 图例小一点，别挡住线
save(fig, "_test/ch07/rel_line.png")
plt.close(fig)
print("已保存 _test/ch07/rel_line.png")
```

> 输出：
```text
Text(0.5, 1.0, '默认：每个折扣档的均值 + 95% 置信区间')
Text(0.5, 1.0, 'errorbar=None：只画均值，不画置信带')
_test/ch07/rel_line.png
已保存 _test/ch07/rel_line.png
```

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `errorbar` | 画不画误差带、用什么算 | `("ci", 95)` 默认；`"sd"` 标准差；`None` 不画 |
| `n_boot` | bootstrap 重采样次数 | 默认 `1000`，越大越稳但越慢 |
| `estimator` | 聚合函数 | 默认 `"mean"`，可换 `"median"` `"sum"` `"max"` |
| `marker` | 数据点标记 | `"o"` `"s"` `"^"` |
| `units` | 每条线代表一个个体 | 传个体 ID 列名，常用于画"每个人的变化轨迹" |
| `dashes` | 线条是否虚线 | `True` 用虚线区分 hue 分组 |

> 📌 **版本差异**：老教程里写的是 `ci=95`。本机实测 `ci=95` **仍然能跑**，
> 但会抛 `FutureWarning: The 'ci' parameter is deprecated.
> Use errorbar=('ci', 95) for the same effect.`。
> seaborn 0.13 起请统一写 **`errorbar=("ci", 95)`**，
> 想彻底去掉误差带就写 **`errorbar=None`**。

> ⚠️ **用 lineplot 画时间序列前先想清楚一件事**：
> 如果你的 x 是**日期**且每个日期只有一条记录，那"自动聚合"什么也不会做，
> 你看到的就是普通折线图；但如果一天有多条记录（比如一天内多次下单），
> 你会得到"日均值曲线"，而**不是**"总和曲线"。
> 想要别的口径就显式写 `estimator="sum"`，别默认。

### 7.3.3 `sns.relplot`：散点图的分面版

`relplot` = **rel**ationship **plot**，可以理解成"能分面的 scatterplot / lineplot"。
它比 `scatterplot` 多出 `col`、`row`、`col_wrap` 三个参数，直接**按类别拆成多张子图**。

```python
g = sns.relplot(
    data=sales,
    x="单价", y="销售额",
    hue="客户性别",              # 子图内部再按性别着色
    col="省份区域",              # 按省份区域拆成 6 张子图（col 就是"列"）
    col_wrap=3,                 # 一行最多放 3 张，超了就换行；不写就挤在一行
    height=3.0,                 # 每个子图的高度（英寸）
    aspect=1.25,                # 子图宽高比，1.25 表示"宽是高的 1.25 倍"
    alpha=0.7,
    facet_kws={"sharex": False, "sharey": False},   # 每个子图各用各的坐标范围
)
g.set_titles("{col_name}")      # 子图标题模板：{col_name} 会替换成当前子图的值
g.set_axis_labels("单价（元）", "销售额（元）")
save(g.figure, "_test/ch07/rel_relplot.png", tight=False)   # Figure 级对象要取 .figure
plt.close(g.figure)
print("已保存 _test/ch07/rel_relplot.png")
```

> 输出：
```text
<seaborn.axisgrid.FacetGrid object at 0x0000021909CAE3D0>
<seaborn.axisgrid.FacetGrid object at 0x0000021909CAE3D0>
_test/ch07/rel_relplot.png
已保存 _test/ch07/rel_relplot.png
```

**`facet_kws={"sharex": False, "sharey": False}` 什么时候用？**
默认所有子图共用一套坐标范围，方便横向比较；
但如果某个省份的销售额量级和其他省份差很远，共用坐标会把它压成一条线，
这时就关掉共享，让每张子图自己撑满。

**Figure 级函数的统一用法**（记住这个套路，后面 `displot`、`catplot`、`lmplot` 都一样）：

| 你想做的事 | 写法 |
|---|---|
| 改每个子图标题 | `g.set_titles("{col_name}")` |
| 改坐标轴标签 | `g.set_axis_labels("x 轴名", "y 轴名")` |
| 改整体尺寸 | 在建图时传 `height=` 和 `aspect=` |
| 保存 | `save(g.figure, "文件名.png", tight=False)` |
| 关掉释放内存 | `plt.close(g.figure)` |

---

## 7.4 分布图：看一个变量自己长什么样

关系图看"两个变量的关系"，**分布图**看"一个变量自己的形状"：
集中在哪、偏不偏、有几个峰、尾巴有多长。

| 函数 | 画什么 | 什么时候用 |
|---|---|---|
| `sns.histplot` | 直方图（可叠加 KDE） | 最常用，一眼看分布形状 |
| `sns.kdeplot` | 核密度曲线（平滑版直方图） | 多组对比（曲线比柱子更容易叠着看） |
| `sns.ecdfplot` | 累积分布曲线 | 想直接读"低于某值的比例" |
| `sns.displot` | 上面三个的**分面版** | 要按类别拆成多张小图 |

### 7.4.1 `sns.histplot`：直方图 + 一条 KDE 曲线

**直方图**：把数值范围切成若干等宽的"箱子"（bin），数每个箱子里有多少个样本。
箱子数量 `bins` 是唯一需要你动脑的参数：太少看不出形状，太多全是锯齿。

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 4.8))

# 左：单组分布，kde=True 会在直方图上再叠一条平滑的密度曲线
sns.histplot(data=stu, x="期末成绩", bins=25, kde=True,
             color=COLORS["blue"], ax=axes[0])
axes[0].set_title("期末成绩分布（bins=25，叠加 KDE 曲线）")
axes[0].set_xlabel("期末成绩")
axes[0].set_ylabel("人数")

# 右：按性别拆成两组，堆叠显示
sns.histplot(data=stu, x="期末成绩", hue="性别", bins=25,
             multiple="stack", palette="colorblind", ax=axes[1])
axes[1].set_title('按性别分组（multiple="stack" 堆叠，总数看得见）')
axes[1].set_xlabel("期末成绩")
axes[1].set_ylabel("人数")

save(fig, "_test/ch07/dist_hist.png")
plt.close(fig)
print("已保存 _test/ch07/dist_hist.png")
```

> 输出：
```text
Text(0.5, 1.0, '期末成绩分布（bins=25，叠加 KDE 曲线）')
Text(0.5, 0, '期末成绩')
Text(0, 0.5, '人数')
Text(0.5, 1.0, '按性别分组（multiple="stack" 堆叠，总数看得见）')
Text(0.5, 0, '期末成绩')
Text(0, 0.5, '人数')
_test/ch07/dist_hist.png
已保存 _test/ch07/dist_hist.png
```

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `bins` | 箱子个数 | `20`~`40` 通常够用；也可传 `binwidth=` 指定箱宽 |
| `kde` | 是否叠加核密度曲线 | `True` / `False`（默认 False） |
| `hue` | 按哪一列分色 | 类别列名 |
| `multiple` | 多组怎么摆 | `"layer"` 叠加（默认）`"stack"` 堆叠 `"dodge"` 并排 `"fill"` 占比 |
| `stat` | 纵轴统计什么 | `"count"` 默认；`"frequency"` `"probability"` `"density"` |
| `element` | 图形元素 | `"bars"`（默认）`"step"`（只画轮廓）`"poly"` |
| `cumulative` | 是否累积 | `True` 画累积直方图 |

> 💡 **多组比较用哪个 `multiple`？**
> - 想同时看到**总数** → `"stack"`（本刊示例用的这个）
> - 想比较**各组内部的形状** → `"fill"`（每组归一化到 100%）
> - 两组、样本不多 → `"dodge"` 并排最清楚
> - **不要**用默认的 `"layer"` 半透明叠加判断多组大小，重叠区会看错。

### 7.4.2 `sns.kdeplot`：核密度估计是什么

**核密度估计（KDE，Kernel Density Estimation）一句话解释**：
把每个数据点想象成一小堆沙子（一个平滑的小山包），撒在数轴上；
把所有沙子堆叠起来，得到的**平滑地形曲线**就是密度曲线。
它相当于"把直方图的锯齿熨平"。

好处是平滑好看、多条曲线容易叠着比较；坏处是**它是算出来的、不是原始数据**，
样本很少或者有硬边界（比如成绩不能超过 100）时会出现"跑到边界外面"的假象。

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 4.8))

# bw_adjust 是"带宽调整系数"：越小越贴合数据（越抖），越大越平滑（越概括）
for ax, bw in zip(axes, [0.3, 1.5]):
    sns.kdeplot(data=stu, x="期末成绩", hue="性别", fill=True,
                bw_adjust=bw, palette="colorblind", ax=ax)
    ax.set_title(f'bw_adjust={bw}（{"贴合数据" if bw < 1 else "过度平滑"}）')
    ax.set_xlabel("期末成绩")
    ax.set_ylabel("密度")

save(fig, "_test/ch07/dist_kde.png")
plt.close(fig)
print("已保存 _test/ch07/dist_kde.png")
```

> 输出：
```text
_test/ch07/dist_kde.png
已保存 _test/ch07/dist_kde.png
```

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `bw_adjust` | 带宽倍数，控制平滑程度 | 默认 `1.0`；`0.5` 更贴合，`2` 更平滑 |
| `fill` | 曲线下方是否填色 | `True` 更好看（默认 `False`） |
| `cut` | 曲线向数据范围外延伸多少 | 默认 `3`（单位是带宽）；设 `0` 就严格贴着数据 |
| `common_norm` | 多组是否共用归一化 | `True` 默认；想让每组各自占满就用 `False` |
| `multiple` | 多组怎么摆 | 同 `histplot` |

> ⚠️ **KDE 不能替代直方图**：核密度曲线是**猜出来的**平滑版本。
> 数据里有两个明显分离的峰时它能看出来，但样本量小于 30 时别用 KDE，
> 直接看原始数据点（7.5.3 的 `stripplot`）更诚实。
> 另外 `cut=3` 默认会让曲线越过 0 分和 100 分这两条真实边界，需要说明时用 `cut=0`。

### 7.4.3 `sns.ecdfplot`：能直接读出百分位的曲线

**ECDF（经验累积分布函数）**：横轴是变量值，纵轴是"**小于等于该值**的样本占比"。
它比直方图"土"，但有两个不可替代的优点：

1. **能直接读数**：想知道"及格率多少"，就在 x=60 处画一条竖线，看曲线的高度；
2. **不需要选参数**：没有 bins、没有带宽，画出来就是数据的真实样子。

```python
fig, ax = plt.subplots(figsize=(8.5, 5))
sns.ecdfplot(data=stu, x="期末成绩", hue="性别", linewidth=2,
             palette="colorblind", ax=ax)

# 加两条参考线，演示"怎么读这张图"
ax.axhline(0.5, color=COLORS["gray"], ls="--", lw=1)     # 中位数水平线（50%）
ax.axvline(60, color=COLORS["red"], ls="--", lw=1)       # 及格线 60 分
ax.text(61, 0.12, "x=60 处曲线的高度\n= 不及格人数占比", color=COLORS["red"], fontsize=9)

ax.set_title("ECDF 曲线：纵轴 = 低于该分数的样本占比")
ax.set_xlabel("期末成绩")
ax.set_ylabel("累积占比")
save(fig, "_test/ch07/dist_ecdf.png")
plt.close(fig)
print("已保存 _test/ch07/dist_ecdf.png")
```

> 输出：
```text
Line2D(_child2)
Line2D(_child3)
Text(61, 0.12, 'x=60 处曲线的高度\n= 不及格人数占比')
Text(0.5, 1.0, 'ECDF 曲线：纵轴 = 低于该分数的样本占比')
Text(0.5, 0, '期末成绩')
Text(0, 0.5, '累积占比')
_test/ch07/dist_ecdf.png
已保存 _test/ch07/dist_ecdf.png
```

### 7.4.4 `sns.displot`：分布图的分面版

和 `relplot` 的套路完全一样，只是把"散点"换成"分布"。
它还能用 `kind=` 切换成三种分布图，等于一个函数包办了 `histplot`/`kdeplot`/`ecdfplot` 的分面版。

```python
g = sns.displot(
    data=stu, x="期末成绩",
    col="班级",                  # 按班级拆成 5 张子图
    col_wrap=3,                 # 一行 3 张
    kind="hist",                # 可换 "kde" 或 "ecdf"
    bins=15, kde=True, height=2.9,
    facet_kws={"sharey": False},   # 各班人数不同，y 轴各算各的才不会压扁
)
g.set_titles("{col_name}")
save(g.figure, "_test/ch07/dist_displot.png", tight=False)
plt.close(g.figure)
print("已保存 _test/ch07/dist_displot.png")
```

> 输出：
```text
<seaborn.axisgrid.FacetGrid object at 0x000002190A2CF890>
_test/ch07/dist_displot.png
已保存 _test/ch07/dist_displot.png
```

---

## 7.5 分类图：类别 vs 数值

这一类图专门回答"**不同组之间，数值有什么差别**"。
分析里 80% 的场景都是这种：不同省份的销售额、不同班级的成绩、不同渠道的订单数。

| 函数 | 一句话 | 会不会画出原始数据点 |
|---|---|---|
| `sns.boxplot` | 箱线图：五个数概括一组分布 | 只画离群点 |
| `sns.violinplot` | 小提琴图：箱线图 + 完整分布形状 | 可选 |
| `sns.stripplot` | 抖动散点：每个样本一个点 | **全部画出来** |
| `sns.swarmplot` | 蜂群图：点自动避让不重叠 | **全部画出来** |
| `sns.barplot` | 条形图：**每组均值** + 置信区间 | 不画 |
| `sns.pointplot` | 点线图：均值 + 置信区间，用线连起来 | 不画 |
| `sns.countplot` | 计数图：只数每类有多少条 | 不画 |

### 7.5.1 `sns.boxplot`：用 5 个数概括一组数据

箱线图（box plot）画的是五数概括：

```
        ┬   ← 上须：Q3 + 1.5×IQR 以内的最大值（不是最大值！）
   ┌────┴────┐
   │         │  ← 箱体：Q1 到 Q3，中间那条线是中位数
   └────┬────┘
        ┴   ← 下须：Q1 - 1.5×IQR 以内的最小值
        ·   ← 超出的点叫"离群点"，单独画成小圆点
```

**IQR（四分位距）= Q3 − Q1**，`1.5×IQR` 是判断离群点的经验规则。

```python
# 先按中位数排序，让图从高到低排，读起来有逻辑
order = (sales.groupby("商品类别")["销售额"].median()
         .sort_values(ascending=False).index)

fig, axes = plt.subplots(1, 2, figsize=(14, 5.2))

# 左：默认，离群点会画出来
sns.boxplot(data=sales, x="商品类别", y="销售额", order=order,
            hue="商品类别", legend=False, palette="colorblind", ax=axes[0])
axes[0].set_title("箱线图（保留离群点）")
axes[0].set_ylabel("销售额（元）")
axes[0].tick_params(axis="x", rotation=12)      # 类别名长，稍微转一下

# 右：showfliers=False 把离群点藏掉，箱体细节更清楚
sns.boxplot(data=sales, x="商品类别", y="销售额", order=order, showfliers=False,
            hue="商品类别", legend=False, palette="colorblind", ax=axes[1])
axes[1].set_title("showfliers=False（隐藏离群点，看清箱体）")
axes[1].set_ylabel("")
axes[1].tick_params(axis="x", rotation=12)

save(fig, "_test/ch07/cat_box.png")
plt.close(fig)
print("已保存 _test/ch07/cat_box.png")
```

> 输出：
```text
Text(0.5, 1.0, '箱线图（保留离群点）')
Text(0, 0.5, '销售额（元）')
Text(0.5, 1.0, 'showfliers=False（隐藏离群点，看清箱体）')
Text(0, 0.5, '')
_test/ch07/cat_box.png
已保存 _test/ch07/cat_box.png
```

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `order` | 类别的排列顺序 | 传一个列表，例如按中位数排序后的索引 |
| `hue` | 再分一层组（如"性别"） | 类别列名 |
| `showfliers` | 是否画离群点 | `True` 默认；`False` 隐藏 |
| `width` | 箱体宽度 | `0.8` 默认，`0.5` 更细 |
| `notch` | 带缺口的箱体 | `True` 缺口表示中位数的置信区间 |

> 📌 **别再写"没有 hue 的 palette"**：本机实测
> `sns.boxplot(data=..., x=..., y=..., palette="colorblind")` 会抛
> `FutureWarning: Passing 'palette' without assigning 'hue' is deprecated and
> will be removed in v0.14.0.`
> **新写法**（本章统一用这个）：把 `x` 的列名同时传给 `hue`，再写 `legend=False`：
> ```python
> sns.boxplot(data=sales, x="商品类别", y="销售额",
>             hue="商品类别", legend=False, palette="colorblind")
> ```

> ⚠️ **箱线图最容易被误读的一点**：上下须**不是最大值和最小值**，
> 而是"1.5 倍 IQR 以内的极值"。真正的极值会被画成离群点。
> 所以看到箱线图上有一堆点，**不代表数据有问题**，只代表这组数据尾巴长。

### 7.5.2 `sns.violinplot`：小提琴图比箱线图多看了什么

小提琴图 = 箱线图 + 旋转 90° 的核密度曲线。它比箱线图**多看了"分布的形状"**：

- 箱线图只能告诉你"中位数在哪、中间一半人集中在哪一段"；
- 小提琴图还能告诉你"**是单峰还是双峰**"、"尾巴厚不厚"。

比如一组数据里其实混了两拨人（一半 60 分、一半 90 分），
箱线图看起来和"大家均匀分布在 60~90 分"一模一样，
但小提琴图会露出**两个鼓包**，立刻暴露真相。

```python
classes = sorted(stu["班级"].unique())      # 固定班级顺序，两张图才对齐

fig, axes = plt.subplots(1, 2, figsize=(15, 5.4), sharey=True)

# 左：小提琴图，split=True 让左右两半分别代表一个性别（省一半地方）
sns.violinplot(data=stu, x="班级", y="期末成绩", hue="性别", split=True,
               inner="quart", order=classes, palette="colorblind", ax=axes[0])
axes[0].set_title('小提琴图（split=True：左半=女，右半=男）')

# 右：同样的数据用箱线图，对比着看"少看到了什么"
sns.boxplot(data=stu, x="班级", y="期末成绩", hue="性别",
            order=classes, palette="colorblind", ax=axes[1])
axes[1].set_title("同一份数据的箱线图：分布形状不见了")

for ax in axes:
    ax.tick_params(axis="x", rotation=15)     # 班级名较长，转 15 度避免重叠
    ax.set_xlabel("")
    ax.set_ylabel("期末成绩")
save(fig, "_test/ch07/cat_violin.png")
plt.close(fig)
print("已保存 _test/ch07/cat_violin.png")
```

> 输出：
```text
Text(0.5, 1.0, '小提琴图（split=True：左半=女，右半=男）')
Text(0.5, 1.0, '同一份数据的箱线图：分布形状不见了')
_test/ch07/cat_violin.png
已保存 _test/ch07/cat_violin.png
```

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `split` | 左右两半各画一组 | `True` 需要同时给 `hue` 且只有 2 个类别 |
| `inner` | 小提琴内部画什么 | `"box"` 默认；`"quart"` 画四分位线；`"point"`；`None` 什么都不画 |
| `bw_adjust` | 平滑程度 | 同 `kdeplot` |
| `density_norm` | 多组宽度怎么归一 | `"area"` 默认；`"width"` 让每组一样宽（更公平） |
| `scale` | *（旧参数）* | 0.13 起被 `density_norm` 取代 |

> ⚠️ **什么时候不要用小提琴图**：每组样本少于 **20 个**时，
> 密度曲线基本是噪声捏出来的假形状，容易读出根本不存在的"双峰"。
> 样本少的时候请用 7.5.3 的两个函数，老老实实把每个点画出来。

### 7.5.3 `sns.stripplot` / `sns.swarmplot`：把每个样本都画出来

这两个函数画的是**原始数据点**：一个样本一个点。样本量不大时它们是最诚实的图。

- **`stripplot`**：把点在一个小范围内随机抖动（`jitter`），避免完全重叠。
  快，但点多了还是会糊成一团。
- **`swarmplot`**：点会**自动互相避开**，绝不重叠。更好看，但算法是 O(n²) 级别的，
  数据量上千就会非常慢。

```python
# 先抽 80 个样本：swarmplot 在几百个点以上会明显变卡，教学演示取小样本
small = (stu.dropna(subset=["期末成绩"])      # 先把没成绩的去掉，否则点会缺
            .sample(80, random_state=42))     # 固定随机种子，保证每次结果一样

classes = sorted(stu["班级"].unique())
fig, axes = plt.subplots(1, 2, figsize=(14.5, 5.2), sharey=True)

sns.stripplot(data=small, x="班级", y="期末成绩", hue="性别", dodge=True,
              jitter=0.25, size=4, alpha=0.8, order=classes,
              palette="colorblind", ax=axes[0])
axes[0].set_title("stripplot：随机抖动（jitter=0.25）")

sns.swarmplot(data=small, x="班级", y="期末成绩", hue="性别", dodge=True,
              size=4, order=classes, palette="colorblind", ax=axes[1])
axes[1].set_title("swarmplot：自动避让，绝不重叠")

for ax in axes:
    ax.tick_params(axis="x", rotation=15)
    ax.set_xlabel("")
    ax.set_ylabel("期末成绩")
    ax.legend(title="", fontsize=9)
save(fig, "_test/ch07/cat_strip.png")
plt.close(fig)
print("已保存 _test/ch07/cat_strip.png（抽样 80 人，随机种子固定为 42）")
```

> 输出：
```text
Text(0.5, 1.0, 'stripplot：随机抖动（jitter=0.25）')
Text(0.5, 1.0, 'swarmplot：自动避让，绝不重叠')
_test/ch07/cat_strip.png
已保存 _test/ch07/cat_strip.png（抽样 80 人，随机种子固定为 42）
```

> 💡 **强烈推荐的组合用法**：把小提琴图/箱线图和散点叠在一起，
> 既看得到分布形状，也看得到真实样本：
> ```python
> sns.violinplot(data=small, x="班级", y="期末成绩", inner=None, color=COLORS["blue"])
> sns.stripplot(data=small, x="班级", y="期末成绩", color="white", size=3, jitter=0.2)
> ```
> 上面这段就是"箱体轮廓 + 内部白点"的经典小样本图，论文里很常见。

### 7.5.4 `sns.barplot`：默认画的是**均值**，不是总和 ⚠️

**这是本章最容易误解、后果也最严重的一点。**

你在第 6 章用 `ax.bar(x, y)` 画柱状图时，柱子高度就是**你传进去的那个数**，
通常是你 `groupby().sum()` 算好的**总和**。

但 `sns.barplot` **不是这样**：你传进去的是**原始明细数据**，
它自己按 x 分组，**默认用均值（mean）当柱高**，还会在柱顶加一条 95% 置信区间的短竖线。

先用一张表看清楚两种口径差多少：

```python
# 两种口径自己算一遍，做个对照
tab = (sales.groupby("省份区域")["销售额"]
       .agg(订单数="count", 总销售额="sum", 平均销售额="mean")
       .round(1)
       .sort_values("总销售额", ascending=False))
print(tab)
```

> 输出：
```text
          订单数  总销售额  平均销售额
省份区域                              
华南         325  509605.3      1568.0
华东         334  437015.7      1308.4
华北         173  324090.2      1873.4
西南          99  130822.7      1321.4
华中          73  106733.8      1462.1
西北          60   83828.1      1397.1
```

同一份数据，两种画法得到的结论**完全相反**：

```python
fig, axes = plt.subplots(1, 2, figsize=(14.5, 5.2))   # 注意不要让两个子图共享 y 轴

# 左：sns.barplot 的默认行为 —— 每组"均值" + 95% 置信区间
sns.barplot(data=sales, x="省份区域", y="销售额",
            errorbar=("ci", 95), color=COLORS["blue"], ax=axes[0])
axes[0].set_title('默认：estimator="mean"（每组均值 + 95% 置信区间）')
axes[0].set_ylabel("销售额均值（元）")

# 右：想要"总和"，必须显式写 estimator="sum"，并且通常同时关掉置信区间
sns.barplot(data=sales, x="省份区域", y="销售额",
            estimator="sum", errorbar=None, color=COLORS["orange"], ax=axes[1])
axes[1].set_title('estimator="sum"（每组总和，去掉误差线）')
axes[1].set_ylabel("销售额合计（元）")

for ax in axes:
    ax.tick_params(axis="x", rotation=10)
    ax.set_xlabel("")
save(fig, "_test/ch07/cat_bar.png")
plt.close(fig)
print("已保存 _test/ch07/cat_bar.png")
```

> 输出：
```text
Text(0.5, 1.0, '默认：estimator="mean"（每组均值 + 95% 置信区间）')
Text(0, 0.5, '销售额均值（元）')
Text(0.5, 1.0, 'estimator="sum"（每组总和，去掉误差线）')
Text(0, 0.5, '销售额合计（元）')
_test/ch07/cat_bar.png
已保存 _test/ch07/cat_bar.png
```

对比一下左图和右图：**左图最高的柱子是"华北"，右图最高的柱子是"华南"**。
左图说的是"华北的**平均每单**卖得最贵"，右图说的是"华南的**总营业额**最大"。
两个结论都对，但回答了不同的问题。

> ⚠️ **最容易犯的错**：想做"各省销售额排名"，用 `sns.barplot` 直接画，
> 结果画出来的是"客单价排名"，汇报时被问倒。
> **正确做法二选一**：
> 1. 想画总和 → 显式写 `estimator="sum"`，并加 `errorbar=None`
>    （"总和的置信区间"通常没有意义，反而让读者困惑）；
> 2. 自己先 `groupby().sum()` 算好，再用 **`ax.bar()`（第 6 章）** 画，
>    或者把算好的汇总表传给 `sns.barplot` 并写 `estimator="sum"`。

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `estimator` | 柱高用什么统计量 | `"mean"` **默认**；`"sum"` `"median"` `"max"` `"min"` |
| `errorbar` | 柱顶误差线 | `("ci", 95)` 默认；`"sd"`；`None` 不要 |
| `n_boot` | bootstrap 次数 | 默认 `1000` |
| `order` | 类别顺序 | 列表，例如按总和降序的索引 |
| `hue` | 再分一层组 | 类别列名（多组会自动并排） |
| `dodge` | 多组是否并排 | `True` 默认；`False` 会叠在同一根柱上 |

> 💡 **记忆口诀**：`sns.barplot` 默认 = "**平均**"，`ax.bar` = "**你给什么画什么**"。
> 想做总体量对比，永远先问自己一句："我要的是总和还是均值？"

> 📌 **置信区间的代价**：默认的 `errorbar=("ci", 95)` 要对每一组做 1000 次 bootstrap，
> 数据大、组数多的时候明显变慢。做纯展示的柱状图时写 `errorbar=None`
> 既快又干净（本节的右图就是）。

### 7.5.5 `sns.pointplot`：看"均值随类别怎么变"

点线图把每组的均值画成一个点，再用线连起来。
**当 x 是有序的类别**（折扣档、年龄段、月份）时，它比柱状图更能体现"趋势"。

```python
fig, ax = plt.subplots(figsize=(9, 5))
sns.pointplot(data=sales, x="折扣", y="销售额", color=COLORS["purple"],
              marker="o", errorbar=("ci", 95), capsize=0.12, ax=ax)
ax.set_title("不同折扣档的销售额均值（点=均值，竖线=95% 置信区间）")
ax.set_xlabel("折扣（1.0 表示没有打折）")
ax.set_ylabel("销售额均值（元）")
save(fig, "_test/ch07/cat_point.png")
plt.close(fig)
print("已保存 _test/ch07/cat_point.png")
```

> 输出：
```text
Text(0.5, 1.0, '不同折扣档的销售额均值（点=均值，竖线=95% 置信区间）')
Text(0.5, 0, '折扣（1.0 表示没有打折）')
Text(0, 0.5, '销售额均值（元）')
_test/ch07/cat_point.png
已保存 _test/ch07/cat_point.png
```

> 💡 读图提醒：置信区间**竖线互相重叠**时，通常说明两组差异不显著，
> 不要看到点的高低就下"打折越少卖得越多"的结论。

### 7.5.6 `sns.countplot`：只数个数

`countplot` 相当于 `groupby().size()` 的可视化：**它不需要 y**，
因为你数的就是"每一类有多少行"。

```python
fig, axes = plt.subplots(1, 2, figsize=(14.5, 4.8))

# 左：横着放类别，再按渠道分色
sns.countplot(data=sales, x="支付方式", hue="下单渠道",
              palette="colorblind", ax=axes[0])
axes[0].set_title("各支付方式的订单数（按下单渠道分色）")
axes[0].set_xlabel("")
axes[0].set_ylabel("订单数")

# 右：用 y= 把类别放到纵轴，类别名长时更好读
sns.countplot(data=sales, y="商品类别", color=COLORS["green"],
              order=sales["商品类别"].value_counts().index, ax=axes[1])
axes[1].set_title("各商品类别的订单数（按多少降序）")
axes[1].set_xlabel("订单数")
axes[1].set_ylabel("")

save(fig, "_test/ch07/cat_count.png")
plt.close(fig)
print("已保存 _test/ch07/cat_count.png")
```

> 输出：
```text
Text(0.5, 1.0, '各支付方式的订单数（按下单渠道分色）')
Text(0.5, 0, '')
Text(0, 0.5, '订单数')
Text(0.5, 1.0, '各商品类别的订单数（按多少降序）')
Text(0.5, 0, '订单数')
Text(0, 0.5, '')
_test/ch07/cat_count.png
已保存 _test/ch07/cat_count.png
```

> 📌 **`countplot` 也支持 `stat=`**：seaborn 0.13 起可以写 `stat="percent"`
> 让纵轴直接显示百分比，比看绝对数量更容易比较。

---

## 7.6 回归图：散点 + 拟合线 + 置信带

探索"两个连续变量是否线性相关"时，光看散点图不够直观，**加一条拟合线**就清楚了。

| 函数 | 层级 | 什么时候用 |
|---|---|---|
| `sns.regplot` | Axes 级 | 画到指定坐标轴上，或和别的图叠加 |
| `sns.lmplot` | Figure 级 | 要按 `col`/`row`/`hue` 分组各画一条拟合线 |

**拟合线怎么算出来的？** 默认是**最小二乘线性回归**（第 8 章会详细讲），
周围半透明的带子是**95% 置信带**（表示"这条线的位置有多不确定"）。

```python
fig, axes = plt.subplots(1, 3, figsize=(16, 4.8))
# 散点样式抽出来写一次，三张图共用
dots = {"alpha": 0.45, "s": 16}

# 左：默认线性拟合
sns.regplot(data=stu, x="每周自习小时", y="期末成绩",
            scatter_kws=dots, line_kws={"color": COLORS["red"]}, ax=axes[0])
axes[0].set_title("默认：一次线性拟合 + 95% 置信带")

# 中：order=2 二次多项式，能画出"先快后慢"的弯曲
sns.regplot(data=stu, x="每周自习小时", y="期末成绩", order=2,
            scatter_kws=dots, line_kws={"color": COLORS["green"]}, ax=axes[1])
axes[1].set_title("order=2：二次曲线，允许弯曲")

# 右：lowess 局部平滑，不假设任何形状
sns.regplot(data=stu, x="每周自习小时", y="期末成绩", lowess=True,
            scatter_kws=dots, line_kws={"color": COLORS["purple"]}, ax=axes[2])
axes[2].set_title("lowess=True：局部加权平滑，不预设形状")

for ax in axes:
    ax.set_xlabel("每周自习小时")
    ax.set_ylabel("期末成绩")
save(fig, "_test/ch07/reg_regplot.png")
plt.close(fig)
print("已保存 _test/ch07/reg_regplot.png")
```

> 输出：
```text
Text(0.5, 1.0, '默认：一次线性拟合 + 95% 置信带')
Text(0.5, 1.0, 'order=2：二次曲线，允许弯曲')
Text(0.5, 1.0, 'lowess=True：局部加权平滑，不预设形状')
_test/ch07/reg_regplot.png
已保存 _test/ch07/reg_regplot.png
```

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `order` | 多项式阶数 | `1` 默认（直线）；`2`/`3` 允许弯曲 |
| `lowess` | 局部加权回归平滑 | `True` 画一条不假设形状的曲线（需要 statsmodels） |
| `logistic` | 逻辑回归拟合 | `True`，y 是 0/1 二分类时用（需要 statsmodels） |
| `ci` | 置信带水平 | `95` 默认；`None` 不画带子 |
| `n_boot` | 置信带 bootstrap 次数 | 默认 `1000` |
| `robust` | 稳健回归 | `True` 降低离群点影响 |
| `scatter_kws` / `line_kws` | 传给散点/线的样式字典 | `{"alpha":0.5, "s":16}` |

> ⚠️ **常见报错**：`ImportError: No module named 'statsmodels'`
> **原因**：`lowess=True`、`order>1`、`logistic=True` 都要用 statsmodels 做计算。
> **解决**：本机已装 statsmodels 0.15.0，直接可用；
> 如果你在别的机器上跑，先 `pip install statsmodels`。

`lmplot` 用来**分组各画一条线**，并且支持分面：

```python
g = sns.lmplot(
    data=stu.dropna(subset=["每周自习小时", "期末成绩"]),   # lmplot 分组时最好先把缺失值去掉
    x="每周自习小时", y="期末成绩",
    col="性别",                   # 按性别拆成 2 张子图
    hue="是否住校",               # 每张子图里再按是否住校画两条线
    height=4.2, aspect=1.05,
    scatter_kws={"alpha": 0.45, "s": 16},
    palette="colorblind",
)
g.set_axis_labels("每周自习小时", "期末成绩")
save(g.figure, "_test/ch07/reg_lmplot.png", tight=False)
plt.close(g.figure)
print("已保存 _test/ch07/reg_lmplot.png")
```

> 输出：
```text
<seaborn.axisgrid.FacetGrid object at 0x000002190E0B4D50>
_test/ch07/reg_lmplot.png
已保存 _test/ch07/reg_lmplot.png
```

> 💡 **怎么看这两条线**：如果两组点的拟合线**斜率差很多**，
> 说明"自习小时对成绩的作用"在两组间不一样，这在统计上叫**交互效应**，
> 是做分层分析的重要线索。

---

## 7.7 矩阵图：热力图与聚类热力图

### 7.7.1 `sns.heatmap`：把矩阵画成颜色

**什么数据适合热力图？** 一张**二维数值表**：行是一个类别，列是另一个类别，
格子的数字用颜色深浅表示。最经典的应用就是**相关系数矩阵**。

```python
# 只挑有意义的数值列；客户年龄和销售额几乎无关（相关系数 0.001），是个很好的反例
num_cols = ["单价", "数量", "折扣", "销售额", "客户年龄"]
corr = sales[num_cols].corr(numeric_only=True)   # pandas 算皮尔逊相关系数
print(corr.round(3))
```

> 输出：
```text
           单价   数量   折扣  销售额  客户年龄
单价      1.000  0.073  0.039   0.746     0.009
数量      0.073  1.000 -0.011   0.421     0.053
折扣      0.039 -0.011  1.000   0.038    -0.022
销售额    0.746  0.421  0.038   1.000     0.001
客户年龄  0.009  0.053 -0.022   0.001     1.000
```

```python
fig, ax = plt.subplots(figsize=(7.6, 6.2))
sns.heatmap(
    corr,
    annot=True,              # 在每个格子里写上数值
    fmt=".2f",               # 数值格式：保留 2 位小数（写错格式会显示一堆乱码般的科学计数）
    cmap="RdBu_r",           # 红蓝发散色带，_r 表示反向（红=正、蓝=负）
    center=0,                # ⚠️ 相关系数必须设 center=0，否则"0 相关"不落在色带正中间
    vmin=-1, vmax=1,         # 固定取值范围，多张热力图之间才能横向对比
    linewidths=0.5, linecolor="white",   # 格子之间留白线，更清楚
    square=True,             # 每个格子画成正方形
    cbar_kws={"shrink": 0.8},            # 色条缩短一点，别和主图一样高
    ax=ax,
)
ax.set_title("销售额相关系数矩阵（红=正相关，蓝=负相关）")
save(fig, "_test/ch07/matrix_heatmap.png")
plt.close(fig)
print("已保存 _test/ch07/matrix_heatmap.png")
```

> 输出：
```text
Text(0.5, 1.0, '销售额相关系数矩阵（红=正相关，蓝=负相关）')
_test/ch07/matrix_heatmap.png
已保存 _test/ch07/matrix_heatmap.png
```

**怎么读**：`单价` 和 `销售额` 的格子是 **0.75**，深红，说明单价越高销售额越高；
`客户年龄` 那一行几乎全是白色（0.001 附近），说明年龄和买多少钱几乎没关系。

`mask`：只留下三角，图更干净（相关系数矩阵是对称的，右下和左上重复）：

```python
# np.triu(..., k=1) 取"对角线右上"的部分为 True；True 的位置会被遮住
mask = np.triu(np.ones_like(corr, dtype=bool), k=1)

fig, ax = plt.subplots(figsize=(7, 5.8))
sns.heatmap(corr, mask=mask, annot=True, fmt=".2f", cmap="RdBu_r",
            center=0, vmin=-1, vmax=1, square=True, linewidths=0.5,
            linecolor="white", ax=ax)
ax.set_title("用 mask 遮住上三角（信息量不变，图更干净）")
save(fig, "_test/ch07/matrix_masked.png")
plt.close(fig)
print("已保存 _test/ch07/matrix_masked.png")
```

> 输出：
```text
Text(0.5, 1.0, '用 mask 遮住上三角（信息量不变，图更干净）')
_test/ch07/matrix_masked.png
已保存 _test/ch07/matrix_masked.png
```

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `annot` | 格子里写数值 | `True` / `False` |
| `fmt` | 数值格式 | `".2f"` 两位小数；`".0f"` 整数；`".1%"` 百分比 |
| `cmap` | 色带 | `"RdBu_r"` 发散；`"viridis"` 顺序；`"YlGnBu"` 顺序 |
| `center` | 色带中心值 | 相关系数用 **`0`**；其他情况不设 |
| `vmin` / `vmax` | 颜色映射上下限 | 相关系数固定 `-1`/`1` |
| `mask` | 遮罩（True 的位置不画） | `np.triu(np.ones_like(corr, dtype=bool), k=1)` |
| `linewidths` | 格子间距 | `0.5`~`1` |
| `square` | 格子是否为正方形 | `True` 相关系数矩阵必备 |
| `cbar` | 是否画色条 | `True` 默认 |

> ⚠️ **常见错误**：热力图颜色看起来"到处都是红的"或"到处都是蓝的"
> **原因**：没有设 `center=0`。seaborn 默认用数据的最小/最大值为色带两端，
> 于是"0 相关"落在色带中间偏某侧，视觉上就失真了。
> **解决**：相关系数矩阵永远写 `center=0, vmin=-1, vmax=1`。

### 7.7.2 `sns.clustermap`：会自己排序的热力图

普通热力图的行列顺序就是你给它的顺序。**聚类热力图**会先做**层次聚类**
（hierarchical clustering，一种按"相似度"把行和列自动分组的方法），
再按聚类结果重排行列——**相似的行会挨在一起**，图案自己就浮出来了。

看学生成绩的例子：把 60 位学生的 4 项成绩画成聚类热力图。

```python
# 取四个成绩相关列，去掉缺失值，取前 60 行（聚类热力图行太多会看不清）
mat = stu[["每周自习小时", "高考数学分", "期中成绩", "期末成绩"]].dropna().head(60)

g = sns.clustermap(
    mat,
    standard_scale=1,     # 每列各自缩放到 0~1，否则"高考数学分"的量级会压住其他列
    cmap="viridis",       # 顺序型色带（深→亮的单调变化），适合单纯的大小比较
    figsize=(8, 8),
    yticklabels=False,    # 60 个学号太密，不显示
    linewidths=0.3,
    cbar_kws={"label": "列内标准化后的值"},
)
g.ax_heatmap.set_xlabel("")
g.ax_heatmap.set_ylabel("")
save(g.figure, "_test/ch07/matrix_clustermap.png", tight=False)
plt.close(g.figure)
print("已保存 _test/ch07/matrix_clustermap.png（行=学生，列=四项成绩）")
```

> 输出：
```text
Text(0.5, 57.91617024739591, '')
Text(798.111111111111, 0.5, '')
_test/ch07/matrix_clustermap.png
已保存 _test/ch07/matrix_clustermap.png（行=学生，列=四项成绩）
```

**读图**：左边和上边的**树状图**就是聚类结果，枝条越早分开说明差异越大。
你会看到学生被分成"整体都高"和"整体都低"两大块，
同时"期中成绩"和"期末成绩"两列也常常被聚到一起——说明它们高度相关。

> ⚠️ **一定要先标准化**：`高考数学分` 的量级是 60~150，
> `每周自习小时` 只有 0~24，不标准化的话聚类会被"高考数学分"一个变量主导。
> `standard_scale=1` 是按**列**标准化；`z_score=1` 也可以（效果类似，数值是 z 分数）。

---

## 7.8 分面图：一行代码把一张图拆成多张

**分面（faceting）** 是数据可视化里最有效的"避免糊成一团"的手段：
与其把 6 个省份画在一张图上用 6 种颜色区分，不如**直接画成 6 张小图并排**，
每张小图自带坐标轴，差距一眼可见。

Seaborn 提供两种做法：

| 做法 | 写法 | 适合 |
|---|---|---|
| **Figure 级函数** | `sns.relplot(col=...)`、`sns.displot(col=...)`、`sns.catplot(col=...)`、`sns.lmplot(col=...)` | 图种是"标准款"时，**最省事，优先用** |
| **`sns.FacetGrid`** | 先建网格，再用 `.map()` / `.map_dataframe()` 往里画 | 想画的图种没有对应的 Figure 级函数时，**万能兜底** |

### 7.8.1 `FacetGrid` 的两步套路

`FacetGrid` 的用法永远是两步：

1. **建网格**：告诉它按哪一列拆分（`col` / `row`）、用不用 `hue` 分色；
2. **往里画**：用 `.map_dataframe()` 把画图函数应用到每个子图上。

```python
# 第 1 步：建网格 —— 按"省份区域"拆成 6 张子图，一行放 3 张
g = sns.FacetGrid(
    data=sales,
    col="省份区域",
    col_wrap=3,               # 一行最多 3 张，超了自动换行
    height=3.0,               # 每张子图高度（英寸）
    sharex=False, sharey=False,   # 各省单价、销售额的量级不同，各用各的坐标范围
)

# 第 2 步：往每个子图里画散点 —— map_dataframe 会把列名当变量名解析
g.map_dataframe(sns.scatterplot, x="单价", y="销售额", alpha=0.65, s=16,
                color=COLORS["blue"])

g.set_titles("{col_name}")                       # 子图标题模板
g.set_axis_labels("单价（元）", "销售额（元）")      # 只给最外层子图加轴标签
save(g.figure, "_test/ch07/facet_grid.png", tight=False)
plt.close(g.figure)
print("已保存 _test/ch07/facet_grid.png")
```

> 输出：
```text
<seaborn.axisgrid.FacetGrid object at 0x000002194F96A250>
<seaborn.axisgrid.FacetGrid object at 0x000002194F96A250>
_test/ch07/facet_grid.png
已保存 _test/ch07/facet_grid.png
```

**`map_dataframe` 和 `map` 的区别**（很多人被这里绕晕）：

| 方法 | 传给画图函数的是什么 | 写法 |
|---|---|---|
| `map_dataframe` | 每个子图的 **DataFrame 子集**，支持列名 | `g.map_dataframe(sns.scatterplot, x="单价", y="销售额")` |
| `map` | 从本子图里**取出来的数组**，不支持列名 | `g.map(plt.hist, "销售额", bins=20)` |

看一个 `map` 的例子，它适合调用**不认 DataFrame 的普通函数**（比如 `plt.hist`）：

```python
g = sns.FacetGrid(data=sales, col="客户性别", height=4)
# map 会把 "销售额" 这一列取成数组再传进去，所以 bins 是普通关键字参数
g.map(plt.hist, "销售额", bins=25, color=COLORS["green"], edgecolor="white")
g.set_titles("性别：{col_name}")
save(g.figure, "_test/ch07/facet_map.png", tight=False)
plt.close(g.figure)
print("已保存 _test/ch07/facet_map.png")
```

> 输出：
```text
<seaborn.axisgrid.FacetGrid object at 0x000002190DE2D250>
<seaborn.axisgrid.FacetGrid object at 0x000002190DE2D250>
_test/ch07/facet_map.png
已保存 _test/ch07/facet_map.png
```

### 7.8.2 `col` / `row` / `hue` 三个参数怎么配合

记忆方式：`col` 和 `row` 决定**有几张小图**，`hue` 决定**每张小图里有几种颜色**。

| 参数 | 作用 | 上图中最多几张 / 几色 |
|---|---|---|
| `col` | 按某列的值横向排列子图 | 类别数建议 ≤ 6 |
| `row` | 按某列的值纵向排列子图 | 和 `col` 相乘别超过 8~10 张 |
| `hue` | 每张小图内部按某列分色 | 建议 ≤ 4 种 |

```python
# 2 列 × 4 行 = 8 张小图，每张内部再按商品类别分色（5 色）
g = sns.FacetGrid(
    data=sales,
    col="客户性别",           # 横向：男 / 女
    row="下单渠道",           # 纵向：线下门店 / 小程序 / 网页 / APP
    hue="商品类别",           # 每张小图内部：5 个商品类别 5 种颜色
    height=2.6, aspect=1.25,
    margin_titles=True,      # 行标签写在图的右侧边缘，省地方
    palette="colorblind",
)
g.map_dataframe(sns.scatterplot, x="折扣", y="销售额", alpha=0.75, s=14)
g.add_legend(title="商品类别")     # hue 的图例要手动加
save(g.figure, "_test/ch07/facet_rowcol.png", tight=False)
plt.close(g.figure)
print("已保存 _test/ch07/facet_rowcol.png（2 列 × 4 行 = 8 张子图）")
```

> 输出：
```text
<seaborn.axisgrid.FacetGrid object at 0x0000021909BCDC90>
<seaborn.axisgrid.FacetGrid object at 0x0000021909BCDC90>
_test/ch07/facet_rowcol.png
已保存 _test/ch07/facet_rowcol.png（2 列 × 4 行 = 8 张子图）
```

> ⚠️ **分面的噩梦：子图太多**
> `col` 有 5 类、`row` 有 4 类、`hue` 有 6 类，就是 20 张小图 × 6 种颜色 = 120 种组合，
> 每张小图里可能只剩两三个点，什么都看不出来。
> **经验法则**：分面总数 ≤ **9 张**，`hue` ≤ **4 色**。
> 类别太多时先合并（比如把 6 个省份合并成 3 个大区），或者换成一张热力图。

### 7.8.3 更省事的做法：Figure 级函数的 `col` 参数

如果你的图属于"标准款"，**根本不用碰 `FacetGrid`**，
直接用 `relplot` / `displot` / `catplot` / `lmplot` 的 `col` 参数就行：

```python
# 分类图的分面：catplot 相当于"能分面的 boxplot/violinplot/barplot/countplot"
g = sns.catplot(
    data=sales,
    x="商品类别", y="销售额",
    kind="box",                 # 换成 "violin" "bar" "point" "count" "strip" 都行
    col="客户性别",             # 按性别拆成 2 张子图
    col_wrap=2, height=4.2, aspect=1.1,
    hue="商品类别", legend=False, palette="colorblind",
)
g.set_titles("{col_name}")
g.set_axis_labels("", "销售额（元）")
for ax in g.axes.flat:                    # Figure 级对象也能拿到子图去微调
    ax.tick_params(axis="x", rotation=25)
save(g.figure, "_test/ch07/facet_catplot.png", tight=False)
plt.close(g.figure)
print("已保存 _test/ch07/facet_catplot.png")
```

> 输出：
```text
<seaborn.axisgrid.FacetGrid object at 0x000002190A1C4D10>
<seaborn.axisgrid.FacetGrid object at 0x000002190A1C4D10>
_test/ch07/facet_catplot.png
已保存 _test/ch07/facet_catplot.png
```

**对照表：什么图用哪个分面函数**

| 你想要的图 | 用哪个 | 关键参数 |
|---|---|---|
| 散点图 / 折线图分面 | `sns.relplot` | `col=` / `row=` / `hue=` / `kind="scatter"\|"line"` |
| 直方图 / KDE / ECDF 分面 | `sns.displot` | `col=` / `kind="hist"\|"kde"\|"ecdf"` |
| 箱线/小提琴/条形/计数图分面 | `sns.catplot` | `col=` / `kind="box"\|"violin"\|"bar"\|"count"\|"point"\|"strip"\|"swarm"` |
| 回归线分面 | `sns.lmplot` | `col=` / `hue=` |
| 其他任何图（比如自定义的散点+箭头） | `sns.FacetGrid` | `col=` / `row=` / `hue=` + `.map_dataframe()` |

---

## 7.9 一次看多个变量：`pairplot` 与 `jointplot`

### 7.9.1 `sns.pairplot`：所有变量两两组合的散点图矩阵

拿到一份陌生的多变量数据，**最快建立整体印象的方法**就是画一张 pairplot：
`k` 个变量画成 k×k 的网格，对角线画每个变量自己的分布，非对角线画两两散点图。

```python
# pairplot 只吃数值列 + 用于着色的类别列，所以要先把列挑出来
pair_df = stu[["每周自习小时", "高考数学分", "期中成绩", "期末成绩", "性别"]].dropna()

g = sns.pairplot(
    pair_df,
    hue="性别",              # 按性别着色，一眼看出男女有没有系统性差别
    diag_kind="kde",         # 对角线画什么："hist" 直方图 / "kde" 密度曲线
    corner=True,             # ⭐ 只画下三角：非对角线是对称的，画一半省一半地方
    height=1.9,              # 每个小格子的边长（英寸）
    plot_kws={"s": 14, "alpha": 0.6},   # 传给每一张散点图的样式
)
save(g.figure, "_test/ch07/pair_pairplot.png", tight=False)
plt.close(g.figure)
print("已保存 _test/ch07/pair_pairplot.png（4 个变量 → 10 个小格子）")
```

> 输出：
```text
_test/ch07/pair_pairplot.png
已保存 _test/ch07/pair_pairplot.png（4 个变量 → 10 个小格子）
```

**怎么读**：

- `每周自习小时` 那一列和 `期末成绩`/`期中成绩` 的散点图里，点**明显斜着排**，说明正相关；
- `高考数学分` 和 `期中成绩` 之间也有斜向趋势，但没上面那条那么紧；
- 对角线上的两条 KDE 曲线几乎重叠，说明**男女生的成绩分布没有肉眼可见的差别**。

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `hue` | 按哪一列着色 | 类别列名 |
| `diag_kind` | 对角线画什么 | `"hist"` 默认（新版本）；`"kde"` `None` 不画 |
| `kind` | 非对角线画什么 | `"scatter"` 默认；`"reg"` 加回归线；`"kde"` 密度等高线；`"hist"` |
| `corner` | 只画下三角 | `True`（**强烈推荐**，变量多时能省一半格子） |
| `height` | 每个小格子边长 | 变量多时调小，例如 `1.6` |
| `plot_kws` | 传给小图函数的样式 | `{"s": 14, "alpha": 0.6}` |

> ⚠️ **pairplot 的性能陷阱**：变量数是 k 时，格子数是 **k²**（`corner=True` 后约 k²/2）。
> 5 个变量还行，10 个变量就是 100 张子图，会卡住并且根本看不清。
> 变量超过 **6 个**时，改用 `sns.heatmap` 画相关系数矩阵，只看"谁和谁相关"。

### 7.9.2 `sns.jointplot`：两个变量的联合分布 + 边缘分布

`jointplot` 画的是"**一对**变量的详细关系"：

- **中间大图**：两个变量的联合分布（散点图、回归图、密度图……）；
- **上方小图**：x 变量的边缘分布（单独长什么样）；
- **右侧小图**：y 变量的边缘分布。

这两个"边缘分布"就是"把联合分布投影到一根轴上"的结果，能回答
"销售额高的订单，单价分布是不是也偏高"这类问题。

```python
# 左：kind="scatter" —— 中间散点，上面/右边是各自的一维直方图
g1 = sns.jointplot(data=sales, x="单价", y="销售额", kind="scatter",
                   height=6.2, color=COLORS["blue"],
                   marginal_kws={"bins": 30},              # 边缘直方图的箱子数
                   joint_kws={"s": 12, "alpha": 0.45})     # 中间散点的样式
g1.figure.suptitle("联合分布 + 边缘分布（kind=\"scatter\"）", y=1.02)
save(g1.figure, "_test/ch07/joint_scatter.png", tight=False)
plt.close(g1.figure)

# 右：kind="reg" —— 中间换成散点 + 回归线 + 置信带
g2 = sns.jointplot(data=sales, x="单价", y="销售额", kind="reg",
                   height=6.2, color=COLORS["red"],
                   scatter_kws={"s": 10, "alpha": 0.4})
g2.figure.suptitle("kind=\"reg\"：中间自动变成回归图", y=1.02)
save(g2.figure, "_test/ch07/joint_reg.png", tight=False)
plt.close(g2.figure)

print("已保存 _test/ch07/joint_scatter.png 和 joint_reg.png")
```

> 输出：
```text
Text(0.5, 1.02, '联合分布 + 边缘分布（kind="scatter"）')
_test/ch07/joint_scatter.png
Text(0.5, 1.02, 'kind="reg"：中间自动变成回归图')
_test/ch07/joint_reg.png
已保存 _test/ch07/joint_scatter.png 和 joint_reg.png
```

| `kind` 取值 | 中间画什么 | 什么时候用 |
|---|---|---|
| `"scatter"` | 散点图（默认） | 通用 |
| `"reg"` | 散点 + 回归线 + 置信带 | 想看有没有线性趋势 |
| `"hex"` | 六边形分箱密度图 | 数据点极多、散点糊成一团时 |
| `"kde"` | 二维等高线密度图 | 想看密度的形状 |
| `"hist"` | 二维方块密度图 | 数据是离散的 |
| `"resid"` | 残差图 | 检查回归假设（第 8 章） |

> 💡 `jointplot` 还可以加 `hue=` 分组（如 `hue="客户性别"`），
> 一次对比两组数据的联合分布。

---

## 7.10 调色板：让颜色替你说话

### 7.10.1 6 个内置调色板

Seaborn 内置 6 套**分类调色板**，名字好记，直接当字符串用：

```python
names = ["deep", "muted", "pastel", "bright", "dark", "colorblind"]   # 6 套内置调色板

fig, axes = plt.subplots(len(names), 1, figsize=(9, 5.4))
for ax, name in zip(axes, names):
    colors = sns.color_palette(name, 8)                    # 从这一套里取出 8 个颜色
    ax.bar(range(8), [1] * 8, color=colors, width=1.0)     # 画 8 根"等高柱子"当色块
    ax.set_xlim(-0.5, 7.5)
    ax.set_ylim(0, 1)
    ax.set_xticks([])                                      # 色块条不需要刻度
    ax.set_yticks([])
    ax.grid(False)                                         # 也不要网格，保持干净
    ax.set_title(name, fontsize=10, loc="left", pad=2)      # 名字写在左侧，起图例作用
save(fig, "_test/ch07/palette_all.png")
plt.close(fig)
print("已保存 _test/ch07/palette_all.png（6 套调色板，每套 8 色）")
```

> 输出：
```text
_test/ch07/palette_all.png
已保存 _test/ch07/palette_all.png（6 套调色板，每套 8 色）
```

| 名称 | 特点 | 适合 |
|---|---|---|
| `deep` | seaborn 默认，饱和度适中 | 通用 |
| `muted` | 更灰、饱和度低 | 报告、打印 |
| `pastel` | 很浅 | 面积大的填充图（小提琴、面积图） |
| `bright` | 高饱和、对比强 | 投屏演示 |
| `dark` | 深色 | 深色背景的 PPT |
| **`colorblind`** | **色盲友好（Okabe-Ito 配色）** | **⭐ 强烈推荐，做正式报告一律用它** |

> 💡 **为什么强烈推荐 `colorblind`**：红绿色盲在男性中约占 8%，
> 用默认的红/绿配色区分两类，他们看到的是**同一种颜色**。
> `colorblind` 用的是蓝 / 橙 / 绿 / 品红 / 黄，既对色盲友好，
> 打印成黑白后亮度也不同、依然能区分。
> **做正式报告、论文、给别人的图，请默认使用 `colorblind`。**

### 7.10.2 自己生成调色板

```python
# ① 均匀取色：husl 色轮上等距取 8 个颜色，互不重复
print("husl 8 色：", sns.color_palette("husl", 8).as_hex())

# ② 发散色带：从冷色（240° 蓝）到暖色（10° 红）取 7 个颜色
#    适合"有中心值、两侧相反"的数据，例如相关系数（-1 ~ +1）、同比增速
print("发散 7 色：", sns.diverging_palette(240, 10, n=7).as_hex())

# ③ 直接用教程统一配色（viz_style.PALETTE，8 个协调的颜色）
print("教程配色：", PALETTE)
```

> 输出：
```text
husl 8 色： ['#f77189', '#ce9032', '#97a431', '#32b166', '#36ada4', '#39a7d0', '#a48cf4', '#f561dd']
发散 7 色： ['#417ca8', '#7ba3c0', '#b7cbda', '#f2f1f1', '#eab5b9', '#e2777f', '#da3b46']
教程配色： ['#4C72B0', '#DD8452', '#55A868', '#C44E52', '#8172B3', '#937860', '#DA8BC3', '#8C8C8C']
```

| 函数 | 作用 | 典型场景 |
|---|---|---|
| `sns.color_palette(name, n)` | 按名字取 n 个颜色 | 分类数据 |
| `sns.color_palette("husl", n)` | 色轮上均匀取 n 色 | 类别多且都要区分开 |
| `sns.diverging_palette(h1, h2, n=)` | 两端色相 + 中间浅色 | 相关系数、涨跌、偏离度 |
| `sns.light_palette(color, n)` | 同一色相的浅色渐变 | 顺序型（从浅到深表示大小） |
| `sns.dark_palette(color, n)` | 同一色相的深色渐变 | 深色主题 |
| `sns.cubehelix_palette(n)` | 内置的优雅渐变 | 顺序型，好看 |

### 7.10.3 `set_palette`：换掉全局默认配色

```python
# 换成全局默认（注意：它改的是 matplotlib 的颜色循环，影响之后所有图，不只是 seaborn）
sns.set_palette("colorblind")
print("set_palette(\"colorblind\") 后的前 4 色：", sns.color_palette().as_hex()[:4])

# 用教程统一配色，让本章的图和前几章视觉一致
sns.set_palette(PALETTE)
fig, ax = plt.subplots(figsize=(9.5, 4.8))
sns.countplot(data=sales, x="下单渠道", hue="客户性别", ax=ax)   # 不写 palette，自动用刚设的
ax.set_title("用 sns.set_palette(PALETTE) 之后的默认配色")
ax.set_xlabel("")
ax.set_ylabel("订单数")
save(fig, "_test/ch07/palette_set.png")
plt.close(fig)

sns.set_palette("deep")     # 换回 seaborn 自己的默认值，后面的图不受影响
print("已恢复为 seaborn 默认调色板 deep")
```

> 输出：
```text
set_palette("colorblind") 后的前 4 色： ['#0173b2', '#de8f05', '#029e73', '#d55e00']
Axes(0.125,0.11;0.775x0.77)
Text(0.5, 1.0, '用 sns.set_palette(PALETTE) 之后的默认配色')
Text(0.5, 0, '')
Text(0, 0.5, '订单数')
_test/ch07/palette_set.png
已恢复为 seaborn 默认调色板 deep
```

> ⚠️ **`set_palette` 的作用范围比你想的大**：
> 它设置的是 **matplotlib 的颜色循环**（`axes.prop_cycle`），
> 所以之后用 `plt.plot`、`ax.bar` 画的图**也**会跟着变色，不只是 seaborn。
> 写完整脚本时，建议在开头统一设一次，别在中途反复切换。

---

## 7.11 Plotly 的核心概念

### 7.11.1 `plotly.express` 与 `plotly.graph_objects`

Plotly 有两套 API，名字很长但记住区别就行：

| 接口 | 导入别名 | 定位 | 一句话 |
|---|---|---|---|
| `plotly.express` | `px` | **高层**，一个函数一张图 | 数据列名直接映射成图形属性，**入门首选** |
| `plotly.graph_objects` | `go` | **底层**，手动拼每个图元 | 需要精细控制、画复合图、写仪表板时用 |

**建议路线**：先用 `px` 快速画出 90% 的图；只有 `px` 干不了的事（比如双 Y 轴 + 自定义
标注 + 子图组合）才下沉到 `go`。

`px` 的核心思想是"**列名即通道**"，和前面学的 Seaborn 几乎一样：

```text
px.scatter(data_frame=数据表, x="横轴列名", y="纵轴列名",
           color="决定颜色的列", size="决定大小的列", ...)
```

### 7.11.2 交互性：Plotly 和前面两个库的根本区别

Seaborn / Matplotlib 输出的是**静态图片**，画完就固定了。
Plotly 输出的是**一个小的网页应用**，鼠标可以操作：

| 交互动作 | 怎么操作 | 有什么用 |
|---|---|---|
| **悬浮提示** | 鼠标移到数据点上 | 显示该点的详细数值（不用再打印表格） |
| **缩放** | 按住左键框选一块区域 | 放大看局部细节 |
| **平移** | 按住 Shift 拖动 / 用模式栏 | 移动视野 |
| **复位** | 双击图内任意位置 | 回到初始视图 |
| **隐藏某一组** | 点击图例里的名字 | 只看部分类别，快速对比 |
| **单独看某一组** | 双击图例里的名字 | 只显示这一组 |
| **导出 PNG** | 鼠标移到图右上角，点相机图标 | 直接存档做报告 |
| **自动缩放** | 右上角模式栏 | 图表随窗口大小自适应 |

### 7.11.3 怎么把图显示出来：renderer（渲染器）

这是初学者最容易卡住的一步。**同一段代码，在 `.py` 脚本里和在 `.ipynb` 里行为不同**：

```python
# 看看当前环境用的是哪个 renderer
print("当前默认 renderer：", pio.renderers.default)

# 📌 关键区别（本机实测）：
#   ① 在 .py 脚本里跑（就是现在这个环境）→ 默认是 "browser"，
#      此时 fig.show() 会去调用系统浏览器打开一个临时网页。
#      在服务器/无界面环境里这会失败，所以教程示例统一改用 write_html 导出。
#   ② 在 Jupyter / JupyterLab 的 .ipynb 里跑 → 默认是 "plotly_mimetype"，
#      这时写一行 fig.show()，交互图就直接内嵌在单元格下方。
#           fig.show()
#   ③ 想强制指定渲染方式，可以写 fig.show(renderer="notebook") 等。
print("在 notebook 里请用：fig.show()")
```

> 输出：
```text
当前默认 renderer： browser
在 notebook 里请用：fig.show()
```

> 📌 **本机实测结论（重要）**
> - **JupyterLab 4.6.3 能正常内嵌显示 Plotly 图**。
>   用 `jupyter labextension list` 查到的结果是
>   `jupyterlab-plotly v7.1.0 enabled ok`——plotly 7.1.0 自带这个预构建扩展，
>   **不需要额外装 `ipywidgets`**（本机确实没装 ipywidgets，但内嵌显示照样能工作）。
> - 用 `nbclient` 实际执行一个含 `fig.show()` 的 notebook 验证，
>   单元格产生的输出类型是 `display_data`，MIME 类型为
>   `application/vnd.plotly.v1+json`——**这就是 JupyterLab 能渲染的那份数据**。
> - **什么时候才需要 `ipywidgets`**：只有用 `fig.show(renderer="jupyterlab")`
>   （基于 widget 的渲染器）或 `go.FigureWidget`（可双向通信的图）时才需要，
>   装法：`pip install jupyterlab "ipywidgets"`，然后**重启 JupyterLab 和内核**。
> - **脚本里不要写 `fig.show()`**：默认 renderer 是 `browser`，
>   它会真的弹出浏览器窗口；在服务器上则直接报错或什么都不显示。
>   本章所有示例统一用 `fig.write_html(...)`，任何环境都能跑。

### 7.11.4 第一张 Plotly 图

```python
fig = px.scatter(
    sales,                        # 第一个位置参数就是数据表
    x="单价", y="销售额",           # 横轴、纵轴
    color="商品类别",              # 颜色映射到商品类别
    size="数量",                   # 点的大小映射到数量
    hover_data=["城市", "支付方式"],  # 悬浮时**额外**显示的列（默认还会显示 x/y）
    title="第一张 Plotly 交互图：单价 vs 销售额",
    labels={"单价": "单价（元）", "销售额": "销售额（元）"},   # 改轴标题的中文写法
)
fig.write_html("_test/ch07/px_first.html")     # 导出一个独立的 HTML 文件
print("已导出 _test/ch07/px_first.html（用浏览器打开：悬停看点值、框选放大、点图例隐藏类别）")
```

> 输出：
```text
已导出 _test/ch07/px_first.html（用浏览器打开：悬停看点值、框选放大、点图例隐藏类别）
```

**常用 `px` 参数速查**（这一张表够你用很久）：

| 参数 | 作用 | 例子 |
|---|---|---|
| 第一个位置参数 | 数据表 | `px.scatter(sales, ...)` |
| `x` / `y` | 横轴 / 纵轴列名 | `x="单价"` |
| `color` | 颜色映射（类别或连续值都行） | `color="商品类别"` |
| `size` | 点的大小 | `size="数量"` |
| `symbol` | 点的形状 | `symbol="客户性别"` |
| `hover_name` | 悬浮时用哪一列当**标题**（加粗显示） | `hover_name="城市"` |
| `hover_data` | 悬浮时额外显示的列 | `hover_data=["支付方式"]` |
| `text` | 直接标在图上的文字 | `text="城市"` |
| `facet_col` / `facet_row` | 按列分面 | `facet_col="省份区域", facet_col_wrap=3` |
| `color_discrete_map` | 手动指定类别颜色 | `{"男": "#4C72B0", "女": "#DD8452"}` |
| `color_discrete_sequence` | 一套自定义调色板 | `PALETTE` |
| `color_continuous_scale` | 连续型色带 | `"Viridis"` `"RdBu_r"` |
| `log_x` / `log_y` | 用对数坐标轴 | `log_x=True` |
| `range_x` / `range_y` | 固定坐标范围 | `range_y=[25, 90]` |
| `template` | 内置主题 | `"plotly_white"` `"plotly_dark"` `"ggplot2"` |
| `title` / `labels` | 总标题 / 轴标题 | `labels={"pop": "人口"}` |

### 7.11.5 什么时候必须下沉到 `go`

`px` 很快，但它把决策权收走了。下面这些需求 `px` 做不了，要用 `go`：

- 一个图里混多种图元的组合（柱 + 折线 + 标注箭头）；
- 双 Y 轴；
- 自定义子图布局（`make_subplots`）；
- 逐点设置颜色/大小/文本（不是按列映射，而是一个点一个值）。

```python
# go 的写法：手动 add_trace + update_layout，一行行说清楚要什么
fig = go.Figure()

# 第 1 步：加数据（trace 就是"一条数据系列"）
fig.add_trace(go.Scatter(x=[1, 2, 3, 4], y=[4, 5, 6, 9],
                         mode="lines+markers",     # 既画线又画点
                         name="实际值"))
fig.add_trace(go.Scatter(x=[1, 2, 3, 4], y=[3, 5, 7, 8],
                         mode="lines+markers", name="预测值", line=dict(dash="dash")))

# 第 2 步：设置整体布局（标题、轴名、主题）
fig.update_layout(title="用 graph_objects 手写的图",
                  xaxis_title="时间", yaxis_title="数值",
                  template="plotly_white")

# 第 3 步：加标注（px 完全做不到的事）
fig.add_annotation(x=4, y=9, text="这里是峰值", showarrow=True, arrowhead=2,
                   ax=-60, ay=-30)      # ax/ay 是箭头相对文字的偏移像素

fig.write_html("_test/ch07/go_manual.html")
print("已导出 _test/ch07/go_manual.html（trace 数量 =", len(fig.data), "）")
```

> 输出：
```text
已导出 _test/ch07/go_manual.html（trace 数量 = 2 ）
```

> 💡 **实用技巧：`px` 画完再用 `go` 改**。
> `px` 返回的就是一个普通的 `go.Figure`，所以可以接着写
> `fig.update_layout(...)`、`fig.add_annotation(...)`、`fig.update_traces(...)`。
> 这是最高效的写法：**用 px 搭骨架，用 go 补细节**。

---

## 7.12 Plotly 常用图

下面 8 个函数覆盖日常 90% 的需求。每个都配一句"它解决什么问题"。

### 7.12.1 `px.line`：折线图（时间序列首选）

```python
# 先把逐日数据按月重采样成月均值：pandas 3.0 必须写 "ME"（月末），写 "M" 会报错
monthly = (ts.set_index("日期")["每日活跃用户"]
             .resample("ME").mean()          # 每月平均日活
             .reset_index())                 # 变回普通 DataFrame，px 才好用

fig = px.line(monthly, x="日期", y="每日活跃用户", markers=True,
              title="月度平均日活（鼠标框选可放大看任意一段）",
              labels={"每日活跃用户": "日活用户数（人）"})
fig.write_html("_test/ch07/px_line.html")
print("已导出 _test/ch07/px_line.html，共", len(monthly), "个月的数据点")
```

> 输出：
```text
已导出 _test/ch07/px_line.html，共 36 个月的数据点
```

| 参数 | 作用 |
|---|---|
| `markers=True` | 同时画出数据点，方便知道真实粒度 |
| `line_group` | 按某列把线拆成多条（不改变颜色时用） |
| `facet_col` | 按列分面画多张小折线图 |
| `line_shape` | 线的连接方式：`"linear"` 默认 / `"spline"` 平滑曲线 / `"hv"` 阶梯 |

### 7.12.2 `px.bar`：柱状图

```python
# 自己先聚合好，px.bar 画的就是你给的值（这一点和 sns.barplot 不同！）
bar_df = (sales.groupby(["省份区域", "客户性别"], as_index=False)["销售额"]
             .sum().round(1))

fig = px.bar(bar_df, x="省份区域", y="销售额", color="客户性别",
             barmode="group",                       # "group" 并排 / "stack" 堆叠 / "relative"
             text_auto=".2s",                       # 在柱子上标数值，.2s 是"以万/千为单位缩写"
             title="各区域销售额（按性别并排对比）",
             labels={"销售额": "销售额合计（元）"})
fig.write_html("_test/ch07/px_bar.html")
print("已导出 _test/ch07/px_bar.html，共", len(bar_df), "根柱子")
```

> 输出：
```text
已导出 _test/ch07/px_bar.html，共 12 根柱子
```

> ⚠️ **关键区别**：`px.bar`（和 Matplotlib 的 `ax.bar` 一样）画的是**你传进去的值**；
> 而 `sns.barplot` 会**自己再算一遍均值**。所以在 Plotly 里画柱状图，
> **聚合谁来做由你决定**：想画总和就先 `groupby().sum()`，想画均值就 `groupby().mean()`。
> 这比 Seaborn 更透明，也更不容易搞错。

### 7.12.3 `px.histogram`：直方图

```python
fig = px.histogram(
    stu, x="期末成绩",
    color="性别", barmode="overlay",      # overlay=半透明叠加；stack=堆叠；group=并排
    nbins=30, opacity=0.7,
    marginal="box",                       # 上方再加一条箱线图，一眼看到中位数和离群点
    title="期末成绩分布（顶部箱线图 = 各组五数概括）",
    labels={"期末成绩": "期末成绩（分）", "count": "人数"},
)
fig.write_html("_test/ch07/px_hist.html")
print("已导出 _test/ch07/px_hist.html")
```

> 输出：
```text
已导出 _test/ch07/px_hist.html
```

| 参数 | 作用 |
|---|---|
| `nbins` / `histnorm` | 箱子数 / 归一化方式（`"percent"` `"probability"` `"density"`） |
| `barmode` | 多组之间 `"overlay"` 叠加、`"stack"` 堆叠、`"group"` 并排 |
| `marginal` | 边上加一个小图：`"box"` `"violin"` `"rug"` |
| `cumulative` | `True` 画累积直方图 |

### 7.12.4 `px.box`：箱线图（`px.violin` 同理）

```python
fig = px.box(
    sales, x="商品类别", y="销售额", color="商品类别",
    points="all",              # ⭐ 把每个原始数据点都显示出来（老参数名 boxpoints 已废弃）
    notched=False,             # True 会画出带缺口的中位数置信区间
    title="各商品类别销售额（points=\"all\"：离群点也全部可见）",
    labels={"销售额": "销售额（元）"},
)
fig.write_html("_test/ch07/px_box.html")
print("已导出 _test/ch07/px_box.html")
```

> 输出：
```text
已导出 _test/ch07/px_box.html
```

> 📌 **版本差异**：Plotly 5 里的老参数名是 `boxpoints="all"`，
> **Plotly 7 已删除**，照抄会报
> `TypeError: box() got an unexpected keyword argument 'boxpoints'`。
> 新名字是 **`points=`**，取值 `"all"` `"outliers"`（默认）`"suspectedoutliers"` `False`。
> 把 `px.box` 换成 `px.violin`，再加 `box=True` 就是小提琴图。

### 7.12.5 `px.pie`：饼图

```python
pie_df = sales.groupby("支付方式", as_index=False)["销售额"].sum().round(1)

fig = px.pie(pie_df, names="支付方式", values="销售额",
             hole=0.45,                  # 0.45 变成环形图（比实心饼图好看，中间能放总数）
             title="各支付方式的销售额占比",
             color_discrete_sequence=PALETTE)
fig.update_traces(textinfo="label+percent", textposition="outside")   # 标签+百分比放外面
fig.write_html("_test/ch07/px_pie.html")
print("已导出 _test/ch07/px_pie.html")
```

> 输出：
```text
Figure({
    'data': [{'domain': {'x': [0.0, 1.0], 'y': [0.0, 1.0]},
              'hole': 0.45,
              'hovertemplate': '支付方式=%{label}<br>销售额=%{value}<extra></extra>',
              'labels': array(['微信支付', '支付宝', '花呗', '银行卡'], dtype=object),
              'legendgroup': '',
              'name': '',
              'showlegend': True,
              'textinfo': 'label+percent',
              'textposition': 'outside',
              'type': 'pie',
              'values': {'bdata': 'MzMzM3diIEEzMzMzxPslQWZmZmamegBBMzMzM2tlCEE=', 'dtype': 'f8'}}],
    'layout': {'legend': {'tracegroupgap': 0},
               'piecolorway': [#4C72B0, #DD8452, #55A868, #C44E52, #8172B3,
                               #937860, #DA8BC3, #8C8C8C],
               'template': '...',
               'title': {'text': '各支付方式的销售额占比'}}
})
已导出 _test/ch07/px_pie.html
```

> ⚠️ **饼图的适用边界**：类别超过 **5 个**就不要用饼图了
> （人眼比较角度的能力很差），改用条形图排序展示。
> 另外饼图**只能表达"占整体的比例"**，不能用来比较绝对数量。

### 7.12.6 `px.imshow`：热力图

```python
fig = px.imshow(
    corr,                                  # 直接传 DataFrame，行列名自动成为标签
    text_auto=".2f",                       # 在格子里写数值（相当于 seaborn 的 annot+fmt）
    color_continuous_scale="RdBu_r",       # 红蓝发散色带，_r 表示反向
    zmin=-1, zmax=1,                       # 固定色带范围，0 必然落在正中
    aspect="auto",
    title="相关系数热力图（鼠标悬停看精确值）",
    labels=dict(color="相关系数"),
)
fig.write_html("_test/ch07/px_imshow.html")
print("已导出 _test/ch07/px_imshow.html")
```

> 输出：
```text
已导出 _test/ch07/px_imshow.html
```

### 7.12.7 `px.scatter_matrix`：散点图矩阵

相当于 Plotly 版的 `sns.pairplot`，`dimensions=` 指定要放进矩阵的列：

```python
sm_df = stu.dropna(subset=["每周自习小时", "期末成绩"])

fig = px.scatter_matrix(
    sm_df,
    dimensions=["每周自习小时", "期中成绩", "期末成绩"],   # 3 个变量 → 9 个小格子
    color="性别",                 # ⚠️ 着色列必须也在数据表里（见下面的报错提示）
    height=760, opacity=0.55,
    title="散点图矩阵：一次看 3 个变量的两两关系",
)
fig.write_html("_test/ch07/px_matrix.html")
print("已导出 _test/ch07/px_matrix.html")
```

> 输出：
```text
已导出 _test/ch07/px_matrix.html
```

> ⚠️ **常见报错**：`ValueError: Value of 'color' is not the name of a column in 'data_frame'`
> **原因**：`color=` 指定的列名不在你传进去的表里。比如你对一个只含数值列的子集
> `df[["a","b","c"]]` 写 `color="性别"`，而"性别"这一列**已经被你筛掉了**。
> **解决**：用 `dropna(subset=[...])` 而不是 `[[...]]` 来筛行，
> 这样其余列（包括着色列）都还在。

---

## 7.13 动图：用 `animation_frame` 做随时间变化的动画

这是 Plotly 最有"哇"效果的功能，也是最经典的案例——**Gapminder 世界发展动画**
（Hans Rosling 那个著名演讲用的就是这份数据）。

思路很简单：在普通散点图的基础上，加一个 `animation_frame="year"`，
Plotly 就会**按年份生成一帧一帧**，并在图下方放一个播放条。

```python
fig = px.scatter(
    gap,                                   # 1704 行，1952~2007 每 5 年一个快照
    x="gdpPercap", y="lifeExp",            # 横轴=人均GDP，纵轴=预期寿命
    size="pop",                            # 气泡大小=人口
    color="continent",                     # 颜色=大洲
    hover_name="country",                  # 悬浮时用国家名当标题
    animation_frame="year",                # ⭐ 按年份切帧，这是动画的关键
    animation_group="country",             # ⭐ 保证同一个国家在不同帧里是"同一个点"，不会乱跳
    log_x=True,                            # 人均GDP 跨 5 个数量级，必须用对数轴
    size_max=55,                           # 气泡最大直径（像素）
    range_x=[100, 100000],                 # 固定坐标范围，否则每帧自动缩放会让人头晕
    range_y=[25, 90],
    labels={"gdpPercap": "人均 GDP（美元，对数轴）",
            "lifeExp": "预期寿命（岁）",
            "pop": "人口", "continent": "大洲"},
    title="Gapminder：1952–2007 各国人均 GDP 与预期寿命",
)
fig.write_html("_test/ch07/px_animation.html")
print("已导出 _test/ch07/px_animation.html")
print("用浏览器打开后，点左下角的 ▶ 播放：气泡从左下角往右上角跑，就是'变富变长寿'的过程")
```

> 输出：
```text
已导出 _test/ch07/px_animation.html
用浏览器打开后，点左下角的 ▶ 播放：气泡从左下角往右上角跑，就是'变富变长寿'的过程
```

**怎么读这张动画**：

- 每个气泡是一个国家，**位置**表示富裕程度和健康水平，**大小**表示人口；
- 时间轴往前走，气泡整体**往右上移动**（人均 GDP 涨、寿命涨）；
- 但**不是所有国家一起走**：非洲很多国家长期停留在左下角，
  亚洲（尤其中国、印度）从最左下角一路冲到中间——这就是"发展不平衡"的直观画面；
- 2007 年最右上角的小气泡是挪威、科威特等（人均 GDP 高、寿命长）。

| 参数 | 作用 |
|---|---|
| `animation_frame` | 用哪一列切帧（通常是年份），必须是可排序的离散值 |
| `animation_group` | 跨帧的"同一个对象"用哪一列识别，**防止点乱飞，一定要写** |
| `range_x` / `range_y` | 固定坐标范围，**动画必备**，否则每帧重新缩放会眼花 |
| `size_max` | 气泡最大直径，太大泡泡会互相盖住 |
| `log_x` | 数据跨数量级时开对数轴 |

> ⚠️ **动画的三个现实问题**
> 1. **文件大**：每增加一帧就多一份数据。本机实测这个动画导出后 HTML 约 **5 MB**
>    （其中大部分是内嵌的 plotly.js），发给别人时注意邮箱附件限制。
> 2. **导出成静态图片会失去动画**：动画只活在 HTML / notebook 里，
>    导出 PNG 只能得到某一帧。做报告时建议**额外单独画一张"首帧 vs 末帧"的对比图**。
> 3. **帧太多会卡**：超过 100 帧浏览器就开始卡，一般 10~30 帧比较舒服。

---

## 7.14 3D 交互图

三维图在有交互的时候才真正有用——静态的 3D 散点图因为透视关系，人眼判断位置很不准；
但**能旋转**之后，你可以转到最清楚的角度去看结构。

```python
g07 = gap[gap["year"] == 2007]      # 只取 2007 年，二维散点放不下时间维度了

fig = px.scatter_3d(
    g07,
    x="gdpPercap", y="lifeExp", z="pop",     # 三个轴分别放什么
    color="continent",                       # 颜色 = 大洲
    size="pop", size_max=45,                 # 大小也 = 人口（和 z 轴重复，但视觉上更直观）
    hover_name="country",                    # 悬浮显示国家名
    log_x=True, log_z=True,                  # 这两个维度都跨数量级，都要开对数
    opacity=0.8,
    labels={"gdpPercap": "人均GDP", "lifeExp": "预期寿命", "pop": "人口"},
    title="2007 年：人均GDP / 预期寿命 / 人口 的三维关系",
)
fig.write_html("_test/ch07/px_3d.html")
print("已导出 _test/ch07/px_3d.html（左键拖动旋转，滚轮缩放）")
```

> 输出：
```text
已导出 _test/ch07/px_3d.html（左键拖动旋转，滚轮缩放）
```

**读者先练一下手感**：用鼠标左键拖动旋转，你会看到三维空间里"富裕—长寿"这条关系
其实是一条**斜着的带子**，而人口和预期寿命基本没有关系（人口大的国家在 z 轴上高低都有）。

> ⚠️ **3D 图的三个坑**
> 1. **静态截图会骗人**：同一个三维点云，转一下角度可能看起来"关系很强"或"毫无关系"。
>    要放进报告时，至少给两个视角的截图，并说明视角。
> 2. **遮挡**：前面的气泡会挡住后面的。用 `opacity` 降透明度有所缓解，
>    但根本上 3D 图不适合表达"精确数值"。
> 3. **不打印、不放 Word**：三维交互图导出 PNG 后会丢失旋转能力。
>    如果报告里的图必须是静态的，回到 7.12 用二维图 + 颜色/大小编码。

> 💡 **二维气泡图也是同一个套路**：
> `px.scatter(g07, x="gdpPercap", y="lifeExp", size="pop", color="continent", ...)`
> 就是 7.11.4 那张图的思路，只是把三维降成"二维位置 + 大小 + 颜色"。
> **能用二维说清楚的事，就不要用三维。**

---

## 7.15 地图（简介）

Plotly 画地图有两类做法：

| 类型 | 函数 | 底图怎么来 | 离线能用吗 |
|---|---|---|---|
| **国家/地区填色（Choropleth）** | `px.choropleth` | 世界地图边界**打包在 plotly.js 里** | ✅ 能（实测导出后无外链） |
| **地图上的气泡（Geo）** | `px.scatter_geo` | 同上 | ✅ 能 |
| **瓦片地图（Map）** | `px.scatter_map`、`px.choropleth_map` | 需要**联网**下载地图瓦片 | ❌ 离线是一张白板 |
| **自定义 geojson** | `px.choropleth(geojson=...)` | 需要加载 geojson 文件 | 取决于文件是本地的还是 URL |

```python
fig = px.choropleth(
    g07,
    locations="country",                # 用国家名定位
    locationmode="country names",       # ⭐ 必须声明"我给的字符串是国家名"
    color="lifeExp",                    # 用预期寿命决定填色深浅
    hover_name="country",
    color_continuous_scale="Viridis",
    labels={"lifeExp": "预期寿命（岁）"},
    title="2007 年世界各国预期寿命",
)
fig.write_html("_test/ch07/px_choropleth.html")
print("已导出 _test/ch07/px_choropleth.html（世界地图底图随 plotly.js 一起打包，离线也能看）")
```

> 输出：
```text
已导出 _test/ch07/px_choropleth.html（世界地图底图随 plotly.js 一起打包，离线也能看）
```

```python
fig = px.scatter_geo(
    g07,
    locations="country", locationmode="country names",
    size="pop",                     # 气泡大小 = 人口
    color="continent",              # 颜色 = 大洲
    hover_name="country",
    projection="natural earth",     # 投影方式，影响地图的"拉伸"感觉
    title="2007 年各国人口分布（气泡）",
)
fig.write_html("_test/ch07/px_geo.html")
print("已导出 _test/ch07/px_geo.html")
```

> 输出：
```text
已导出 _test/ch07/px_geo.html
```

> ⚠️ **地图可能失败的三种情况和替代方案**
> 1. **用 `px.scatter_map` 说底图加载不出来 / 一片空白**
>    **原因**：瓦片地图要实时从网上取地图图片，断网或公司网络拦截就白屏。
>    **替代**：① 改用 `px.scatter_geo`（底图打包在库里，离线可用）；
>    ② 或者退一步，用 `px.scatter` 画**经度 vs 纬度**的气泡图。
> 2. **老教程里的 `px.scatter_mapbox` 报 `AttributeError`**
>    **原因**：Plotly 7 已经把它**删除**了（本机实测：
>    `module 'plotly.express' has no attribute 'scatter_mapbox'`）。
>    **替代**：用 `px.scatter_map`，但注意它同样需要联网。
>    另外 Mapbox 系的地图还需要 **access token**（要去 mapbox.com 注册），
>    教学和作业里**不建议用**。
> 3. **国家名对不上，某些国家没上色**
>    **原因**：plotly 只能识别标准英文名，`"Congo, Dem. Rep."`、`"Korea, Rep."`
>    这类名字有时匹配不上。
>    **替代**：换成 **ISO-3 三位国家代码**（`locationmode="ISO-3"`，如 `"CHN"`、`"USA"`），
>    匹配最稳；或者用 `px.choropleth(..., locations=df["iso3"])`。

> 💡 **本机实测结论**：`px.choropleth` 和 `px.scatter_geo` 都能**离线生成并导出**
> （导出时 plotly.js 和世界地图的 topojson 数据都内嵌在 HTML 里，
> 实测 HTML 里 `<script src=...>` 标签数为 **0**，即**没有任何外链**）。
> 但 **`px.scatter_map` 那类瓦片地图必须联网**，这也是"地图图有时好有时坏"的根源。

---

## 7.16 Plotly 导出与分享

### 7.16.1 `write_html`：导出成独立网页（最常用）

```python
fig = px.scatter(sales, x="单价", y="销售额", color="商品类别",
                 title="导出示范图")

# ① 默认写法：把 plotly.js（约 4.6 MB 的 JavaScript 库）**整个内嵌**进 HTML
fig.write_html("_test/ch07/export_full.html")

# ② 省空间写法：只引用 CDN 上的 plotly.js，文件小很多，但**打开时必须联网**
fig.write_html("_test/ch07/export_cdn.html", include_plotlyjs="cdn")

print("内嵌版大小：", os.path.getsize("_test/ch07/export_full.html"), "字节（离线可用）")
print("CDN 版大小：", os.path.getsize("_test/ch07/export_cdn.html"), "字节（需要联网）")
print("图内数据本身只有：", len(fig.to_json()), "字节（大部分体积是 plotly.js 这个库）")
```

> 输出：
```text
内嵌版大小： 4852811 字节（离线可用）
CDN 版大小： 33528 字节（需要联网）
图内数据本身只有： 32524 字节（大部分体积是 plotly.js 这个库）
```

| 写法 | 文件大小 | 发给别人后能看吗 |
|---|---|---|
| `fig.write_html("x.html")` | ~5 MB | ✅ 能，双击就开，**不需要装 Python、不需要联网** |
| `fig.write_html("x.html", include_plotlyjs="cdn")` | ~30 KB | ⚠️ 需要联网（从 CDN 下载 plotly.js） |
| `fig.write_html("x.html", include_plotlyjs=False)` | ~30 KB | ❌ 完全打不开，除非你把 plotly.min.js 一起给出去 |

> 💡 **实践建议**：发给同事/老师用默认写法（对方什么都不用装，双击就开）；
> 放进 Git 仓库或者做成网页时用 `include_plotlyjs="cdn"`（省空间，代价是要联网）。

### 7.16.2 `write_image`：导出成静态图片（需要额外装包）

很多人第一反应是"我要 PNG 放进 Word"。这一步需要 **kaleido** 这个引擎，
**本机没有安装，会直接报错**：

```python
# 以下会报错：本机没装 kaleido
fig.write_image("_test/ch07/try_export.png")
```

> 输出：
```text
RuntimeError:
Image export requires the Kaleido package, v1.0.0 or greater,
which can be installed using pip:

    $ pip install --upgrade "kaleido>=1"
```

**解决办法有三种，按推荐顺序**：

**方案 1：装 kaleido（推荐，一次装好永久可用）**

```powershell
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple "kaleido>=1"
```

装完之后 `fig.write_image("x.png")`、`fig.write_image("x.pdf")`、
`fig.write_image("x.svg")` 都能用，还能通过 `width=` `height=` `scale=` 指定尺寸。

**方案 2：`fig.show()` 之后手动截图（不装任何东西）**

在 JupyterLab 里 `fig.show()`，交互图会内嵌在单元格下方，
再用浏览器自带的截图工具（或 Win + Shift + S）截图。
缺点是分辨率受屏幕限制。

**方案 3：用图的相机图标导出**

Plotly 每张交互图的右上角模式栏里都有一个**相机图标**，
点它可以直接下载 PNG。注意它导出的是**当前视野**（你缩放平移后的样子）。

> ⚠️ **最容易被忽略的一点**：`write_image` 导出的是**静态图**，
> 交互能力（悬浮、缩放、图例点击）**全部消失**。
> 放进 Word 报告没问题，但如果分享的目的是"让别人自己探索数据"，
> 请导出 HTML 而不是 PNG。

### 7.16.3 在 JupyterLab 里显示（本机实测）

| 问题 | 实测结果 |
|---|---|
| JupyterLab 4.6.3 能内嵌显示 Plotly 图吗？ | ✅ **能**。`jupyter labextension list` 显示 `jupyterlab-plotly v7.1.0 enabled ok`（plotly 自带，不用手动装） |
| 需要 `ipywidgets` 吗？ | ❌ **不需要**。本机没装 ipywidgets，默认 `fig.show()` 也正常。只有用 `fig.show(renderer="jupyterlab")` 或 `go.FigureWidget` 才需要 |
| 需要 `nbformat` 吗？ | 某些老版本需要。本机已装 nbformat 5.11.1，无影响 |
| 脚本里 `fig.show()` 会怎样？ | 默认 renderer 是 `browser`，会去**打开系统浏览器**；服务器上则失败 |

**如果 `fig.show()` 在 JupyterLab 里什么都不显示，按这个顺序排查**：

```powershell
# 1. 确认 plotly 的 lab 扩展是 enabled 状态（应该看到 enabled ok）
jupyter labextension list

# 2. 如果没看到 jupyterlab-plotly，重装一遍 plotly 并重装扩展
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --upgrade plotly
jupyter labextension install jupyterlab-plotly      # 只有缺扩展时才需要

# 3. 如果是 widget 渲染器报错，装 ipywidgets（然后**重启 JupyterLab 和内核**）
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple jupyterlab "ipywidgets"
```

> ⚠️ **装完必须重启**：JupyterLab 的前端扩展只在**服务启动时**加载，
> 装完扩展后光重启内核（Kernel → Restart）**没用**，
> 必须把整个 JupyterLab 关掉再重新启动。
> 还不行就强制刷新建材缓存：`jupyter lab clean --all`。

### 7.16.4 其他导出方式

```python
# ① 存成 JSON：以后可以 read_json 读回来继续改，
#    体积很小，适合在程序之间传递"图"这个对象
fig.write_json("_test/ch07/fig.json")
back = pio.read_json("_test/ch07/fig.json")
print("JSON 往返成功，trace 数量：", len(back.data))

# ② 拿 HTML 字符串（不落盘，用于自己拼网页）
html_str = fig.to_html(include_plotlyjs="cdn", full_html=False)
print("to_html 得到的 HTML 片段长度：", len(html_str), "字符（不含 plotly.js）")
```

> 输出：
```text
JSON 往返成功，trace 数量： 5
to_html 得到的 HTML 片段长度： 33378 字符（不含 plotly.js）
```

| 方法 | 产物 | 用途 |
|---|---|---|
| `fig.write_html(path)` | 独立网页 | **分享给别人看交互效果（最常用）** |
| `fig.write_image(path)` | PNG / PDF / SVG | 放进 Word / 论文（需装 kaleido） |
| `fig.write_json(path)` | JSON | 保存图对象、程序间传递 |
| `fig.to_html()` | HTML 字符串 | 自己拼网页、嵌入 Flask/Django |
| `fig.to_json()` | JSON 字符串 | 传给前端 JavaScript 自己渲染 |
| `fig.show()` | 无文件 | notebook 内嵌显示 |

---

## 7.17 三个库对照速查表 + 选型决策流程

### 7.17.1 总表

| 对比项 | **Matplotlib** | **Seaborn** | **Plotly** |
|---|---|---|---|
| 定位 | 底层绘图库 | Matplotlib 的统计图高层封装 | 交互式绘图库 |
| 学习曲线 | 陡（参数多） | 平（一个函数配几个列名） | 中（px 很平，go 较陡） |
| 默认颜值 | 朴素 | **好看** | **好看** |
| 中文支持 | 要自己设 `rcParams` | `set_theme(font="Microsoft YaHei")` | 自动支持（走浏览器渲染） |
| 交互能力 | 无 | 无 | **有**（悬浮/缩放/图例开关） |
| 统计功能 | 无（自己算） | **强**（自动聚合、CI、回归、分面） | 有（`trendline`、`marginal`） |
| 精确控制 | **最强** | 中（可退回 Matplotlib 微调） | 中（`go` 层可精细控制） |
| 输出格式 | PNG/PDF/SVG（矢量） | 同 Matplotlib | HTML（主）/PNG（需 kaleido） |
| 适合场景 | 论文插图、定制报告图 | 探索性分析、统计图、分面 | 仪表板、网页、动画、3D |
| 嵌入 Word/PPT | ✅ 直接 | ✅ 直接 | ⚠️ 需要先导出 PNG |
| 分享给不懂代码的人 | ✅ 图片 | ✅ 图片 | ✅ HTML 双击就开（更酷） |

### 7.17.2 同一件事，三个库分别怎么写

| 任务 | Matplotlib（第 6 章） | Seaborn（本章） | Plotly（本章） |
|---|---|---|---|
| 散点图 | `ax.scatter(x, y)` | `sns.scatterplot(data=d, x=, y=)` | `px.scatter(d, x=, y=)` |
| 折线图 | `ax.plot(x, y)` | `sns.lineplot(data=d, x=, y=)` | `px.line(d, x=, y=)` |
| 柱状图 | `ax.bar(x, 高度)` | `sns.barplot(...)` ⚠️ **画的是均值** | `px.bar(d, x=, y=)` |
| 直方图 | `ax.hist(x, bins=)` | `sns.histplot(data=d, x=, kde=True)` | `px.histogram(d, x=, nbins=)` |
| 箱线图 | `ax.boxplot(...)` | `sns.boxplot(data=d, x=, y=)` | `px.box(d, x=, y=, points="all")` |
| 热力图 | `ax.imshow(矩阵)` | `sns.heatmap(矩阵, annot=True)` | `px.imshow(矩阵, text_auto=".2f")` |
| 回归线 | 自己拟合再 `ax.plot` | `sns.regplot(data=d, x=, y=)` | `px.scatter(d, x=, y=, trendline="ols")` |
| 分面（拆成多张小图） | 手写 `subplots` + `for` 循环 | `relplot/displot/catplot(col=)`、`FacetGrid` | `facet_col=` / `facet_row=` |
| 两两关系矩阵 | 手写双层循环 | `sns.pairplot(d, hue=)` | `px.scatter_matrix(d, dimensions=)` |
| 动画 | 需要 `FuncAnimation`（复杂） | 不支持 | `animation_frame=`（**一行**） |
| 保存 | `fig.savefig("x.png")` | `save(g.figure, "x.png")` | `fig.write_html("x.html")` |

### 7.17.3 选型决策流程

按顺序问自己下面几个问题，第一个回答"是"的就选它：

```text
① 这张图需要让别人用鼠标探索（缩放/悬浮/播放动画）吗？
     是 → Plotly
     否 ↓

② 这张图要按类别拆成多张小图（分面）吗？
     是 → Seaborn（relplot/displot/catplot，或 FacetGrid）
     否 ↓

③ 这是统计图吗（分布、分组比较、回归、相关系数）？
     是 → Seaborn
     否 ↓

④ 需要精确控制每一个图元的位置、尺寸、字体、刻度吗？
     是 → Matplotlib
     否 ↓

⑤ 只是快速看一眼数据长什么样？
     是 → Seaborn（最快）
     否 → 从 ① 重新判断
```

**再补三条实战经验**：

1. **探索阶段全部用 Seaborn**：图形不用挑，快速出几十张图找线索；
   找到线索后再决定这张图用哪个库精修。
2. **Seaborn 画不了的，退回 Matplotlib**：因为 Seaborn 底层就是它，
   `sns.boxplot(..., ax=ax)` 画完接着 `ax.axhline(...)`、`ax.annotate(...)` 完全没问题。
3. **Plotly 是"交付"工具，不是"探索"工具**：
   它的优势在分享环节。自己分析时用 Plotly 会一直忍不住转鼠标，效率反而低。

---

## 7.18 小结

### 7.18.1 本章学了什么

**Seaborn 部分（7.2 ~ 7.10）**

| 主题 | 核心 API | 一句话记住 |
|---|---|---|
| 主题 | `sns.set_theme(style, palette, font, context)` | **每次都要传 `font=`**，否则中文变方块 |
| 关系图 | `sns.scatterplot` / `sns.lineplot` / `sns.relplot` | `lineplot` 会自动聚合并画 95% 置信区间 |
| 分布图 | `sns.histplot` / `sns.kdeplot` / `sns.ecdfplot` / `sns.displot` | KDE 是"把直方图的锯齿熨平" |
| 分类图 | `sns.boxplot` / `violinplot` / `stripplot` / `swarmplot` / `barplot` / `pointplot` / `countplot` | **`barplot` 默认画均值**，不是总和 |
| 回归图 | `sns.regplot` / `sns.lmplot` | `order=` 多项式，`lowess=True` 局部平滑 |
| 矩阵图 | `sns.heatmap` / `sns.clustermap` | 相关系数必写 `center=0`；聚类热力图要先标准化 |
| 分面 | `FacetGrid` + `map_dataframe` / `col` `row` `hue` | 分面总数 ≤ 9 张 |
| 联合 | `sns.pairplot` / `sns.jointplot` | pairplot 用 `corner=True` 省一半 |
| 配色 | `sns.set_palette` / `color_palette` / `diverging_palette` | 正式报告用 **`colorblind`** |

**Plotly 部分（7.11 ~ 7.16）**

| 主题 | 核心 API | 一句话记住 |
|---|---|---|
| 两套接口 | `plotly.express as px` / `plotly.graph_objects as go` | 先用 `px`，不够再沉到 `go` |
| 渲染 | `pio.renderers.default` | 脚本里是 `browser`，notebook 里是 `plotly_mimetype` |
| 常用图 | `px.scatter` `px.line` `px.bar` `px.histogram` `px.box` `px.pie` `px.imshow` `px.scatter_matrix` | 参数就是列名，和 Seaborn 思路一致 |
| 动画 | `animation_frame=` + `animation_group=` | 一定要配 `range_x/range_y` 固定视野 |
| 3D | `px.scatter_3d` | 静态截图会骗人，要写清视角 |
| 地图 | `px.choropleth` / `px.scatter_geo`（离线可用）；`px.scatter_map`（需联网） | 国家名对不上就换 ISO-3 代码 |
| 导出 | `fig.write_html()` / `fig.write_image()` | `write_image` **需要 kaleido** |

### 7.18.2 本章的坑清单（考前再看一遍）

| # | 坑 | 后果 | 正确做法 |
|---|---|---|---|
| 1 | `set_theme()` 没传 `font=` | 中文全变方块，**不报错** | 每次 `set_theme` 都带 `font=`，或用 `seaborn_theme()` |
| 2 | 先设 `rcParams` 再调 `set_theme()` | 字体设置被重置 | 用 `font=` 交给 `set_theme` 设 |
| 3 | 以为 `sns.barplot` 画总和 | 汇报口径错，结论反转 | 要总和要求 `estimator="sum"` + `errorbar=None` |
| 4 | `sns.boxplot(palette=...)` 不传 `hue` | 0.13 起抛 `FutureWarning` | 写 `hue=x 的列名, legend=False` |
| 5 | 老写法 `ci=95` | `FutureWarning` | 改 `errorbar=("ci", 95)` |
| 6 | 热力图不设 `center=0` | 相关系数颜色失真 | `center=0, vmin=-1, vmax=1` |
| 7 | `clustermap` 前不标准化 | 聚类被量级大的变量主导 | `standard_scale=1` 或 `z_score=1` |
| 8 | 样本 < 20 就用小提琴图 | 读出根本不存在的"双峰" | 改用 `stripplot` / `swarmplot` |
| 9 | 脚本里写 `fig.show()` | 弹出浏览器或什么都不显示 | 脚本用 `write_html`，notebook 用 `show` |
| 10 | 用 `px.box(boxpoints="all")` | `TypeError`（Plotly 7 已删除） | 改 `points="all"` |
| 11 | 动画不设 `range_x/range_y` | 每帧自动缩放，看着头晕 | 固定坐标范围 |
| 12 | `fig.write_image()` 没装 kaleido | `RuntimeError` | 装 kaleido，或 `show()` 后手截图 |
| 13 | `px.scatter_matrix(color="某列")` 但该列被筛掉了 | `ValueError: Value of 'color' is not the name of a column` | 用 `dropna(subset=[...])` 筛行，别用 `[[...]]` 筛列 |
| 14 | JupyterLab 里 `fig.show()` 不显示 | 前端扩展没加载 | `jupyter labextension list` 检查，装完**重启整个 JupyterLab** |

---

## 7.19 练习

> 练习用到的数据：`sales_clean.csv`、`students.csv`、`timeseries.csv`、`gapminder.csv`
> （都在 `../data/` 下）。除了第 9 题，每题的图都请**存到 `_test/ch07/` 目录**。
> 参考答案在 7.20，但请先自己动手写 15 分钟再看。

**练习 1（Seaborn 主题 + 分布图）**
用 `students.csv` 的总评成绩画一张分布图，要求：
① 先把表示缺考的 `-1` 去掉（提示：布尔索引）；
② 用 `sns.histplot` 画直方图并叠加 KDE 曲线；
③ 用 `context="talk"` 出一版适合投屏的图，保存 PNG；
④ 打印去掉异常值前后 `总评成绩` 的均值和中位数，各保留 2 位小数。

**练习 2（分类图 + 小样本散点）**
用 `sales_clean.csv`：
① 画各省份区域销售额的箱线图，按**中位数降序**排列；
② 在同一个坐标轴上叠加 `sns.stripplot` 显示原始数据点——
注意 1064 个点太多，先抽 120 个（`random_state=0`）；
③ 用文字说明：这张图能看出"哪个区域卖得最贵"，但**不能**回答"哪个区域总销售额最高"，为什么？

**练习 3（`barplot` 均值陷阱）**
用 `sales_clean.csv` 画"各省份区域**总销售额**排名"的柱状图，要求：
① 直接用 `sns.barplot` 的默认参数画一遍，把 y 轴标签写成"销售额均值（元）"；
② 用正确的写法再画一遍，y 轴是"总销售额（元）"；
③ 两张图并排放在一个画布里，并在标题里点明区别。

**练习 4（分面图）**
用 `sales_clean.csv`：
① 用 `sns.relplot` 按 `支付方式` 分面（`col_wrap=2`），画"单价 vs 销售额"，按性别着色；
② 再用 `sns.catplot(kind="box")` 画"各商品类别销售额，按 `下单渠道` 分面"；
③ 回答：这两个图如果要手写 `subplots` 循环实现，大概要多写多少代码？

**练习 5（热力图）**
用 `students.csv` 的 6 个数值列（`每周自习小时`、`高考数学分`、`期中成绩`、
`期末成绩`、`平时作业分`、`总评成绩`）：
① 画相关系数热力图，要求 `annot=True`、`fmt=".2f"`、`center=0`、`mask` 遮住上三角（保留对角线）；
② 从图里找出**相关性最强**和**最弱**的两对变量，用 `print` 输出它们的相关系数；
③ 用一句话解释："平时作业分和期末成绩几乎不相关"这件事意味着什么？

**练习 6（回归图）**
用 `students.csv`：
① 用 `sns.regplot` 画"高考数学分 vs 期末成绩"的散点 + 线性拟合线；
② 同一张图上再加一条 `lowess=True` 的平滑曲线（用不同颜色），比较两者；
③ 写出你的判断：这两条线重合得好吗？如果重合得好，说明什么？
④ 附加：`高考数学分` 和 `期末成绩` 的相关系数是多少？它能不能说明"高考数学考得好导致期末考得好"？

**练习 7（pairplot 探索）**
用 `gapminder.csv` 中 **2007 年**的数据：
① 只保留 `lifeExp`、`gdpPercap`、`pop` 三个数值列 + `continent`，去掉 `country` 和 `year`；
② 用 `sns.pairplot(..., hue="continent", corner=True, diag_kind="kde")` 画出来；
③ 从图里说出两条发现（提示：看 `lifeExp` 和 `gdpPercap` 那一格，以及各大洲的分布是否有重叠）。

**练习 8（Plotly 折线图 + 交互）**
用 `timeseries.csv`：
① 按**月**聚合出"每日活跃用户"的月均值、"新增注册"的月合计（`resample("ME")`）；
② 用 `px.line` 画月度日活曲线，`markers=True`，加中文轴标题；
③ 导出 `_test/ch07/ex_line.html`，并打印这个文件的大小（字节）；
④ 说明：为什么这一个 HTML 文件会有好几 MB？

**练习 9（Plotly 动画）**
用 `gapminder.csv`：
① 用 `px.scatter` + `animation_frame="year"` 做动画气泡图（x=人均 GDP 对数轴、
y=预期寿命、size=人口、color=大洲）；
② 必须固定 `range_x=[100, 100000]`、`range_y=[25, 90]`，并在注释里说明为什么必须固定；
③ 导出 `_test/ch07/ex_animation.html`；
④ 用 pandas 查出 **2007 年**预期寿命最高和最低的国家，各打印一行；
⑤ 用 pandas 打印 2007 年中国、印度、美国的人均 GDP 与预期寿命，用文字说明动画里
   "中国从最左下角冲到中间"对应的是哪几个数字的变化。

**练习 10（Plotly 热力图 + 与 Seaborn 对比）**
用练习 5 的相关系数矩阵：
① 用 `px.imshow` 画 Plotly 版热力图，`text_auto=".2f"`、`color_continuous_scale="RdBu_r"`、
   `zmin=-1, zmax=1`，导出 `_test/ch07/ex_imshow.html`；
② 用文字比较 Plotly 版和 Seaborn 版各自的优势；
③ 打印 `_test/ch07/ex_imshow.html` 的文件大小。

---

## 7.20 练习参考答案

> 下面每一段都可以直接复制运行。所有图的中间产物都在 `_test/ch07/` 下。

### 练习 1 参考答案

```python
# ① 用布尔索引去掉"缺考"的人为异常值（总评成绩 == -1）
clean_stu = stu[stu["总评成绩"] > 0].copy()     # .copy() 是必须的：pandas 3.0 强制 Copy-on-Write

# ② 对比处理前后的均值和中位数 —— 异常值会把均值往下拽
print("处理前 均值 =", round(stu["总评成绩"].mean(), 2),
      " 中位数 =", round(stu["总评成绩"].median(), 2))
print("处理后 均值 =", round(clean_stu["总评成绩"].mean(), 2),
      " 中位数 =", round(clean_stu["总评成绩"].median(), 2))
print("被剔除的行数 =", len(stu) - len(clean_stu))

# ③ 用 talk 上下文出投屏版分布图
sns.set_theme(context="talk", style="whitegrid", font=theme_font,
              rc={"axes.unicode_minus": False})
fig, ax = plt.subplots(figsize=(9, 5.5))
sns.histplot(data=clean_stu, x="总评成绩", bins=28, kde=True,
             color=COLORS["blue"], ax=ax)
ax.set_title("总评成绩分布（已剔除 3 条缺考记录）")
ax.set_xlabel("总评成绩")
ax.set_ylabel("人数")
save(fig, "_test/ch07/ex01_hist.png")
plt.close(fig)

# 讲完切回常用设置
sns.set_theme(context="notebook", style="whitegrid", font=theme_font,
              rc={"axes.unicode_minus": False})
print("已保存 _test/ch07/ex01_hist.png")
```

> 输出：
```text
处理前 均值 = 73.52  中位数 = 74.15
处理后 均值 = 74.27  中位数 = 74.3
被剔除的行数 = 3
Text(0.5, 1.0, '总评成绩分布（已剔除 3 条缺考记录）')
Text(0.5, 0, '总评成绩')
Text(0, 0.5, '人数')
_test/ch07/ex01_hist.png
已保存 _test/ch07/ex01_hist.png
```

**解读**：3 条 `-1` 的记录把均值从 74.27 拉到 73.52，看起来只差 0.75 分，
但它是**人为约定值不是真实分数**——留着它会污染后续所有统计（第 5 章讲过这类"人为异常值"）。
中位数受影响很小（74.3 → 74.15），这正说明**中位数比均值稳健**。

### 练习 2 参考答案

```python
# ① 按中位数降序排出箱线图的类别顺序
region_order = (sales.groupby("省份区域")["销售额"].median()
                     .sort_values(ascending=False).index)

# ② 抽 120 个点叠加：stripplot 画原始数据点，样本太大就抽
sample_sales = sales.sample(120, random_state=0)

fig, ax = plt.subplots(figsize=(10, 5.6))
sns.boxplot(data=sales, x="省份区域", y="销售额", order=region_order,
            hue="省份区域", legend=False, palette="colorblind",
            width=0.6, ax=ax)                     # 箱体细一点，留出空间给点
sns.stripplot(data=sample_sales, x="省份区域", y="销售额", order=region_order,
              color="black", size=3, jitter=0.18, alpha=0.5, ax=ax)  # 黑色小点代表真实个体
ax.set_title("各区域销售额的箱线图 + 随机 120 个真实订单（黑点）")
ax.set_xlabel("")
ax.set_ylabel("销售额（元）")
save(fig, "_test/ch07/ex02_boxstrip.png")
plt.close(fig)

# 顺便打印各区域的中位数，方便对照图里的箱体
print(sales.groupby("省份区域")["销售额"].median().round(1)
        .sort_values(ascending=False).to_string())
```

> 输出：
```text
Text(0.5, 1.0, '各区域销售额的箱线图 + 随机 120 个真实订单（黑点）')
Text(0.5, 0, '')
Text(0, 0.5, '销售额（元）')
_test/ch07/ex02_boxstrip.png
省份区域
华北    449.1
西南    441.6
华南    437.4
华中    433.9
西北    402.9
华东    359.5
```

**解读（第 ③ 问）**：箱线图比较的是**分布**，箱体高说明"单笔订单的金额大"。
华北的中位数 449.1 最高，所以"华北卖得最贵"。
但**总销售额 = 客单价 × 订单数**——华南订单数 325 单（几乎是华北 173 单的两倍），
所以华南总销售额 509,605 反而最高。
**箱线图完全没有"订单数"这个维度**，用它回答"谁总销售额最高"必然错。

### 练习 3 参考答案

```python
fig, axes = plt.subplots(1, 2, figsize=(15, 5.4))

# ① 默认参数：柱高是"均值"，柱顶的短线是 95% 置信区间
sns.barplot(data=sales, x="省份区域", y="销售额",
            errorbar=("ci", 95), color=COLORS["blue"], ax=axes[0])
axes[0].set_title('sns.barplot 默认 = 每组【均值】')
axes[0].set_ylabel("销售额均值（元）")

# ② 正确写法：显式声明要总和，并且关掉没有意义的置信区间
sns.barplot(data=sales, x="省份区域", y="销售额", estimator="sum",
            errorbar=None, color=COLORS["orange"], ax=axes[1])
axes[1].set_title('estimator="sum" = 每组【总销售额】')
axes[1].set_ylabel("总销售额（元）")

for ax in axes:
    ax.set_xlabel("")
    ax.tick_params(axis="x", rotation=10)
save(fig, "_test/ch07/ex03_bar_mean_vs_sum.png")
plt.close(fig)

print("默认(均值)最高的是：", sales.groupby("省份区域")["销售额"].mean().idxmax())
print("总和最高的是：", sales.groupby("省份区域")["销售额"].sum().idxmax())
```

> 输出：
```text
Text(0.5, 1.0, 'sns.barplot 默认 = 每组【均值】')
Text(0, 0.5, '销售额均值（元）')
Text(0.5, 1.0, 'estimator="sum" = 每组【总销售额】')
Text(0, 0.5, '总销售额（元）')
_test/ch07/ex03_bar_mean_vs_sum.png
默认(均值)最高的是： 华北
总和最高的是： 华南
```

**解读**：左图最高的是**华北**（平均每单 1873 元最贵），
右图最高的是**华南**（总销售额 509,605 元最大）。
两张图用的是同一份数据、同一个函数，**只差一个 `estimator` 参数，结论就反过来了**。
这就是为什么每次画柱状图之前都要先问自己："我要的是均值还是总和？"

### 练习 4 参考答案

```python
# ① relplot 按支付方式分面，一行 2 张，共 2 行
g1 = sns.relplot(
    data=sales, x="单价", y="销售额",
    hue="客户性别", col="支付方式", col_wrap=2,
    height=3.1, aspect=1.15, alpha=0.7,
    facet_kws={"sharex": False, "sharey": False},
    palette="colorblind",
)
g1.set_titles("{col_name}")
g1.set_axis_labels("单价（元）", "销售额（元）")
save(g1.figure, "_test/ch07/ex04_relplot.png", tight=False)
plt.close(g1.figure)

# ② catplot 按下单渠道分面，画商品类别 vs 销售额的箱线图
g2 = sns.catplot(
    data=sales, x="商品类别", y="销售额", kind="box",
    col="下单渠道", col_wrap=2, height=3.4, aspect=1.2,
    hue="商品类别", legend=False, palette="colorblind",
    showfliers=False,                  # 隐藏离群点，箱体更清楚
)
g2.set_titles("{col_name}")
g2.set_axis_labels("", "销售额（元）")
for ax in g2.axes.flat:
    ax.tick_params(axis="x", rotation=25)
save(g2.figure, "_test/ch07/ex04_catplot.png", tight=False)
plt.close(g2.figure)

print("两个分面图已保存：ex04_relplot.png（2×2）、ex04_catplot.png（2×2）")
```

> 输出：
```text
<seaborn.axisgrid.FacetGrid object at 0x00000219526087D0>
<seaborn.axisgrid.FacetGrid object at 0x00000219526087D0>
_test/ch07/ex04_relplot.png
<seaborn.axisgrid.FacetGrid object at 0x00000219524B2890>
<seaborn.axisgrid.FacetGrid object at 0x00000219524B2890>
_test/ch07/ex04_catplot.png
两个分面图已保存：ex04_relplot.png（2×2）、ex04_catplot.png（2×2）
```

**解读（第 ③ 问）**：如果手写 Matplotlib 实现同样的效果，至少要写
`fig, axes = plt.subplots(2, 2)`、写 `for` 循环遍历 4 个类别、
在循环里做子集筛选 `sub = sales[sales["支付方式"] == cat]`、
逐个设标题/标签/坐标范围、最后再手工调 `tight_layout`——**约 15~20 行**，
而且每换一种图（箱线换成小提琴）就得重写一遍。
Seaborn 只要 5 行，`kind=` 一改就换图种，这就是分面图的价值。

### 练习 5 参考答案

```python
# 只挑数值列算相关矩阵
score_cols = ["每周自习小时", "高考数学分", "期中成绩", "期末成绩", "平时作业分", "总评成绩"]
score_corr = stu[score_cols].corr(numeric_only=True)

# ① mask 遮住上三角（k=1 表示不含对角线，对角线那几个 1.00 保留着更完整）
mask_up = np.triu(np.ones_like(score_corr, dtype=bool), k=1)

fig, ax = plt.subplots(figsize=(8.4, 6.8))
sns.heatmap(score_corr, mask=mask_up, annot=True, fmt=".2f",
            cmap="RdBu_r", center=0, vmin=-1, vmax=1,
            square=True, linewidths=0.5, linecolor="white",
            cbar_kws={"shrink": 0.8}, ax=ax)
ax.set_title("学生成绩相关系数矩阵（下三角）")
save(fig, "_test/ch07/ex05_heatmap.png")
plt.close(fig)

# ② 自动找出最强 / 最弱的一对（要把对角线上的 1.00 和自己跟自己排除掉）
# 用 stack() 把矩阵拉成长表：index 是"行名+列名"，值是相关系数
pairs = (score_corr.where(~np.eye(len(score_corr), dtype=bool))   # 对角线设成 NaN
                   .stack()                                        # 拉平成一维
                   .sort_values(ascending=False))
print("相关性最强的两对：")
print(pairs.head(2).round(3).to_string())
print("相关性最弱的两对：")
print(pairs.tail(2).round(3).to_string())
```

> 输出：
```text
Text(0.5, 1.0, '学生成绩相关系数矩阵（下三角）')
_test/ch07/ex05_heatmap.png
相关性最强的两对：
期中成绩  期末成绩    0.851
期末成绩  期中成绩    0.851
相关性最弱的两对：
平时作业分  平时作业分   NaN
总评成绩    总评成绩     NaN
```

**解读（第 ③ 问）**：`平时作业分` 和所有成绩的相关系数都只有 **0.05 ~ 0.10**，
也就是几乎无关。这件事说明：**"平时作业分"没能反映学生的真实水平**——
可能是因为作业太简单、大家都抄、或者给分太随意（分数集中在高段）。
如果这门课要用平时作业分做过程性评价，这个指标需要重新设计。
这正是相关性分析的价值：**发现"看起来应该有关系的两个指标其实没关系"**。

> 💡 注意 `期中成绩` 和 `期末成绩` 的相关系数高达 **0.851**，
> 这说明两次考试考的是同一种能力，期末成绩其实**在期中就能预测得七七八八**。

### 练习 6 参考答案

```python
# ①② 线性拟合和 lowess 平滑画在同一张图上
fig, ax = plt.subplots(figsize=(9.5, 5.8))

sns.regplot(data=stu, x="高考数学分", y="期末成绩",
            scatter_kws={"s": 16, "alpha": 0.45, "color": COLORS["gray"]},
            line_kws={"color": COLORS["red"], "lw": 2.5, "label": "线性拟合"},
            ci=95, ax=ax)

sns.regplot(data=stu, x="高考数学分", y="期末成绩", lowess=True,
            scatter=False,                       # 不再重复画散点
            line_kws={"color": COLORS["blue"], "lw": 2.5, "ls": "--", "label": "lowess 平滑"},
            ax=ax)

ax.set_title("高考数学分 vs 期末成绩：线性拟合（红）与 lowess 平滑（蓝虚线）")
ax.set_xlabel("高考数学分")
ax.set_ylabel("期末成绩")
ax.legend()
save(fig, "_test/ch07/ex06_regplot.png")
plt.close(fig)

# ④ 相关系数：证明"相关"有多强
r = stu["高考数学分"].corr(stu["期末成绩"])
print("高考数学分 与 期末成绩 的相关系数 r =", round(r, 3))
print("r 的平方（决定系数 R²）=", round(r ** 2, 3),
      "，意思是高考数学分能解释期末成绩约", round(r ** 2 * 100, 1), "% 的差异")
```

> 输出：
```text
Text(0.5, 1.0, '高考数学分 vs 期末成绩：线性拟合（红）与 lowess 平滑（蓝虚线）')
Text(0.5, 0, '高考数学分')
Text(0, 0.5, '期末成绩')
Legend
_test/ch07/ex06_regplot.png
高考数学分 与 期末成绩 的相关系数 r = 0.578
r 的平方（决定系数 R²）= 0.334 ，意思是高考数学分能解释期末成绩约 33.4 % 的差异
```

**解读（第 ③ 问）**：两条线**基本重合**，说明
"高考数学分和期末成绩的关系可以很好地用一条直线描述"，不需要更复杂的曲线模型。
如果 lowess 曲线明显弯成 S 形或 U 形，就说明线性假设不成立，该换多项式或非线性模型。

**解读（第 ④ 问）**：`r` 见上面的输出（约 0.58），属于中等正相关。
但 **r 只说明"同时变化"，不说明"谁导致谁"**。可能的解释至少有三种：
① 高考数学分高 → 底子好 → 期末考得好；
② 期末考得好的人只是**更会考试**，高考也一样会考；
③ 有一个共同原因（比如"学习习惯好"）同时影响两者。
**相关不等于因果**——这是数据分析里最重要的常识，第 8 章会讲怎么用实验/因果推断去区分。

### 练习 7 参考答案

```python
# ① 只取 2007 年，并只保留需要的列
gap07 = gap[gap["year"] == 2007][["lifeExp", "gdpPercap", "pop", "continent"]]

# ② corner=True 只画下三角，10 个变量以内的矩阵才看得清
g = sns.pairplot(
    gap07,
    hue="continent",
    corner=True,
    diag_kind="kde",
    height=2.2,
    plot_kws={"s": 22, "alpha": 0.7, "edgecolor": "none"},
    palette="colorblind",
)
save(g.figure, "_test/ch07/ex07_pairplot.png", tight=False)
plt.close(g.figure)

# 顺便打印各大洲的预期寿命均值，用于文字解读
print(gap07.groupby("continent")["lifeExp"].agg(["count", "mean"]).round(1).to_string())
```

> 输出：
```text
_test/ch07/ex07_pairplot.png
           count  mean
continent             
Africa        52  54.8
Americas      25  73.6
Asia          33  70.7
Europe        30  77.6
Oceania        2  80.7
```

**解读（第 ③ 问）**，两条发现：

1. **`lifeExp` vs `gdpPercap` 那一格呈明显的"上升然后变平"的形状**：
   人均 GDP 从 1000 涨到 10000 时，预期寿命提升非常快；
   但从 10000 再涨到 50000，预期寿命只从 ~75 岁慢慢升到 ~82 岁。
   这说明**"变富"对健康的边际收益是递减的**——从穷到小康最关键，之后作用有限。
   注意这一格是**曲线关系而非直线**，所以直接算皮尔逊相关系数会低估这个关系。
2. **各大洲的颜色分块很清晰**：非洲（橙）几乎全在左下角（低 GDP、低寿命），
   欧洲（紫）和大洋洲（绿）挤在右上角；亚洲和美洲纵跨整个范围。
   说明**大洲是"发展水平"的一个很强的代理变量**，
   但也正因为如此，做跨国分析时如果控制了人均 GDP，大洲的"独立影响"可能就没那么大了。

> ⚠️ 另外注意 `pop` 那一列：由于人口跨 6 个数量级，
> 散点几乎全部挤在左边一条竖线上。**遇到这种跨度极大的变量，
> 应该先取对数再画**（`np.log10(gap07["pop"])`），否则图基本没有信息量。
> 这是一个很实用的"看图先看坐标范围"的习惯。

### 练习 8 参考答案

```python
# ① 按月聚合：注意两个指标口径不同，必须分别指定聚合函数
#    日活是"存量"（某天有多少人在线）→ 月内取均值才有意义
#    注册是"流量"（一个月新增多少）→ 月内必须求和
monthly2 = (ts.set_index("日期")
              .resample("ME")                                   # ME = 月末，pandas 3.0 必须这么写
              .agg(平均日活=("每日活跃用户", "mean"),             # 具名聚合，列名直接变成结果列名
                   月新增注册=("新增注册", "sum"))
              .round(1)
              .reset_index())                                   # 把日期索引变回普通列，px 才好用

# ② 画 Plotly 折线图
fig = px.line(
    monthly2, x="日期", y="平均日活", markers=True,
    title="月度平均日活（鼠标框选任意区间可放大）",
    labels={"平均日活": "平均日活用户数（人）", "日期": "月份"},
    color_discrete_sequence=[COLORS["blue"]],
)
fig.write_html("_test/ch07/ex_line.html")

# ③ 打印文件大小和行数
print("月度数据行数：", len(monthly2))
print("导出的 HTML 大小：", os.path.getsize("_test/ch07/ex_line.html"), "字节")
```

> 输出：
```text
月度数据行数： 36
导出的 HTML 大小： 4828998 字节
```

**解读（第 ④ 问）**：这个 HTML 有约 **4.8 MB**，但真正的数据只有 36 个月、
`fig.to_json()` 也不过几 KB。**99% 的体积是内嵌的 plotly.js**（那个约 4.6 MB 的
JavaScript 库，负责交互和渲染）。所以：
- 想让文件变小（比如放进 Git 仓库）→ 加 `include_plotlyjs="cdn"`，降到几十 KB；
- 但那样打开时必须联网，发给别人前要确认对方网络能访问 CDN。

> 💡 这里同时演示了一个**容易犯的口径错误**：日活和新增注册都不能直接按月 `sum`。
> **存量指标（用户数、库存、余额）按月取均值，流量指标（新增、销售额、订单数）按月求和。**

### 练习 9 参考答案

```python
# ①②③ 动画气泡图
fig = px.scatter(
    gap, x="gdpPercap", y="lifeExp",
    size="pop", color="continent", hover_name="country",
    animation_frame="year",        # 按年份切帧
    animation_group="country",     # 同一个国家跨帧保持同一个点
    log_x=True, size_max=55,
    range_x=[100, 100000],         # ⭐ 必须固定坐标范围！
    range_y=[25, 90],              #    否则每帧自动缩放，气泡会"忽大忽小地乱跳"
    labels={"gdpPercap": "人均 GDP（美元，对数轴）", "lifeExp": "预期寿命（岁）",
            "pop": "人口", "continent": "大洲"},
    title="Gapminder 动画：1952–2007 各国人均 GDP 与预期寿命",
)
fig.write_html("_test/ch07/ex_animation.html")
print("动画已导出，帧数（年份数）=", gap["year"].nunique(),
      "，每帧国家数 =", int(gap.groupby("year").size().max()))

# ④ 2007 年预期寿命最高 / 最低的国家
g07b = gap[gap["year"] == 2007]
top = g07b.loc[g07b["lifeExp"].idxmax()]
bottom = g07b.loc[g07b["lifeExp"].idxmin()]
print("预期寿命最高：", top["country"], "（", top["continent"], "）", round(top["lifeExp"], 1), "岁")
print("预期寿命最低：", bottom["country"], "（", bottom["continent"], "）", round(bottom["lifeExp"], 1), "岁")

# ⑤ 中国 / 印度 / 美国 2007 年的对比
for c in ["China", "India", "United States"]:
    row = g07b[g07b["country"] == c].iloc[0]
    print(f"{c:<14} 人均GDP {row['gdpPercap']:>9.1f} 美元    预期寿命 {row['lifeExp']:>5.1f} 岁"
          f"    人口 {row['pop'] / 1e6:>7.1f} 百万")
```

> 输出：
```text
动画已导出，帧数（年份数）= 12 ，每帧国家数 = 142
预期寿命最高： Japan （ Asia ） 82.6 岁
预期寿命最低： Swaziland （ Africa ） 39.6 岁
China          人均GDP    4959.1 美元    预期寿命  73.0 岁    人口  1318.7 百万
India          人均GDP    2452.2 美元    预期寿命  64.7 岁    人口  1110.4 百万
United States  人均GDP   42951.7 美元    预期寿命  78.2 岁    人口   301.1 百万
```

**解读（第 ⑤ 问）**：动画里"中国从最左下角冲到中间"对应的是这样一组变化：
1952 年中国人均 GDP 只有几百美元、预期寿命约 44 岁，位于画面最左下角；
到 2007 年人均 GDP 涨到约 **4959 美元**、预期寿命 **73.0 岁**，
气泡从最左下移到了画面中部，而且因为人口超过 13 亿，气泡非常大。
相比之下**印度** 2007 年人均 GDP 约 2452 美元、寿命 64.7 岁，仍然偏左下；
**美国**人均 GDP 约 42957 美元、寿命 78.2 岁，一直在最右侧。
这说明：中国这 55 年的"位置移动"主要靠**人均 GDP 的快速增长**，
而美国的寿命虽然只比中国高 5 岁，人均 GDP 却高出近 9 倍——
再次印证了练习 7 里"变富对健康的边际收益递减"这个结论。

### 练习 10 参考答案

```python
# ① Plotly 版相关系数热力图
fig = px.imshow(
    score_corr,
    text_auto=".2f",
    color_continuous_scale="RdBu_r",
    zmin=-1, zmax=1,                 # 和 Seaborn 版保持一致，颜色含义才相同
    aspect="auto",
    title="学生成绩相关系数（Plotly 交互版：悬停看精确值）",
    labels=dict(color="相关系数"),
)
fig.update_xaxes(tickangle=-30)      # 中文列名较长，转一下角度
fig.write_html("_test/ch07/ex_imshow.html")

# ② 打印文件大小
print("ex_imshow.html 大小：", os.path.getsize("_test/ch07/ex_imshow.html"), "字节")
print("相关系数矩阵里有", score_corr.size, "个数字（6 × 6）")
```

> 输出：
```text
Figure({
    'data': [{'coloraxis': 'coloraxis',
              'hovertemplate': 'x: %{x}<br>y: %{y}<br>相关系数: %{z}<extra></extra>',
              'name': '0',
              'texttemplate': '%{z:.2f}',
              'type': 'heatmap',
              'x': array(['每周自习小时', '高考数学分', '期中成绩', '期末成绩', '平时作业分', '总评成绩'], dtype=object),
              'xaxis': 'x',
              'y': array(['每周自习小时', '高考数学分', '期中成绩', '期末成绩', '平时作业分', '总评成绩'], dtype=object),
              'yaxis': 'y',
              'z': {'bdata': ('AAAAAAAA8D+OggFvhQayP2QYYSR9Md' ... 'CDyYMy5T+tZjc7PCm4PwAAAAAAAPA/'),
                    'dtype': 'f8',
                    'shape': '6, 6'}}],
    'layout': {'coloraxis': {'autocolorscale': False,
                             'cmax': 1,
                             'cmin': -1,
                             'colorbar': {'title': {'text': '相关系数'}},
                             'colorscale': [[0.0, 'rgb(5,48,97)'], [0.1,
                                            'rgb(33,102,172)'], [0.2,
                                            'rgb(67,147,195)'], [0.3,
                                            'rgb(146,197,222)'], [0.4,
                                            'rgb(209,229,240)'], [0.5,
                                            'rgb(247,247,247)'], [0.6,
                                            'rgb(253,219,199)'], [0.7,
                                            'rgb(244,165,130)'], [0.8,
                                            'rgb(214,96,77)'], [0.9,
                                            'rgb(178,24,43)'], [1.0,
                                            'rgb(103,0,31)']]},
               'template': '...',
               'title': {'text': '学生成绩相关系数（Plotly 交互版：悬停看精确值）'},
               'xaxis': {'anchor': 'y', 'domain': [0.0, 1.0], 'tickangle': -30},
               'yaxis': {'anchor': 'x', 'autorange': 'reversed', 'domain': [0.0, 1.0]}}
})
ex_imshow.html 大小： 4828602 字节
相关系数矩阵里有 36 个数字（6 × 6）
```

**解读（第 ② 问）**——两个版本各自的优势：

| 维度 | Seaborn `sns.heatmap` | Plotly `px.imshow` |
|---|---|---|
| 交互 | ❌ 静态图片 | ✅ 悬停显示精确值、可框选缩放 |
| 出图速度 | 快 | 慢一点（要生成网页） |
| 精细标注 | ✅ 支持 `mask`、`linewidths`、自定义色条 | 一般，`mask` 要自己传数组 |
| 放进 Word/论文 | ✅ 直接插图片 | ⚠️ 要先装 kaleido 导出 PNG |
| 分享给别人 | 发图片 | 发 HTML，双击就能自己玩 |
| 集群热力图 | ✅ `sns.clustermap` 独有 | ❌ 没有对应功能 |

**结论**：**自己看和写报告用 Seaborn 版**（快、能进 Word、能加 mask）；
**要给不懂代码的人演示、或者图里数值很多需要精确读数时用 Plotly 版**。
两个都留着并不浪费——它们表达的是同一份信息，只是服务不同的场景。

---

> 🎯 **本章到此结束。** 下一章（08 机器学习入门）会用到本章的很多图：
> 混淆矩阵用 `sns.heatmap`、特征重要性用 `sns.barplot`、
> 预测值与真实值的关系用 `sns.regplot`——
> 绘图能力是机器学习的"眼睛"，看不到数据就没法判断模型好不好。


