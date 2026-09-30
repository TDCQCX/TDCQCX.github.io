---
title: 附录 A4 · 术语表
date: 2026-09-26 10:00:00
permalink: /pyviz/a4-glossary/
series: pyviz
chapter: 104
desc: 教程里出现的术语解释
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- 术语表
keywords: Python 数据分析, 数据可视化, 附录 A4 · 术语表, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 附录 A4 · 术语表
toc: true
comments: true
---
> **用法**：读到不懂的词，来这里查。按主题分组，每条给"一句话白话解释 + 出现在哪一章"。
> 最后附**易混淆概念对照**和各科常用符号表。

---

## 一、数据分析基础

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 数据 | Data | 原始记录，本身没有意义 | 1 |
| 信息 | Information | 处理过、有上下文的数据 | 1 |
| 知识 | Knowledge | 从数据归纳出的可复用规律 | 1 |
| 智慧 | Wisdom | 在知识基础上形成的决策 | 1 |
| 描述性分析 | Descriptive Analytics | 回答"发生了什么" | 1 |
| 诊断性分析 | Diagnostic Analytics | 回答"为什么发生" | 1 |
| 预测性分析 | Predictive Analytics | 回答"将会发生什么" | 1 |
| 指导性分析 | Prescriptive Analytics | 回答"该怎么做" | 1 |
| 指标 | Metric | 用来衡量业务表现的量化值（如销售额、客单价） | 1 |
| 维度 | Dimension | 分析的角度（如时间、地域、品类） | 1 |
| 度量 | Measure | 被聚合的数值（如销售额、数量） | 1 |
| 口径 | Definition / Caliber | 一个指标的**确切算法和范围**（含不含税？含不含退货？） | 1 |
| 同比 | Year-over-Year (YoY) | 和去年同期比 | 1 |
| 环比 | Month-over-Month (MoM) | 和上一个周期比 | 1 |
| 下钻 | Drill Down | 从汇总数据往更细的维度看（区域 → 城市 → 门店） | 1 |
| 漏斗 | Funnel | 描述用户逐步转化的各环节 | 1 |
| 留存 | Retention | 用户是否还会回来 | 1 |
| 幸存者偏差 | Survivorship Bias | 只看到"活下来"的样本，得出错误结论 | 1 |
| 辛普森悖论 | Simpson's Paradox | 分组看都是 A 好，合起来却是 B 好（因结构不同） | 1 |

---

## 二、统计学基础

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 总体 | Population | 你关心的**全部**对象 | 8 |
| 样本 | Sample | 从总体里抽出来的一部分 | 8 |
| 变量 | Variable | 会变化的量（就是"列"） | 1 |
| 观测 | Observation | 一条记录（就是"行"） | 1 |
| 均值 | Mean | 所有值加起来除以个数，**受极端值影响大** | 1 |
| 中位数 | Median | 排序后正中间那个，**抗极端值** | 1 |
| 众数 | Mode | 出现次数最多的值 | 1 |
| 分位数 | Quantile / Percentile | 把数据分成等份的切点（P25、P50、P75） | 1 |
| 四分位距 | IQR | P75 − P25，衡量中间 50% 数据的分散程度 | 5 |
| 极差 | Range | 最大值 − 最小值 | 3 |
| 方差 | Variance | 各值偏离均值程度的平方的平均 | 3 |
| 标准差 | Standard Deviation | 方差的平方根，**和原数据同单位** | 3 |
| 偏度 | Skewness | 分布不对称的程度。>0 右偏（长尾在右） | 3 |
| 峰度 | Kurtosis | 分布"尖"或"平"的程度 | 3 |
| 正态分布 | Normal Distribution | 钟形曲线，均值±1σ 含约 68% 数据 | 5 |
| 离群值 | Outlier | 明显偏离其他观测的值 | 5 |
| 3σ 法则 | 3-Sigma Rule | 超出均值±3σ 的值视为异常（要求近正态） | 5 |
| z-score | Standard Score | (x − 均值) / 标准差，表示"偏离几个标准差" | 5 |
| 相关系数 | Correlation Coefficient | −1~1，衡量线性相关强度和方向 | 1 |
| 协方差 | Covariance | 两个变量一起变化的程度（受量纲影响） | 3 |
| 假设检验 | Hypothesis Testing | 用样本判断某个说法是否成立 | 8 |
| 显著性 | Statistical Significance | 差异不太可能是随机造成的 | 8 |
| p 值 | p-value | 原假设成立时，观测到当前结果的概率 | 8 |
| 置信区间 | Confidence Interval | 参数可能落在的区间 | 8 |
| 抽样误差 | Sampling Error | 因为只看了样本而带来的误差 | 8 |
| 集中趋势 | Central Tendency | 数据"中心"在哪（均值/中位数/众数） | 1 |
| 离散程度 | Dispersion | 数据有多分散（方差/标准差/极差） | 3 |

