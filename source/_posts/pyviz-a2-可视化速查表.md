---
title: 附录 A2 · 可视化速查表
date: 2026-09-26 10:00:00
permalink: /pyviz/a2-viz-cheatsheet/
series: pyviz
chapter: 102
desc: 各类图表的适用场景与代码片段
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- 速查表
keywords: Python 数据分析, 数据可视化, 附录 A2 · 可视化速查表, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 附录 A2 · 可视化速查表
toc: true
comments: true
---
> 适用环境：matplotlib **3.11.2** / seaborn **0.13.2** / plotly **7.1.0** / pandas 3.0.6
> 本机实测可用的中文字体：`Microsoft YaHei`（首选）、`SimHei`、`SimSun`、`DengXian`、`KaiTi`、`FangSong`
> 所有例子都用 `../data/` 里的真实数据，**复制就能跑**。

---

## A2.0 开工先做这三件事

```python
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# 第 ① 件：中文字体两行（缺第二行，负号会变成方块）
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False

# 第 ② 件：让 pandas 打印对齐
pd.set_option("display.unicode.east_asian_width", True)

# 第 ③ 件：加载教程统一绘图风格（在 code 目录里启动才有这个文件）
import sys
sys.path.insert(0, ".")
from viz_style import setup, save, COLORS, PALETTE

font = setup()          # 一次性配好中文字体、配色、网格、字号
print("选中的中文字体:", font)
```

> 输出：
```text
选中的中文字体: Microsoft YaHei
```

```python
# 后面所有例子都用这几个数据
df = pd.read_csv("../data/sales_clean.csv", parse_dates=["订单日期"])
ts = pd.read_csv("../data/timeseries.csv", parse_dates=["日期"]).set_index("日期")
gap = pd.read_csv("../data/gapminder.csv")
print(df.shape, ts.shape, gap.shape)
```

> 输出：
```text
(1064, 14) (1096, 3) (1704, 6)
```

### A2.0.1 中文字体配置（四种场景，照着抄）

| 场景 | 写法 |
|---|---|
| 纯 matplotlib（最常用） | `plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]` + `plt.rcParams["axes.unicode_minus"] = False` |
| 想用黑体 | `plt.rcParams["font.sans-serif"] = ["SimHei"]`（第二行一样要写） |
| seaborn | `sns.set_theme(style="whitegrid", font="Microsoft YaHei")`，**必须同时** `plt.rcParams["axes.unicode_minus"] = False` |
| 单个元素临时指定字体 | `ax.set_title("中文", fontproperties=my_font)`，其中 `my_font = FontProperties(fname=r"C:\Windows\Fonts\msyh.ttc")` |

```python
# 不知道本机有哪些中文字体可用？这样查
from matplotlib import font_manager as fm
available = sorted({f.name for f in fm.fontManager.ttflist})
for name in ["Microsoft YaHei", "SimHei", "SimSun", "DengXian", "KaiTi", "FangSong"]:
    print(name, "->", "可用" if name in available else "不可用")
```

> 输出：
```text
Microsoft YaHei -> 可用
SimHei -> 可用
SimSun -> 可用
DengXian -> 可用
KaiTi -> 可用
FangSong -> 可用
```

```python
# 临时用某个字体文件（不想改全局配置时）
from matplotlib.font_manager import FontProperties
my_font = FontProperties(fname=r"C:\Windows\Fonts\msyh.ttc")
fig, ax = plt.subplots(figsize=(4, 3))
ax.set_title("换个字体画中文", fontproperties=my_font)
ax.plot([1, 2, 3], [1, 4, 9])
print("my_font 名称:", my_font.get_name())
plt.close(fig)
```

> 输出：
```text
my_font 名称: Microsoft YaHei
```

---

## A2.1 图表选型决策表

**先看你的数据是什么，再决定画什么图。**

| 你想表达 | 变量个数 | 数据形态 | 选它 | 不要用 |
|---|---|---|---|---|
| 谁大谁小（比较） | 1 分类 + 1 数值 | 类别 ≤ 8 个 | **水平柱状图**（`barh`，排序后） | 饼图、3D 柱状图 |
| 排名 | 1 分类 + 1 数值 | 类别多、名字长 | **水平柱状图**（`barh` + 排序） | 垂直柱状图（标签会重叠） |
| 构成占比 | 1 分类 + 1 数值 | 类别 ≤ 5 个 | **堆积柱状图 / 环形图** | **饼图超过 5 类** |
| 随时间变化 | 时间 + 1 数值 | 连续时间 | **折线图**（`plot`） | 柱状图（点太多像噪声） |
| 多组随时间变化 | 时间 + 多数值 | | **折线图**（每条一个颜色 + 图例） | 堆积面积图（难比较） |
| 分布形态 | 1 数值 | 单变量 | **直方图**（`hist`）/ 密度图（`kdeplot`） | 柱状图 |
| 分组分布对比 | 1 分类 + 1 数值 | | **箱线图** / 小提琴图 / 蜂群图 | 只画均值柱状图（会掩盖异常值） |
| 两个变量关系 | 2 数值 | | **散点图**（`scatter`） | 折线图（数据没有顺序） |
| 相关强度 | 多变量两两 | | **热力图**（`heatmap` + 相关系数） | 一张张散点图矩阵（太多） |
| 三维以上关系 | 3~4 变量 | | 散点（颜色/大小编码）、分面、平行坐标 | 3D 散点（会互相遮挡） |
| 部分与整体的时序 | 时间 + 多分组 | | **堆积面积图**（`stackplot`） | 饼图 |
| 不确定范围 | 时间 + 均值 + 上下界 | | **折线 + 误差棒 / `fill_between`** | 只有一条线 |
| 地理分布 | 经纬度 | | 散点图（`scatter`，坐标 = 经纬度） | 饼图 |

### 选型的三条硬规则

1. **饼图不要超过 5 类**。超过 5 类人眼无法比较扇区角度，直接换排序后的水平柱状图。
2. **柱状图的纵轴尽量从 0 开始**。截断纵轴会放大差距，是常见的误导性图表。
3. **分类超过 8 个就排序 + 水平摆放**，否则 x 轴标签会挤成一团。

```python
# 反例演示：8 个城市用饼图 —— 谁大谁小根本看不出来
# （这不算错误，但属于"能画出来但读不出来"的典型）
vc = df.groupby("城市")["销售额"].sum().sort_values(ascending=False)
print("城市数:", len(vc), "| 最大与最小之比:",
      round(float(vc.iloc[0] / vc.iloc[-1]), 1))
```

> 输出：
```text
城市数: 8 | 最大与最小之比: 5.1
```

---

## A2.2 Matplotlib 核心用法

### A2.2.1 `plt.subplots` 参数表

```python
fig, axes = plt.subplots(2, 2, figsize=(10, 7),
                         sharex=False, sharey=False,
                         gridspec_kw={"height_ratios": [2, 1]})
axes[0][0].set_title("左上")
axes[1][1].set_title("右下")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_sub.png", dpi=110)
print(type(fig).__name__, type(axes).__name__, axes.shape)
plt.close(fig)
```

> 输出：
```text
Figure ndarray (2, 2)
```