---

## 三、NumPy 相关

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 数组 | ndarray / array | NumPy 的核心数据结构，同类型元素的连续内存块 | 3 |
| 维度 | Dimension / ndim | 数组有几个轴（一维、二维、三维） | 3 |
| 形状 | Shape | 每个轴的长度，如 `(3, 4)` 表示 3 行 4 列 | 3 |
| 轴 | Axis | 数组的某个维度方向。聚合时 **axis 是"被消掉的维度"** | 3 |
| 广播 | Broadcasting | 形状不同的数组运算时自动扩展对齐 | 3 |
| 向量化 | Vectorization | 用数组整体运算代替逐元素循环，**快几十倍** | 3 |
| 视图 | View | 和原数组共享内存，改它会改到原数组 | 3 |
| 副本 | Copy | 独立的内存，改它不影响原数组 | 3 |
| 布尔索引 | Boolean Indexing | 用 True/False 数组筛选，返回**副本** | 3 |
| 花式索引 | Fancy Indexing | 用整数下标数组取多个元素，返回**副本** | 3 |
| 数据类型 | dtype | 元素类型（int64 / float64 / str / bool...） | 3 |
| 轴方向 | — | `axis=0` 消掉行（按列算）；`axis=1` 消掉列（按行算） | 3 |
| 缺失值 | NaN / NA | "不是一个数"，注意 **`nan != nan`** | 3 |
| 随机种子 | Random Seed | 固定随机数序列，让结果**可复现** | 3 |
| 伪随机数 | Pseudo-random Number | 由算法生成的"看起来随机"的数列 | 3 |
| SIMD | Single Instruction Multiple Data | CPU 一条指令处理多个数据，NumPy 快的原因之一 | 3 |

---

## 四、pandas 相关

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 序列 | Series | 带行标签的一维数据结构（相当于一列） | 4 |
| 数据框 | DataFrame | 带行列标签的二维表 | 4 |
| 索引 | Index | 行的"名字"，默认是 0,1,2... | 4 |
| 列名 | Columns | 表的字段名 | 4 |
| 标签索引 | `.loc` | 按**名字**取数据，**切片含结尾** | 4 |
| 位置索引 | `.iloc` | 按**位置编号**取数据，**切片不含结尾** | 4 |
| 布尔筛选 | Boolean Selection | `df[df["列"] > 5]`，注意用 `&` 不是 `and` | 4 |
| 分组聚合 | groupby + agg | 按某维度切开、分别算指标、再合并 | 4 |
| 具名聚合 | Named Aggregation | `agg(新名字=("列", "函数"))`，推荐的写法 | 4 |
| 广播（分组） | `transform` | 把组内统计量广播回原表的每一行（长度不变） | 4 |
| 透视表 | pivot_table | 类似 Excel 透视表，行列交叉汇总 | 4 |
| 交叉表 | crosstab | 专门统计频次的交叉表 | 4 |
| 宽表 / 长表 | Wide / Long Format | 宽表列多行少；长表列少行多（脏数据也长） | 4 |
| 变形 | melt | 宽表 → 长表 | 4 |
| 变形 | pivot / unstack | 长表 → 宽表 | 4 |
| 连接 | merge | 按共同列把两张表拼起来（等价 SQL JOIN） | 4 |
| 内连接 | inner join | 只保留两边都有的（匹配不上就丢） | 4 |
| 左连接 | left join | **保留左表全部**（匹配不上补 NaN），**默认推荐** | 4 |
| 纵向拼接 | concat(axis=0) | 上下摞起来（要求列相同） | 4 |
| 横向拼接 | concat(axis=1) | 左右并排（按索引对齐） | 4 |
| 链式调用 | Method Chaining | 连续调用方法形成流水线 | 4 |
| 管道 | pipe | 把自己的函数插进链式调用 | 4 |
| 写时复制 | Copy-on-Write (CoW) | pandas 3.0 起强制开启：切片永远是独立的 | 4 |
| 分类类型 | category | 只有少数几种取值的列，省内存、聚合更快 | 4 |
| 重采样 | resample | 按时间粒度重新聚合（**3.0 用 "ME" 不用 "M"**） | 4 |
| 分箱 | binning / cut | 把连续值变成区间（`cut` 按数值、`qcut` 按分位数） | 4 |
| 缺失值 | NaN / NA / None | 三种不同来源的"空"，语义有细微差别 | 5 |
| 空字符串 | `""` | **不是缺失值**，但业务上常要当缺失处理 | 5 |

---

## 五、数据预处理

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 数据清洗 | Data Cleaning | 把脏数据变成能用数据的过程 | 5 |
| 数据质量 | Data Quality | 完整性、准确性、一致性、时效性 | 5 |
| 缺失率 | Missing Rate | 某列缺失值占比 | 5 |
| 填补 | Imputation | 用某种规则填上缺失值 | 5 |
| 前向填充 | Forward Fill (ffill) | 用上一个非缺失值填 | 5 |
| 插值 | Interpolation | 按趋势估算中间的值（线性插值等） | 5 |
| 异常值 | Outlier | 明显不合理的值 | 5 |
| 截断 | Clipping | 把超出范围的值压到边界（`clip`） | 5 |
| 去重 | Deduplication | 去掉重复记录，注意 `subset` 的语义 | 5 |
| 标准化 | Standardization | (x − 均值) / 标准差，结果均值 0 标准差 1 | 5 |
| 归一化 | Normalization | (x − min) / (max − min)，压到 [0,1] | 5 |
| 稳健标准化 | Robust Scaling | 用中位数和 IQR，**抗异常值** | 5 |
| 对数变换 | Log Transform | 压缩右偏分布，常用 `log1p`（能处理 0） | 5 |
| 独热编码 | One-Hot Encoding | 把分类变成多个 0/1 列 | 5 |
| 标签编码 | Label Encoding | 把分类映射成整数（**注意有序 vs 无序**） | 5 |
| 特征工程 | Feature Engineering | 造出对预测更有用的输入变量 | 5 |
| 特征缩放 | Feature Scaling | 统一各特征量纲（标准化/归一化的统称） | 5 |
| 数据泄漏 | Data Leakage | 模型"偷看"了训练时不该看到的信息 | 8 |
| 数据体检 | Data Profiling | 分析前先检查数据质量 | 5 |

---

## 六、可视化

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 图形对象 | Figure | 整张画布（可以含多个子图） | 6 |
| 坐标轴对象 | Axes | 一张子图（**不是"轴"，是"子图"**） | 6 |
| 轴 | Axis | 横轴/纵轴 | 6 |
| 状态机接口 | pyplot Interface | `plt.plot(...)` 的简写风格 | 6 |
| 面向对象接口 | OO Interface | `fig, ax = plt.subplots()` 风格，**推荐** | 6 |
| 子图 | Subplot | 一张图里切分出的多个小图 | 6 |
| 分面 | Faceting | 按某个分类变量拆成多张子图 | 7 |
| 图例 | Legend | 说明各颜色/线型代表什么 | 6 |
| 刻度 | Tick | 坐标轴上的标尺和标签 | 6 |
| 边框 | Spine | 子图四周的边框线 | 6 |
| 注释 | Annotation | 给图加文字说明/箭头 | 6 |
| 色带 | Colormap (cmap) | 连续数据映射到的颜色序列 | 6 |
| 发散色带 | Diverging Colormap | 中间为中性色、两端相反的色带（如 `RdBu_r`），适合有正负的数据 | 6 |
| 顺序色带 | Sequential Colormap | 亮度单调变化（如 `viridis`），适合连续量 | 6 |
| 分辨率 | DPI | 每英寸点数，越高越清晰、文件越大 | 6 |
| 矢量图 | Vector Graphics | SVG/PDF，**放大不模糊**，适合论文插图 | 6 |
| 栅格图 | Raster Graphics | PNG/JPG，放大后模糊 | 6 |
| 核密度估计 | KDE | 用平滑曲线估计概率密度（直方图的连续版） | 7 |
| 箱线图 | Box Plot | 用五数概括展示分布，**能看出离群点** | 6 |
| 小提琴图 | Violin Plot | 箱线图 + 密度曲线，比箱线图多看了"形状" | 7 |
| 分位数 | Quartile | 把数据四等分的切点 | 6 |
| 误差棒 | Error Bar | 图上表示波动范围的竖线（常是 ±标准差） | 6 |
| 双轴图 | Twin Axis | 两个量纲不同的指标画在一张图（有两个纵轴） | 6 |
| 交互图 | Interactive Chart | 可缩放、悬浮显示数值的图（plotly） | 7 |

---