| 参数 | 含义 | 常用取值 |
|---|---|---|
| `nrows` / `ncols` | 几行几列子图 | `2, 2` |
| `figsize=(宽, 高)` | 整张图尺寸，**单位英寸**（1 英寸 ≈ 2.54 cm） | `(12, 6)`、`(6, 4)` |
| `sharex` / `sharey` | 是否共享 x / y 轴（省空间、便于比较） | `True`、`"col"`、`"row"` |
| `squeeze` | 只有一个子图时是否返回单对象而不是数组 | 默认 `True`，子图多时无所谓 |
| `width_ratios` / `height_ratios` | 各列 / 各行宽度比例（放 `gridspec_kw` 里） | `{"width_ratios": [2, 1]}` |
| `subplot_kw` | 传给每个子图的参数 | `{"projection": "3d"}` |
| `gridspec_kw` | 传给 GridSpec 的参数 | `{"wspace": .3, "hspace": .4}` |
| `dpi` | 图片分辨率 | `100`、`110` |

> 💡 `subplots(2, 2)` 返回的 `axes` 是**二维数组**，用 `axes[0][1]` 取；
> `subplots(1, 3)` 返回一维数组，用 `axes[1]` 取；
> `subplots()` 只画一张图时返回单个 `Axes`，直接写 `ax.`。
> 分不清就 `print(type(axes), getattr(axes, "shape", ""))` 看一眼。

```python
# 只有一个子图时，squeeze 的影响
fig1, ax1 = plt.subplots()                     # 返回单个 Axes，可以直接 ax1.plot
print("单子图:", type(ax1).__name__)
fig2, axes2 = plt.subplots(1, 2)               # 一维数组
print("一行两列:", type(axes2).__name__, axes2.shape)
fig3, axes3 = plt.subplots(2, 2)               # 二维数组
print("两行两列:", type(axes3).__name__, axes3.shape)
plt.close("all")
```

> 输出：
```text
单子图: Axes
一行两列: ndarray (2,)
两行两列: ndarray (2, 2)
```

用 `gridspec` 做不规则排版：

```python
import matplotlib.gridspec as gridspec

fig = plt.figure(figsize=(8, 5))
gs = gridspec.GridSpec(2, 3, figure=fig)
ax_a = fig.add_subplot(gs[0, :])       # 第一行占满 3 列
ax_b = fig.add_subplot(gs[1, 0])       # 第二行第 1 列
ax_c = fig.add_subplot(gs[1, 1:])      # 第二行后 2 列
print("三个子图:", [type(a).__name__ for a in (ax_a, ax_b, ax_c)])
plt.close(fig)
```

> 输出：
```text
三个子图: ['Axes', 'Axes', 'Axes']
```

### A2.2.2 常用 `ax.*` 绘图方法全表

| 方法 | 画什么 | 最该记的参数 |
|---|---|---|
| `ax.plot(x, y)` | 折线图 | `marker="o"`、`lw=2`、`ls="--"`、`color=`、`label=` |
| `ax.scatter(x, y)` | 散点图 | `s=大小`、`c=颜色/颜色数组`、`alpha=透明度`、`cmap=` |
| `ax.bar(x, height)` | 垂直柱状图 | `width=`、`color=`、`edgecolor=` |
| `ax.barh(y, width)` | 水平柱状图 | 配 `ax.invert_yaxis()` 让最大值在上面 |
| `ax.hist(x, bins=)` | 直方图 | `bins=20`、`density=True`（转成密度）、`cumulative=True` |
| `ax.boxplot(x)` | 箱线图 | `vert=False`（3.11 起建议用 `orientation="horizontal"`）、`patch_artist=True` |
| `ax.violinplot(x)` | 小提琴图 | `showmeans=True`、`showmedians=True` |
| `ax.pie(x)` | 饼图 | `labels=`、`autopct="%1.1f%%"`、`startangle=90`、`colors=` |
| `ax.stackplot(x, y1, y2)` | 堆积面积图 | `colors=`、`labels=` |
| `ax.imshow(Z)` | 矩阵热力图 | `cmap=`、`aspect="auto"`，配 `fig.colorbar(im, ax=ax)` |
| `ax.errorbar(x, y, yerr=)` | 带误差棒的折线/散点 | `capsize=4`、`fmt="o"` |
| `ax.fill_between(x, y1, y2)` | 两条线之间填色 | `alpha=.2`、`where=条件` |
| `ax.axhline(y)` | 水平参考线 | `ls="--"`、`color=`、`label=` |
| `ax.axvline(x)` | 垂直参考线 | 同上 |
| `ax.axhspan(y1, y2)` | 水平色带 | `alpha=.1` |
| `ax.annotate(文字, xy=, xytext=)` | 带箭头的注释 | `arrowprops=dict(arrowstyle="->")`、`textcoords="offset points"` |
| `ax.text(x, y, 文字)` | 普通文字标注 | `fontsize=`、`ha=`、`va=` |
| `ax.legend()` | 图例 | `loc="upper right"`、`ncol=2`、`frameon=False` |
| `ax.pcolormesh()` / `ax.contourf()` | 网格/等高线图 | 空间数据用 |
| `ax.stem()` / `ax.step()` | 火柴杆图 / 阶梯图 | 离散事件用 |

常用 `set_*` 方法：

| 方法 | 作用 | 例子 |
|---|---|---|
| `set_title()` | 子图标题 | `ax.set_title("销售额趋势", fontsize=14)` |
| `set_xlabel()` / `set_ylabel()` | 轴标题（**永远不要省**） | `ax.set_ylabel("销售额（元）")` |
| `set_xlim()` / `set_ylim()` | 轴范围 | `ax.set_ylim(0, 60000)` |
| `set_xticks()` / `set_yticks()` | 刻度位置 | `ax.set_xticks([0, 3, 6, 9])` |
| `set_xticklabels()` | 刻度文字 | `ax.set_xticklabels(["一","二","三"], rotation=30)` |
| `set_xscale()` / `set_yscale()` | 轴刻度类型 | `ax.set_yscale("log")` |
| `set_axisbelow()` | 网格画在数据下面 | `ax.set_axisbelow(True)` |
| `set_facecolor()` | 背景色 | `ax.set_facecolor("#f7f7f7")` |
| `set_prop_cycle()` | 颜色循环 | `ax.set_prop_cycle(color=PALETTE)` |
| `grid()` | 网格 | `ax.grid(True, alpha=.3, ls="--")` |
| `tick_params()` | 刻度样式 | `ax.tick_params(axis="x", rotation=45, labelsize=9)` |
| `spines[...].set_visible(False)` | 去掉边框 | `ax.spines["top"].set_visible(False)` |