## 七、机器学习

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 机器学习 | Machine Learning | 让计算机从数据里自动找规律并预测 | 8 |
| 监督学习 | Supervised Learning | **有标签**，学"输入 → 输出"的映射 | 8 |
| 无监督学习 | Unsupervised Learning | **没有标签**，找数据的内在结构 | 8 |
| 半监督学习 | Semi-supervised Learning | 少量有标签 + 大量无标签 | — |
| 强化学习 | Reinforcement Learning | 通过奖励/惩罚学习策略 | — |
| 分类 | Classification | 预测**类别**（买/不买、是/否） | 8 |
| 回归 | Regression | 预测**连续数值**（房价、销量） | 8 |
| 聚类 | Clustering | 无标签下把相似的样本分成组 | 8 |
| 降维 | Dimensionality Reduction | 用更少的维度表示原数据（PCA） | 8 |
| 关联规则 | Association Rules | 找"买 A 的人往往也买 B" | 8 |
| 特征 | Feature | 用来预测的输入变量（X） | 8 |
| 标签 / 目标 | Label / Target | 要预测的值（y） | 8 |
| 样本 | Sample / Instance | 一条数据（一行） | 8 |
| 参数 | Parameter | 模型**自己从数据学**出来的（如线性回归的斜率） | 8 |
| 超参数 | Hyperparameter | **你手工设定**的（如树深、K 值、学习率） | 8 |
| 训练集 | Training Set | 用来"学"的数据 | 8 |
| 测试集 | Test Set | 用来"考试"的数据，**训练时绝对不能看** | 8 |
| 验证集 | Validation Set | 用来调超参数的数据 | 8 |
| 分层抽样 | Stratified Sampling | 划分时保持正例比例一致，**不平衡数据必加** | 8 |
| 交叉验证 | Cross-Validation | K 折轮流当验证集，结果更稳 | 8 |
| 网格搜索 | Grid Search | 穷举超参数组合找最优 | 8 |
| 随机搜索 | Random Search | 随机采样超参数组合，参数多时更高效 | 8 |
| 拟合 | Fit / Train | 让模型从数据里学规律 | 8 |
| 预测 | Predict / Inference | 用模型对新数据出结果 | 8 |
| 泛化 | Generalization | 在**没见过的数据**上表现好不好 | 8 |
| 过拟合 | Overfitting | 训练集极好、测试集差（背下了噪声） | 8 |
| 欠拟合 | Underfitting | 训练集和测试集都差（没学到规律） | 8 |
| 学习曲线 | Learning Curve | 得分随训练数据量的变化曲线，用来诊断拟合问题 | 8 |
| 正则化 | Regularization | 惩罚模型复杂度以缓解过拟合 | 8 |
| L1 正则 | L1 / Lasso | 加系数绝对值之和的惩罚，**能自动做特征选择** | 8 |
| L2 正则 | L2 / Ridge | 加系数平方和的惩罚，让系数更平滑 | 8 |
| 早停 | Early Stopping | 验证集不再提升就停止训练 | 8 |
| 集成学习 | Ensemble Learning | 组合多个模型提升效果 | 8 |
| 装袋 | Bagging | 并行训练多个模型再投票（随机森林） | 8 |
| 提升 | Boosting | 串行训练，后一个修正前一个的错误（GBDT） | 8 |
| 混淆矩阵 | Confusion Matrix | TP/FP/FN/TN 四格表，其他指标都由它衍生 | 8 |
| 准确率 | Accuracy | (TP+TN)/总数，**不平衡时会骗人** | 8 |
| 精确率 | Precision | TP/(TP+FP)，"预测为正的里有多少真的正" | 8 |
| 召回率 | Recall | TP/(TP+FN)，"实际为正的里找出了多少" | 8 |
| F1 分数 | F1 Score | 精确率和召回率的调和平均 | 8 |
| ROC 曲线 | ROC Curve | 横轴误报率、纵轴召回率的曲线 | 8 |
| AUC | Area Under ROC Curve | 曲线下面积，**不受不平衡影响**，二分类首选指标 | 8 |
| 分类阈值 | Threshold | 把概率变成"是/否"的分界，**决定成本收益** | 8 |
| 平均绝对误差 | MAE | 预测误差绝对值的平均，**和 y 同单位** | 8 |
| 均方误差 | MSE | 误差平方的平均，放大对大误差的惩罚 | 8 |
| 均方根误差 | RMSE | MSE 开方，和 MAE 同单位但更敏感于大误差 | 8 |
| 决定系数 | R² | 模型解释了目标变量多少比例的变异，≤1 | 8 |
| KNN | K-Nearest Neighbors | 看最近的 K 个邻居是谁来投票/取均值 | 8 |
| 决策树 | Decision Tree | 一系列 if-else 规则，**可解释但易过拟合** | 8 |
| 随机森林 | Random Forest | 多棵决策树投票（Bagging） | 8 |
| 梯度提升 | Gradient Boosting | 串行训练决策树，逐步修正残差 | 8 |
| 逻辑回归 | Logistic Regression | 名字叫"回归"，实际是**分类**（输出概率） | 8 |
| 支持向量机 | SVM | 找最大间隔的超平面；用核函数处理非线性 | 8 |
| 朴素贝叶斯 | Naive Bayes | 基于贝叶斯定理 + "特征独立"假设 | 8 |
| K-Means | K-Means | 迭代找 K 个质心的聚类算法 | 8 |
| DBSCAN | Density-Based Clustering | 基于密度的聚类，**能自动定簇数、能识别噪声** | 8 |
| 层次聚类 | Hierarchical Clustering | 自底向上合并，得到一棵聚类树 | 8 |
| 轮廓系数 | Silhouette Score | −1~1，衡量"簇内紧、簇间分"，聚类效果指标 | 8 |
| 肘部法 | Elbow Method | 看 SSE 下降曲线的"拐点"来定 K | 8 |
| 主成分分析 | PCA | 把相关的多个特征压缩成少数几个"综合特征" | 8 |
| 方差解释率 | Explained Variance Ratio | 每个主成分保留了原数据多少信息 | 8 |
| 载荷 | Loading | 主成分由哪些原始特征构成（绝对值越大贡献越大） | 8 |
| 支持度 | Support | A 和 B 同时出现的比例（关联规则） | 8 |
| 置信度 | Confidence | 买了 A 的人里也买 B 的比例 | 8 |
| 提升度 | Lift | 有 A 之后买 B 的概率提升倍数，**>1 才有意义** | 8 |
| 频繁项集 | Frequent Itemset | 出现频率超过阈值的商品组合（apriori 的产物） | 8 |
| 平稳性 | Stationarity | 统计特征不随时间变化（时间序列建模前提） | 8 |
| ADF 检验 | Augmented Dickey-Fuller Test | 检验时间序列是否平稳，p<0.05 表示平稳 | 8 |
| 差分 | Differencing | 后一个值减前一个值，用来让序列平稳 | 8 |
| 移动平均 | Moving Average | 用最近 N 期的均值平滑序列 | 8 |
| 趋势 | Trend | 长期的上升/下降 | 8 |
| 季节性 | Seasonality | 固定周期的重复波动 | 8 |
| 残差 | Residual | 实际值减模型拟合值，剩下"没被解释"的部分 | 8 |
| ARIMA | ARIMA(p,d,q) | 经典时间序列模型：自回归+差分+移动平均 | 8 |
| 指数平滑 | Exponential Smoothing | 越近的数据权重越大；Holt-Winters 加趋势和季节 | 8 |
| 朴素基线 | Naive Baseline | 最简单的预测方法（如"用昨天=今天"），用来对比 | 8 |