```python
# 把常用方法一次演示完，并存成图
fig, axes = plt.subplots(2, 3, figsize=(14, 7.5))

# ① 折线图 + 标记
axes[0][0].plot(ts.index, ts["每日活跃用户"], color=COLORS["blue"], lw=1)
axes[0][0].set_title("折线图 plot")
axes[0][0].set_xlabel("日期"); axes[0][0].set_ylabel("人数")

# ② 散点图（s 控制点大小，alpha 控制透明度，解决点重叠）
axes[0][1].scatter(df["单价"], df["销售额"], s=8, alpha=.4, color=COLORS["orange"])
axes[0][1].set_title("散点图 scatter")
axes[0][1].set_xlabel("单价"); axes[0][1].set_ylabel("销售额")

# ③ 直方图（bins 决定柱子数量，numpy 会动手调）
axes[0][2].hist(df["客户年龄"].dropna(), bins=20, color=COLORS["green"],
                edgecolor="white")
axes[0][2].set_title("直方图 hist")
axes[0][2].set_xlabel("客户年龄")

# ④ 柱状图 + 排序（比按字母顺序好看得多）
vc = df["城市"].value_counts()
axes[1][0].bar(vc.index, vc.values, color=COLORS["blue"])
axes[1][0].set_title("柱状图 bar")
axes[1][0].tick_params(axis="x", rotation=30)

# ⑤ 水平柱状图（类别名长时首选）
top = df.groupby("城市")["销售额"].sum().sort_values().tail(5)
axes[1][1].barh(top.index, top.values, color=COLORS["purple"])
axes[1][1].set_title("水平柱状图 barh")
axes[1][1].set_xlabel("销售额（元）")

# ⑥ 箱线图（一图看分布：中位数、四分位、异常值）
axes[1][2].boxplot([df["销售额"].clip(upper=5000), df["单价"] * 10],
                   tick_labels=["销售额", "单价×10"])     # 3.9+ 用 tick_labels
axes[1][2].set_title("箱线图 boxplot")

fig.suptitle("六种基础图表", fontsize=15)
fig.tight_layout()
fig.savefig("_test/appendix/_a2_six.png", dpi=100, bbox_inches="tight")
print("已保存 _a2_six.png，块数:", len(axes.ravel()))
plt.close(fig)
```

> 输出：
```text
已保存 _a2_six.png，块数: 6
```

```python
# 参考线、标注、填充：把一张图讲清楚的三件套
fig, ax = plt.subplots(figsize=(7, 4))
monthly = ts["每日活跃用户"].resample("ME").mean()
ax.plot(monthly.index, monthly.values, marker="o", color=COLORS["blue"], label="月均活跃")
ax.axhline(monthly.mean(), ls="--", color=COLORS["gray"], label="全年均值")
peak = monthly.idxmax()
ax.axvline(peak, ls=":", color=COLORS["red"])
ax.annotate("峰值", xy=(peak, monthly.max()), xytext=(25, 25),
            textcoords="offset points", fontsize=11,
            arrowprops=dict(arrowstyle="->", color=COLORS["red"]))
ax.text(monthly.index[0], monthly.min(), "起点", fontsize=10)
ax.fill_between(monthly.index, monthly.mean(), monthly.values, alpha=.15,
                color=COLORS["blue"])
ax.set_title("折线 + 参考线 + 标注 + 填充")
ax.set_ylabel("日均活跃用户")
ax.legend(loc="upper left")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_annot.png", dpi=110)
print("峰值月份:", peak.strftime("%Y-%m"), "| 均值:", round(float(monthly.mean()), 1))
plt.close(fig)
```

> 输出：
```text
峰值月份: 2024-04 | 均值: 1473.8
```

### A2.2.3 常用 `fig.*` 方法

| 方法 | 作用 | 例子 |
|---|---|---|
| `fig.suptitle()` | 整张图的**大标题**（子图标题用 `ax.set_title`） | `fig.suptitle("2023-2024 运营看板", fontsize=16)` |
| `fig.tight_layout()` | 自动调整间距，防止标签重叠 | `fig.tight_layout()` |
| `fig.subplots_adjust()` | 手动调边距（`tight_layout` 挤不开时用） | `fig.subplots_adjust(top=.85, hspace=.4, wspace=.3)` |
| `fig.savefig()` | 保存 | `fig.savefig("a.png", dpi=150, bbox_inches="tight")` |
| `fig.colorbar(mappable, ax=ax)` | 加颜色条（热力图必需） | `fig.colorbar(im, ax=ax)` |
| `fig.legend()` | 整张图统一的图例 | `fig.legend(handles, labels, loc="lower center", ncol=3)` |
| `fig.set_size_inches()` | 事后改尺寸（seaborn 的 `displot` 等返回图时有用） | `fig.set_size_inches(10, 5)` |
| `fig.add_subplot()` / `fig.add_axes()` | 手动加子图 | 配 `gridspec` 用 |
| `fig.text()` | 在图上任意位置写字 | `fig.text(.5, .02, "数据来源：销售系统", ha="center")` |
| `fig.canvas.draw()` | 强制重绘 | 导出前调一次 |

```python
fig, axes = plt.subplots(1, 2, figsize=(9, 3.5))
axes[0].plot([1, 2, 3], [1, 4, 9], color=COLORS["blue"])
axes[0].bar(["甲", "乙"], [3, 5], color=COLORS["orange"])
axes[1].plot([1, 2, 3], [-1, 0, 1], color=COLORS["green"])
axes[1].set_title("负号测试")
fig.suptitle("总标题用 suptitle", fontsize=14)
# 手动控制边距：top 给总标题留空间
fig.subplots_adjust(left=.08, right=.97, top=.82, bottom=.15, wspace=.35)
fig.text(.5, .02, "数据来源：本教程 data/ 目录", ha="center", fontsize=9,
         color=COLORS["gray"])
fig.savefig("_test/appendix/_a2_fig.png", dpi=110)
print("suptitle:", fig._suptitle.get_text())
plt.close(fig)
```

> 输出：
```text
suptitle: 总标题用 suptitle
```

### A2.2.4 常用 rcParams 全表

```python
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]   # 中文字体 ★必设
plt.rcParams["axes.unicode_minus"] = False              # 负号正常显示 ★必设
plt.rcParams["figure.figsize"] = (8, 4.5)               # 默认图尺寸（英寸）
plt.rcParams["figure.dpi"] = 110                        # 屏幕显示分辨率
plt.rcParams["savefig.dpi"] = 110                       # 保存分辨率（可单独调高）
plt.rcParams["axes.grid"] = True                        # 默认显示网格
plt.rcParams["grid.alpha"] = .3                         # 网格透明度
plt.rcParams["grid.linestyle"] = "--"                   # 网格线型
plt.rcParams["axes.axisbelow"] = True                   # 网格画在数据下面
plt.rcParams["legend.frameon"] = False                  # 图例不要边框
plt.rcParams["axes.prop_cycle"] = plt.cycler(color=PALETTE)   # 默认配色循环
print(plt.rcParams["figure.figsize"], plt.rcParams["axes.unicode_minus"])
```

> 输出：
```text
[8.0, 4.5] False
```

| rcParam | 作用 | 常用值 |
|---|---|---|
| `font.sans-serif` | 无衬线字体列表 | `["Microsoft YaHei", "SimHei"]` |
| `font.family` | 字体族 | `"sans-serif"` |
| `axes.unicode_minus` | 是否用 Unicode 减号 | **`False`**（True 时 SimHei 缺字形变方块） |
| `font.size` | 全局字号 | `12` |
| `axes.titlesize` / `axes.labelsize` | 标题 / 轴标签字号 | `14` / `11` |
| `xtick.labelsize` / `ytick.labelsize` | 刻度字号 | `10` |
| `legend.fontsize` / `legend.frameon` | 图例字号 / 边框 | `10` / `False` |
| `figure.figsize` | 默认画布尺寸 | `(10, 6)` |
| `figure.dpi` / `savefig.dpi` | 显示 / 保存分辨率 | `110` / `200` |
| `figure.facecolor` / `axes.facecolor` | 画布 / 绘图区背景色 | `"white"` |
| `savefig.bbox` | 保存时是否紧裁 | `"tight"` |
| `savefig.format` | 默认保存格式 | `"png"` |
| `axes.grid` / `grid.alpha` / `grid.linestyle` | 网格 | `True` / `.3` / `"--"` |
| `axes.axisbelow` | 网格层级 | `True` |
| `axes.spines.top` / `axes.spines.right` | 上/右边框是否显示 | `False`（简洁风） |
| `axes.prop_cycle` | 颜色循环 | `plt.cycler(color=PALETTE)` |
| `lines.linewidth` / `lines.markersize` | 线宽 / 点大小 | `2` / `6` |
| `lines.marker` | 默认标记 | `None`、`"o"` |

查看当前值：`plt.rcParams["savefig.dpi"]`；恢复默认：`plt.rcdefaults()`。

> ⚠️ **顺序陷阱**：`plt.style.use(...)` 和 `sns.set_theme(...)` 会**覆盖** rcParams。
> 所以字体设置要么写在它们**之后**，要么用 `sns.set_theme(font="Microsoft YaHei")` 一次性传进去。
> 详见 A3 手册 D 节。

### A2.2.5 保存图片参数表

| 参数 | 含义 | 该取多少 |
|---|---|---|
| `dpi` | 每英寸点数 | 屏幕预览 `100~110`；报告/PPT `150~200`；印刷 `300` |
| `bbox_inches="tight"` | 裁掉四周空白 | **强烈建议总开着**，否则标题/标签容易被切掉 |
| `pad_inches` | 紧裁后额外留白 | `0.1`（默认）；要贴边写 `0.02` |
| `format` | 输出格式 | 一般靠扩展名自动判断 |
| `transparent=True` | 背景透明 | 做 PPT 叠加时用 |
| `facecolor` | 背景色 | `"white"`（默认 `"auto"`，深色主题下会存成深色） |
| `metadata` | 写入作者等信息 | `{"Author": "你的名字"}`（PDF 用） |

| 格式 | 适合 | 不适合 | 特点 |
|---|---|---|---|
| `PNG` | 报告、PPT、网页 | 印刷放大 | 无损、体积适中、支持透明 |
| `SVG` | 论文、网页矢量图 | 太大太慢 | 无限放大不失真，可用代码改 |
| `PDF` | LaTeX 论文、印刷 | 预览不便 | 矢量、可嵌字体 |
| `JPG` | 照片 | 图表（线条会有毛刺） | 有损压缩 |

```python
import os
fig, ax = plt.subplots(figsize=(5, 3))
ax.bar(["A", "B", "C"], [3, 5, 4], color=COLORS["blue"])
ax.set_title("DPI 与格式对比")
for d in (60, 110, 200, 300):
    fig.savefig(f"_test/appendix/_a2_dpi{d}.png", dpi=d, bbox_inches="tight")
for ext in ("png", "svg", "pdf", "jpg"):
    fig.savefig(f"_test/appendix/_a2_fmt.{ext}", dpi=110, bbox_inches="tight")
print({d: os.path.getsize(f"_test/appendix/_a2_dpi{d}.png") for d in (60, 110, 200, 300)})
print({e: os.path.getsize(f"_test/appendix/_a2_fmt.{e}") for e in ("png", "svg", "pdf", "jpg")})
plt.close(fig)
```

> 输出：
```text
{60: 4064, 110: 8963, 200: 16668, 300: 25218}
{'png': 8963, 'svg': 17052, 'pdf': 10175, 'jpg': 11342}
```

> ⚠️ **顺序陷阱（最常见的"图是空白"）**
> `plt.show()` 之后再 `fig.savefig(...)`，保存出来的会是空白图。
> 正确顺序永远是：**先 `savefig`（或 `save(fig, ...)`），再 `plt.show()`，最后 `plt.close(fig)`**。
> 详见 A3 手册 D 节。

### A2.2.6 其它实用技巧

```python
# ① 对数坐标：数据跨好几个数量级时
fig, axes = plt.subplots(1, 2, figsize=(9, 3.5))
axes[0].hist(gap["gdpPercap"], bins=30, color=COLORS["blue"])
axes[0].set_title("原始（右偏严重）")
axes[1].hist(gap["gdpPercap"], bins=30, color=COLORS["green"])
axes[1].set_xscale("log")
axes[1].set_title("对数坐标（看得清了）")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_log.png", dpi=100)
print("偏度:", round(float(gap["gdpPercap"].skew()), 2))
plt.close(fig)
```

> 输出：
```text
偏度: 3.85
```

```python
# ② 双 y 轴：两个量纲差距很大的指标画一起（谨慎用，容易误导）
fig, ax1 = plt.subplots(figsize=(7, 4))
m = ts.resample("ME").agg(活跃=("每日活跃用户", "mean"), 时长=("平均使用时长", "mean"))
ax1.plot(m.index, m["活跃"], color=COLORS["blue"])
ax1.set_ylabel("日均活跃用户", color=COLORS["blue"])
ax2 = ax1.twinx()                      # 共享 x 轴，右侧独立 y 轴
ax2.plot(m.index, m["时长"], color=COLORS["red"])
ax2.set_ylabel("平均使用时长（分钟）", color=COLORS["red"])
ax1.set_title("双 y 轴示例")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_twin.png", dpi=110)
print("两列相关系数:", round(float(m["活跃"].corr(m["时长"])), 3))
plt.close(fig)
```

> 输出：
```text
两列相关系数: -0.04
```

```python
# ③ 3D 图（能画，但多数场景 2D 更好读）
fig = plt.figure(figsize=(5, 4))
ax3d = fig.add_subplot(111, projection="3d")
sub = df.sample(300, random_state=0)
ax3d.scatter(sub["单价"], sub["数量"], sub["销售额"], s=8,
             c=sub["销售额"], cmap="viridis")
ax3d.set_xlabel("单价"); ax3d.set_ylabel("数量"); ax3d.set_zlabel("销售额")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_3d.png", dpi=100)
print("3D 图已保存")
plt.close(fig)
```

> 输出：
```text
3D 图已保存
```

```python
# ④ 画完记得关掉：不关会累积警告并吃内存
for _ in range(5):
    f, a = plt.subplots()
plt.close("all")
print("剩余打开的图:", plt.get_fignums())
```

> 输出：
```text
剩余打开的图: []
```

---

## A2.3 Seaborn：一行一张统计图

### A2.3.1 `sns.set_theme` 参数表

```python
import seaborn as sns

sns.set_theme(style="whitegrid",            # 背景风格
              context="notebook",           # 元素尺寸
              palette="colorblind",         # 配色
              font="Microsoft YaHei",       # 中文字体 ★关键
              font_scale=1.0,               # 字号缩放
              rc={"axes.unicode_minus": False})   # 负号 ★关键
print("字体族:", plt.rcParams["font.family"])
sns.set_theme(style="whitegrid", font="Microsoft YaHei",
              rc={"axes.unicode_minus": False})   # 恢复教程统一风格
```

> 输出：
```text
字体族: ['Microsoft YaHei']
```

| 参数 | 可选值 | 说明 |
|---|---|---|
| `style` | `"white"` / `"whitegrid"`（推荐）/ `"dark"` / `"darkgrid"` / `"ticks"` | 背景和网格 |
| `context` | `"paper"` / `"notebook"`（默认）/ `"talk"` / `"poster"` | 整体元素尺寸，做汇报用 `"talk"` |
| `palette` | `"deep"` / `"muted"` / `"pastel"` / `"bright"` / `"dark"` / `"colorblind"` / 色带名 | 配色 |
| `font` | `"Microsoft YaHei"` / `"SimHei"` / `"sans-serif"` | 字体 ★中文必填 |
| `font_scale` | `1.0` / `1.3` / `1.5` | 字号缩放 |
| `color_codes` | `True`（默认） | 允许 `"b"`、`"r"` 这种短颜色名 |
| `rc` | 字典 | 覆盖任意 rcParams，中文负号就靠它 |