---

## 八、数据库与数据获取

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 数据库 | Database | 有组织地存储数据的系统 | 2 |
| 关系型数据库 | Relational Database | 数据存在多张表里，通过键关联 | 2 |
| 表 | Table | 相当于一个 DataFrame | 2 |
| 字段 / 列 | Field / Column | 表的一个属性 | 2 |
| 记录 / 行 | Record / Row | 表的一条数据 | 2 |
| 主键 | Primary Key | 唯一标识一行的字段 | 2 |
| 外键 | Foreign Key | 指向另一张表主键的字段 | 2 |
| 索引 | Index (DB) | 加速查询的数据结构 | 2 |
| 查询 | Query | 用 SQL 从数据库取数 | 2 |
| SQL | Structured Query Language | 数据库查询语言 | 2 |
| 聚合函数 | Aggregate Function | COUNT / SUM / AVG / MAX / MIN | 2 |
| 编码 | Encoding | 字符到字节的映射规则（utf-8 / gbk） | 2 |
| BOM | Byte Order Mark | 文件开头的不可见标记，会导致列名带 `\ufeff` | 2 |
| CSV | Comma-Separated Values | 逗号分隔的纯文本表格 | 2 |
| Parquet | — | 列式存储格式，体积小、类型保留、适合大数据 | 2 |
| 行式存储 | Row-oriented Storage | 一行整块存（CSV/MySQL 默认） | 2 |
| 列式存储 | Column-oriented Storage | 一列整块存（Parquet），只读部分列时极快 | 2 |
| JSON | JavaScript Object Notation | 能表达嵌套结构的数据格式，接口事实标准 | 2 |
| JSONL | JSON Lines | 每行一个 JSON 对象，适合流式读取 | 2 |
| 嵌套结构 | Nested Structure | 值里还有对象或数组，需要摊平才能分析 | 2 |
| 摊平 | Flatten / Normalize | 把嵌套 JSON 变成平面表（`json_normalize`） | 2 |
| 网页抓取 | Web Scraping | 用程序从网页提取数据 | 2 |
| HTML | HyperText Markup Language | 网页的骨架标记语言 | 2 |
| CSS 选择器 | CSS Selector | 用 `#id` / `.class` / 标签定位元素 | 2 |
| API | Application Programming Interface | 服务方提供的数据接口，通常返回 JSON | 2 |
| REST | Representational State Transfer | 最常见的 API 设计风格 | 2 |
| 分页 | Pagination | 接口一次只返回一部分，需要翻页取全 | 2 |
| 请求头 | Header | 请求附带的元信息（认证 token 等） | 2 |
| 状态码 | Status Code | 200 成功 / 401 未认证 / 404 不存在 / 429 太频繁 / 500 服务器错 | 2 |
| 频率限制 | Rate Limit | 服务方限制你的请求频率 | 2 |
| requests | — | Python 的 HTTP 请求库 | 2 |
| BeautifulSoup | — | Python 的 HTML 解析库 | 2 |