> 💡 `set_theme` 是**全局**的：调用一次后面所有图都生效。
> 但它也会把 `font.sans-serif` 重置成 `Arial` —— 这正是很多人"设了字体还是方块"的原因，
> 因为 `sns.set_theme(font="Microsoft YaHei")` 改的是 `font.family`，不是 `font.sans-serif`。
> **最保险的写法：`set_theme(font=...)` 和 `plt.rcParams["font.sans-serif"]` 两个都设。**

### A2.3.2 Seaborn 函数总表

| 函数 | 画什么 | 关键参数 |
|---|---|---|
| `sns.scatterplot(data, x, y)` | 散点图 | `hue=`（颜色分组）、`size=`、`style=`、`alpha=`、`s=` |
| `sns.lineplot(data, x, y)` | 折线图（**自动带置信区间**） | `hue=`、`errorbar=None`（关掉阴影）、`estimator="mean"` |
| `sns.relplot(data, x, y)` | 关系图（figure 级，可分面） | `kind="scatter"/"line"`、`col=`、`row=`、`col_wrap=`、`height=`、`aspect=` |
| `sns.histplot(data, x)` | 直方图 | `bins=`、`kde=True`、`hue=`、`multiple="stack"/"dodge"`、`stat="density"` |
| `sns.kdeplot(data, x)` | 核密度曲线 | `fill=True`、`bw_adjust=`（平滑程度）、`hue=` |
| `sns.ecdfplot(data, x)` | 累积分布曲线 | 看"低于某值占多少比例" |
| `sns.rugplot(data, x)` | 轴上的小刻度（数据点分布） | 常配合其它图 |
| `sns.displot(data, x)` | figure 级分布图（可分面） | `kind="hist"/"kde"/"ecdf"`、`col=`、`kde=True` |
| `sns.boxplot(data, x, y)` | 箱线图 | `hue=`、`orient=`、`showfliers=False`（隐藏异常点） |
| `sns.violinplot(data, x, y)` | 小提琴图 | `inner="quart"/"box"/"point"/"stick"/None`、`split=True`（左右对比）、`bw_adjust=` |
| `sns.boxenplot(data, x, y)` | 增强箱线图（大数据更合适） | 展示更多分位数 |
| `sns.stripplot(data, x, y)` | 散点条带图（每点都画） | `jitter=True`、`size=3`、`dodge=True` |
| `sns.swarmplot(data, x, y)` | 蜂群图（点不重叠） | 数据量大时会很慢 |
| `sns.barplot(data, x, y)` | 柱状图（**默认画均值 + 误差棒**） | `estimator="mean"/"sum"`、`errorbar=None`、`ci=`（旧版） |
| `sns.pointplot(data, x, y)` | 点线图（看趋势） | `hue=`、`dodge=` |
| `sns.countplot(data, x)` | 频次柱状图（数个数） | `hue=`、`order=` |
| `sns.catplot(data, x, y)` | figure 级分类图 | `kind="box"/"violin"/"bar"/"strip"/"swarm"/"point"/"count"`、`col=` |
| `sns.regplot(data, x, y)` | 散点 + 回归线 | `ci=None`、`order=2`（多项式）、`logistic=True` |
| `sns.lmplot(data, x, y)` | figure 级回归图（可分组分面） | `hue=`、`col=`、`height=` |
| `sns.residplot(data, x, y)` | 残差图（检查回归假设） | 残差应随机分布 |
| `sns.heatmap(data)` | 热力图（**矩阵数据**） | `annot=True`、`fmt=".2f"`、`cmap=`、`center=0`、`square=True`、`linewidths=.5` |
| `sns.clustermap(data)` | 带聚类的热力图 | 自动重排行列，让相似项挨着 |
| `sns.pairplot(data)` | 散点图矩阵（两两关系） | `hue=`、`height=`、`diag_kind="kde"`、`plot_kws=` |
| `sns.jointplot(data, x, y)` | 联合分布图（散点 + 边缘分布） | `kind="scatter"/"hex"/"kde"/"reg"/"hist"` |
| `sns.FacetGrid(data, col=)` | 分面网格（底层 API） | `g.map(sns.histplot, "列名", bins=20)`、`g.set_titles()` |
| `sns.PairGrid` / `sns.JointGrid` | pairplot / jointplot 的底层版 | 需要自定义时才用 |
| `sns.despine()` | 去掉上右边框 | `sns.despine(ax=ax)` |
| `sns.color_palette(name, n)` | 取一组颜色 | `sns.color_palette("Set2", 5)` |
| `sns.set_palette(name)` | 设置全局配色 | `sns.set_palette("colorblind")` |

```python
# 分布三件套：直方图 / 密度图 / 累积分布
fig, axes = plt.subplots(1, 3, figsize=(13, 3.6))
sns.histplot(data=df, x="销售额", bins=30, kde=True, ax=axes[0], color=COLORS["blue"])
sns.kdeplot(data=df, x="销售额", hue="客户性别", fill=True, ax=axes[1])
sns.ecdfplot(data=df, x="销售额", ax=axes[2], color=COLORS["green"])
axes[0].set_title("直方图 + 密度")
axes[1].set_title("分组密度（fill=True）")
axes[2].set_title("累积分布 ECDF")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_sns_dist.png", dpi=100)
print("三张图完成")
plt.close(fig)
```

> 输出：
```text
三张图完成
```

```python
# 分类对比三件套：箱线图 / 小提琴图 / 柱状图（带误差棒）
fig, axes = plt.subplots(1, 3, figsize=(13, 3.6))
sns.boxplot(data=df, x="商品类别", y="销售额", ax=axes[0], color=COLORS["blue"])
sns.violinplot(data=df, x="商品类别", y="销售额", ax=axes[1],
               color=COLORS["orange"], inner="quart")   # inner 控制内部画什么
sns.barplot(data=df, x="省份区域", y="销售额", estimator="mean",
            errorbar=None, ax=axes[2], color=COLORS["green"])
for a in axes[:2]:
    a.tick_params(axis="x", rotation=20)
axes[0].set_title("箱线图：看分布和异常值")
axes[1].set_title("小提琴图：看分布形状")
axes[2].set_title("柱状图：看均值（errorbar=None 关误差棒）")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_sns_cat.png", dpi=100)
print("中位数对比:", df.groupby("商品类别")["销售额"].median().round(0).to_dict())
plt.close(fig)
```

> 输出：
```text
中位数对比: {'图书文娱': 53.0, '家用电器': 1073.0, '手机数码': 1062.0, '服饰鞋包': 358.0, '食品饮料': 119.0}
```

```python
# 回归与分面：一次看清"两组数据的趋势是不是一样"
g = sns.lmplot(data=df, x="单价", y="销售额", hue="客户性别",
               height=4, aspect=1.4, scatter_kws={"s": 10, "alpha": .4})
g.figure.suptitle("分组回归散点图 lmplot")
g.figure.savefig("_test/appendix/_a2_sns_lm.png", dpi=100, bbox_inches="tight")
print("lmplot 完成")
plt.close("all")
```

> 输出：
```text
lmplot 完成
```

```python
# 两种价格的相关系数：分面图最擅长回答"分组后关系还成立吗"
r = df.groupby("客户性别").apply(
    lambda d: d["单价"].corr(d["销售额"]), include_groups=False)
print(r.round(3).to_dict())
```

> 输出：
```text
{'女': 0.778, '男': 0.725}
```

```python
# 热力图：相关系数矩阵的标准画法
fig, ax = plt.subplots(figsize=(6, 5))
corr = df.corr(numeric_only=True)
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", center=0,
            square=True, linewidths=.5, ax=ax, cbar_kws={"shrink": .8})
ax.set_title("相关系数热力图")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_sns_heat.png", dpi=110)
print("单价~销售额:", round(float(corr.loc["单价", "销售额"]), 3),
      "| 客户年龄~销售额:", round(float(corr.loc["客户年龄", "销售额"]), 3))
plt.close(fig)
```

> 输出：
```text
单价~销售额: 0.746 | 客户年龄~销售额: 0.001
```

```python
# 分面网格 FacetGrid：底层 API，自由度最高
g = sns.FacetGrid(df, col="下单渠道", col_wrap=2, height=2.6, sharey=True)
g.map(sns.histplot, "销售额", bins=20, color=COLORS["blue"])
g.set_titles("{col_name} 渠道")
g.figure.tight_layout()
g.figure.savefig("_test/appendix/_a2_sns_facet.png", dpi=100, bbox_inches="tight")
print("FacetGrid 完成")
plt.close("all")
```

> 输出：
```text
FacetGrid 完成
```

> ⚠️ **`sns.barplot` 的高度是"均值"不是"总和"**！
> 想画总和要写 `estimator="sum"`。默认还带误差棒，讲单一数字时用 `errorbar=None` 关掉。
> 这是 seaborn 最容易被误读的一处默认行为。

---

## A2.4 Plotly：可交互图表

### A2.4.1 `plotly.express` 常用函数

| 函数 | 画什么 | 关键参数 |
|---|---|---|
| `px.scatter` | 散点 / 气泡图 | `size=`（气泡大小）、`color=`、`hover_name=`、`log_x=`、`trendline="ols"` |
| `px.line` | 折线图 | `line_group=`、`markers=True` |
| `px.area` | 面积图 | `groupnorm="percent"` |
| `px.bar` | 柱状图 | `orientation="h"`、`barmode="group"/"stack"`、`text_auto=".3s"` |
| `px.histogram` | 直方图 | `nbins=`、`histnorm="percent"`、`marginal="box"` |
| `px.box` | 箱线图 | `points="all"/"outliers"`、`notched=True` |
| `px.violin` | 小提琴图 | `box=True`、`points="all"` |
| `px.strip` | 条带散点 | `color=` |
| `px.pie` | 饼图 / 环形图 | `hole=.4`（环形）、`names=`、`values=` |
| `px.density_heatmap` | 密度热力图 | `nbinsx=`、`histfunc="avg"` |
| `px.density_contour` | 等高线密度图 | `contours_coloring="fill"` |
| `px.imshow` | 矩阵图 / 图片 | `text_auto=".2f"`、`color_continuous_scale=`、`zmin=`、`zmax=` |
| `px.ecdf` | 累积分布 | `marginal="rug"` |
| `px.scatter_matrix` | 散点图矩阵 | `dimensions=` |
| `px.parallel_coordinates` | 平行坐标（多维对比） | `color=`、`dimensions=` |
| `px.treemap` | 矩形树图（层级占比） | `path=["省","市"]`、`values=` |
| `px.sunburst` | 旭日图（层级占比，环形） | `path=` |
| `px.icicle` | 冰柱图（层级占比，柱状） | `path=` |
| `px.funnel` | 漏斗图（转化率） | `x=`、`y=` |
| `px.timeline` | 甘特图 | `x_start=`、`x_end=`、`y=` |
| `px.choropleth` | 世界/美国地图 | `locations=`、`locationmode=` |
| `px.scatter_3d` | 三维散点 | `z=`、`size=` |
| `px.line_3d` / `px.scatter_polar` | 3D 折线 / 极坐标 | 特殊场景 |
| `px.get_trendline_results(fig)` | 取趋势线拟合结果 | 配合 `trendline="ols"` 看回归系数 |

**`px` 的通用关键参数（几乎所有函数都支持）**

| 参数 | 作用 | 示例 |
|---|---|---|
| `color` | 按某列着色（分类或连续） | `color="商品类别"` |
| `size` | 按某列决定点/柱大小 | `size="pop"` |
| `hover_name` / `hover_data` | 悬停提示显示什么 | `hover_name="country", hover_data=["year"]` |
| `facet_col` / `facet_row` | 分面 | `facet_col="商品类别", facet_col_wrap=3` |
| `animation_frame` / `animation_group` | 动画（按某列逐帧） | `animation_frame="year", animation_group="country"` |
| `log_x` / `log_y` | 对数轴 | `log_x=True`（数据跨数量级时必用） |
| `range_x` / `range_y` | 固定轴范围（做动画时防止抖动） | `range_x=[100, 100000]` |
| `template` | 主题 | `"plotly_white"`（报告）/ `"plotly_dark"`（大屏）/ `"simple_white"` |
| `title` / `labels` | 标题 / 轴名映射 | `labels={"gdpPercap": "人均GDP"}` |
| `text` / `text_auto` | 柱子上直接标数值 | `text_auto=".3s"` |
| `color_discrete_sequence` | 自定义分类配色 | `color_discrete_sequence=PALETTE` |
| `color_continuous_scale` | 自定义连续色带 | `color_continuous_scale="Viridis"` |
| `opacity` | 透明度 | `opacity=.7` |
| `width` / `height` | 尺寸（像素） | `height=500` |

```python
import plotly.express as px

# 气泡散点：颜色=大洲，大小=人口，对数 x 轴，悬停显示国名
d2007 = gap[gap["year"] == 2007]
fig = px.scatter(d2007, x="gdpPercap", y="lifeExp", size="pop", color="continent",
                 hover_name="country", log_x=True, template="plotly_white",
                 labels={"gdpPercap": "人均GDP", "lifeExp": "预期寿命"},
                 title="2007 年各国人均 GDP 与预期寿命")
fig.write_html("_test/appendix/_a2_px_scatter.html")
print("气泡散点:", len(d2007), "个国家")
```

> 输出：
```text
气泡散点: 142 个国家
```

```python
# 动画散点：按年份逐帧播放（gapminder 是经典演示数据）
fig2 = px.scatter(gap, x="gdpPercap", y="lifeExp", size="pop", color="continent",
                  animation_frame="year", animation_group="country", log_x=True,
                  range_x=[100, 100000], range_y=[25, 90],
                  title="1952-2007 各国发展动画")
fig2.write_html("_test/appendix/_a2_px_anim.html")
print("动画帧数:", len(gap["year"].unique()))
```

> 输出：
```text
动画帧数: 12
```

```python
# 分面直方图 + 水平条形图（报告里最常用的两种）
g = df.groupby("省份区域", as_index=False)["销售额"].sum().sort_values("销售额")
fig3 = px.bar(g, x="销售额", y="省份区域", orientation="h",
              text_auto=".3s", template="plotly_white",
              title="各区域销售额")
fig3.write_html("_test/appendix/_a2_px_bar.html")
print(g.set_index("省份区域")["销售额"].round(0).to_dict())
```