---

## 九、环境与工程

| 中文 | 英文 | 一句话解释 | 章节 |
|---|---|---|---|
| 虚拟环境 | Virtual Environment | 项目独立的依赖空间，互不干扰 | 0 |
| conda | — | 包与环境管理器（也能管非 Python 依赖） | 0 |
| pip | Pip Installs Packages | Python 官方包管理器 | 0 |
| 镜像源 | Mirror | 国内的 PyPI 镜像，下载更快 | 0 |
| Jupyter Notebook | — | 单元格式交互编程环境 | 0 |
| 内核 | Kernel | Notebook 背后真正跑 Python 的进程 | 0 |
| 工作目录 | Working Directory | 程序运行时"当前所在"的目录，**决定相对路径的基准** | 2 |
| 相对路径 | Relative Path | 相对于当前工作目录的路径（`../data/x.csv`） | 2 |
| 绝对路径 | Absolute Path | 从盘符开始的完整路径 | 2 |
| 可复现性 | Reproducibility | 别人能跑出和你一样的结果（固定随机种子、写脚本） | 1 |
| 随机种子 | Random Seed | 见"NumPy"节 | 3 |
| 硬编码 | Hardcoding | 把会变的值写死在代码里（**坏习惯**） | 9 |
| 重构 | Refactoring | 不改变功能的前提下改善代码结构 | 9 |
| 单元测试 | Unit Test | 自动验证某个函数行为是否符合预期 | 5 |
| 数据管道 | Data Pipeline | 数据从源到分析结果的一系列处理步骤 | 9 |

---

## 十、易混淆概念对照（★重点）

### 10.1 均值 vs 中位数 vs 众数

| | 均值 Mean | 中位数 Median | 众数 Mode |
|---|---|---|---|
| 定义 | 总和 ÷ 个数 | 排序后正中间 | 出现次数最多 |
| 抗极端值 | ❌ 差 | ✅ 好 | ✅ 好 |
| 适用 | 分布对称 | **分布偏斜** | 分类变量 |
| 例子 | 人均收入被富豪拉高 | 房价用中位数更典型 | 最畅销的尺码 |

> **判断口径**：如果 **均值和中位数差很多**，说明数据偏斜，
> 报告里**应该同时给两个**，并用中位数描述"典型值"。

### 10.2 方差 vs 标准差

| | 方差 Variance | 标准差 Std |
|---|---|---|
| 单位 | 原单位的**平方** | **和原数据同单位** |
| 可比性 | 不直观 | **直观**（"平均偏离多少"） |
| 用途 | 数学推导 | 描述和报告 |

### 10.3 标准化 vs 归一化

| | 标准化 Standardization | 归一化 Normalization |
|---|---|---|
| 公式 | (x − 均值) / 标准差 | (x − min) / (max − min) |
| 结果范围 | 约 ±3（不固定） | **固定 [0, 1]** |
| 抗异常值 | 一般 | ❌ **极差**（一个异常值就能压扁所有数据） |
| 推荐默认 | ✅ 用它 | 需要固定范围时用 |

### 10.4 相关系数 vs R²

| | 相关系数 r | 决定系数 R² |
|---|---|---|
| 范围 | −1 ~ 1 | −∞ ~ 1（回归里通常 0~1） |
| 方向 | **有**（正/负） | 无 |
| 含义 | 线性相关强度和方向 | 模型解释了目标多少比例的变异 |
| 关系 | **一元线性回归中 R² = r²** | 多元回归时 r 不适用 |