> 输出：
```text
{'西北': 83828.0, '华中': 106734.0, '西南': 130823.0, '华北': 324090.0, '华东': 437016.0, '华南': 509605.0}
```

```python
# imshow 画相关系数矩阵：plotly 版热力图
corr = df.corr(numeric_only=True)
fig4 = px.imshow(corr, text_auto=".2f", color_continuous_scale="RdBu_r",
                 zmin=-1, zmax=1, title="相关系数矩阵")
fig4.write_html("_test/appendix/_a2_px_heat.html")
print("矩阵大小:", corr.shape)
```

> 输出：
```text
矩阵大小: (5, 5)
```

> ⚠️ **Plotly 导出静态图片需要额外装 `kaleido`（本机没装）**
> 所以本教程一律用 `fig.write_html("xxx.html")` —— 双击就能在浏览器里打开，
> 还能缩放、悬停、点图例隐藏系列。装图片导出：
> `pip install kaleido` 之后 `fig.write_image("x.png", scale=2)`。

---

## A2.5 配色方案速查

### A2.5.1 教程统一配色：`viz_style.py` 的 `COLORS` / `PALETTE`

```python
from viz_style import COLORS, PALETTE
print(COLORS)
print(PALETTE)
```

> 输出：
```text
{'blue': '#4C72B0', 'orange': '#DD8452', 'green': '#55A868', 'red': '#C44E52', 'purple': '#8172B3', 'brown':
   '#937860', 'pink': '#DA8BC3', 'gray': '#8C8C8C', 'yellow': '#CCB974', 'cyan': '#64B5CD'}
['#4C72B0', '#DD8452', '#55A868', '#C44E52', '#8172B3', '#937860', '#DA8BC3', '#8C8C8C']
```

| 名字 | 色值 | 适合 |
|---|---|---|
| `COLORS["blue"]` | `#4C72B0` | 主色，最常用（单系列图默认用它） |
| `COLORS["orange"]` | `#DD8452` | 第二系列 / 对比色 |
| `COLORS["green"]` | `#55A868` | 正向指标（增长、达标） |
| `COLORS["red"]` | `#C44E52` | 负向指标 / 重点标注 |
| `COLORS["purple"]` | `#8172B3` | 第三、第四系列 |
| `COLORS["gray"]` | `#8C8C8C` | 参考线、辅助信息、次要系列 |
| `PALETTE` | 一组 8 色 | 需要多系列时按顺序取，`PALETTE[:3]` |

### A2.5.2 三种色带（cmap）该怎么选

```python
# 教程约定的三条色带
CMAP_SEQ = "viridis"     # 连续型：单调递增亮度，色盲友好、打印黑白也能分
CMAP_DIV = "RdBu_r"      # 发散型：有"中心值"（通常是 0）时用
CMAP_CAT = "Set2"        # 分类型：类别不多、要互相区分时用
fig, axes = plt.subplots(1, 3, figsize=(12, 3))
data = np.random.default_rng(0).random((8, 8))
for ax, cmap in zip(axes, [CMAP_SEQ, CMAP_DIV, CMAP_CAT]):
    im = ax.imshow(data, cmap=cmap)
    ax.set_title(cmap)
    fig.colorbar(im, ax=ax)
fig.tight_layout()
fig.savefig("_test/appendix/_a2_cmap.png", dpi=100)
print(CMAP_SEQ, CMAP_DIV, CMAP_CAT)
plt.close(fig)
```

> 输出：
```text
viridis RdBu_r Set2
```

| 场景 | 推荐 | 为什么 |
|---|---|---|
| 连续数值（金额、温度、密度） | `"viridis"` / `"Blues"` / `"rocket"` / `"mako"` / `"crest"` | 亮度单调变化，人眼能排序 |
| 有正负、以 0 为中心（相关系数、涨跌） | `"RdBu_r"` / `"coolwarm"` / `"vlag"` / `"icefire"` | 两头异色、中间白，`center=0` |
| 分类数据（5~8 类） | `"Set2"` / `"tab10"` / `"colorblind"` / `"deep"` | 颜色差异大、不混淆 |
| 色盲友好 | `"colorblind"` / `"viridis"` / `"cividis"` | 红绿色盲也能区分 |
| 打印成黑白报告 | `"viridis"` / `"Greys"` | 亮度差异在灰度下依然可见 |

```python
# 看一眼几套配色的实际色值
import seaborn as sns
pals = {}
for name in ["colorblind", "Set2", "deep", "tab10"]:
    pals[name] = [plt.matplotlib.colors.to_hex(c) for c in sns.color_palette(name, 4)]
print(pals["colorblind"])
print(pals["Set2"])
plt.close("all")
```

> 输出：
```text
['#0173b2', '#de8f05', '#029e73', '#d55e00']
['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3']
```

### A2.5.3 具名颜色与十六进制

```python
from matplotlib import colors as mcolors

print("基本色:", sorted(mcolors.BASE_COLORS))          # 极简短名
print("Tableau:", sorted(mcolors.TABLEAU_COLORS)[:4])   # matplotlib 默认循环色
print("CSS4 色总数:", len(mcolors.CSS4_COLORS))          # 148 个具名色
print([c for c in ["steelblue", "tomato", "gold", "teal", "crimson",
                   "salmon", "skyblue"] if c in mcolors.CSS4_COLORS])
```

> 输出：
```text
基本色: ['b', 'c', 'g', 'k', 'm', 'r', 'w', 'y']
Tableau: ['tab:blue', 'tab:brown', 'tab:cyan', 'tab:gray']
CSS4 色总数: 148
['steelblue', 'tomato', 'gold', 'teal', 'crimson', 'salmon', 'skyblue']
```

三种写颜色（`color=`）的方式：具名 `"steelblue"`、十六进制 `"#4C72B0"`、灰度字符串 `"0.7"`（0 黑 ~ 1 白）。

---

## A2.6 常见图表"改进前后"对照

### 对照 1：默认饼图 → 排序后的水平柱状图

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 3.8))

# 改进前：饼图，扇区顺序按字母/出现顺序，读者要来回看图例
vc = df["支付方式"].value_counts()
axes[0].pie(vc.values, labels=vc.index, autopct="%1.1f%%", colors=PALETTE[:len(vc)])
axes[0].set_title("改进前：默认饼图")

# 改进后：排序 + 水平 + 直接标数值，眼睛不用动
vc2 = vc.sort_values()
axes[1].barh(vc2.index, vc2.values, color=COLORS["blue"])
for y, v in enumerate(vc2.values):
    axes[1].text(v, y, f" {v}", va="center", fontsize=9)
axes[1].set_title("改进后：排序水平柱状图")
axes[1].set_xlabel("订单数")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_ba1.png", dpi=110)
print("改进点：① 排序 ② 水平摆放（分类名不旋转）③ 直接标注数值 ④ 去掉无意义的颜色")
plt.close(fig)
```

> 输出：
```text
改进点：① 排序 ② 水平摆放（分类名不旋转）③ 直接标注数值 ④ 去掉无意义的颜色
```

### 对照 2：右偏直方图 → log 变换

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 3.8))
axes[0].hist(df["销售额"], bins=20, color=COLORS["gray"])
axes[0].set_title(f"改进前：原始分布（偏度 {df['销售额'].skew():.1f}）")
axes[1].hist(np.log1p(df["销售额"]), bins=20, color=COLORS["green"])
axes[1].set_title(f"改进后：log1p 变换（偏度 {np.log1p(df['销售额']).skew():.2f}）")
axes[1].set_xlabel("log1p(销售额)")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_ba2.png", dpi=110)
plt.close(fig)
print("偏度对比:", round(float(df["销售额"].skew()), 3), "->",
      round(float(np.log1p(df["销售额"]).skew()), 3))
```