### 10.5 准确率 vs 精确率 vs 召回率 vs F1

| 指标 | 公式 | 回答的问题 | 什么时候看它 |
|---|---|---|---|
| 准确率 | (TP+TN)/全部 | 整体猜对多少 | 类别**平衡**时 |
| 精确率 | TP/(TP+FP) | 说"是"的里面有多少真是 | **误报代价高**（垃圾邮件拦截） |
| 召回率 | TP/(TP+FN) | 真的"是"里找出多少 | **漏报代价高**（癌症筛查、风控） |
| F1 | 2PR/(P+R) | 两者的调和平均 | 两者都重要 |

> ⚠️ **类别不平衡时，准确率会骗人。**
> 例：正例率 24% 时，"全猜负例"的准确率有 76%，但召回率是 0。

### 10.6 参数 vs 超参数

| | 参数 Parameter | 超参数 Hyperparameter |
|---|---|---|
| 谁决定 | **模型自己学** | **你手工设** |
| 例子 | 线性回归的斜率/截距、神经网络的权重 | 树的最大深度、K-Means 的 K、随机森林的树数 |
| 怎么找 | 训练得到 | 网格搜索/随机搜索 |
| 一句话 | **参数是"学"来的** | **超参数是"设"的** |

### 10.7 过拟合 vs 欠拟合

| | 过拟合 | 欠拟合 |
|---|---|---|
| 训练集 | **极好**（甚至 100%） | 差 |
| 测试集 | 差 | 差 |
| 原因 | 模型太复杂 / 数据太少 / 噪声被当成规律 | 模型太简单 / 特征不够 |
| 解决 | 加数据、降复杂度、加正则化、早停 | 加特征、换更复杂的模型、减少正则化 |
| 诊断 | 两条学习曲线**有大缝** | 两条学习曲线**都很低且贴着** |

### 10.8 特征 vs 维度 vs 样本

```text
一个表格：
        身高   体重   年龄   ← 3 个「特征」（也叫维度、变量、属性）
张三    175    70     25    ← 1 个「样本」（也叫观测、记录、实例）
李四    180    82     30    ← 又一个样本
```

**维度**是特征的另一个说法（"高维数据"= 特征很多）。

### 10.9 总体 vs 样本

| | 总体 Population | 样本 Sample |
|---|---|---|
| 定义 | 你关心的全部对象 | 实际观测到的一部分 |
| 大小 | 往往无法全部获取 | 有限 |
| 统计量 | 参数（μ、σ） | 估计量（x̄、s） |
| 关系 | **用样本推断总体** | |

### 10.10 缺失值 vs 空字符串 vs 零值

| | 真缺失 NaN | 空字符串 `""` | 零值 `0` |
|---|---|---|---|
| 含义 | **不知道** | 填了但没写内容 | 明确的"零" |
| `isna()` | True | **False** | False |
| 算均值 | 被忽略（用 nanmean） | 报错或变空 | **参与计算** |
| 处理 | 填补或删行 | 常需先 `.replace("", np.nan)` | 视业务而定 |

> ⚠️ **这三者经常被混用，是数据清洗的经典坑。**
> 我们的 `sales.csv` 里 `客户性别` 就有 22 个**空字符串**——
> 用 `isna()` 检查是查不出来的。

### 10.11 相关 vs 因果

| | 相关 Correlation | 因果 Causation |
|---|---|---|
| 能说明 | 两件事**一起变** | 一件**导致**另一件 |
| 怎么证明 | 算相关系数 | 需要实验（A/B 测试）或因果推断方法 |
| 陷阱 | 伪相关（有共同原因）、反向因果、巧合 | |

> **数据能证明相关，不能单独证明因果。** 这是数据分析最重要的纪律。

### 10.12 行式 vs 列式存储

| | 行式（CSV/MySQL） | 列式（Parquet） |
|---|---|---|
| 一行 | 整块连续存 | 分散在各列块里 |
| 读"某几列" | 必须全读再丢 | **只读那几列，极快** |
| 压缩率 | 一般 | **高**（同列类型相同、重复多） |
| 适合 | 增删改单行（OLTP） | 分析查询（OLAP） |

---

## 十一、常用数学与统计符号