> 输出：
```text
偏度对比: 6.383 -> -0.335
```

### 对照 3：均值柱状图 → 箱线图（暴露被掩盖的分布）

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 3.8))
order = ["食品饮料", "图书文娱", "家用电器", "手机数码", "服饰鞋包"]

# 改进前：只画均值，看不到"差距有多大、有没有极端值"
means = [df.loc[df["商品类别"] == c, "销售额"].mean() for c in order]
axes[0].bar(order, means, color=COLORS["gray"])
axes[0].set_title("改进前：只画均值（信息量极低）")
axes[0].tick_params(axis="x", rotation=20)

# 改进后：箱线图，中位数、四分位、异常值一次全出来
axes[1].boxplot([df.loc[df["商品类别"] == c, "销售额"] for c in order],
                tick_labels=order, showfliers=False)
axes[1].set_title("改进后：箱线图（分布 + 异常值）")
axes[1].tick_params(axis="x", rotation=20)
fig.tight_layout()
fig.savefig("_test/appendix/_a2_ba3.png", dpi=110)
plt.close(fig)
print("均值:", [round(m) for m in means])
print("中位数:", [round(float(df.loc[df['商品类别'] == c, '销售额'].median())) for c in order])
```

> 输出：
```text
均值: [1865, 1156, 1073, 972, 944]
中位数: [437, 252, 345, 380, 456]
```

> 看到差别了吗？**均值排序和中位数排序完全不一样** —— 均值被少数大单拉高了。
> 这正是"只画均值"最容易误导人的地方。

### 对照 4：折线图 → 加参考线与标注

```python
fig, ax = plt.subplots(figsize=(9, 3.8))
m = ts["每日活跃用户"].resample("ME").mean()
ax.plot(m.index, m.values, color=COLORS["blue"], lw=1.8)

# 改进：① 参考线给出比较基准 ② 标注点出关键事件 ③ 峰值上直接写数
avg = m.mean()
ax.axhline(avg, ls="--", color=COLORS["gray"], lw=1)
ax.text(m.index[0], avg, f" 月均 {avg:.0f}", va="bottom", fontsize=9,
        color=COLORS["gray"])
peak = m.idxmax()
ax.scatter([peak], [m.max()], s=60, color=COLORS["red"], zorder=5)
ax.annotate(f"峰值 {m.max():.0f}\n{peak.strftime('%Y-%m')}",
            xy=(peak, m.max()), xytext=(-70, 25), textcoords="offset points",
            fontsize=9, color=COLORS["red"],
            arrowprops=dict(arrowstyle="->", color=COLORS["red"]))
ax.set_title("改进后：有基准、有事件、有具体数字")
ax.set_ylabel("日均活跃用户")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_ba4.png", dpi=110)
plt.close(fig)
print("峰值:", peak.strftime("%Y-%m"), round(float(m.max()), 1))
```

> 输出：
```text
峰值: 2024-11 1682.1
```

### 对照 5：三件"图表规范"小事

| 问题 | 改进前 | 改进后 |
|---|---|---|
| 没有单位 | `ax.set_ylabel("销售额")` | `ax.set_ylabel("销售额（元）")` |
| 标题太空 | `ax.set_title("图1")` | `ax.set_title("华南区销售额连续 3 个季度领先")` |
| 图例挡数据 | 默认位置压住曲线 | `ax.legend(loc="upper left", frameon=False)` 或挪到图外 |
| x 标签挤成一团 | 竖排重叠 | `ax.tick_params(axis="x", rotation=30)` 或改 `barh` |
| 颜色太多 | 8 个类别 8 种颜色 | 只给"重点类别"上色，其余用灰色 |

```python
fig, ax = plt.subplots(figsize=(9, 3.8))
m = ts["每日活跃用户"].resample("ME").mean()
# 只高亮最高的 3 个月，其余用灰色 —— "注意力管理"是配色最重要的作用
thr = m.nlargest(3).min()
colors = [COLORS["red"] if v >= thr else COLORS["gray"] for v in m.values]
ax.bar(m.index, m.values, width=20, color=colors)
ax.set_title("只给 Top3 上色，其余留灰")
ax.set_ylabel("日均活跃用户")
fig.tight_layout()
fig.savefig("_test/appendix/_a2_ba5.png", dpi=110)
plt.close(fig)
print("Top3 月份:", [d.strftime("%Y-%m") for d in m.nlargest(3).index])
```

> 输出：
```text
Top3 月份: ['2024-11', '2024-06', '2024-12']
```

---

## A2.7 三套库怎么选

| 维度 | Matplotlib | Seaborn | Plotly |
|---|---|---|---|
| 定位 | 底层绘图引擎 | 统计图封装（基于 matplotlib） | 交互式图表 |
| 上手难度 | 中（要自己控制每个元素） | 低（一行一张图） | 低 |
| 灵活性 | **最高**（什么都能改） | 中（复杂自定义要回到 matplotlib） | 中高 |
| 统计功能 | 无（要自己算） | **强**（自动分组、置信区间、分面） | 中（有 trendline） |
| 交互 | 无 | 无 | **强**（缩放/悬停/图例开关） |
| 保存为图片 | 好（PNG/SVG/PDF） | 好（就是 matplotlib 的图） | 需要 `kaleido` |
| 适合 | 论文、要精确控制、做模板 | 探索性分析、快速出图 | 网页、大屏、汇报演示 |

**实践建议**：
1. 数据分析阶段（自己看）→ **seaborn**，一行一张，快。
2. 出报告/论文（给别人看）→ **matplotlib**，因为能精确控制字号、边距、配色。
3. 做演示/网页（要动起来）→ **plotly**，`write_html` 一个文件就能发给别人。

---

## 小结

- 两行字体配置（`font.sans-serif` + `axes.unicode_minus`）是所有中文图表的前提。
- 选图先问"我要表达什么"：比较用柱状、分布用直方/箱线、关系用散点、趋势用折线。
- 饼图不超过 5 类；柱状图纵轴从 0 开始；分类多于 8 个就排序 + 水平摆放。
- `plt.subplots` 返回的可能是单个 `Axes`、一维数组或二维数组，先看清楚再索引。
- 顺序永远是 **savefig → show → close**，反过来会存出空白图。
- `dpi` 屏幕用 110、报告用 200、印刷用 300，`bbox_inches="tight"` 永远开着。
- `sns.set_theme(font=...)` 和 `plt.rcParams["font.sans-serif"]` 两个都要设才保险。
- plotly 用 `write_html` 分享，导出 PNG 需要另装 `kaleido`。
- 配色的作用是**引导注意力**：重点用主色，其余用灰色，而不是"越多颜色越好看"。

> 相关的两个附录：**A1 pandas 速查表**（怎么把数据算出来）、**A3 版本差异与常见报错手册**（图不显示/中文变方块查这里）。