| 符号 | 读法 | 含义 |
|---|---|---|
| `x̄` / `mean` | x bar | 样本均值 |
| `μ` | mu | 总体均值 |
| `σ` | sigma | 总体标准差 |
| `s` | s | 样本标准差 |
| `σ²` | sigma squared | 总体方差 |
| `Σ` | sigma（大写） | 求和 |
| `Π` | pi（大写） | 连乘 |
| `Σx²` | — | 所有 x 的平方和 |
| `(Σx)²` | — | 所有 x 之和的平方 |
| `n` | n | 样本量 |
| `N` | N | 总体量 |
| `r` | r | 相关系数 |
| `R²` | R squared | 决定系数 |
| `P25 / P50 / P75` | — | 第 25/50/75 百分位数 |
| `IQR` | — | 四分位距 = P75 − P25 |
| `z` | z | z-score（标准分） |
| `p` | p | p 值（显著性） |
| `α` | alpha | 显著性水平（常取 0.05）；正则化强度 |
| `λ` | lambda | 特征值；正则化参数（部分教材用 λ 代替 α） |
| `β` | beta | 回归系数 |
| `ε` | epsilon | 误差项 |
| `H₀` | H zero | 原假设 |
| `H₁` | H one | 备择假设 |
| `x̄ ± s` | — | 均值 ± 标准差（常写成 `mean ± std`） |
| `∈` | 属于 | 元素属于集合 |
| `∀` / `∃` | 任意/存在 | 逻辑量词 |
| `|x|` | 绝对值 | |
| `√x` | 根号 x | 平方根 |
| `log(x)` | — | 对数（numpy 里默认自然对数） |
| `e` | — | 自然常数 ≈ 2.71828 |
| `π` | pi | 圆周率 ≈ 3.14159 |

---

## 十二、机器学习指标公式速查

```text
【分类】混淆矩阵四格
               预测正     预测负
    实际正      TP         FN       ← FN = 漏报
    实际负      FP         TN       ← FP = 误报

准确率 Accuracy  = (TP + TN) / (TP + TN + FP + FN)
精确率 Precision = TP / (TP + FP)          "预测为正的里有多少真是正"
召回率 Recall    = TP / (TP + FN)          "真正例里找出了多少"
特异度 Specificity = TN / (TN + FP)        "真负例里正确排除了多少"
F1              = 2 × P × R / (P + R)

【回归】
MAE  = mean(|y - ŷ|)
MSE  = mean((y - ŷ)²)
RMSE = √MSE
R²   = 1 - SS_res / SS_tot
     其中 SS_res = Σ(y - ŷ)²      （残差平方和）
          SS_tot = Σ(y - ȳ)²      （总平方和）

【标准化 / 归一化】
Z-score    z = (x - μ) / σ
Min-Max    x' = (x - min) / (max - min)
Robust     x' = (x - median) / IQR

【聚类】
轮廓系数 s(i) = (b(i) - a(i)) / max(a(i), b(i))
    a(i) = i 到同簇其他点的平均距离（越小越好）
    b(i) = i 到最近的其他簇的平均距离（越大越好）
    s 范围 [-1, 1]，接近 1 表示分得好
SSE (inertia) = Σ Σ ||x - μ_k||²   （簇内平方和，越小越紧凑）

【关联规则】
支持度 Support(A→B)      = P(A ∩ B) = 同时含 A 和 B 的交易数 / 总交易数
置信度 Confidence(A→B)   = P(B|A)   = 支持度(A→B) / 支持度(A)
提升度 Lift(A→B)         = 置信度(A→B) / 支持度(B)
     lift > 1 → 正相关（A 促进 B）★ 要找的
     lift = 1 → 独立（无信息量）
     lift < 1 → 负相关（A 抑制 B）

【PCA】
方差解释率 = λ_k / Σλ_i        （第 k 个主成分保留的信息比例）
累计解释率 = Σ_{i≤k} λ_i / Σλ_i

【时间序列】
一阶差分   Δy_t = y_t - y_{t-1}
移动平均   MA_t = (y_t + y_{t-1} + ... + y_{t-n+1}) / n
MAPE       = mean(|(y - ŷ) / y|) × 100%
```

---

## 十三、怎么用这份术语表

**三种用法**：

1. **查词**：读到不懂的词，`Ctrl+F` 搜中文或英文；
2. **复习**：学完一章，回来扫一遍该章的术语，看能不能说出每个的含义；
3. **面试准备**：**第十节"易混淆概念对照"是面试高频考点**——
   "均值和中位数的区别""准确率和召回率什么时候用哪个""参数和超参数的区别"，
   这些都是必问的。

> 💡 **一个自测方法**：随机挑 10 个术语，
> **用一句话向不懂技术的朋友解释清楚**。
> 如果你能做到，说明你真的懂了；
> 如果只能说"就是……那个东西"，说明还停留在"认得这个词"的阶段。
>
> **能把术语讲给外行听，是数据分析师最实用的能力之一**——
> 因为你的汇报对象，绝大多数都不懂技术。
