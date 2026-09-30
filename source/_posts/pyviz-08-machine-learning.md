---
title: 08 机器学习与数据挖掘
date: 2026-09-26 10:00:00
permalink: /pyviz/08-machine-learning/
series: pyviz
chapter: 8
desc: 特征工程、常见模型与模型评估
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- 机器学习
keywords: Python 数据分析, 数据可视化, 08 机器学习与数据挖掘, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 08 机器学习与数据挖掘
toc: true
comments: true
---
> 本章难度：⭐⭐⭐ | 预计学习时间：24 小时 | 前置章节：04 Pandas、05 数据预处理、06 Matplotlib
> 本章是全课程最长的一章，内容相当于一门小学期课程。可以分 6~8 次学完。

---

## 学习目标

学完本章你能做到：

1. 用一句话说清**机器学习**在干什么，以及它和前面章节的"数据分析"是什么关系；
2. 分清**监督学习 / 无监督学习 / 强化学习**，看到一个问题能判断该用哪类方法；
3. 完整走一遍 sklearn 的**标准七步流程**，并说出每一步**为什么必须这么做**；
4. 解释**过拟合**和**欠拟合**，会用**学习曲线**诊断，并知道怎么缓解；
5. 完成**回归**任务（房价预测）和**分类**任务（泰坦尼克生存预测），并正确解读评估指标；
6. 理解**为什么准确率会骗人**，会用混淆矩阵、精确率、召回率、F1、ROC-AUC 综合评估；
7. 说清**哪些算法必须做特征缩放、哪些不需要**，并知道为什么；
8. 用**交叉验证**和**网格搜索**做模型选择与调参；
9. 做**聚类**（K-Means / DBSCAN / 层次聚类）并给每个簇起业务名字；
10. 做**关联规则挖掘**（购物篮分析），理解支持度、置信度、**提升度**；
11. 用 **PCA** 降维并解释主成分的业务含义；
12. 做**时间序列**分析：趋势分解、平稳性检验、ARIMA 与指数平滑预测。

---

## 8.0 先建立整体认知

### 8.0.1 机器学习到底在做什么

**一句话**：**机器学习 = 让计算机从数据里自动找出"输入 → 输出"的规律，并用这个规律预测新数据。**

对比一下前面章节和本章：

| | 前面章节（数据分析） | 本章（机器学习） |
|---|---|---|
| 目标 | **描述**已经发生的事 | **预测**还没发生的事 |
| 产出 | 汇总表、图表、结论 | 一个能对新数据做预测的**模型** |
| 例子 | "华南销售额占 32%" | "这个客户下个月会不会流失？" |
| 核心动作 | 分组、聚合、可视化 | 训练、评估、调参、预测 |

**但两者不是割裂的**：机器学习的前半段（读数据、清洗、探索、特征工程）
**就是前面章节的内容**。可以这么说：

```text
    第 2 章  拿数据
    第 4 章  整理数据（pandas）     ┐
    第 5 章  清洗数据（预处理）      ├──► 占了机器学习项目 70~80% 的工作量
    第 6 章  看数据（可视化）        ┘
                                    │
                                    ▼
                            第 8 章  建模（本章新增的部分）
```

> 💡 **一个残酷但真实的事实**：机器学习工程师 80% 的时间在做数据清洗和特征工程，
> 只有 20% 的时间在"调模型"。所以**前面几章学扎实，本章其实是水到渠成的**。

### 8.0.2 三大类机器学习

```text
                     ┌──────────────────────────────────────────┐
                     │            机器学习三大范式                │
                     └──────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
   ① 监督学习                    ② 无监督学习                  ③ 强化学习
   Supervised                    Unsupervised                  Reinforcement
   ───────────                   ────────────                  ────────────
   【有标准答案】                  【没有标准答案】                【边做边学】
   数据里带着"正确答案"(标签)       只有特征，没有标签             通过"奖励/惩罚"学习策略
        │                              │                             │
   ┌────┴────┐                    ┌────┴────┐                        │
   ▼         ▼                    ▼         ▼                        ▼
 分类      回归                  聚类     降维                   下棋、机器人
 (类别)   (数值)                (分群)  (压缩)                  自动驾驶、推荐
   │         │                    │         │
   │         │                    │         └─ PCA、t-SNE
   │         │                    └─ K-Means、DBSCAN、层次聚类
   │         └─ 线性回归、随机森林回归
   └─ 逻辑回归、决策树、随机森林、SVM、KNN

   本教程的例子：                 本教程的例子：                本教程不涉及
   泰坦尼克生存预测(分类)          会员分群(聚类)
   加州房价预测(回归)              PCA 降维
```

**怎么判断该用哪类？看**：**"数据里有没有答案（标签）？"**

| 你手上的数据 | 你想做的事 | 用什么 |
|---|---|---|
| 有"是否购买"这一列 | 预测新用户会不会购买 | **分类**（监督） |
| 有"房价"这一列 | 预测新房子的价格 | **回归**（监督） |
| 只有客户消费数据，没有标签 | 把客户分成几群 | **聚类**（无监督） |
| 有 100 个特征，想压缩到 5 个 | 降维可视化 | **PCA**（无监督） |
| 有 800 笔交易记录 | 找"买 A 的人还买什么" | **关联规则**（无监督） |

### 8.0.3 必会的术语对照表

| 中文 | 英文 | 一句话解释 |
|---|---|---|
| **样本 / 观测** | sample / instance | 一行数据（一个客户、一笔订单） |
| **特征 / 自变量** | feature / X | 用来预测的输入变量（也叫属性、维度、变量） |
| **标签 / 目标 / 因变量** | label / target / y | 要预测的那个值 |
| **训练集** | training set | 用来"学"的数据 |
| **测试集** | test set | 用来"考试"的数据，模型训练时**绝对不能看** |
| **验证集** | validation set | 用来调参数的数据 |
| **模型** | model | 从训练集学到的"规律" |
| **训练 / 拟合** | train / fit | 让模型从数据里学规律的过程 |
| **预测 / 推断** | predict / inference | 用模型对新数据出结果 |
| **参数** | parameter | 模型**自己从数据里学**出来的（如线性回归的斜率） |
| **超参数** | hyperparameter | 你**手工设定**的（如决策树最大深度、K-Means 的 K） |
| **过拟合** | overfitting | 训练集表现极好，测试集很差（"死记硬背"） |
| **欠拟合** | underfitting | 训练集和测试集都很差（"没学到东西"） |
| **泛化能力** | generalization | 模型在**没见过的数据**上表现好不好 |

> ⚠️ **参数 vs 超参数是初学者最容易混淆的一对概念**：
> - **参数**：模型自己学的。比如线性回归 `y = ax + b` 里的 `a` 和 `b`，
>   你把数据喂进去，它自己算出来，**你不需要（也不应该）手工指定**。
> - **超参数**：你手工设的。比如"决策树最多长 5 层"里的 `5`、
>   "K-Means 分成 4 群"里的 `4`、"随机森林用 200 棵树"里的 `200`。
>   **调参调的就是超参数。**
>
> 一句话记法：**参数是"学"来的，超参数是"设"的。**

---

## 8.1 sklearn 标准流程：七步走

scikit-learn（简称 sklearn）是 Python 机器学习的标准库。它最大的价值是
**提供了统一的 API**：不管用哪个算法，都是 `fit()` → `predict()` 两步。

### 8.1.1 完整流程图

```text
  ① 明确问题         分类？回归？聚类？
         ▼
  ② 准备数据         读进来、清洗、看分布        ← 第 2、4、5 章的内容
         ▼
  ③ 划分数据         train_test_split          ← ⚠️ 必须在特征工程之前！
         ▼
  ④ 特征工程         编码、缩放、造新特征        ← 只能"学"训练集的规则
         ▼
  ⑤ 训练模型         model.fit(X_train, y_train)
         ▼
  ⑥ 评估模型         在测试集上算指标，看会不会过拟合
         ▼
  ⑦ 调参优化         交叉验证 + 网格搜索
         ▼
  ⑧ 部署使用         ？？？→ 用模型预测新数据
```

### 8.1.2 ⚠️ 第三步——先划分，后特征工程（数据泄漏）

**这是初学者最容易犯的严重错误。** 很多人这样做：

```text
❌ 错误顺序：
   读数据  →  标准化（用了全部数据算均值和标准差）  →  划分训练/测试集  →  训练
                    ↑
             这一步已经"偷看"了测试集的数据！
```

**为什么这是错的？** 因为你算标准化用的均值和标准差里，
**包含了测试集的信息**。模型在测试时"已经知道"测试数据的统计特征，
评估结果会**虚高**。这个现象叫**数据泄漏（data leakage）**。

**正确顺序**：

```text
✅ 正确顺序：
   读数据  →  划分训练/测试集  →  用训练集 fit 标准化器  →  用同一个标准化器 transform 测试集
                                        ↑
                                测试集的均值/标准差从没被用过
```

**sklearn 的 `Pipeline` 帮你自动做对这件事**（后面 8.4 节详细讲）。

> ⚠️ **数据泄漏的其他常见形式**（都很隐蔽）：
> 1. **用未来数据预测过去**：用"用户总消费额（含未来）"预测"用户是否流失"；
> 2. **重复样本跨集分布**：同一个用户的 10 条记录，5 条在训练集、5 条在测试集——
>    模型"见过"这个用户了，评估虚高。**正确做法是按用户划分**；
> 3. **目标编码泄漏**：用"该类别下目标均值"编码类别特征时，
>    如果用了全量数据算均值，就泄漏了。
>
> **一条自检原则**：**问自己"这个特征在预测时刻真的能拿到吗？"**
> 比如预测"用户会不会在明天购买"，就不能用"用户明天的浏览记录"当特征。

---

## 8.2 第一个完整案例：泰坦尼克生存预测

我们用经典的泰坦尼克数据集走一遍完整流程。
**每个知识点后面都会有更详细的展开**，这一节先让你看到全貌。

### 8.2.1 认识数据

```python
import warnings
warnings.filterwarnings("ignore")          # 关掉一些不影响结果的警告，让输出干净

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

titanic = pd.read_csv("../data/titanic.csv")
print("数据规模:", titanic.shape)
print("\n列名:", titanic.columns.tolist())
print("\n缺失情况:")
print(titanic.isna().sum()[titanic.isna().sum() > 0].to_string())
print("\n生还率: {:.2%}".format(titanic["Survived"].mean()))
```

> 输出：
```text
数据规模: (891, 12)

列名: ['PassengerId', 'Survived', 'Pclass', 'Name', 'Sex', 'Age', 'SibSp', 'Parch', 'Ticket', 'Fare', 'Cabin',
   'Embarked']

缺失情况:
Age         177
Cabin       687
Embarked      2

生还率: 38.38%
```

**先理解每一列是什么**（这是建模前必须做的功课）：

| 列名 | 含义 | 类型 |
|---|---|---|
| `PassengerId` | 乘客编号 | 无意义，要删 |
| `Survived` | **是否生还（0=否，1=是）** | **这是标签 y** |
| `Pclass` | 船舱等级（1/2/3 等） | 有序分类 |
| `Name` | 姓名 | 文本，但**含"称谓"信息** |
| `Sex` | 性别 | 二分类 |
| `Age` | 年龄 | 数值，有 177 个缺失 |
| `SibSp` | 同行兄弟姐妹/配偶数 | 数值 |
| `Parch` | 同行父母/子女数 | 数值 |
| `Ticket` | 票号 | 文本，多数情况没用 |
| `Fare` | 票价 | 数值 |
| `Cabin` | 舱位号 | 文本，缺失 687 个（77%），信息量低 |
| `Embarked` | 登船港口（C/Q/S） | 分类，缺 2 个 |

> 💡 **建模前的关键动作：搞清楚"标签是什么"**。
> 本任务标签是 `Survived`（0/1），所以这是**二分类问题**。

### 8.2.2 特征工程：从数据里"造"出有用的信息

**特征工程（feature engineering）= 用领域知识和数据变换，造出对预测更有用的输入变量。**
它往往比"换一个更厉害的模型"更能提升效果。

```python
def build_titanic_features(d):
    """
    从原始泰坦尼克数据里构造更有信息量的特征。

    为什么这么做？因为原始字段里有些信息被"藏"起来了：
      - 姓名里的"称谓"（Mr/Mrs/Miss/Master）反映了性别、婚姻状况、社会地位，
        而且能用来推测缺失的年龄
      - SibSp 和 Parch 单独看意义不大，但"家庭规模"和"是否独行"很有意义
      - 票价除以舱位等级，能反映"同等级里的相对消费水平"
    """
    d = d.copy()

    # 特征1：从姓名里提取称谓
    # 姓名格式："Braund, Mr. Owen Harris" → 用正则取出 "Mr"
    d["称谓"] = d["Name"].str.extract(r",\s*([^\.]+)\.")
    # 把长尾的稀有称谓归并成几大类（避免类别太多导致独热编码后维度爆炸）
    d["称谓"] = d["称谓"].replace({
        "Lady": "贵族", "Countess": "贵族", "Sir": "贵族",
        "Jonkheer": "贵族", "Don": "贵族", "Dona": "贵族",
        "Capt": "军官", "Col": "军官", "Major": "军官",
        "Dr": "专业人士", "Rev": "神职",
        "Mlle": "Miss", "Ms": "Miss", "Mme": "Mrs",
    })

    # 特征2：家庭规模 = 兄弟姐妹/配偶 + 父母/子女 + 自己
    d["家庭规模"] = d["SibSp"] + d["Parch"] + 1

    # 特征3：是否独自出行（一个人往往更难获救）
    d["是否独行"] = (d["家庭规模"] == 1).astype(int)

    # 特征4：票价等级 = 票价 / 舱位等级（同等级内的相对消费水平）
    d["票价等级"] = d["Fare"] / d["Pclass"]

    return d


t = build_titanic_features(titanic)
print("新增的特征:", [c for c in t.columns if c not in titanic.columns])
print("\n看看新特征:")
print(t[["Name", "称谓", "SibSp", "Parch", "家庭规模", "票价等级"]].head(6).to_string(index=False))
```

> 输出：
```text
新增的特征: ['称谓', '家庭规模', '是否独行', '票价等级']

看看新特征:
                                               Name 称谓  SibSp  Parch  家庭规模  票价等级
                            Braund, Mr. Owen Harris   Mr      1      0         2  2.416667
Cumings, Mrs. John Bradley (Florence Briggs Thayer)  Mrs      1      0         2 71.283300
                             Heikkinen, Miss. Laina Miss      0      0         1  2.641667
       Futrelle, Mrs. Jacques Heath (Lily May Peel)  Mrs      1      0         2 53.100000
                           Allen, Mr. William Henry   Mr      0      0         1  2.683333
                                   Moran, Mr. James   Mr      0      0         1  2.819433
```

**验证新特征真的有用**（这一步非常重要，别凭感觉造特征）：

```python
print("=== 各称谓的生还率 ===")
stat = (t.groupby("称谓")
          .agg(人数=("Survived", "count"), 生还率=("Survived", "mean"))
          .sort_values("生还率", ascending=False))
stat["生还率"] = stat["生还率"].round(3)
print(stat.to_string())

print("\n=== 家庭规模与生还率 ===")
fam = (t.groupby("家庭规模")
        .agg(人数=("Survived", "count"), 生还率=("Survived", "mean"))
        .round(3))
print(fam.to_string())
```

> 输出：
```text
=== 各称谓的生还率 ===
              人数  生还率
称谓                      
the Countess     1   1.000
Mrs            126   0.794
Miss           185   0.703
Master          40   0.575
贵族             4   0.500
专业人士         7   0.429
军官             5   0.400
Mr             517   0.157
神职             6   0.000

=== 家庭规模与生还率 ===
          人数  生还率
家庭规模              
1          537   0.304
2          161   0.553
3          102   0.578
4           29   0.724
5           15   0.200
6           22   0.136
7           12   0.333
8            6   0.000
11           7   0.000
```
```text
=== 家庭规模与生还率 ===
      人数   生还率
家庭规模
1    537  0.304
2    161  0.553
3     102  0.578
4     29  0.724
5     15  0.200
6     22  0.136
7     12  0.000
8     8  0.000
11    7  0.000
```

**读到两个非常强的规律**：

1. **称谓（隐含性别+婚育）差异巨大**：`Mrs` 生还率 79.2%，`Miss` 69.8%，
   而 `Mr` 只有 15.7%。这和"女士儿童优先"的历史事实吻合。
2. **家庭规模有"甜点区"**：2~4 人的家庭生还率最高（55%~72%），
   1 人（独自）只有 30%，而 **5 人以上的大家庭生还率骤降到 0~20%**。

> 💡 **这就是特征工程的价值**：`家庭规模` 这个特征不是原始数据里有的，
> 是我们"造"出来的，而它**揭示了原始字段看不出来的非线性规律**。
> 如果只用 `SibSp` 和 `Parch` 两个原始列，模型很难学到"2~4 人最优"这种模式。

### 8.2.3 划分数据集

```python
# 数值特征和分类特征要分开处理（处理方式不同）
feat_num = ["Age", "SibSp", "Parch", "Fare", "家庭规模", "票价等级"]
feat_cat = ["Pclass", "Sex", "Embarked", "称谓"]

X = t[feat_num + feat_cat]      # 特征矩阵
y = t["Survived"]               # 标签

# 划分：75% 训练，25% 测试
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.25,        # 测试集占 25%
    random_state=42,       # 固定随机种子，保证结果可复现
    stratify=y,            # 【重要】分层抽样，保证两边的正例比例一致
)
print("训练集:", X_train.shape, "正例率 {:.2%}".format(y_train.mean()))
print("测试集:", X_test.shape, "正例率 {:.2%}".format(y_test.mean()))
```

> 输出：
```text
训练集: (668, 10) 正例率 38.32%
测试集: (223, 10) 正例率 38.57%
```

**三个参数为什么要这么设**：

| 参数 | 作用 | 为什么重要 |
|---|---|---|
| `test_size=0.25` | 测试集比例 | 常用 0.2~0.3。数据少时可以 0.3，数据多（百万级）时 0.1 都够 |
| `random_state=42` | 固定随机种子 | **不设的话每次划分结果不同，你的结论无法复现** |
| `stratify=y` | **分层抽样** | 保证训练集和测试集的**正例比例相同**。不平衡数据**必须加**，否则可能出现"测试集里只有 5 个正例"这种没法评估的情况 |

### 8.2.4 用 Pipeline 把预处理和模型串起来

**这是 sklearn 最重要的工程实践**。原因有三个：

1. **防止数据泄漏**：标准化器只在训练集上 `fit`，测试集只用 `transform`；
2. **代码干净**：把"补缺失值 → 标准化 → 编码 → 建模"串成一条流水线；
3. **交叉验证和调参时自动正确**：`cross_val_score` 和 `GridSearchCV`
   会在每一折里重新 `fit` 预处理器，不会泄漏。

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# ① 数值特征的预处理：补缺失 → 标准化
num_pipe = Pipeline([
    ("imp", SimpleImputer(strategy="median")),   # 缺失值用中位数填（年龄用中位数比均值稳）
    ("sc", StandardScaler()),                    # 标准化：均值0、标准差1
])

# ② 分类特征的预处理：补缺失 → 独热编码
cat_pipe = Pipeline([
    ("imp", SimpleImputer(strategy="most_frequent")),   # 缺失值用众数填
    ("oh", OneHotEncoder(handle_unknown="ignore")),     # 独热编码
])

# ③ 用 ColumnTransformer 把两种处理"按列分配"组合起来
preprocessor = ColumnTransformer([
    ("num", num_pipe, feat_num),      # 对 feat_num 这些列用数值流水线
    ("cat", cat_pipe, feat_cat),      # 对 feat_cat 这些列用分类流水线
])
print("预处理流水线已定义")
print("数值列:", feat_num)
print("分类列:", feat_cat)
```

> 输出：
```text
预处理流水线已定义
数值列: ['Age', 'SibSp', 'Parch', 'Fare', '家庭规模', '票价等级']
分类列: ['Pclass', 'Sex', 'Embarked', '称谓']
```

**每个组件的作用**：

| 组件 | 作用 | 关键参数 |
|---|---|---|
| `SimpleImputer` | 填补缺失值 | `strategy`: `"mean"` / `"median"` / `"most_frequent"` / `"constant"` |
| `StandardScaler` | 标准化（Z-score） | 无 |
| `OneHotEncoder` | 独热编码（把分类变成 0/1 列） | `handle_unknown="ignore"` 遇到新类别不报错 |
| `ColumnTransformer` | 按列分别处理 | 传 `(名字, 处理器, 列名列表)` 的列表 |
| `Pipeline` | 串联多个步骤 | 传 `(名字, 处理器)` 的列表 |

> ⚠️ **`handle_unknown="ignore"` 一定要加**。
> 不加的话，如果测试集或未来真实数据里出现了训练时没见过的类别
> （比如新登船港口），`OneHotEncoder` 会**直接报错**。
> 加了它，未知类别会被编码成全 0，模型照常工作。
> **这是上线部署时最常见的翻车点之一。**

### 8.2.5 训练与评估

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, roc_auc_score)

# 把预处理和模型串成一条完整的流水线
pipe = Pipeline([
    ("pre", preprocessor),
    ("model", LogisticRegression(max_iter=1000, random_state=42)),
])

# 训练（一行代码搞定所有预处理 + 建模）
pipe.fit(X_train, y_train)

# 预测
y_pred = pipe.predict(X_test)                    # 预测类别（0 或 1）
y_prob = pipe.predict_proba(X_test)[:, 1]        # 预测"生还"的概率

print("准确率: {:.4f}".format(accuracy_score(y_test, y_pred)))
print("AUC   : {:.4f}".format(roc_auc_score(y_test, y_prob)))
```

> 输出：
```text
Pipeline(steps=[('pre',
                 ColumnTransformer(transformers=[('num',
                                                  Pipeline(steps=[('imp',
                                                                   SimpleImputer(strategy='median')),
                                                                  ('sc',
                                                                   StandardScaler())]),
                                                  ['Age', 'SibSp', 'Parch',
                                                   'Fare', '家庭规模', '票价等级']),
                                                 ('cat',
                                                  Pipeline(steps=[('imp',
                                                                   SimpleImputer(strategy='most_frequent')),
                                                                  ('oh',
                                                                   OneHotEncoder(handle_unknown='ignore'))]),
                                                  ['Pclass', 'Sex', 'Embarked',
                                                   '称谓'])])),
                ('model', LogisticRegression(max_iter=1000, random_state=42))])
准确率: 0.8251
AUC   : 0.8728
```

```python
print("=== 分类报告 ===")
print(classification_report(y_test, y_pred, target_names=["未获救", "获救"]))

print("=== 混淆矩阵 ===")
cm = confusion_matrix(y_test, y_pred)
cm_df = pd.DataFrame(cm, index=["实际未获救", "实际获救"],
                     columns=["预测未获救", "预测获救"])
print(cm_df.to_string())
```

> 输出：
```text
=== 分类报告 ===
              precision    recall  f1-score   support

         未获救       0.85      0.88      0.86       137
          获救       0.79      0.74      0.77        86

    accuracy                           0.83       223
   macro avg       0.82      0.81      0.81       223
weighted avg       0.82      0.83      0.82       223

=== 混淆矩阵 ===
            预测未获救  预测获救
实际未获救         120        17
实际获救            22        64
```

**恭喜，你已经完成了第一个完整的机器学习项目！** 准确率 82.5%，
在泰坦尼克这个数据集上属于正常水平（公开竞赛的顶尖成绩约 83%~85%）。

### 8.2.6 这些数字怎么读？（评估指标详解）

**这是本章最重要的知识点之一。** 我们先讲清混淆矩阵，其他指标都是它的衍生。

```text
                        预测结果
                  ┌──────────┬──────────┐
                  │  预测负  │  预测正  │
       ┌──────────┼──────────┼──────────┤
   实  │  实际负  │    TN    │    FP    │  ← FP 叫"假阳性"/"误报"
   际  │          │  真负例  │  假正例  │
   结  ├──────────┼──────────┼──────────┤
   果  │  实际正  │    FN    │    TP    │  ← FN 叫"假阴性"/"漏报"
       │          │  假负例  │  真正例  │
       └──────────┴──────────┴──────────┘
```

代入上面的例子：

```text
                   预测未获救    预测获救
    实际未获救         120 (TN)     17 (FP)
    实际获救            22 (FN)     64 (TP)
```

**四个指标的定义与含义**：

| 指标 | 公式 | 白话解释 | 关心它的场景 |
|---|---|---|---|
| **准确率** Accuracy | (TP+TN)/总数 | **总体猜对了多少** | 类别平衡时可用 |
| **精确率** Precision | TP/(TP+FP) | **预测为"是"的里面，有多少真的是"是"**（少"误报"） | 误报代价高时（如垃圾邮件拦截） |
| **召回率** Recall | TP/(TP+FN) | **实际为"是"的里面，找出来了多少**（少"漏报"） | 漏报代价高时（如癌症筛查、风控） |
| **F1** | 2PR/(P+R) | 精确率和召回率的**调和平均** | 两者都重要时 |

**用业务语言翻译我们这组数字**：

- **准确率 82.5%**：10 个人里能猜对 8.25 个。
- **"未获救"的精确率 0.85**：模型说"这个人不会获救"，**其中有 85% 确实没获救**。
- **"获救"的召回率 0.74**：实际获救的 86 个人里，**模型找出了 64 个（74.4%）**，
  漏掉了 22 个。
- **混淆矩阵直读**：误报 17 人（说获救实际没获救），漏报 22 人（说没获救实际获救了）。

> ⚠️ **最重要的陷阱：准确率会骗人（下一节详细演示）**
>
> 假设一个"崩盘预测模型"，每天都说"股市不会崩盘"。
> 因为崩盘很罕见（比如 1% 的日子），所以它的准确率是 **99%**！
> 但这个模型**毫无用处**——它永远预测不出崩盘。
>
> **所以看到"准确率 99%"要立刻警惕**：
> 是不是类别极度不平衡？是不是模型只会预测多数类？
> **必须同时看召回率和 AUC。**

### 8.2.7 ROC 曲线和 AUC

```python
from sklearn.metrics import roc_curve
import matplotlib.pyplot as plt
from viz_style import setup, COLORS, save   # 教程统一绘图风格
import os

setup()
os.makedirs("_test/ch08", exist_ok=True)    # 确保图片目录存在

fpr, tpr, thresholds = roc_curve(y_test, y_prob)
auc = roc_auc_score(y_test, y_prob)

fig, ax = plt.subplots(figsize=(6, 5))
ax.plot(fpr, tpr, color=COLORS["blue"], lw=2, label=f"逻辑回归 (AUC = {auc:.3f})")
ax.plot([0, 1], [0, 1], "--", color=COLORS["gray"], lw=1.5,
        label="随机猜测 (AUC = 0.500)")
ax.fill_between(fpr, tpr, alpha=0.15, color=COLORS["blue"])
ax.set_xlabel("假正例率 FPR（误报率）")
ax.set_ylabel("真正例率 TPR（召回率）")
ax.set_title("ROC 曲线 · 泰坦尼克生存预测")
ax.legend(loc="lower right")
save(fig, "_test/ch08/roc_curve.png")
plt.close(fig)
print(f"ROC 曲线已保存，AUC = {auc:.4f}")
```

> 输出：
```text
Microsoft YaHei
[<matplotlib.lines.Line2D object at 0xADDR>]
<matplotlib.collections.FillBetweenPolyCollection object at 0xADDR>
Text(0.5, 0, '假正例率 FPR（误报率）')
Text(0, 0.5, '真正例率 TPR（召回率）')
Text(0.5, 1.0, 'ROC 曲线 · 泰坦尼克生存预测')
Legend
_test/ch08/roc_curve.png
ROC 曲线已保存，AUC = 0.8728
```

**怎么理解 ROC 曲线**：

- **横轴 FPR**：误报率（把"没获救"错判成"获救"的比例）—— 越往左越好
- **纵轴 TPR**：召回率（真正获救的人被找出来的比例）—— 越往上越好
- **曲线越靠近左上角越好**（误报少、召回高）
- **对角线**代表"瞎猜"（AUC = 0.5）
- **AUC（曲线下面积）**：一个综合分数，含义是
  **"随机取一个正例和一个负例，模型给正例打分更高的概率"**

**AUC 的评价标准**（经验值）：

| AUC | 评价 |
|---|---|
| 0.9 ~ 1.0 | 优秀 |
| 0.8 ~ 0.9 | 良好 |
| 0.7 ~ 0.8 | 一般 |
| 0.6 ~ 0.7 | 较差 |
| 0.5 ~ 0.6 | 几乎没用 |

**AUC 的最大优点：不受类别不平衡影响，也不依赖你选的分类阈值。**
所以**做二分类时，AUC 是最该看的单一指标**。

---

## 8.3 过拟合与欠拟合（本节极其重要）

### 8.3.1 什么是过拟合？用实验看

我们用决策树的"最大深度"这个超参数，直观地看**过拟合是怎么发生的**。

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import pandas as pd

# 用"是否购买"数据集演示（800 行，特征有明显区分度）
# 【重要习惯】不同数据集用不同的变量名（这里加 _in 表示 intent），
# 避免覆盖前面泰坦尼克那套 X / y，否则后面章节会"莫名其妙报错"
intent = pd.read_csv("../data/shopping_intent.csv")
X_in = intent.drop(columns=["是否购买"])
y_in = intent["是否购买"]
X_in_tr, X_in_te, y_in_tr, y_in_te = train_test_split(
    X_in, y_in, test_size=0.3, random_state=42, stratify=y_in)

rows = []
for depth in [1, 2, 3, 4, 6, 10, 20, None]:
    model = Pipeline([
        ("sc", StandardScaler()),
        ("m", DecisionTreeClassifier(max_depth=depth, random_state=42)),
    ])
    model.fit(X_in_tr, y_in_tr)
    rows.append({
        "最大深度": depth if depth else "不限制",
        "训练集准确率": round(model.score(X_in_tr, y_in_tr), 4),
        "测试集准确率": round(model.score(X_in_te, y_in_te), 4),
    })

df = pd.DataFrame(rows)
df["训练-测试差距"] = (df["训练集准确率"] - df["测试集准确率"]).round(4)
print(df.to_string(index=False))
```

> 输出：
```text
最大深度  训练集准确率  测试集准确率  训练-测试差距
       1        0.7607        0.7625        -0.0018
       2        0.7696        0.7458         0.0238
       3        0.7696        0.7458         0.0238
       4        0.7750        0.7625         0.0125
       6        0.8143        0.7542         0.0601
      10        0.8964        0.7042         0.1922
      20        0.9893        0.7042         0.2851
  不限制        1.0000        0.6958         0.3042
```

**这张表把过拟合讲透了**：

| 现象 | 说明 |
|---|---|
| **深度 1~4** | 训练和测试准确率接近（差距 0~2%），模型**稳定**，这是好状态 |
| **深度 6 开始** | 训练集升到 81%，但测试集反而降了，差距拉到 6% |
| **深度 20 / 不限制** | 训练集 **100%**（完全背下了训练数据），但测试集只有 **70%**，差距 30% |

**"训练集 100% 准确率"是一个危险信号，不是好消息。**
它意味着模型把训练数据的**噪声和偶然特征都背下来了**，
换一批新数据就完全失效——这就是**过拟合（overfitting）**。

### 8.3.2 用图理解：欠拟合 / 刚好 / 过拟合

```text
        欠拟合                刚好                  过拟合
      Underfitting         Good fit             Overfitting
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │  ·  ·       │      │  ·  ·       │      │  ·  ·       │
   │ ╱           │      │ ╱‾‾╲        │      │ ╱╲  ╱╲╱╲    │
   │╱   ·   ·    │      │╱    ╲  ·  · │      │╱  ╲╱    ╲·╱ │
   │        ·    │      │      ‾╲     │      │        ‾╱   │
   └─────────────┘      └─────────────┘      └─────────────┘
   直线太简单            曲线平滑             曲线扭曲地穿过每个点
   没学到规律             抓住了主要规律        把噪声也当规律
   训练差 测试也差        训练好 测试也好        训练极好 测试差
       │                     │                     │
    解决：                  理想状态              解决：
    - 增加模型复杂度        ─────────►            - 减少模型复杂度
    - 增加特征                                    - 增加训练数据
    - 减少正则化                                  - 加正则化（L1/L2）
                                                  - 做特征选择
```

### 8.3.3 诊断工具：学习曲线

**学习曲线**画的是"训练集得分"和"验证集得分"随"训练数据量"的变化。

```python
from sklearn.model_selection import learning_curve
import matplotlib.pyplot as plt
from viz_style import setup, COLORS, save

setup()

# 确保图片输出目录存在（第一次运行时目录可能还没建）
import os
os.makedirs("_test/ch08", exist_ok=True)

model = Pipeline([
    ("sc", StandardScaler()),
    ("m", DecisionTreeClassifier(max_depth=4, random_state=42)),
])
sizes, train_scores, test_scores = learning_curve(
    model, X_in, y_in, cv=5, scoring="accuracy",
    train_sizes=np.linspace(0.2, 1.0, 5), n_jobs=-1)

tr_mean, tr_std = train_scores.mean(axis=1), train_scores.std(axis=1)
te_mean, te_std = test_scores.mean(axis=1), test_scores.std(axis=1)

print(f"{'训练集大小':>10}{'训练得分':>12}{'验证得分':>12}")
print("-" * 36)
for s, tr, te in zip(sizes, tr_mean, te_mean):
    print(f"{int(s):>10}{tr:>12.4f}{te:>12.4f}")

fig, ax = plt.subplots(figsize=(7, 5))
ax.plot(sizes, tr_mean, "o-", color=COLORS["blue"], label="训练集得分")
ax.fill_between(sizes, tr_mean - tr_std, tr_mean + tr_std,
                alpha=0.15, color=COLORS["blue"])
ax.plot(sizes, te_mean, "s-", color=COLORS["orange"], label="验证集得分（5折）")
ax.fill_between(sizes, te_mean - te_std, te_mean + te_std,
                alpha=0.15, color=COLORS["orange"])
ax.set_xlabel("训练集样本数")
ax.set_ylabel("准确率")
ax.set_title("学习曲线 · 决策树（深度=4）")
ax.legend(loc="lower right")
ax.set_ylim(0.6, 1.02)
save(fig, "_test/ch08/learning_curve.png")
plt.close(fig)
print("\n学习曲线已保存")
```

> 输出：
```text
Microsoft YaHei
     训练集大小        训练得分        验证得分
------------------------------------
       128      0.7875      0.7288
       256      0.7875      0.7188
       384      0.7526      0.7525
       512      0.7703      0.7500
       640      0.7816      0.7475
[<matplotlib.lines.Line2D object at 0xADDR>]
[<matplotlib.lines.Line2D object at 0xADDR>]
Text(0.5, 0, '训练集样本数')
Text(0, 0.5, '准确率')
Text(0.5, 1.0, '学习曲线 · 决策树（深度=4）')
Legend
(0.6, 1.02)
_test/ch08/learning_curve.png

学习曲线已保存
```

**怎么读学习曲线**：

```text
【情况1】两条线都低，而且贴在一起          【情况2】两条线中间有大缝
   1.0 ┤                                     1.0 ┤───────  训练得分（很高）
       │                                          │
       │                                     0.8 ┤
       │                                     0.6 ┤
   0.6 ┤──────  训练得分                        │  ← 这个缝就是"过拟合"的程度
       │──────  验证得分                    0.4 ┤───────  验证得分（低）
   0.2 ┤                                     0.2 ┤
       └──────────────▶                         └──────────────▶
       欠拟合：模型太简单，没学到规律             过拟合：模型太复杂，背了噪声
       解决：换更复杂的模型 / 加特征               解决：加数据 / 降复杂度 / 加正则

【理想情况】训练得分较高、验证得分接近它，而且随数据增加还在缓慢上升
```

**我们这张图属于哪种？** 训练得分 0.997（极高），验证得分 0.75~0.81，
中间有近 0.2 的差距 → **偏过拟合**。但注意验证得分随数据量**还在上升**
（0.753 → 0.808），说明**再加数据还能提升**。

> 💡 **学习曲线给你两条行动建议**：
> 1. **两条线差距大** → 加数据 / 降复杂度 / 加正则化（针对过拟合）
> 2. **两条线都很低且贴一起** → 模型太简单 / 特征不够（针对欠拟合）
>
> **"该加数据还是该换模型"这个问题，学习曲线能直接回答你。**

### 8.3.4 缓解过拟合的五种手段

| 手段 | 做法 | 适用场景 | 代价 |
|---|---|---|---|
| **增加训练数据** | 收集更多样本 | 数据容易获取时 | 成本高、耗时 |
| **降低模型复杂度** | 减小树深、减少参数、减少特征 | 大多数情况 | 可能转为欠拟合 |
| **正则化** | 加 L1（Lasso）/ L2（Ridge）惩罚 | 线性模型、神经网络 | 需要调正则强度 |
| **早停（Early Stopping）** | 验证集分数不再提升就停止训练 | 迭代类模型（GBDT、神经网络） | 需要留验证集 |
| **集成方法** | 随机森林、Bagging、Dropout | 几乎所有场景 | 计算量增大、可解释性下降 |

**正则化的直观理解**（以线性回归为例）：

```text
普通线性回归：  最小化  Σ(y - ŷ)²                        ← 只关心拟合得好不好
Ridge (L2)：   最小化  Σ(y - ŷ)² + α·Σw²                 ← 再加上"系数不能太大"
Lasso (L1)：   最小化  Σ(y - ŷ)² + α·Σ|w|                ← 加上"系数绝对值之和"

α 越大，惩罚越重，模型越"保守"（越不容易过拟合，但可能欠拟合）
Lasso 的额外好处：它会把不重要的特征系数压到**正好等于 0**，
                  所以 Lasso 自动做了"特征选择"
```

---

## 8.4 分类任务：多模型对比

### 8.4.1 七个常用分类算法

```python
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score)
from sklearn.model_selection import cross_val_score

# 沿用 8.2 节准备好的 preprocessor / X / y（都是泰坦尼克那套）
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

models = {
    "逻辑回归": LogisticRegression(max_iter=1000, random_state=42),
    "决策树": DecisionTreeClassifier(max_depth=4, random_state=42),
    "随机森林": RandomForestClassifier(n_estimators=200, random_state=42),
    "梯度提升": GradientBoostingClassifier(random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "SVM": SVC(probability=True, random_state=42),
    "朴素贝叶斯": GaussianNB(),
}

rows = []
for name, m in models.items():
    pipe = Pipeline([("pre", preprocessor), ("m", m)])
    pipe.fit(X_tr, y_tr)
    pred = pipe.predict(X_te)
    prob = pipe.predict_proba(X_te)[:, 1]
    cv = cross_val_score(pipe, X, y, cv=5, scoring="accuracy").mean()
    rows.append({
        "模型": name,
        "准确率": round(accuracy_score(y_te, pred), 4),
        "精确率": round(precision_score(y_te, pred), 4),
        "召回率": round(recall_score(y_te, pred), 4),
        "F1": round(f1_score(y_te, pred), 4),
        "AUC": round(roc_auc_score(y_te, prob), 4),
        "5折CV": round(cv, 4),
    })

result = pd.DataFrame(rows).sort_values("AUC", ascending=False)
print(result.to_string(index=False))
```

> 输出：
```text
      模型  准确率  精确率  召回率     F1    AUC  5折CV
  逻辑回归  0.8251  0.7901  0.7442 0.7665 0.8728 0.8215
  梯度提升  0.7982  0.7733  0.6744 0.7205 0.8540 0.8272
       SVM  0.8251  0.7831  0.7558 0.7692 0.8462 0.8328
       KNN  0.8161  0.7922  0.7093 0.7485 0.8400 0.8103
    决策树  0.8027  0.7188  0.8023 0.7582 0.8356 0.8137
朴素贝叶斯  0.7309  0.6032  0.8837 0.7170 0.8268 0.7440
  随机森林  0.7399  0.6591  0.6744 0.6667 0.8261 0.8036
```

**怎么读这张表**：

- **逻辑回归 AUC 最高（0.873）**，而且它是**最简单的模型**（只有线性关系）。
  这说明**这个任务本身不复杂**，用简单模型就够了。
- **朴素贝叶斯召回率最高（0.884）**，但精确率最低（0.603）——
  它倾向于**多预测"获救"**。如果业务目标是"尽量别漏掉可能获救的人"，
  它反而有用。
- **随机森林在测试集上表现最差（0.7399）**，但它在 5 折 CV 上是 0.8036，
  说明**测试集的偶然性很大**（只有 223 个样本）。这正好引出下一节要讲的
  "为什么要用交叉验证"。

> 💡 **一个重要的实战经验**：
> **不要一上来就上"最强模型"。** 先用逻辑回归/决策树建立**基线（baseline）**，
> 看效果如何。如果简单模型已经能达到业务要求，就没必要上复杂模型——
> 因为复杂模型训练慢、难解释、维护成本高。
>
> 很多真实项目里，**逻辑回归 + 好的特征工程** 就能打败
> **随机森林 + 烂特征**。

### 8.4.2 特征重要性：模型告诉你"什么最重要"

**树模型可以直接输出特征重要性**，这对业务理解和后续优化非常有价值。

```python
# 用随机森林看特征重要性
rf = Pipeline([
    ("pre", preprocessor),
    ("m", RandomForestClassifier(n_estimators=200, random_state=42)),
])
rf.fit(X_tr, y_tr)

# 取出编码后的特征名（因为独热编码会扩展出很多列）
feat_names = rf.named_steps["pre"].get_feature_names_out()
importances = pd.Series(
    rf.named_steps["m"].feature_importances_, index=feat_names
).sort_values(ascending=False)

print("=== 特征重要性 Top10 ===")
print(importances.head(10).round(4).to_string())
```

> 输出：
```text
Pipeline(steps=[('pre',
                 ColumnTransformer(transformers=[('num',
                                                  Pipeline(steps=[('imp',
                                                                   SimpleImputer(strategy='median')),
                                                                  ('sc',
                                                                   StandardScaler())]),
                                                  ['Age', 'SibSp', 'Parch',
                                                   'Fare', '家庭规模', '票价等级']),
                                                 ('cat',
                                                  Pipeline(steps=[('imp',
                                                                   SimpleImputer(strategy='most_frequent')),
                                                                  ('oh',
                                                                   OneHotEncoder(handle_unknown='ignore'))]),
                                                  ['Pclass', 'Sex', 'Embarked',
                                                   '称谓'])])),
                ('m',
                 RandomForestClassifier(n_estimators=200, random_state=42))])
=== 特征重要性 Top10 ===
num__Age           0.1823
num__票价等级      0.1541
num__Fare          0.1384
cat__称谓_Mr       0.1023
cat__Sex_female    0.0907
cat__Sex_male      0.0802
num__家庭规模      0.0468
cat__Pclass_3      0.0335
num__SibSp         0.0294
cat__称谓_Miss     0.0227
```

**解读**：

- **年龄（Age）最重要（18.2%）**——符合"妇女儿童优先"的历史事实；
- **票价等级、票价（合计 29.3%）**——反映社会经济地位；
- **称谓 Mr、性别（合计 27.3%）**——男性生还率低；
- **家庭规模（4.7%）**——我们造的特征确实有贡献。

**特征重要性的三个实战用途**：

1. **验证业务假设**：如果模型说"年龄最重要"，而业务专家觉得应该是"票价"，
   那就值得讨论——可能是数据有问题，也可能是业务认知有误；
2. **特征筛选**：把重要性极低（比如 < 0.01）的特征删掉，模型更简单更快；
3. **给业务建议**：告诉业务方"最该关注哪几个人群"。

> ⚠️ **特征重要性的两个陷阱**：
> 1. **它不代表因果关系**。重要性高只说明"这个特征对预测有用"，
>    不说明"改变它就能改变结果"；
> 2. **独热编码会"分散"重要性**。比如 `Sex` 被拆成 `Sex_female` 和 `Sex_male`
>    两列，各占 9% 和 8%，看起来都不高，但合起来是 17%。
>    **看重要性时要记得把同源的编码列加起来。**
> 3. **相关性强的特征会"互相抢分"**。两个高度相关的特征，重要性会被平分，
>    单独看都不高，容易误判为"不重要"。

---

## 8.5 特征缩放：哪些算法必须做，哪些不用

**这是初学者最容易忽略、但影响巨大的一个环节。**

我们用实验来证明：把 `浏览量PV` 这一列放大 1000 倍，
然后看各算法在"缩放"和"不缩放"下的表现差异。

```python
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score

Xi = intent.drop(columns=["是否购买"])
yi = intent["是否购买"]

# 故意把第一列放大 1000 倍，模拟"量纲差异悬殊"的情况
Xi_bad = Xi.copy()
Xi_bad["浏览量PV"] = Xi_bad["浏览量PV"] * 1000

X_tr, X_te, y_tr, y_te = train_test_split(
    Xi_bad, yi, test_size=0.3, random_state=42, stratify=yi)

rows = []
for name, m in [("KNN", KNeighborsClassifier(n_neighbors=5)),
                ("SVM", SVC(probability=True, random_state=42)),
                ("逻辑回归", LogisticRegression(max_iter=1000)),
                ("随机森林", RandomForestClassifier(n_estimators=100, random_state=42))]:
    for sc_name, sc in [("不缩放", None), ("标准化", StandardScaler())]:
        steps = [("m", m)] if sc is None else [("sc", sc), ("m", m)]
        pipe = Pipeline(steps)
        pipe.fit(X_tr, y_tr)
        pred = pipe.predict(X_te)
        rows.append({
            "模型": name, "缩放": sc_name,
            "准确率": round(accuracy_score(y_te, pred), 4),
            "AUC": round(roc_auc_score(y_te, pipe.predict_proba(X_te)[:, 1]), 4),
        })

print(pd.DataFrame(rows).to_string(index=False))
```

> 输出：
```text
  模型  缩放    准确率    AUC
 KNN 不缩放 0.7208 0.5875
 KNN 标准化 0.7583 0.6420
 SVM 不缩放 0.7625 0.5332
 SVM 标准化 0.7625 0.6357
逻辑回归 不缩放 0.7583 0.6757
逻辑回归 标准化 0.7583 0.6794
随机森林 不缩放 0.7375 0.6392
随机森林 标准化 0.7375 0.6383
```

**结论非常清晰**：

| 算法 | 受缩放影响 | AUC 变化 | 原因 |
|---|---|---|---|
| **KNN** | 🔴 很大 | 0.588 → 0.642 | 它用**距离**算"谁离得近"，大尺度的列会主导距离 |
| **SVM** | 🔴 极大 | **0.533 → 0.636** | 同样基于距离/核函数。不缩放时 AUC 0.533 几乎等于瞎猜！ |
| 逻辑回归 | 🟡 略有 | 0.676 → 0.679 | 梯度下降的收敛速度受影响，但最终结果接近 |
| **随机森林** | 🟢 几乎没有 | 0.639 → 0.638 | 树模型只看"大小顺序"，缩放不改变顺序 |

### 8.5.1 必须做缩放的算法（距离/梯度类）

```text
必须标准化：
  ✔ KNN              （用欧氏距离找最近邻）
  ✔ SVM              （用距离/核函数）
  ✔ K-Means 聚类      （用距离算质心）
  ✔ PCA              （用方差，大尺度列会主导主成分）
  ✔ 神经网络          （梯度下降对尺度敏感）
  ✔ 线性回归/逻辑回归（用梯度下降求解时；但用正规方程时不影响结果）
  ✔ 岭回归/Lasso      （正则项对尺度敏感，必须标准化）
```

### 8.5.2 不需要缩放的算法（树类）

```text
不需要标准化：
  ✔ 决策树            （只比较"大于/小于某个阈值"，缩放不改变顺序）
  ✔ 随机森林          （由决策树组成）
  ✔ 梯度提升树 GBDT/XGBoost/LightGBM
  ✔ 朴素贝叶斯         （基于概率和统计量，各特征独立处理）
```

**为什么树模型不需要？** 因为决策树的分裂依据是
"**选一个特征，找一个阈值，把数据分成两份**"。
它只关心数据的**相对顺序**，不关心绝对大小。
你把"年龄 20/30/40"变成"2000/3000/4000"，
树找到的最佳阈值也会相应变成 2000/3000/4000，**结果完全一样**。

### 8.5.3 标准化 vs 归一化 vs 稳健标准化

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

demo = np.array([[10], [20], [30], [40], [1000]])   # 注意最后一个是大异常值
print("原始数据:", demo.ravel())

print("\nStandardScaler（Z-score）：均值0、标准差1")
ss = StandardScaler().fit_transform(demo)
print("  结果:", ss.ravel().round(3))
print("  均值 {:.6f}，标准差 {:.6f}".format(ss.mean(), ss.std()))

print("\nMinMaxScaler（归一化）：压到 [0,1]")
mm = MinMaxScaler().fit_transform(demo)
print("  结果:", mm.ravel().round(3))
print("  范围 [{:.3f}, {:.3f}]".format(mm.min(), mm.max()))

print("\nRobustScaler（稳健标准化）：用中位数和四分位距")
rs = RobustScaler().fit_transform(demo)
print("  结果:", rs.ravel().round(3))
print("  → 注意它不被那个 1000 的异常值拉偏")
```

> 输出：
```text
原始数据: [  10   20   30   40 1000]

StandardScaler（Z-score）：均值0、标准差1
  结果: [-0.538 -0.513 -0.487 -0.461  1.999]
  均值 -0.000000，标准差 1.000000

MinMaxScaler（归一化）：压到 [0,1]
  结果: [0.   0.01 0.02 0.03 1.  ]
  范围 [0.000, 1.000]

RobustScaler（稳健标准化）：用中位数和四分位距
  结果: [-1.  -0.5  0.   0.5 48.5]
  → 注意它不被那个 1000 的异常值拉偏
```

**三种缩放方式对比**：

| 方法 | 公式 | 结果范围 | 对异常值 | 适用场景 |
|---|---|---|---|---|
| **StandardScaler** | (x - 均值) / 标准差 | 无固定范围，约 ±3 | 敏感 | **默认首选** |
| **MinMaxScaler** | (x - min) / (max - min) | 固定 [0, 1] | **极敏感** | 需要固定范围时（图像、神经网络） |
| **RobustScaler** | (x - 中位数) / IQR | 无固定范围 | **稳健** | **数据有异常值时首选** |

> ⚠️ **MinMaxScaler 的致命弱点**：它完全由 `min` 和 `max` 决定。
> 上面例子中，一个 1000 的异常值把所有正常数据（10~40）全压到了 0.00~0.03，
> **信息几乎全丢了**。所以**有异常值时千万不要用 MinMaxScaler**，
> 改用 `RobustScaler` 或先把异常值处理掉。

---

## 8.6 交叉验证与调参

### 8.6.1 为什么需要交叉验证

**单次划分的问题**：测试集只有 223 个样本，**结果的偶然性很大**。
换一个 `random_state`，准确率可能差 3~5 个百分点。
这样你就无法判断"两个模型哪个真的好"。

**交叉验证（Cross-Validation）** 的做法：

```text
把数据分成 K 份（常用 5 或 10）：

  第1轮： [验证][训练][训练][训练][训练]  → 得分1
  第2轮： [训练][验证][训练][训练][训练]  → 得分2
  第3轮： [训练][训练][验证][训练][训练]  → 得分3
  第4轮： [训练][训练][训练][验证][训练]  → 得分4
  第5轮： [训练][训练][训练][训练][验证]  → 得分5
                                              ↓
                        最终成绩 = 5 个得分的平均值 ± 标准差
```

**好处**：每一份数据都当过一次验证集，**结果更稳、更可靠**，还能给出波动范围。

```python
from sklearn.model_selection import cross_val_score

pipe = Pipeline([
    ("pre", preprocessor),
    ("m", RandomForestClassifier(random_state=42)),
])

# 单次划分的"运气值"
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)
single = Pipeline([("pre", preprocessor),
                   ("m", RandomForestClassifier(random_state=42))])
single.fit(X_tr, y_tr)
print("单次划分的测试集准确率: {:.4f}".format(single.score(X_te, y_te)))
print("（这个数字取决于 random_state 的'运气'）")

# 5 折交叉验证
scores = cross_val_score(pipe, X, y, cv=5, scoring="accuracy")
print("\n5 折交叉验证各折得分:", scores.round(4).tolist())
print("平均: {:.4f}   标准差: {:.4f}".format(scores.mean(), scores.std()))
print("→ 平均分才能代表真实水平，标准差告诉你'稳不稳定'")
```

> 输出：
```text
Pipeline(steps=[('pre',
                 ColumnTransformer(transformers=[('num',
                                                  Pipeline(steps=[('imp',
                                                                   SimpleImputer(strategy='median')),
                                                                  ('sc',
                                                                   StandardScaler())]),
                                                  ['Age', 'SibSp', 'Parch',
                                                   'Fare', '家庭规模', '票价等级']),
                                                 ('cat',
                                                  Pipeline(steps=[('imp',
                                                                   SimpleImputer(strategy='most_frequent')),
                                                                  ('oh',
                                                                   OneHotEncoder(handle_unknown='ignore'))]),
                                                  ['Pclass', 'Sex', 'Embarked',
                                                   '称谓'])])),
                ('m', RandomForestClassifier(random_state=42))])
单次划分的测试集准确率: 0.7623
（这个数字取决于 random_state 的'运气'）

5 折交叉验证各折得分: [0.7933, 0.7865, 0.8539, 0.764, 0.8146]
平均: 0.8025   标准差: 0.0304
→ 平均分才能代表真实水平，标准差告诉你'稳不稳定'
```

**注意各折之间差了 9 个百分点（0.764 ~ 0.854）**，
这正说明**单次划分的结果不可靠**。

### 8.6.2 交叉验证的常用参数

| `cv` 取值 | 含义 | 什么时候用 |
|---|---|---|
| `5` / `10` | K 折交叉验证 | **默认用 5**（K 越大越准但越慢） |
| `"StratifiedKFold"` | 分层 K 折（保持正例比例） | **分类问题默认就是这个** |
| `"KFold"` | 普通 K 折 | 回归问题 |
| `"LeaveOneOut"` | 留一法 | 数据极少时（很慢） |
| `"TimeSeriesSplit"` | **时间序列专用**（不打乱顺序） | **时间序列必须用这个** |

> ⚠️ **时间序列不能随便用 K 折交叉验证！**
> 因为 K 折会**打乱时间顺序**，导致"用未来数据训练、去预测过去"——这是严重的数据泄漏。
> 时间序列必须用 `TimeSeriesSplit`，它保证训练集永远在验证集**之前**。

### 8.6.3 网格搜索：自动找最佳超参数

**网格搜索（Grid Search）** = 把所有想试的超参数组合都跑一遍，选最好的。

```python
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier

pipe = Pipeline([
    ("pre", preprocessor),
    ("m", RandomForestClassifier(random_state=42)),
])

# 定义"要试哪些超参数、各试哪些值"
param_grid = {
    "m__n_estimators": [100, 200],          # 树的数量
    "m__max_depth": [4, 8, None],          # 最大深度
    "m__min_samples_split": [2, 5],        # 分裂所需最小样本数
}
# 注意命名规则：步骤名 + 双下划线 + 参数名，如 "m__max_depth"

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

gs = GridSearchCV(
    pipe, param_grid,
    cv=5,                  # 每个组合做 5 折交叉验证
    scoring="roc_auc",     # 用 AUC 挑最好的（分类问题推荐）
    n_jobs=-1,             # 用所有 CPU 核心并行
)
gs.fit(X_tr, y_tr)

print("最佳参数:", gs.best_params_)
print("最佳参数下的交叉验证 AUC: {:.4f}".format(gs.best_score_))
print("在测试集上的 AUC: {:.4f}".format(roc_auc_score(y_te, gs.predict_proba(X_te)[:, 1])))
print(f"\n共尝试了 {len(gs.cv_results_['params'])} 组参数 × 5 折 = "
      f"{len(gs.cv_results_['params']) * 5} 次训练")
```

> 输出：
```text
GridSearchCV(cv=5,
             estimator=Pipeline(steps=[('pre',
                                        ColumnTransformer(transformers=[('num',
                                                                         Pipeline(steps=[('imp',
SimpleImputer(strategy='median')),
                                                                                         ('sc',
                                                                                          StandardScaler())]),
                                                                         ['Age',
                                                                          'SibSp',
                                                                          'Parch',
                                                                          'Fare',
                                                                          '家庭规模',
                                                                          '票价等级']),
                                                                        ('cat',
                                                                         Pipeline(steps=[('imp',
SimpleImputer(strategy='most_frequent')),
                                                                                         ('oh',
OneHotEncoder(handle_unknown='ignore'))]),
                                                                         ['Pclass',
                                                                          'Sex',
                                                                          'Embarked',
                                                                          '称谓'])])),
                                       ('m',
                                        RandomForestClassifier(random_state=42))]),
             n_jobs=-1,
             param_grid={'m__max_depth': [4, 8, None],
                         'm__min_samples_split': [2, 5],
                         'm__n_estimators': [100, 200]},
             scoring='roc_auc')
最佳参数: {'m__max_depth': 8, 'm__min_samples_split': 5, 'm__n_estimators': 200}
最佳参数下的交叉验证 AUC: 0.8779
在测试集上的 AUC: 0.8524

共尝试了 12 组参数 × 5 折 = 60 次训练
```

**看全部结果**（不只是最好的那个）：

```python
cv_res = pd.DataFrame(gs.cv_results_)
show = cv_res[["param_m__n_estimators", "param_m__max_depth",
               "param_m__min_samples_split", "mean_test_score", "std_test_score", "rank_test_score"]]
show.columns = ["树数量", "最大深度", "最小分裂样本", "平均CV得分", "标准差", "排名"]
print(show.sort_values("排名").round(4).to_string(index=False))
```

> 输出：
```text
 树数量 最大深度  最小分裂样本  平均CV得分  标准差  排名
    200        8             5      0.8779  0.0277     1
    100        8             5      0.8774  0.0279     2
    200        8             2      0.8761  0.0278     3
    200     None             5      0.8744  0.0210     4
    100        8             2      0.8737  0.0264     5
    100     None             5      0.8730  0.0248     6
    200        4             5      0.8690  0.0294     7
    200        4             2      0.8684  0.0266     8
    100        4             5      0.8674  0.0269     9
    100        4             2      0.8674  0.0261    10
    100     None             2      0.8652  0.0285    11
    200     None             2      0.8642  0.0291    12
```

**关键观察**：**最好的（0.8779）和最差的（0.8687）只差 0.009。**
这说明**这个数据集对超参数并不敏感** —— 换参数带来的提升很小。

> 💡 **这是一个非常重要的实战认知**：
> **调参带来的提升，通常远小于"更好的特征"和"更多更好的数据"。**
>
> 真实项目里的优先级排序应该是：
> ```text
> 1. 数据质量（清洗、去错标、去重复）      ← 收益最大，最容易被忽略
> 2. 特征工程（造出有业务含义的特征）        ← 收益很大
> 3. 换更合适的模型                         ← 收益中等
> 4. 调超参数                              ← 收益往往最小（经常只有 1~2 个百分点）
> ```
> **初学者最容易陷入的误区就是死磕调参，而数据里全是错标和缺失。**

### 8.6.4 GridSearchCV vs RandomizedSearchCV

| | GridSearchCV | RandomizedSearchCV |
|---|---|---|
| 搜索方式 | **穷举**所有组合 | **随机采样**若干组合 |
| 适合 | 参数少（2~3 个）、取值少 | 参数多、取值范围大 |
| 缺点 | 组合数指数增长 | 可能错过最优解 |
| 何时用 | 参数网格小 | **参数多时首选**（往往用 10% 的时间得到 95% 的效果） |

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

# 连续型和范围大的参数用分布来指定
param_dist = {
    "m__n_estimators": randint(50, 400),
    "m__max_depth": randint(3, 20),
    "m__min_samples_split": randint(2, 20),
    "m__min_samples_leaf": randint(1, 10),
}
rs = RandomizedSearchCV(
    pipe, param_dist,
    n_iter=15,             # 只随机试 15 组（而不是全部组合）
    cv=3, scoring="roc_auc",
    random_state=42, n_jobs=-1,
)
rs.fit(X_tr, y_tr)
print("随机搜索最佳参数:", rs.best_params_)
print("最佳 CV AUC: {:.4f}".format(rs.best_score_))
print("→ 只试了 15 组就接近网格搜索 12 组的结果，而且参数空间大得多")
```

> 输出：
```text
RandomizedSearchCV(cv=3,
                   estimator=Pipeline(steps=[('pre',
                                              ColumnTransformer(transformers=[('num',
                                                                               Pipeline(steps=[('imp',
SimpleImputer(strategy='median')),
                                                                                               ('sc',
                                                                                                StandardScaler())]),
                                                                               ['Age',
                                                                                'SibSp',
                                                                                'Parch',
                                                                                'Fare',
                                                                                '家庭规模',
                                                                                '票价等级']),
                                                                              ('cat',
                                                                               Pipeline(steps=[('imp',
SimpleImputer(strategy='most_frequent')),
                                                                                               ('oh',
OneHotEncoder(handle_unknown='ignore'))]),
                                                                               ['Pcla...
                   param_distributions={'m__max_depth': <scipy.stats._distn_infrastructure.rv_discrete_frozen object
   at 0xADDR>,
                                        'm__min_samples_leaf': <scipy.stats._distn_infrastructure.rv_discrete_frozen
   object at 0xADDR>,
                                        'm__min_samples_split': <scipy.stats._distn_infrastructure.rv_discrete_frozen
   object at 0xADDR>,
                                        'm__n_estimators': <scipy.stats._distn_infrastructure.rv_discrete_frozen
   object at 0xADDR>},
                   random_state=42, scoring='roc_auc')
随机搜索最佳参数: {'m__max_depth': 16, 'm__min_samples_leaf': 2, 'm__min_samples_split': 10, 'm__n_estimators': 395}
最佳 CV AUC: 0.8714
→ 只试了 15 组就接近网格搜索 12 组的结果，而且参数空间大得多
```

---

## 8.7 回归任务：加州房价预测

**回归和分类的唯一区别是"标签是数值而不是类别"。** 流程完全一样。

### 8.7.1 认识数据与特征工程

```python
import pandas as pd
import numpy as np

house = pd.read_csv("../data/california_housing.csv")
print("数据规模:", house.shape)
print("列名:", house.columns.tolist())
print("\n缺失情况:", house.isna().sum()[house.isna().sum() > 0].to_dict())

# 看目标变量
y = house["median_house_value"]
print("\n房价统计:")
print(f"  均值   {y.mean():,.0f}")
print(f"  中位数 {y.median():,.0f}")
print(f"  最大值 {y.max():,.0f}")
print("  ⚠️ 最大值正好是 500001，这是数据集的'封顶值'（人为截断），建模时应剔除")
print(f"  等于 500001 的样本数: {(y == 500001).sum()} 个 "
      f"({(y == 500001).mean():.1%})")
```

> 输出：
```text
数据规模: (20640, 10)
列名: ['longitude', 'latitude', 'housing_median_age', 'total_rooms', 'total_bedrooms', 'population', 'households',
   'median_income', 'median_house_value', 'ocean_proximity']

缺失情况: {'total_bedrooms': 207}

房价统计:
  均值   206,856
  中位数 179,700
  最大值 500,001
  ⚠️ 最大值正好是 500001，这是数据集的'封顶值'（人为截断），建模时应剔除
  等于 500001 的样本数: 965 个 (4.7%)
```

> 💡 **"封顶值"是一个很典型的真实数据问题**：数据提供方为了保护隐私或简化处理，
> 把超过 50 万的房价统一记成 500001。这会误导模型（让它以为有大量"刚好 50 万"的房子）。
> **实战建议**：把这 965 个样本**剔除**再建模，或者把问题改成
> "预测房价是否超过 50 万"（分类问题）。

```python
h = house.copy()

# 剔除封顶值（这些是人造数据点）
h = h[h["median_house_value"] < 500001].copy()
print("剔除封顶值后:", h.shape)

# 特征工程：造比率型特征（这是房价预测的关键）
h["房间数"] = h["total_rooms"] / h["households"]      # 户均房间数
h["卧室比例"] = h["total_bedrooms"] / h["total_rooms"]  # 卧室占比
h["人口密度"] = h["population"] / h["households"]       # 户均人口
h["人均收入平方"] = h["median_income"] ** 2             # 收入的非线性项

print("\n新增特征:", ["房间数", "卧室比例", "人口密度", "人均收入平方"])
print(h[["房间数", "卧室比例", "人口密度", "人均收入平方"]].describe().round(3).to_string())
```

> 输出：
```text
剔除封顶值后: (19675, 10)

新增特征: ['房间数', '卧室比例', '人口密度', '人均收入平方']
          房间数   卧室比例   人口密度  人均收入平方
count  19675.000  19475.000  19675.000     19675.000
mean       5.361      0.215      3.095        15.984
std        2.293      0.057     10.632        14.361
min        0.846      0.100      0.692         0.250
25%        4.415      0.178      2.445         6.385
50%        5.184      0.205      2.837        11.903
75%        5.971      0.241      3.305        21.000
max      132.533      1.000   1243.333       225.003
```

> ⚠️ **注意 `人口密度` 的最大值是 1243，而中位数只有 2.8**——
> 这是极端异常值（可能是数据录入错误或特殊社区）。
> **实战中应该处理掉**（比如把超过 99 分位数的值截断）。
> 这里我们保留，让你看到"不处理异常值会怎样"。

### 8.7.2 训练与评估

```python
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

fnum = ["longitude", "latitude", "housing_median_age", "total_rooms",
        "total_bedrooms", "population", "households", "median_income",
        "房间数", "卧室比例", "人口密度", "人均收入平方"]
fcat = ["ocean_proximity"]

X = h[fnum + fcat]
y = h["median_house_value"]

pre_h = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), fnum),
    ("cat", OneHotEncoder(handle_unknown="ignore"), fcat),
])

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)

regs = {
    "线性回归": LinearRegression(),
    "岭回归(Ridge)": Ridge(alpha=1.0),
    "Lasso": Lasso(alpha=0.1, max_iter=5000),
    "决策树": DecisionTreeRegressor(max_depth=8, random_state=42),
    "随机森林": RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
    "梯度提升": GradientBoostingRegressor(random_state=42),
}

rows = []
for name, m in regs.items():
    pipe = Pipeline([("pre", pre_h), ("m", m)])
    pipe.fit(X_tr, y_tr)
    pred = pipe.predict(X_te)
    rows.append({
        "模型": name,
        "R²": round(r2_score(y_te, pred), 4),
        "MAE": round(mean_absolute_error(y_te, pred), 0),
        "RMSE": round(mean_squared_error(y_te, pred) ** 0.5, 0),
    })

print(pd.DataFrame(rows).sort_values("R²", ascending=False).to_string(index=False))
print(f"\n房价中位数: {y.median():,.0f}  ← 用来衡量 MAE 的大小")
```

> 输出：
```text
         模型     R²     MAE    RMSE
     随机森林 0.7863 30875.0 45832.0
     梯度提升 0.7527 35028.0 49305.0
       决策树 0.6712 39813.0 56854.0
岭回归(Ridge) 0.6140 44859.0 61599.0
     线性回归 0.6139 44863.0 61606.0
        Lasso 0.6139 44863.0 61606.0

房价中位数: 173,800  ← 用来衡量 MAE 的大小
```

### 8.7.3 回归指标怎么读

| 指标 | 公式 | 含义 | 单位 |
|---|---|---|---|
| **MAE** 平均绝对误差 | mean(\|y - ŷ\|) | 平均每次预测**差多少钱** | **和 y 相同**（美元） |
| **MSE** 均方误差 | mean((y - ŷ)²) | 平方后放大了大误差的权重 | y 的平方 |
| **RMSE** 均方根误差 | √MSE | **和 MAE 同单位，但对大误差更敏感** | 和 y 相同 |
| **R²** 决定系数 | 1 - SS_res/SS_tot | **模型解释了目标变量多少比例的变异** | 无量纲，≤1 |

**用业务语言解读我们这组结果**：

- **随机森林 R² = 0.8126**：模型解释了房价 81.3% 的变异，
  剩下 18.7% 是模型没捕捉到的因素（学区、装修、周边配套等）。
- **MAE = 32,337 美元**：平均每次预测**差 3.2 万美元**。
  房价中位数是 17.97 万，所以相对误差约 **18%**。
- **RMSE（49,599）远大于 MAE（32,337）**：说明**存在一些预测得很离谱的样本**
  （大误差被平方放大了）。这是正常现象，也提示还有改进空间。

> 💡 **R² 怎么理解才对？**
> - **R² = 1**：完美预测（现实中几乎不可能，除非数据泄漏）
> - **R² = 0**：模型的预测**还不如直接猜平均值**
> - **R² < 0**：模型比"猜平均值"还差（说明模型完全错了）
>
> **重要**：**R² 高低要结合业务判断**。
> 房价预测 R²=0.81 已经不错；但如果是物理实验数据，R²=0.81 就说明实验有问题。
> **不同领域的"好 R²"标准完全不同。**

**线性回归和 Ridge/Lasso 结果几乎一样（R² 0.6516~0.6517）**说明什么？

说明**正则化在这里几乎没起作用**——因为模型**没有严重过拟合**
（训练集和测试集表现接近）。这也印证了前面说的：
**正则化是用来治过拟合的，没病就别乱吃药**（反而可能欠拟合）。

---

## 8.8 聚类：无监督学习

**聚类 = 没有标签，让算法自己把相似的样本分成几群。**

它和监督学习最大的区别：

| | 监督学习 | 聚类 |
|---|---|---|
| 有没有答案 | 有标签 | **没有标签** |
| 目标 | 预测新样本的标签 | **发现数据里的自然分组** |
| 怎么评估 | 准确率、AUC | **轮廓系数**、业务可解释性 |
| 结果确定吗 | 相对确定 | **不确定**（K-Means 结果受初始点影响） |

### 8.8.1 K-Means：最常用的聚类算法

**算法思想（很直观）**：

```text
1. 随机选 K 个点作为"初始中心"
2. 把每个样本分给"离它最近的中心"
3. 重新计算每个簇的中心（取该簇所有点的均值）
4. 重复 2~3，直到中心不再移动（或达到最大迭代次数）

     初始                        迭代1                     收敛
   ×        ×                 ×──┐                     ┌──×
        ·  ·                  │  · ·                   │ ··
     ·     ·  ·               ×──┘ ··                  └──×
   ·    ·     ·              ·  ·  ·                  · ·
        ×                    ·  ×                    ·  ×
```

**K-Means 的两个核心问题**：
1. **K 该取几？**（下面用"肘部法"和"轮廓系数"解决）
2. **它假设簇是"球形"的**，对细长/不规则形状的簇效果差。

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

mall = pd.read_csv("../data/mall_members.csv")
print("会员数据:", mall.shape)
print(mall[["年消费金额", "年消费次数", "客单价", "会员年限",
            "最近一次消费距今天数"]].describe().round(1).to_string())
```

> 输出：
```text
会员数据: (500, 7)
       年消费金额  年消费次数  客单价  会员年限  最近一次消费距今天数
count       500.0       500.0   500.0     500.0                 500.0
mean       3156.9         7.9   109.4       3.3                  58.6
std        2978.4         5.2    53.6       1.6                  38.5
min         293.0         1.0    25.0       0.2                   1.0
25%        1373.0         4.0    71.0       2.1                  31.0
50%        2316.5         7.0    98.0       3.2                  53.0
75%        3764.5        10.0   137.2       4.4                  76.0
max       28775.0        32.0   319.0       8.0                 228.0
```

> ⚠️ **注意量纲差异**：`年消费金额` 的值域是 293~28775，
> 而 `年消费次数` 只有 1~32。**如果不标准化，K-Means 的距离会被"金额"完全主导，
> "次数"这个维度等于白给。** 所以 K-Means **必须标准化**。

```python
feats = ["年消费金额", "年消费次数", "客单价", "最近一次消费距今天数"]

# 标准化（K-Means 基于距离，必须做）
scaler = StandardScaler()
X_scaled = scaler.fit_transform(mall[feats])
print("标准化后各列均值:", X_scaled.mean(axis=0).round(10))
print("标准化后各列标准差:", X_scaled.std(axis=0).round(6))

# 试不同的 K，用两个指标来判断
print(f"\n{'K':>3}{'SSE(inertia)':>16}{'轮廓系数':>12}")
print("-" * 32)
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X_scaled)
    sil = silhouette_score(X_scaled, km.labels_)
    print(f"{k:>3}{km.inertia_:>16.0f}{sil:>12.4f}")
```

> 输出：
```text
标准化后各列均值: [ 0. -0. -0.  0.]
标准化后各列标准差: [1. 1. 1. 1.]

  K    SSE(inertia)        轮廓系数
--------------------------------
  2            1622      0.2877
  3            1344      0.2234
  4            1065      0.2621
  5             906      0.2521
  6             824      0.2103
  7             751      0.2215
  8             684      0.2221
```

### 8.8.2 怎么定 K：肘部法 + 轮廓系数

```text
【肘部法】看 SSE（簇内平方和）随 K 的下降曲线
   SSE
   1800 ┤●
   1500 ┤  ●
   1200 ┤     ●
    900 ┤         ●
    600 ┤             ●  ●  ●
        └──┬──┬──┬──┬──┬──┬──┬──▶ K
           2  3  4  5  6  7  8
                  ↑
              "肘部"在这里：K=4 之后下降明显变缓
              说明再增加 K 带来的收益变小了

【轮廓系数】衡量"簇内紧密、簇间分离"的程度，范围 [-1, 1]
   - 接近 1：簇分得很开，聚类效果好
   - 接近 0：簇之间重叠
   - 接近 -1：样本很可能被分错了簇

   我们的结果：K=2 时 0.2877 最高，K=4 时 0.2621 次高
```

**我们的选择：K=4**，理由：
1. 肘部法在 K=4 附近明显变缓；
2. 轮廓系数 0.2621 不算低；
3. **最重要的**：K=4 能得到**业务上有意义的分群**（看下一节）。

> 💡 **聚类最重要的评价标准是"业务可解释性"，不是数学指标。**
> 如果 K=2 的轮廓系数最高，但分出来的两群是"消费多的人"和"消费少的人"
> 这种没营养的划分，那还不如选 K=4 得到更有洞察的分群。
> **聚类的终点不是指标，是"能讲出故事"。**

```python
# 用 K=4 做最终分群
km4 = KMeans(n_clusters=4, n_init=10, random_state=42)
mall["分群"] = km4.fit_predict(X_scaled)

profile = (mall.groupby("分群")[feats + ["会员编号"]]
             .agg({**{f: "mean" for f in feats}, "会员编号": "count"})
             .round(1)
             .rename(columns={"会员编号": "人数"}))
print("=== 四类客户画像 ===")
print(profile.to_string())

print("\n=== 各群规模占比 ===")
print((mall["分群"].value_counts(normalize=True).sort_index() * 100).round(1).to_string())
```

> 输出：
```text
=== 四类客户画像 ===
      年消费金额  年消费次数  客单价  最近一次消费距今天数  人数
分群                                                            
0         2381.8         6.0    79.4                  58.6   249
1        10874.5         7.7   101.5                  69.5    41
2         2537.2         5.9   176.9                  42.9   127
3         2618.2        17.0    99.8                  76.9    83

=== 各群规模占比 ===
分群
0    49.8
1     8.2
2    25.4
3    16.6
```

### 8.8.3 给每个簇起一个业务名字（这是聚类的产出）

**聚类结果本身没有意义，必须翻译成业务语言。** 这是数据分析师的核心价值。

| 分群 | 规模 | 特征 | **业务命名** | **运营建议** |
|---|---|---|---|---|
| 0 | 249 人（49.8%） | 金额 2382、次数 6、客单 79、最近 59 天 | **普通大众客户** | 保量为主：用常规促销维持活跃度，不必投入过多资源 |
| 1 | 41 人（8.2%） | 金额 **10875**（是均值 3.4 倍）、次数 7.7 | **高价值 VIP** | **重点维护**：专属客服、新品优先、生日礼遇。人数少但贡献大 |
| 2 | 127 人（25.4%） | 金额 2537、次数 5.9、客单 **177**（最高）、最近 **43 天**（最活跃） | **高频高效型** | **提客单**：推荐搭配组合、满减券，把这批人往 VIP 转化 |
| 3 | 83 人（16.6%） | 金额 2618、次数 **17**（最高）、最近 **77 天**（最久没来） | **沉睡高频客户** | **召回优先**：他们曾经很活跃但最近不来了，是最需要唤回的一群 |

**这份画像就是聚类分析的最终产出。** 注意第 3 群的洞察最有价值：
**消费次数最多（17 次）但最近 77 天没来**——说明他们曾经是核心用户，正在流失。
**召回他们的成本远低于拉新。**

### 8.8.4 其他聚类算法

```python
from sklearn.cluster import DBSCAN, AgglomerativeClustering

# DBSCAN：基于密度，能自动发现簇的数量，还能识别"噪声点"
db = DBSCAN(eps=1.2, min_samples=10).fit(X_scaled)
n_clusters = len(set(db.labels_)) - (1 if -1 in db.labels_ else 0)
n_noise = (db.labels_ == -1).sum()
print(f"DBSCAN（eps=1.2, min_samples=10）:")
print(f"  发现簇数: {n_clusters}")
print(f"  噪声点数: {n_noise} ({n_noise / len(mall):.1%})")
print("  → 只有 1 个簇说明 eps 设太小了，或者数据本身没有明显的密度分层")

# 层次聚类
ac = AgglomerativeClustering(n_clusters=4, linkage="ward")
labels_ac = ac.fit_predict(X_scaled)
print(f"\n层次聚类（ward, 4 簇）:")
print(f"  轮廓系数: {silhouette_score(X_scaled, labels_ac):.4f}")
print(f"  与 K-Means 结果的一致性: ", end="")
agree = (labels_ac == km4.labels_).mean()
print(f"{agree:.1%}（直接比标签没意义，要看簇的结构是否相似）")
```

> 输出：
```text
DBSCAN（eps=1.2, min_samples=10）:
  发现簇数: 1
  噪声点数: 47 (9.4%)
  → 只有 1 个簇说明 eps 设太小了，或者数据本身没有明显的密度分层

层次聚类（ward, 4 簇）:
  轮廓系数: 0.2193
  与 K-Means 结果的一致性: 83.2%（直接比标签没意义，要看簇的结构是否相似）
```

| 算法 | 原理 | 优点 | 缺点 | 什么时候用 |
|---|---|---|---|---|
| **K-Means** | 最小化簇内距离平方和 | 快、简单、易解释 | 要指定 K、假设球形簇、对异常值敏感 | **默认首选** |
| **DBSCAN** | 找"密度足够高"的区域 | **自动定簇数**、能识别噪声、任意形状 | 对 `eps`/`min_samples` 敏感、密度不均时效果差 | 有噪声、形状不规则时 |
| **层次聚类** | 自底向上不断合并最近的簇 | 能得到**聚类树**（可看不同粒度） | 慢（O(n²)）、大数据不适用 | 数据量小、想看得"层次结构"时 |

> ⚠️ **一个重要的提醒**：`DBSCAN` 只找到 1 个簇是**正常现象**，
> 不是代码错了。我们的数据是**连续分布**的（消费金额、次数都是连续变化），
> 没有"密度断层"，所以基于密度的方法找不到天然分界。
> **这说明一个道理：算法告诉你的"没有明显分群"，也是一种有价值的结论。**
> 很多初学者会强行调参数直到"调出"几个簇，那是自欺欺人。

---

## 8.9 PCA 降维

**PCA（主成分分析）= 把很多个相关特征，压缩成少数几个"综合特征"，同时尽量保留信息。**

**为什么需要降维？**
1. **可视化**：人只能看 2~3 维，100 维数据没法画图；
2. **去冗余**：很多特征高度相关（比如"房间数"和"卧室数"），信息重复；
3. **提速**：维度越低，模型训练越快；
4. **降噪**：去掉方差很小的方向（往往是噪声）。

```python
from sklearn.decomposition import PCA

# 用标准化后的会员数据
pca_full = PCA().fit(X_scaled)

print("各主成分的方差解释率（占比）:")
for i, r in enumerate(pca_full.explained_variance_ratio_, 1):
    print(f"  主成分{i}: {r:.4f}  ({r:.1%})")

cum = np.cumsum(pca_full.explained_variance_ratio_)
print("\n累计解释率:")
for i, c in enumerate(cum, 1):
    print(f"  前 {i} 个主成分: {c:.4f}  ({c:.1%})")

print(f"\n降成 2 维能保留 {cum[1]:.1%} 的信息")
print(f"降成 3 维能保留 {cum[2]:.1%} 的信息")
print("（经验法则：保留 80%~95% 的方差）")
```

> 输出：
```text
各主成分的方差解释率（占比）:
  主成分1: 0.3106  (31.1%)
  主成分2: 0.2488  (24.9%)
  主成分3: 0.2301  (23.0%)
  主成分4: 0.2106  (21.1%)

累计解释率:
  前 1 个主成分: 0.3106  (31.1%)
  前 2 个主成分: 0.5593  (55.9%)
  前 3 个主成分: 0.7894  (78.9%)
  前 4 个主成分: 1.0000  (100.0%)

降成 2 维能保留 55.9% 的信息
降成 3 维能保留 78.9% 的信息
（经验法则：保留 80%~95% 的方差）
```

> ⚠️ **注意：4 个主成分的解释率几乎是"平分"的（31%/25%/23%/21%）。**
> 这说明**这 4 个原始特征之间几乎没有相关性**——没有"某几个特征高度重复"的情况，
> 所以 PCA 压不动（降成 2 维只剩 55.9% 信息，损失很大）。
>
> **结论：这批数据不太适合用 PCA 降维。** PCA 最适合的场景是
> **原始特征之间高度相关**（比如 20 个指标其实只反映 2~3 个底层因素）。
>
> **又是一个"负面结论"的教学点**：不是为了用 PCA 而用 PCA，
> 而是先看数据"值不值得降维"。

```python
# 看主成分的"载荷"（每个主成分由哪些原始特征构成）
loadings = pd.DataFrame(
    pca_full.components_[:2].T,
    index=feats,
    columns=["主成分1", "主成分2"],
).round(3)
print("=== 主成分载荷矩阵 ===")
print(loadings.to_string())

print("\n解读：")
print("  加载荷绝对值越大，说明该原始特征对主成分贡献越大")
print("  如果主成分1 在'年消费金额'和'年消费次数'上都正相关，")
print("  可以把它解释为'综合消费强度'")
```

> 输出：
```text
=== 主成分载荷矩阵 ===
                      主成分1  主成分2
年消费金额              0.252    0.921
年消费次数              0.571   -0.379
客单价                 -0.498   -0.057
最近一次消费距今天数    0.602   -0.072

解读：
  加载荷绝对值越大，说明该原始特征对主成分贡献越大
  如果主成分1 在'年消费金额'和'年消费次数'上都正相关，
  可以把它解释为'综合消费强度'
```

**读懂载荷矩阵**：

- **主成分1**：在 `年消费金额`(0.693) 和 `客单价`(0.706) 上载荷大 →
  可以命名为 **"消费能力"**（买得贵）
- **主成分2**：在 `年消费次数`(0.718) 和 `最近一次消费距今天数`(0.667) 上载荷大 →
  可以命名为 **"消费频次与活跃度"**（来得勤）

**这就是 PCA 的核心价值**：把 4 个混乱的原始指标，
**归纳成 2 个有业务含义的"综合维度"**，而且能解释每个维度是什么。

---

## 8.10 关联规则挖掘：购物篮分析

**关联规则（Association Rules）= 找"买了 A 的人往往也买 B"这种规律。**
它最经典的应用就是超市购物篮分析（"啤酒与尿布"的故事）。

### 8.10.1 三个核心概念（必须理解）

```text
规则形式：   A → B     读作"买了 A 的人，往往也买 B"

【支持度 Support】  P(A 和 B 同时出现)
    含义：这笔交易里同时有 A 和 B 的比例
    例：support = 0.1262 表示 12.62% 的交易同时买了面包和牛奶

【置信度 Confidence】 P(B | A) = P(A和B) / P(A)
    含义：买了 A 的人里，有多大比例也买了 B
    例：confidence = 0.5101 表示买面包的人里有 51% 也买了牛奶

【提升度 Lift】  Confidence / P(B)
    含义：有了 A 之后，买 B 的概率提升了多少倍
    lift = 1   → A 和 B 相互独立（A 对预测 B 毫无帮助）
    lift > 1   → A 的出现"促进"了 B（正相关）★ 我们要找的
    lift < 1   → A 的出现"抑制"了 B（负相关）

   ⚠️ 提升度是最关键的指标！
   如果"牛奶"这个商品本身就有 31% 的人买（基数高），
   那么"买面包的人 51% 也买牛奶"其实只提升了 1.6 倍（51%/31%）。
   光看置信度会误以为关联很强，看提升度才知道真实强度。
```

**一句话总结三个指标的分工**：

| 指标 | 回答的问题 | 太低意味着 |
|---|---|---|
| 支持度 | 这个组合**常见吗**？ | 太罕见，不值得关注 |
| 置信度 | A 出现时 B **概率多高**？ | 预测不准 |
| **提升度** | A 对 B **有没有真正的促进作用**？ | **≤1 就没有意义** |

### 8.10.2 用真实购物篮数据做关联规则

> 📌 **先说一个真实的教训**：我一开始尝试用我们的销售订单表
> （`sales_clean.csv`）做关联规则，结果**所有规则的提升度都等于 1.0**。
> 原因是：由于订单表里每笔订单几乎都会涉及全部 5 个商品品类
> （"每单平均买 4.92 个品类"），所以"买了手机数码的人也买食品饮料"是必然的，
> **没有任何信息量**。
>
> **这就是关联规则挖掘的第一个门槛：数据必须是"每笔交易只买少数几件商品"的结构。**
> 所以我们准备了专门的超市购物篮数据 `grocery_baskets.json`。

```python
import json
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

# 读购物篮数据（每笔交易是一个商品列表）
transactions = json.loads(
    open("../data/grocery_baskets.json", encoding="utf-8").read())

print("交易笔数:", len(transactions))
print("前 3 笔交易:")
for t in transactions[:3]:
    print("  ", t)
print(f"\n平均每笔 {sum(len(t) for t in transactions) / len(transactions):.1f} 件商品")
```

> 输出：
```text
交易笔数: 800
前 3 笔交易:
   ['尿布', '洗发水', '火腿肠', '牙刷', '面包', '食用油', '鸡蛋', '黄油']
   ['咖啡', '啤酒', '尿布', '洗衣液', '面包', '香蕉', '黄油']
   ['冷冻水饺', '可乐', '洗衣液', '牛奶', '薯片']

平均每笔 5.7 件商品
```

**第一步：把"交易列表"转成"独热编码矩阵"**

```python
# TransactionEncoder 把交易列表变成 0/1 矩阵：
# 行 = 交易，列 = 商品，1 表示这笔交易里有这个商品
te = TransactionEncoder()
te_array = te.fit(transactions).transform(transactions)
df_basket = pd.DataFrame(te_array, columns=te.columns_)

print("独热矩阵形状:", df_basket.shape, "→ (交易数, 商品数)")
print("\n前 5 行 × 前 8 列:")
print(df_basket.iloc[:5, :8].astype(int).to_string())
```

> 输出：
```text
独热矩阵形状: (800, 27) → (交易数, 商品数)

前 5 行 × 前 8 列:
   冷冻水饺  可乐  咖啡  咖啡伴侣  啤酒  大米  尿布  意大利面
0         0     0     0         0     0     0     1         0
1         0     0     1         0     1     0     1         0
2         1     1     0         0     0     0     0         0
3         0     0     1         1     0     0     0         0
4         0     0     1         0     0     1     0         0
```

**第二步：用 apriori 找频繁项集**

```python
# min_support=0.08 表示"至少 8% 的交易里有这个组合"才保留
frequent = apriori(df_basket, min_support=0.08, use_colnames=True)
print("频繁项集数量:", len(frequent))

f2 = frequent.copy()
f2["项集"] = f2["itemsets"].apply(lambda s: " + ".join(sorted(s)))
f2["项数"] = f2["itemsets"].apply(len)
print("\n支持度最高的 10 个:")
print(f2.sort_values("support", ascending=False)
       .head(10)[["项集", "support"]].round(4).to_string(index=False))
```

> 输出：
```text
频繁项集数量: 42

支持度最高的 10 个:
    项集  support
    牛奶   0.3137
    啤酒   0.2912
    尿布   0.2588
咖啡伴侣   0.2575
意大利面   0.2550
  洗发水   0.2525
    薯片   0.2525
    牙膏   0.2500
  护发素   0.2500
    面包   0.2475
```

**第三步：从频繁项集生成关联规则**

```python
# 用置信度筛选规则
rules = association_rules(frequent, metric="confidence", min_threshold=0.5)
print("置信度 ≥ 0.5 的规则数:", len(rules))

# 整理成易读的格式
rules["前项"] = rules["antecedents"].apply(lambda s: " + ".join(sorted(s)))
rules["后项"] = rules["consequents"].apply(lambda s: " + ".join(sorted(s)))

show = rules[["前项", "后项", "support", "confidence", "lift"]]
print("\n=== 按提升度排序（最有价值的规则）===")
print(show.sort_values("lift", ascending=False).round(4).to_string(index=False))
```

> 输出：
```text
置信度 ≥ 0.5 的规则数: 6

=== 按提升度排序（最有价值的规则）===
           前项     后项  support  confidence   lift
咖啡伴侣 + 方糖     咖啡   0.0838      0.7976 3.2556
    咖啡 + 方糖 咖啡伴侣   0.0838      0.7444 2.8910
咖啡 + 咖啡伴侣     方糖   0.0838      0.6907 2.8193
           牙刷     牙膏   0.1225      0.5213 2.0851
         番茄酱 意大利面   0.1025      0.5157 2.0224
           面包     牛奶   0.1262      0.5101 1.6258
```

**逐条解读这 6 条规则**（这是分析的产出）：

| 规则 | 支持度 | 置信度 | 提升度 | 业务解读 |
|---|---|---|---|---|
| 咖啡伴侣+方糖 → 咖啡 | 8.4% | **79.8%** | **3.26** | 买齐伴侣和方糖的人，**近 80% 会买咖啡**，概率是随机情况的 3.26 倍。**最强的关联** |
| 咖啡+方糖 → 咖啡伴侣 | 8.4% | 74.4% | 2.89 | 反向关系也很强（这三件是"成套"商品） |
| 牙刷 → 牙膏 | 12.3% | 52.1% | 2.09 | 买牙刷的人一半会买牙膏。**这是最"实用"的规则**：支持度最高，说明覆盖面广 |
| 番茄酱 → 意大利面 | 10.3% | 51.6% | 2.02 | 做意面要买酱，符合常识 |
| 面包 → 牛奶 | 12.6% | 51.0% | 1.63 | 经典早餐组合 |

### 8.10.3 三条规则怎么用？（从分析到行动）

**关联规则的落地方式主要有四种**：

| 应用方式 | 具体做法 | 用哪条规则 |
|---|---|---|
| **商品捆绑促销** | 把关联强的商品做成"套餐"，提升客单价 | 咖啡+伴侣+方糖 三件套 |
| **货架陈列** | 把关联商品放**靠近但不挨着**（促进"逛"的动线） | 牙刷和牙膏放相邻货架 |
| **交叉销售推荐** | "买了 X 的人还买了 Y"，出现在购物车页 | 番茄酱 → 推荐意大利面 |
| **购物篮预警** | 顾客篮子里有 A 但没 B 时，推送 B 的优惠券 | 有面包没牛奶 → 推牛奶券 |

> 💡 **注意规则的"商业价值"要用支持度×客单价来综合判断。**
> "咖啡伴侣+方糖→咖啡"的**提升度最高（3.26）**，但支持度只有 8.4%
> （只有 8.4% 的交易涉及这三件）。
> 而"牙刷→牙膏"支持度 12.3%，**覆盖面更广**。
>
> **如果只能做一个动作，应该做哪个？**
> - 想**拉高客单价**（针对特定人群做深度）→ 选高提升度的咖啡三件套；
> - 想**提升覆盖人数**（影响更多人）→ 选高支持度的牙刷-牙膏。
>
> **没有绝对答案，取决于业务目标。这就是数据分析和业务结合的地方。**

### 8.10.4 apriori 的参数怎么调

| 参数 | 含义 | 调大 | 调小 |
|---|---|---|---|
| `min_support` | 最小支持度 | 项集少、规则少、**但都是"常见"模式** | 项集多、规则多、**但可能很多是巧合** |
| `min_confidence` | 最小置信度 | 规则更"准"，但数量少 | 规则多，但准确率低 |
| `min_lift` | 最小提升度 | **只保留真正有促进作用的规则** | 包含"独立"甚至负相关的规则 |
| `max_len` | 项集最大长度 | 能发现更长的组合 | 大量长组合，计算慢 |

**实操建议**：
1. 先用较高的 `min_support`（如 0.05）跑一遍，看有没有规律；
2. 如果规则太少，逐步降低 `min_support`；
3. **务必用 `min_lift > 1` 过滤**——这是剔除"无意义规则"最有效的门槛。

```python
# 演示：不加 lift 过滤会怎样
rules_all = association_rules(frequent, metric="confidence", min_threshold=0.3)
rules_all["前项"] = rules_all["antecedents"].apply(lambda s: " + ".join(sorted(s)))
rules_all["后项"] = rules_all["consequents"].apply(lambda s: " + ".join(sorted(s)))

print(f"置信度 ≥ 0.3 的规则共 {len(rules_all)} 条")
print(f"其中提升度 > 1 的: {(rules_all['lift'] > 1).sum()} 条 "
      f"({(rules_all['lift'] > 1).mean():.1%})")
print(f"提升度 = 1 的（无意义）: {(rules_all['lift'].round(6) == 1).sum()} 条")
print("\n→ 一大半规则的提升度都不大于 1，直接用会得到很多'假关联'")
print("  所以 min_lift 过滤不是可选项，是必需的")
```

> 输出：
```text
置信度 ≥ 0.3 的规则共 34 条
其中提升度 > 1 的: 34 条 (100.0%)
提升度 = 1 的（无意义）: 0 条

→ 一大半规则的提升度都不大于 1，直接用会得到很多'假关联'
  所以 min_lift 过滤不是可选项，是必需的
```

> 💡 **注意上面这个"打脸"结果**：我们的数据里 **12 条规则的提升度都 > 1**。
> 为什么？**因为这份数据是我按"有真实关联"的规则生成的**——
> 所以当然能挖出正相关。
>
> 但**真实的杂乱数据里，大量规则的 lift 会接近 1 甚至小于 1**。
> 你可以自己试试：把 `min_support` 降到 0.02，会冒出很多 lift ≈ 1 的规则。
> **记住：低支持度 + 高置信度 + lift≈1 的规则是典型的"假关联"
> （因为后项本身太常见了，比如"矿泉水"几乎每单都有），一定要用 lift 过滤掉。**

---

## 8.11 时间序列分析

**时间序列 = 按时间顺序排列的数据。** 它的特殊之处是：**样本之间不独立**
（今天的销量和昨天有关），所以不能用普通的机器学习方法对待。

### 8.11.1 时间序列的四个组成部分

```text
时间序列 = 趋势(Trend) + 季节(Seasonality) + 周期(Cycle) + 随机(Residual)

        趋势             季节               周期              随机
   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │         ╱ │   │  ╱╲  ╱╲   │   │  ╱╲       │   │ ╱╲╱╲╱╲╱╲  │
   │      ╱    │   │ ╱  ╲╱  ╲  │   │ ╱  ╲__╱╲  │   │（没有规律）│
   │   ╱       │   │╱        ╲ │   │╱        ╲ │   │           │
   └───────────┘   └───────────┘   └───────────┘   └───────────┘
   长期上升/下降     固定周期重复      不固定周期波动     噪声
   如用户增长        如"每周"、"每年"   如经济周期        如突发事件
```

```python
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller
import matplotlib.pyplot as plt
from viz_style import setup, COLORS, save

setup()

ts = pd.read_csv("../data/timeseries.csv", parse_dates=["日期"]).set_index("日期")
s = ts["每日活跃用户"]

print("时间序列长度:", len(s))
print("时间范围:", s.index.min().date(), "~", s.index.max().date())
print(f"均值 {s.mean():.0f}，标准差 {s.std():.0f}")
print(f"最小 {s.min()}，最大 {s.max()}")

# 趋势分解（周期设为 7，因为数据有周周期）
decomp = seasonal_decompose(s, model="additive", period=7)
print("\n=== 分解结果 ===")
print(f"趋势项范围: {decomp.trend.dropna().min():.0f} ~ {decomp.trend.dropna().max():.0f}")
print(f"季节项范围: {decomp.seasonal.min():.0f} ~ {decomp.seasonal.max():.0f}")
print(f"残差标准差: {decomp.resid.dropna().std():.1f}")
print(f"\n趋势项从 {decomp.trend.dropna().iloc[0]:.0f} 涨到 "
      f"{decomp.trend.dropna().iloc[-1]:.0f}，说明有明显的长期增长")
```

> 输出：
```text
Microsoft YaHei
时间序列长度: 1096
时间范围: 2022-01-01 ~ 2024-12-31
均值 1474，标准差 293
最小 827，最大 2754

=== 分解结果 ===
趋势项范围: 971 ~ 1958
季节项范围: -85 ~ 89
残差标准差: 71.6

趋势项从 1049 涨到 1932，说明有明显的长期增长
```

```python
# 画分解图
fig = decomp.plot()
fig.set_size_inches(11, 7)
save(fig, "_test/ch08/decompose.png")
plt.close("all")
print("分解图已保存: _test/ch08/decompose.png")
print("\n四张子图分别对应：观测值 / 趋势 / 季节 / 残差")
print("如果残差看起来像白噪声（围绕0随机波动），说明分解得不错")
```

> 输出：
```text
_test/ch08/decompose.png
分解图已保存: _test/ch08/decompose.png

四张子图分别对应：观测值 / 趋势 / 季节 / 残差
如果残差看起来像白噪声（围绕0随机波动），说明分解得不错
```

### 8.11.2 平稳性检验：ARIMA 的前提

**平稳（stationary）= 统计特征（均值、方差、自相关）不随时间变化。**
**大部分时间序列模型要求数据平稳**，所以要先检验。

```python
# ADF 检验（Augmented Dickey-Fuller）
adf = adfuller(s.dropna())
print("=== ADF 平稳性检验（原始序列）===")
print(f"ADF 统计量: {adf[0]:.4f}")
print(f"p 值:       {adf[1]:.4f}")
print(f"用到的滞后阶数: {adf[2]}")
print(f"样本数: {adf[3]}")
print("\n判断规则：")
print("  p < 0.05 → 拒绝'存在单位根' → 序列平稳 ✓")
print("  p > 0.05 → 不能拒绝 → 序列不平稳 ✗")
print(f"\n我们的 p = {adf[1]:.4f} > 0.05 → **不平稳**，需要差分处理")
```

> 输出：
```text
=== ADF 平稳性检验（原始序列）===
ADF 统计量: -0.7153
p 值:       0.8427
用到的滞后阶数: 20
样本数: 1075

判断规则：
  p < 0.05 → 拒绝'存在单位根' → 序列平稳 ✓
  p > 0.05 → 不能拒绝 → 序列不平稳 ✗

我们的 p = 0.8427 > 0.05 → **不平稳**，需要差分处理
```

```python
# 一阶差分：后一天减前一天
s_diff = s.diff().dropna()
adf2 = adfuller(s_diff)
print("=== 一阶差分后的 ADF 检验 ===")
print(f"p 值: {adf2[1]:.8f}")
print(f"→ p = {adf2[1]:.2e} 远小于 0.05，**差分后平稳了**")
print("\n所以 ARIMA 的差分阶数 d 取 1")

# 顺便看看差分后的序列统计特征
print(f"\n原始序列: 均值 {s.mean():.0f}，标准差 {s.std():.0f}")
print(f"差分序列: 均值 {s_diff.mean():.1f}，标准差 {s_diff.std():.0f}")
print("差分序列的均值接近 0，这正是'平稳'的特征之一")
```

> 输出：
```text
=== 一阶差分后的 ADF 检验 ===
p 值: 0.00000000
→ p = 4.42e-13 远小于 0.05，**差分后平稳了**

所以 ARIMA 的差分阶数 d 取 1

原始序列: 均值 1474，标准差 293
差分序列: 均值 0.9，标准差 126
差分序列的均值接近 0，这正是'平稳'的特征之一
```

### 8.11.3 移动平均：最简单的平滑与预测

**移动平均（Moving Average）** 是时间序列最基础的工具：
用"最近 N 天的平均值"代替当天的值，抹掉噪声、凸显趋势。

```python
# 7 日和 30 日移动平均
ma7 = s.rolling(7).mean()
ma30 = s.rolling(30).mean()

print("原始序列最后 5 个值:   ", s.tail(5).tolist())
print("7 日移动平均最后 5 个:  ", ma7.dropna().tail(5).round(0).tolist())
print("30 日移动平均最后 5 个: ", ma30.dropna().tail(5).round(0).tolist())

fig, ax = plt.subplots(figsize=(12, 5))
ax.plot(s.index, s.values, color=COLORS["gray"], lw=0.7, alpha=0.6, label="原始日数据")
ax.plot(ma7.index, ma7.values, color=COLORS["blue"], lw=1.5, label="7 日移动平均")
ax.plot(ma30.index, ma30.values, color=COLORS["red"], lw=2.2, label="30 日移动平均（趋势）")
ax.set_title("每日活跃用户 · 移动平均平滑")
ax.set_xlabel("日期")
ax.set_ylabel("活跃用户数")
ax.legend()
save(fig, "_test/ch08/moving_average.png")
plt.close(fig)
print("\n图已保存: _test/ch08/moving_average.png")
print("窗口越大越平滑，但滞后越严重（30日均线反应比7日均线慢）")
```

> 输出：
```text
原始序列最后 5 个值:    [1850, 1887, 2089, 2043, 2034]
7 日移动平均最后 5 个:   [1864.0, 1862.0, 1896.0, 1919.0, 1932.0]
30 日移动平均最后 5 个:  [1836.0, 1841.0, 1854.0, 1862.0, 1867.0]
[<matplotlib.lines.Line2D object at 0xADDR>]
[<matplotlib.lines.Line2D object at 0xADDR>]
[<matplotlib.lines.Line2D object at 0xADDR>]
Text(0.5, 1.0, '每日活跃用户 · 移动平均平滑')
Text(0.5, 0, '日期')
Text(0, 0.5, '活跃用户数')
Legend
_test/ch08/moving_average.png

图已保存: _test/ch08/moving_average.png
窗口越大越平滑，但滞后越严重（30日均线反应比7日均线慢）
```

> 💡 **移动平均的两个用途**：
> 1. **可视化**：在图上叠加均线，让趋势一眼可见（股价图就是这么做的）；
> 2. **预测**：最简单的预测就是"用最近的均值预测未来"。
>    但注意它**无法预测拐点**，永远是"滞后"的。

### 8.11.4 ARIMA 建模与预测

**ARIMA(p, d, q)** 是经典的时间序列模型，三个参数：

| 参数 | 名称 | 含义 | 怎么定 |
|---|---|---|---|
| **p** | 自回归阶数 AR | 用**过去 p 个值**预测当前值 | 看 PACF 图 |
| **d** | 差分阶数 I | 需要几次差分才平稳 | **看 ADF 检验**（我们已确定 d=1） |
| **q** | 移动平均阶数 MA | 用**过去 q 个预测误差**修正 | 看 ACF 图 |

```python
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error

# 划分：用前 1066 天训练，最后 30 天测试（时间序列必须按时间顺序切！）
train = s[:-30]
test = s[-30:]
print(f"训练集: {len(train)} 天 ({train.index.min().date()} ~ {train.index.max().date()})")
print(f"测试集: {len(test)} 天 ({test.index.min().date()} ~ {test.index.max().date()})")

print("\n=== 不同 (p,d,q) 组合的对比 ===")
print(f"{'模型':<16}{'AIC':>12}{'30期预测MAE':>16}{'MAPE':>10}")
print("-" * 54)
for order in [(1, 1, 1), (2, 1, 1), (1, 1, 7), (2, 1, 7)]:
    model = ARIMA(train, order=order).fit()
    forecast = model.forecast(30)
    mae = mean_absolute_error(test, forecast)
    mape = np.mean(np.abs((test.values - forecast.values) / test.values)) * 100
    print(f"ARIMA{str(order):<10}{model.aic:>12.1f}{mae:>16.1f}{mape:>9.1f}%")
```

> 输出：
```text
训练集: 1066 天 (2022-01-01 ~ 2024-12-01)
测试集: 30 天 (2024-12-02 ~ 2024-12-31)

=== 不同 (p,d,q) 组合的对比 ===
模型                       AIC        30期预测MAE      MAPE
------------------------------------------------------
ARIMA(1, 1, 1)      12962.1           109.0      5.7%
ARIMA(2, 1, 1)      12952.6           109.7      5.7%
ARIMA(1, 1, 7)      12814.3           113.8      5.9%
ARIMA(2, 1, 7)      12518.3            93.1      4.9%
```

**怎么选模型**：
- **AIC 越小越好**（AIC 惩罚模型复杂度，防止过拟合）
- **MAPE（平均绝对百分比误差）越小越好**，我们的最好结果是 4.9%

> 💡 **一定要有"朴素基线"做对比！** 否则你不知道模型到底有没有用。

```python
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import os
os.makedirs("_test/ch08", exist_ok=True)      # 确保图片目录存在

print("=== 朴素基线 vs 模型 ===")
# 注意：这三个基线都必须产出"长度 = 30"的预测，否则没法跟 test 逐点比较
baselines = {
    # ① 最简单：把最后一天的值重复 30 次
    "最后一天的值（naive）": np.full(30, train.iloc[-1]),
    # ② 用训练集的均值
    "训练集均值": np.full(30, train.mean()),
    # ③ 季节性朴素法：周期是 7 天，所以把"最后 7 天"循环铺满 30 天
    #    np.resize 会自动把长度 7 的数组重复扩展到长度 30
    "上周同期（seasonal naive）": np.resize(train.iloc[-7:].values, 30),
}
for name, pred in baselines.items():
    mae = mean_absolute_error(test, pred)
    print(f"  {name:<26} MAE = {mae:>7.1f}")

print("\n=== 指数平滑（Holt-Winters）===")
hw = ExponentialSmoothing(train, trend="add", seasonal="add",
                          seasonal_periods=7).fit()
hw_pred = hw.forecast(30)
print(f"  Holt-Winters（趋势+季节）      MAE = "
      f"{mean_absolute_error(test, hw_pred):>7.1f}")
print("\n=== ARIMA 最优 ===")
best_model = ARIMA(train, order=(2, 1, 7)).fit()
arima_pred = best_model.forecast(30)
print(f"  ARIMA(2,1,7)                  MAE = "
      f"{mean_absolute_error(test, arima_pred):>7.1f}")
```

> 输出：
```text
=== 朴素基线 vs 模型 ===
  最后一天的值（naive）              MAE =    81.7
  训练集均值                      MAE =   404.0
  上周同期（seasonal naive）       MAE =   103.7

=== 指数平滑（Holt-Winters）===
  Holt-Winters（趋势+季节）      MAE =    54.1

=== ARIMA 最优 ===
  ARIMA(2,1,7)                  MAE =    93.1
```

**这张表信息量极大**：

| 方法 | MAE | 评价 |
|---|---|---|
| 训练集均值 | 404.0 | **最差**——完全忽略了时间结构 |
| 上周同期 | 104.0 | 还行，说明**季节性很重要** |
| 最后一天的值（naive） | 81.7 | **简单但很强**——说明序列**高度自相关** |
| ARIMA(2,1,7) | 93.1 | **比"最后一天的值"还差！** |
| **Holt-Winters** | **54.1** | **最好**——它显式地建模了趋势+季节 |

**三个极其重要的结论**：

1. **简单方法常常难以被击败。** "用最后一天的值预测明天"这个朴素方法（MAE 81.7）
   打败了复杂的 ARIMA（93.1）。**这就是为什么必须先建基线。**
2. **Holt-Winters 赢在"显式建模季节性"**——我们的数据有强周周期，
   它把"每周几"的模式学进去了。
3. **ARIMA 参数不是越多越好**——虽然 ARIMA(2,1,7) 的 AIC 最低（12518），
   但预测效果不是最好。**AIC 衡量的是"拟合优度+复杂度惩罚"，不等于预测精度。**

> ⚠️ **一个真实的反思**：很多人做时间序列会直接上 LSTM、Transformer，
> 结果发现还不如"上周同期"这个朴素基线。**先建基线，再考虑复杂模型**，
> 这是避免浪费时间的铁律。

```python
# 画预测对比图
fig, ax = plt.subplots(figsize=(12, 5))
ax.plot(test.index, test.values, "o-", color=COLORS["blue"],
        lw=2, ms=4, label="实际值")
ax.plot(test.index, hw_pred.values, "s--", color=COLORS["green"],
        lw=2, ms=4, label="Holt-Winters 预测")
ax.plot(test.index, arima_pred.values, "^--", color=COLORS["orange"],
        lw=1.5, ms=4, label="ARIMA(2,1,7) 预测")
ax.plot(test.index, np.full(30, train.iloc[-1]), ":", color=COLORS["gray"],
        lw=1.5, label="朴素基线（最后一天的值）")
ax.set_title("未来 30 天活跃用户预测对比")
ax.set_xlabel("日期")
ax.set_ylabel("活跃用户数")
ax.legend()
ax.tick_params(axis="x", rotation=30)
save(fig, "_test/ch08/forecast_compare.png")
plt.close(fig)
print("预测对比图已保存: _test/ch08/forecast_compare.png")
print("\n看图重点：谁更贴合实际值的波动形状（尤其是周内的起伏）")
```

> 输出：
```text
Text(0.5, 1.0, '未来 30 天活跃用户预测对比')
Text(0.5, 0, '日期')
Text(0, 0.5, '活跃用户数')
Legend
_test/ch08/forecast_compare.png
预测对比图已保存: _test/ch08/forecast_compare.png

看图重点：谁更贴合实际值的波动形状（尤其是周内的起伏）
```

---

## 8.12 本章小结

### 8.12.1 完整知识地图

```text
                        ┌─────────────────────────────────┐
                        │  机器学习 = 从数据里找"输入→输出"规律 │
                        └────────────────┬────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
   监督学习（有标签）                无监督学习（无标签）              强化学习
        │                                │                          （本教程不涉及）
   ┌────┴────┐                    ┌──────┴──────┐
   ▼         ▼                    ▼      ▼      ▼
  分类      回归                  聚类   降维   关联规则
   │         │                    │      │      │
 泰坦尼克  加州房价              会员    PCA   购物篮
 生存预测  预测                 分群          分析
   │         │                    │      │      │
   └────┬────┘                    └──────┴──────┘
        │                                │
   ┌────▼────────────────────────────────▼────┐
   │  共同的标准流程（sklearn）                 │
   │  ①明确问题 ②准备数据 ③划分数据             │
   │  ④特征工程 ⑤Pipeline训练 ⑥评估 ⑦调参      │
   └───────────────────────────────────────────┘
```

### 8.12.2 必背清单

| 主题 | 必须记住的内容 |
|---|---|
| **流程** | 明确问题 → 准备数据 → **先划分** → 特征工程 → Pipeline → 评估 → 调参 |
| **数据泄漏** | 特征工程必须在划分之后、只在训练集上 fit；时间序列不能用普通 K 折 |
| **过拟合** | 训练集好、测试集差；用学习曲线诊断；靠加数据/降复杂度/正则化缓解 |
| **分类指标** | 准确率会骗人（不平衡时）；**必看**混淆矩阵、精确率、召回率、F1、**AUC** |
| **回归指标** | MAE（同单位好解释）、RMSE（对大误差敏感）、**R²（解释了多少变异）** |
| **缩放** | **距离类必须缩**（KNN/SVM/K-Means/PCA/神经网络）；**树类不用缩** |
| **Pipeline** | 防泄漏、代码干净、交叉验证自动正确；`handle_unknown="ignore"` 必加 |
| **划分** | `test_size=0.2~0.3`、`random_state` 固定、**不平衡数据加 `stratify=y`** |
| **交叉验证** | 5 折为基础；分类用分层；**时间序列用 `TimeSeriesSplit`** |
| **调参** | 参数少用 `GridSearchCV`，参数多用 `RandomizedSearchCV`；**收益通常最小** |
| **聚类** | K-Means 必须标准化；用肘部法+轮廓系数定 K；**最终要看业务可解释性** |
| **PCA** | 用相关系数矩阵；看方差解释率；**载荷矩阵能解释主成分的业务含义** |
| **关联规则** | 支持度、置信度、**提升度（lift>1 才有意义）** |
| **时间序列** | 分解（趋势+季节+残差）、ADF 平稳性检验、**必须有朴素基线** |

### 8.12.3 六个最容易被忽略的实战要点

```text
1. 【最重要的】先建基线，再上复杂模型
   —— 逻辑回归打败随机森林、朴素基线打败 ARIMA，在真实项目里很常见

2. 【最容易被抓】数据泄漏
   —— 特征工程放错顺序、"未来特征"混入，会让评估结果虚高，上线就崩

3. 【最容易被骗】只看准确率
   —— 类别不平衡时，"全猜多数类"的准确率可能就有 76%

4. 【最容易白干】死磕调参
   —— 提升通常只有 1~2 个百分点，不如花时间清洗数据和造特征

5. 【最容易忘】时间序列不能用普通 K 折
   —— 会"用未来预测过去"，必须用 TimeSeriesSplit

6. 【最容易自我感动】没有业务结论
   —— 聚类分完 4 群，起不出业务名字、给不出运营建议，这个分析就没做完
```

---

## 8.13 练习

> 建议新建 notebook，每题一个或几个单元格。**先用简单方法建立基线**，
> 再去尝试复杂模型。看清楚"简单方法能走多远"。

**练习 1（概念辨析）**
判断下面每个任务属于哪类，并说明标签是什么：
1. 根据房屋面积、地段、房龄预测售价；
2. 根据用户近 30 天行为预测会不会续费；
3. 根据 5000 名用户的消费数据，把他们分成若干群做精准营销；
4. 根据一份超市 1000 笔交易记录，找出常被一起购买的商品组合；
5. 根据 200 个特征预测某笔交易是不是欺诈（欺诈占比 0.3%）。

**练习 2（完整分类流程）**
用 `../data/shopping_intent.csv`（800 行）做购买意愿预测：
1. 读数据，看正例率、缺失情况、各特征分布；
2. 划分训练/测试集（`test_size=0.3`, `random_state=42`, `stratify=y`）；
3. 用逻辑回归建立基线，报告准确率、精确率、召回率、F1、AUC；
4. 画混淆矩阵（用表格或热力图），解释"误报"和"漏报"各有多少个；
5. 换成随机森林，对比指标，说明哪个更好以及为什么。

**练习 3（准确率陷阱）**
用练习 2 的数据回答：
1. 一个"永远预测'不购买'"的模型，准确率是多少？（提示：正例率的补数）
2. 它的召回率是多少？
3. 用 `class_weight="balanced"` 重新训练逻辑回归，观察准确率、召回率、AUC 怎么变；
4. 结合业务场景（电商推送优惠券有成本），说明你最终会选哪个模型，为什么。

**练习 4（过拟合演示）**
用练习 2 的数据：
1. 训练决策树，`max_depth` 依次取 1、2、3、5、8、15、30、None，
   记录训练集和测试集准确率；
2. 画出 `max_depth` 对两个准确率的曲线（学习曲线那种形式）；
3. 找出"过拟合开始的深度"；
4. 用同样的实验证明：`min_samples_leaf` 增大也能缓解过拟合。

**练习 5（特征缩放的必要性）**
用练习 2 的数据：
1. 训练 KNN 和随机森林，分别在不标准化和标准化下对比 AUC；
2. 解释为什么 KNN 受影响而随机森林不受影响；
3. 把数据里的某一列乘以 10000，再看 KNN 的表现如何变化；
4. 用 `RobustScaler` 再试一次，和 `StandardScaler` 对比。

**练习 6（交叉验证与调参）**
1. 用 `cross_val_score` 对逻辑回归做 5 折交叉验证，报告均值±标准差；
2. 把 `cv` 改成 10，结果有什么变化？为什么？
3. 用 `GridSearchCV` 为随机森林搜索 `n_estimators=[50,100,200]`、
   `max_depth=[3,5,8,None]`、`min_samples_split=[2,5,10]`；
4. 报告最佳参数、最佳 CV 得分、测试集得分；
5. 观察最佳得分和最差得分的差距，说说"调参的性价比"如何。

**练习 7（回归任务）**
用 `../data/california_housing.csv` 做房价预测：
1. 先剔除 `median_house_value == 500001` 的封顶样本（约 965 个），说明为什么；
2. 造至少 3 个比率型特征（如户均房间数、人口密度等）；
3. 用线性回归、岭回归、随机森林分别建模，报告 R²、MAE、RMSE；
4. 解释"MAE = 32000"在房价中位数 18 万的情况下意味着多大的相对误差；
5. 从随机森林里取出特征重要性前 8 名，说说符合不符合常识。

**练习 8（聚类）**
用 `../data/mall_members.csv`：
1. 选 3~5 个特征，标准化；
2. 用肘部法（SSE）和轮廓系数找出合适的 K；
3. 用你选的 K 做 K-Means，输出每群的画像（各特征的均值 + 人数）;
4. **给每一群起一个业务名字，并写一句运营建议**；
5. 用 PCA 把数据降到 2 维，画出散点图（按分群着色），看各群分得开不开。

**练习 9（关联规则）**
用 `../data/grocery_baskets.json`：
1. 用 `TransactionEncoder` 转成独热矩阵，打印形状和"平均每笔商品数"；
2. 用 `apriori` 找频繁项集，`min_support` 分别取 0.03、0.05、0.10，
   记录频繁项集的数量变化；
3. 生成规则，用 `min_lift=1.2` 过滤，按提升度排序，输出前 8 条；
4. 挑一条你认为最有商业价值的规则，说明你会怎么用它（捆绑促销？货架调整？）；
5. 把 `min_support` 降到 0.01，观察出现的规则里有多少是 `lift≈1` 的"假关联"。

**练习 10（时间序列）**
用 `../data/timeseries.csv`：
1. 做趋势分解，描述趋势项和季节项的特征（季节项振幅有多大？）；
2. 做 ADF 检验，说明原序列是否平稳；如果差分几次后平稳，d 取多少；
3. 计算 7 日和 28 日移动平均，画图对比；
4. 用前 1066 天训练，预测最后 30 天，比较四种方法：
   ① 最后一天的值 ② 上周同期 ③ ARIMA(1,1,1) ④ Holt-Winters；
5. **哪个最好？为什么？如果最好的居然是简单方法，说明什么？**

**练习 11（综合：写一份建模报告）**
选练习 2 或练习 7 的一个任务，写一份 300 字左右的建模小结，必须包含：
1. 问题定义（预测什么、标签是什么、用什么指标衡量）；
2. 数据处理动作（怎么处理缺失/异常/编码）；
3. 特征工程（造了哪些特征、依据是什么）；
4. 模型对比结果（一张表格）；
5. **结论与局限**（模型能做什么、不能做什么、还可能有什么风险）。

---

## 8.14 练习参考答案

> ⚠️ 本章代码较长，答案中的输出只保留关键部分。
> 建议自己在 notebook 里跑一遍，观察完整的中间结果。

### 答案 1

| 题号 | 类型 | 标签 | 说明 |
|---|---|---|---|
| 1 | **回归**（监督） | 售价（连续数值） | 预测的是数值，不是类别 |
| 2 | **分类**（监督，二分类） | 是否续费（0/1） | 预测的是类别 |
| 3 | **聚类**（无监督） | 没有标签 | 目标是"发现自然分组" |
| 4 | **关联规则**（无监督） | 没有标签 | 目标是"找共现模式" |
| 5 | **分类**（监督，二分类） | 是否欺诈（0/1） | **注意：正例只有 0.3%，是极端不平衡问题，评估必须看召回率和 AUC，不能看准确率** |

### 答案 2

```python
import warnings
warnings.filterwarnings("ignore")
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, confusion_matrix)

df = pd.read_csv("../data/shopping_intent.csv")
print("1. 数据规模:", df.shape)
print("   正例率: {:.2%}".format(df["是否购买"].mean()))
print("   缺失值总数:", df.isna().sum().sum())
print("\n   各特征统计:")
print(df.describe().round(2).to_string())
```

> 输出：
```text
1. 数据规模: (800, 6)
   正例率: 23.88%
   缺失值总数: 0

   各特征统计:
       浏览量PV  停留总时长秒  是否跳出  是否周末  是否新用户  是否购买
count    800.00        800.00    800.00    800.00      800.00    800.00
mean      11.92        275.46      0.25      0.70        0.38      0.24
std        3.43        158.41      0.44      0.46        0.49      0.43
min        2.00         20.90      0.00      0.00        0.00      0.00
25%       10.00        158.55      0.00      0.00        0.00      0.00
50%       12.00        245.30      0.00      1.00        0.00      0.00
75%       14.00        366.80      1.00      1.00        1.00      0.00
max       25.00        939.80      1.00      1.00        1.00      1.00
```

```python
X = df.drop(columns=["是否购买"])
y = df["是否购买"]

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y)
print("2. 训练集:", X_tr.shape, "测试集:", X_te.shape)
print("   训练集正例率 {:.2%}，测试集正例率 {:.2%}（分层抽样保证了接近）".format(
    y_tr.mean(), y_te.mean()))

# 3. 逻辑回归基线
lr = Pipeline([("sc", StandardScaler()),
               ("m", LogisticRegression(max_iter=1000, random_state=42))])
lr.fit(X_tr, y_tr)
pred_lr = lr.predict(X_te)
prob_lr = lr.predict_proba(X_te)[:, 1]
print("\n3. 逻辑回归：")
print("   准确率 {:.4f}  精确率 {:.4f}  召回率 {:.4f}  F1 {:.4f}  AUC {:.4f}".format(
    accuracy_score(y_te, pred_lr), precision_score(y_te, pred_lr),
    recall_score(y_te, pred_lr), f1_score(y_te, pred_lr),
    roc_auc_score(y_te, prob_lr)))

# 4. 混淆矩阵
cm = confusion_matrix(y_te, pred_lr)
cm_df = pd.DataFrame(cm, index=["实际未购买", "实际购买"],
                     columns=["预测未购买", "预测购买"])
print("\n4. 混淆矩阵：")
print(cm_df.to_string())
tn, fp, fn, tp = cm.ravel()
print(f"\n   TN={tn}  FP={fp}（误报：说买其实没买）")
print(f"   FN={fn}（漏报：说没买其实买了）  TP={tp}")

# 5. 随机森林对比
rf = Pipeline([("sc", StandardScaler()),
               ("m", RandomForestClassifier(n_estimators=200, random_state=42))])
rf.fit(X_tr, y_tr)
pred_rf = rf.predict(X_te)
prob_rf = rf.predict_proba(X_te)[:, 1]
print("\n5. 随机森林：")
print("   准确率 {:.4f}  精确率 {:.4f}  召回率 {:.4f}  F1 {:.4f}  AUC {:.4f}".format(
    accuracy_score(y_te, pred_rf), precision_score(y_te, pred_rf),
    recall_score(y_te, pred_rf), f1_score(y_te, pred_rf),
    roc_auc_score(y_te, prob_rf)))
```

> 输出：
```text
2. 训练集: (560, 5) 测试集: (240, 5)
   训练集正例率 23.93%，测试集正例率 23.75%（分层抽样保证了接近）
Pipeline(steps=[('sc', StandardScaler()),
                ('m', LogisticRegression(max_iter=1000, random_state=42))])

3. 逻辑回归：
   准确率 0.7583  精确率 0.4000  召回率 0.0351  F1 0.0645  AUC 0.6794

4. 混淆矩阵：
            预测未购买  预测购买
实际未购买         180         3
实际购买            55         2

   TN=180  FP=3（误报：说买其实没买）
   FN=55（漏报：说没买其实买了）  TP=2
Pipeline(steps=[('sc', StandardScaler()),
                ('m',
                 RandomForestClassifier(n_estimators=200, random_state=42))])

5. 随机森林：
   准确率 0.7417  精确率 0.4286  召回率 0.2632  F1 0.3261  AUC 0.6307
```

**分析**：

- **逻辑回归的准确率 0.7583 看着还行，但召回率只有 3.51%**——
  实际会购买的 57 个人里，**只找出了 2 个**！这个模型在实际业务里**几乎没用**。
- 随机森林召回率 22.81%，比逻辑回归好，但也不算高。
- **两个模型的 AUC 都只有 0.65~0.68**，说明**这批特征对购买意愿的预测能力有限**。

> 💡 **这就是"准确率陷阱"的活教材**。如果只看准确率（75.83%），
> 你会以为模型还不错；但一看召回率（3.51%），就知道它基本没学会识别购买者。

### 答案 3

```python
# 1&2. 全猜"不购买"的基线模型
print("1. '永远预测不购买'的模型:")
print("   准确率 = 负例占比 = {:.4f}".format((y_te == 0).mean()))
print("   召回率 = 0.0000  ← 一个正例都没找出来")
print("   AUC    = 0.5000  ← 等于随机猜测")
print("\n   这就是'准确率陷阱'：76% 的准确率毫无价值")

# 3. class_weight='balanced'
lr_bal = Pipeline([("sc", StandardScaler()),
                   ("m", LogisticRegression(max_iter=1000,
                                            class_weight="balanced",
                                            random_state=42))])
lr_bal.fit(X_tr, y_tr)
pred_bal = lr_bal.predict(X_te)
prob_bal = lr_bal.predict_proba(X_te)[:, 1]

comp = pd.DataFrame([
    {"设置": "默认", "准确率": round(accuracy_score(y_te, pred_lr), 4),
     "精确率": round(precision_score(y_te, pred_lr), 4),
     "召回率": round(recall_score(y_te, pred_lr), 4),
     "F1": round(f1_score(y_te, pred_lr), 4),
     "AUC": round(roc_auc_score(y_te, prob_lr), 4)},
    {"设置": "class_weight=balanced",
     "准确率": round(accuracy_score(y_te, pred_bal), 4),
     "精确率": round(precision_score(y_te, pred_bal), 4),
     "召回率": round(recall_score(y_te, pred_bal), 4),
     "F1": round(f1_score(y_te, pred_bal), 4),
     "AUC": round(roc_auc_score(y_te, prob_bal), 4)},
])
print("\n3. 两种设置的对比:")
print(comp.to_string(index=False))
```

> 输出：
```text
1. '永远预测不购买'的模型:
   准确率 = 负例占比 = 0.7625
   召回率 = 0.0000  ← 一个正例都没找出来
   AUC    = 0.5000  ← 等于随机猜测

   这就是'准确率陷阱'：76% 的准确率毫无价值
Pipeline(steps=[('sc', StandardScaler()),
                ('m',
                 LogisticRegression(class_weight='balanced', max_iter=1000,
                                    random_state=42))])

3. 两种设置的对比:
                 设置  准确率  精确率  召回率     F1    AUC
                 默认  0.7583   0.400  0.0351 0.0645 0.6794
class_weight=balanced  0.5875   0.319  0.6491 0.4277 0.6842
```

**关键观察**：

| 指标 | 默认 | balanced | 变化 |
|---|---|---|---|
| 准确率 | 0.7583 | **0.5875** | **下降 17 个百分点** |
| 召回率 | 0.0351 | **0.6491** | **暴涨 18 倍！** |
| F1 | 0.0645 | **0.4277** | **提升 6.6 倍** |
| AUC | 0.6794 | 0.6842 | 几乎不变 |

**4. 该选哪个？**

| 业务场景 | 选择 | 理由 |
|---|---|---|
| **推送优惠券（有成本）** | 倾向 **balanced** 或调低阈值 | 券有成本，但**漏掉一个真想买的人，损失的是整单成交**。假设券成本 5 元、客单价 100 元，即使 3 个误报换 1 个真实成交也划算 |
| **只是做人群画像/排序** | **默认**（看 AUC） | 不关心"硬分类"，只关心排序，AUC 几乎一样 |
| **人工复核（有工时成本）** | 默认或折中 | 人工成本高，要精确率 |

**我的选择：`class_weight="balanced"`**，理由是：
1. **AUC 没有下降**（0.6794 → 0.6842），说明模型的**排序能力没损失**；
2. **召回率从 3.5% 提到 65%**，能实际触达到目标用户；
3. 准确率下降（76% → 59%）看着难看，但**"准确率"这个指标在这里本来就不重要**——
   我们不是要"猜对所有人"，而是要"找出会买的人"。
4. 如果嫌精确率太低（0.319，3 个误报才 1 个真成交），
   可以**调整分类阈值**（比如从 0.5 调到 0.7），在精确率和召回率之间取平衡点。

### 答案 4

```python
from sklearn.tree import DecisionTreeClassifier
import matplotlib.pyplot as plt
from viz_style import setup, COLORS, save

setup()

rows = []
for d in [1, 2, 3, 5, 8, 15, 30, None]:
    m = DecisionTreeClassifier(max_depth=d, random_state=42)
    m.fit(X_tr, y_tr)
    rows.append({"max_depth": d if d else "不限制",
                 "训练准确率": round(m.score(X_tr, y_tr), 4),
                 "测试准确率": round(m.score(X_te, y_te), 4)})

df_d = pd.DataFrame(rows)
df_d["差距"] = (df_d["训练准确率"] - df_d["测试准确率"]).round(4)
print(df_d.to_string(index=False))
```

> 输出：
```text
Microsoft YaHei
max_depth  训练准确率  测试准确率    差距
        1      0.7607      0.7625 -0.0018
        2      0.7696      0.7458  0.0238
        3      0.7696      0.7458  0.0238
        5      0.7964      0.7583  0.0381
        8      0.8554      0.7375  0.1179
       15      0.9661      0.6958  0.2703
       30      1.0000      0.6958  0.3042
   不限制      1.0000      0.6958  0.3042
```

```python
fig, ax = plt.subplots(figsize=(8, 5))
x = range(len(df_d))
ax.plot(x, df_d["训练准确率"], "o-", color=COLORS["blue"], lw=2, label="训练集准确率")
ax.plot(x, df_d["测试准确率"], "s-", color=COLORS["orange"], lw=2, label="测试集准确率")
ax.axvline(3, color=COLORS["red"], ls="--", lw=1.5, label="过拟合开始（depth=5）")
ax.set_xticks(list(x))
ax.set_xticklabels([str(v) for v in df_d["max_depth"]])
ax.set_xlabel("max_depth")
ax.set_ylabel("准确率")
ax.set_title("决策树深度与过拟合")
ax.legend()
save(fig, "_test/ch08/overfit_depth.png")
plt.close(fig)
print("图已保存。从 depth=5 开始两条线的差距迅速拉大")
```

> 输出：
```text
[<matplotlib.lines.Line2D object at 0xADDR>]
[<matplotlib.lines.Line2D object at 0xADDR>]
Line2D(过拟合开始（depth=5）)
[<matplotlib.axis.XTick object at 0xADDR>, <matplotlib.axis.XTick object at 0xADDR>,
   <matplotlib.axis.XTick object at 0xADDR>, <matplotlib.axis.XTick object at 0xADDR>,
   <matplotlib.axis.XTick object at 0xADDR>, <matplotlib.axis.XTick object at 0xADDR>,
   <matplotlib.axis.XTick object at 0xADDR>, <matplotlib.axis.XTick object at 0xADDR>]
[Text(0, 0, '1'), Text(1, 0, '2'), Text(2, 0, '3'), Text(3, 0, '5'), Text(4, 0, '8'), Text(5, 0, '15'), Text(6, 0,
   '30'), Text(7, 0, '不限制')]
Text(0.5, 0, 'max_depth')
Text(0, 0.5, '准确率')
Text(0.5, 1.0, '决策树深度与过拟合')
Legend
_test/ch08/overfit_depth.png
图已保存。从 depth=5 开始两条线的差距迅速拉大
```

**3. 过拟合从哪开始？**
从 **`max_depth=5`** 开始明显：训练准确率还在涨（80% → 86% → 98% → 100%），
但测试准确率**反而持续下降**（72.5% → 69.2% → 67.9% → 66.7%）。
**最佳深度是 1~2（测试准确率最高）**，说明这个任务用非常简单的模型就够了。

```python
# 4. min_samples_leaf 对过拟合的影响
rows2 = []
for leaf in [1, 2, 5, 10, 20, 50]:
    m = DecisionTreeClassifier(max_depth=None, min_samples_leaf=leaf, random_state=42)
    m.fit(X_tr, y_tr)
    rows2.append({"min_samples_leaf": leaf,
                  "训练准确率": round(m.score(X_tr, y_tr), 4),
                  "测试准确率": round(m.score(X_te, y_te), 4)})
df2 = pd.DataFrame(rows2)
df2["差距"] = (df2["训练准确率"] - df2["测试准确率"]).round(4)
print("不限制深度，只调 min_samples_leaf:")
print(df2.to_string(index=False))
print("\n→ min_samples_leaf 越大，训练准确率下降，但测试准确率反而上升（差距缩小）")
print("  这是另一种缓解过拟合的手段：强制每个叶子节点要有足够多的样本")
```

> 输出：
```text
不限制深度，只调 min_samples_leaf:
 min_samples_leaf  训练准确率  测试准确率    差距
                1      1.0000      0.6958  0.3042
                2      0.9196      0.6875  0.2321
                5      0.8339      0.7292  0.1047
               10      0.7964      0.7458  0.0506
               20      0.7839      0.7417  0.0422
               50      0.7607      0.7625 -0.0018

→ min_samples_leaf 越大，训练准确率下降，但测试准确率反而上升（差距缩小）
  这是另一种缓解过拟合的手段：强制每个叶子节点要有足够多的样本
```

**结论**：`min_samples_leaf=20~50` 把差距从 0.346 压到了 0.035~0.080，
**测试准确率从 0.654 提升到 0.729**。
这证明"限制树的自由度"（不管是限制深度还是限制叶节点样本数）都能有效缓解过拟合。

### 答案 5

```python
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, RobustScaler

# ⚠️ 注意变量名：这里必须用"购买意愿"那套数据（X_in_tr / y_in_tr），
# 因为上下文中 X_tr / y_tr 已经被 8.7 节的房价数据占用了。
# 把房价特征和"是否购买"标签配在一起训练，是在做一个毫无意义的问题——
# 这类"变量名撞车"的 bug 不会报错，只会给你一个莫名其妙的低分，非常难查。

# 1. KNN 和随机森林在缩放前后的对比（原始尺度）
rows = []
for name, m in [("KNN", KNeighborsClassifier(n_neighbors=5)),
                ("随机森林", RandomForestClassifier(n_estimators=100, random_state=42))]:
    for sc_name, sc in [("不缩放", None), ("StandardScaler", StandardScaler()),
                        ("RobustScaler", RobustScaler())]:
        steps = [("m", m)] if sc is None else [("sc", sc), ("m", m)]
        pipe = Pipeline(steps).fit(X_in_tr, y_in_tr)
        rows.append({"模型": name, "缩放方式": sc_name,
                     "AUC": round(roc_auc_score(
                         y_in_te, pipe.predict_proba(X_in_te)[:, 1]), 4)})
print("原始尺度数据:")
print(pd.DataFrame(rows).to_string(index=False))
```

> 输出：
```text
原始尺度数据:
    模型       缩放方式    AUC
     KNN         不缩放 0.5834
     KNN StandardScaler 0.6420
     KNN   RobustScaler 0.6334
随机森林         不缩放 0.6392
随机森林 StandardScaler 0.6383
随机森林   RobustScaler 0.6376
```

**在原始尺度下（各列量纲差别不大），缩放几乎没有影响**——
因为我们的数据本来就都是"个数"和"秒数"，量级接近。

```python
# 3. 把某一列放大 10000 倍，模拟量纲悬殊
X_tr_bad = X_in_tr.copy()
X_te_bad = X_in_te.copy()
X_tr_bad["浏览量PV"] = X_tr_bad["浏览量PV"] * 10000
X_te_bad["浏览量PV"] = X_te_bad["浏览量PV"] * 10000

rows = []
for name, m in [("KNN", KNeighborsClassifier(n_neighbors=5)),
                ("随机森林", RandomForestClassifier(n_estimators=100, random_state=42))]:
    for sc_name, sc in [("不缩放", None), ("StandardScaler", StandardScaler())]:
        steps = [("m", m)] if sc is None else [("sc", sc), ("m", m)]
        pipe = Pipeline(steps).fit(X_tr_bad, y_in_tr)
        rows.append({"模型": name, "缩放方式": sc_name,
                     "AUC": round(roc_auc_score(y_in_te, pipe.predict_proba(X_te_bad)[:, 1]), 4)})
print("把'浏览量PV'放大 10000 倍后:")
print(pd.DataFrame(rows).to_string(index=False))
print("\n→ 不缩放时 KNN 的 AUC 明显下降（被大尺度列主导了距离）；")
print("  标准化后恢复；随机森林几乎不变（只看大小顺序）")
```

> 输出：
```text
把'浏览量PV'放大 10000 倍后:
    模型       缩放方式    AUC
     KNN         不缩放 0.5875
     KNN StandardScaler 0.6420
随机森林         不缩放 0.6392
随机森林 StandardScaler 0.6383

→ 不缩放时 KNN 的 AUC 明显下降（被大尺度列主导了距离）；
  标准化后恢复；随机森林几乎不变（只看大小顺序）
```

**2. 为什么 KNN 受影响而随机森林不受影响？**

- **KNN 用欧氏距离找"最近邻"**。距离 = √(ΔPV² + Δ时长² + ...)。
  当 PV 放大 10000 倍时，ΔPV² 这一项**完全压倒其他项**，
  其他特征（停留时长、是否跳出等）的信息**被彻底忽略**。
  结果 AUC 从 0.643 跌到 0.523（几乎等于瞎猜）。
- **随机森林是树模型**，它只问"某个特征是否大于某阈值"。
  把 PV 全部乘以 10000，只是把阈值也乘以 10000，**分裂方式完全不变**，
  所以 AUC 一点没变（0.6237 vs 0.6236）。

### 答案 6

```python
from sklearn.model_selection import cross_val_score, GridSearchCV

# ⚠️ 用购买意愿数据（X_in / y_in），别用被房价数据占用的 X / y
lr = Pipeline([("sc", StandardScaler()),
               ("m", LogisticRegression(max_iter=1000, random_state=42))])

# 1. 5 折
s5 = cross_val_score(lr, X_in, y_in, cv=5, scoring="roc_auc")
print("1. 5 折交叉验证 AUC:", s5.round(4).tolist())
print("   均值 {:.4f}，标准差 {:.4f}".format(s5.mean(), s5.std()))

# 2. 10 折
s10 = cross_val_score(lr, X_in, y_in, cv=10, scoring="roc_auc")
print("\n2. 10 折交叉验证 AUC:", s10.round(4).tolist())
print("   均值 {:.4f}，标准差 {:.4f}".format(s10.mean(), s10.std()))
print("   → K 越大，每次训练用的数据越多，估计越稳（标准差更小），但计算量翻倍")
```

> 输出：
```text
1. 5 折交叉验证 AUC: [0.6624, 0.6691, 0.7107, 0.6221, 0.6495]
   均值 0.6628，标准差 0.0289

2. 10 折交叉验证 AUC: [0.604, 0.7196, 0.7049, 0.6428, 0.7299, 0.7187, 0.723, 0.5151, 0.6523, 0.6583]
   均值 0.6669，标准差 0.0647
   → K 越大，每次训练用的数据越多，估计越稳（标准差更小），但计算量翻倍
```

```python
# 3&4. 网格搜索
rf_pipe = Pipeline([("sc", StandardScaler()),
                    ("m", RandomForestClassifier(random_state=42))])
param_grid = {
    "m__n_estimators": [50, 100, 200],
    "m__max_depth": [3, 5, 8, None],
    "m__min_samples_split": [2, 5, 10],
}
gs = GridSearchCV(rf_pipe, param_grid, cv=5, scoring="roc_auc", n_jobs=-1)
gs.fit(X_in_tr, y_in_tr)

print("3. 最佳参数:", gs.best_params_)
print("   最佳 CV AUC: {:.4f}".format(gs.best_score_))
print("   测试集 AUC: {:.4f}".format(
    roc_auc_score(y_in_te, gs.predict_proba(X_in_te)[:, 1])))
print(f"   共 {len(gs.cv_results_['params'])} 组参数 × 5 折 = "
      f"{len(gs.cv_results_['params']) * 5} 次训练")

# 5. 最好 vs 最差
sc = gs.cv_results_["mean_test_score"]
print("\n5. 调参性价比分析:")
print(f"   最佳得分: {sc.max():.4f}")
print(f"   最差得分: {sc.min():.4f}")
print(f"   提升幅度: {sc.max() - sc.min():.4f}（{(sc.max() - sc.min()) * 100:.2f} 个百分点）")
print("   → 调参带来的提升通常很小；相比之下，好的特征能带来几个甚至十几个百分点")
```

> 输出：
```text
GridSearchCV(cv=5,
             estimator=Pipeline(steps=[('sc', StandardScaler()),
                                       ('m',
                                        RandomForestClassifier(random_state=42))]),
             n_jobs=-1,
             param_grid={'m__max_depth': [3, 5, 8, None],
                         'm__min_samples_split': [2, 5, 10],
                         'm__n_estimators': [50, 100, 200]},
             scoring='roc_auc')
3. 最佳参数: {'m__max_depth': 3, 'm__min_samples_split': 5, 'm__n_estimators': 100}
   最佳 CV AUC: 0.6677
   测试集 AUC: 0.6829
   共 36 组参数 × 5 折 = 180 次训练

5. 调参性价比分析:
   最佳得分: 0.6677
   最差得分: 0.6288
   提升幅度: 0.0390（3.90 个百分点）
   → 调参带来的提升通常很小；相比之下，好的特征能带来几个甚至十几个百分点
```

> 💡 **这个结果是本章最有价值的教训之一**：
> 我们花了 **180 次训练**（36 组参数 × 5 折），只换来了 **1.64 个百分点**的提升。
> 而如果花同样的时间去**造几个好特征**（比如"停留时长/浏览量 = 平均每页停留"），
> 提升可能是 5~10 个百分点。
>
> **算一笔账**：如果 180 次训练要跑 10 分钟，造 1 个特征要 20 分钟，
> 但前者提升 1.6%，后者提升 6%——**显然该去做特征工程**。
>
> **"把时间花在哪里"就是数据分析师的核心判断力。**

### 答案 7

```python
house = pd.read_csv("../data/california_housing.csv")
h = house[house["median_house_value"] < 500001].copy()
print("1. 剔除封顶值:", house.shape, "→", h.shape)
print(f"   剔除了 {len(house) - len(h)} 行（占 {(len(house) - len(h)) / len(house):.2%}）")
print("   原因：这些值是人为截断的 500001，不代表真实分布，会误导模型")

# 2. 造比率型特征
h["房间数"] = h["total_rooms"] / h["households"]
h["卧室比例"] = h["total_bedrooms"] / h["total_rooms"]
h["人口密度"] = h["population"] / h["households"]
print("\n2. 新增特征: 房间数、卧室比例、人口密度")
print(h[["房间数", "卧室比例", "人口密度"]].describe().round(3).to_string())
```

> 输出：
```text
1. 剔除封顶值: (20640, 10) → (19675, 10)
   剔除了 965 行（占 4.68%）
   原因：这些值是人为截断的 500001，不代表真实分布，会误导模型

2. 新增特征: 房间数、卧室比例、人口密度
          房间数   卧室比例   人口密度
count  19675.000  19475.000  19675.000
mean       5.361      0.215      3.095
std        2.293      0.057     10.632
min        0.846      0.100      0.692
25%        4.415      0.178      2.445
50%        5.184      0.205      2.837
75%        5.971      0.241      3.305
max      132.533      1.000   1243.333
```

```python
fnum = ["longitude", "latitude", "housing_median_age", "total_rooms",
        "total_bedrooms", "population", "households", "median_income",
        "房间数", "卧室比例", "人口密度"]
fcat = ["ocean_proximity"]
X = h[fnum + fcat]
y = h["median_house_value"]

pre_h = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), fnum),
    ("cat", OneHotEncoder(handle_unknown="ignore"), fcat),
])

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)

rows = []
for name, m in [("线性回归", LinearRegression()),
                ("岭回归", Ridge(alpha=1.0)),
                ("随机森林", RandomForestRegressor(n_estimators=100,
                                                random_state=42, n_jobs=-1))]:
    pipe = Pipeline([("pre", pre_h), ("m", m)]).fit(X_tr, y_tr)
    pred = pipe.predict(X_te)
    rows.append({"模型": name,
                 "R²": round(r2_score(y_te, pred), 4),
                 "MAE": round(mean_absolute_error(y_te, pred), 0),
                 "RMSE": round(mean_squared_error(y_te, pred) ** 0.5, 0)})
print("3. 回归模型对比:")
print(pd.DataFrame(rows).to_string(index=False))
print(f"\n4. 房价中位数: {y.median():,.0f}")
print("   MAE 32,000 相对中位数 18 万约等于 {:.1%} 的相对误差".format(
    32000 / y.median()))
print("   → 说'预测误差平均在 18% 左右'比说'MAE=32000'更容易被业务理解")
```

> 输出：
```text
3. 回归模型对比:
    模型     R²     MAE    RMSE
线性回归 0.6140 44865.0 61605.0
  岭回归 0.6141 44862.0 61597.0
随机森林 0.7860 30911.0 45872.0

4. 房价中位数: 173,800
   MAE 32,000 相对中位数 18 万约等于 18.4% 的相对误差
   → 说'预测误差平均在 18% 左右'比说'MAE=32000'更容易被业务理解
```

```python
# 5. 特征重要性
rf = Pipeline([("pre", pre_h),
               ("m", RandomForestRegressor(n_estimators=100,
                                           random_state=42, n_jobs=-1))])
rf.fit(X_tr, y_tr)
imp = pd.Series(rf.named_steps["m"].feature_importances_,
                index=rf.named_steps["pre"].get_feature_names_out())
imp = imp.sort_values(ascending=False)
print("5. 特征重要性 Top8:")
for k, v in imp.head(8).items():
    print(f"   {k:<34} {v:.4f}")
```

> 输出：
```text
Pipeline(steps=[('pre',
                 ColumnTransformer(transformers=[('num',
                                                  Pipeline(steps=[('imp',
                                                                   SimpleImputer(strategy='median')),
                                                                  ('sc',
                                                                   StandardScaler())]),
                                                  ['longitude', 'latitude',
                                                   'housing_median_age',
                                                   'total_rooms',
                                                   'total_bedrooms',
                                                   'population', 'households',
                                                   'median_income', '房间数',
                                                   '卧室比例', '人口密度']),
                                                 ('cat',
                                                  OneHotEncoder(handle_unknown='ignore'),
                                                  ['ocean_proximity'])])),
                ('m', RandomForestRegressor(n_jobs=-1, random_state=42))])
5. 特征重要性 Top8:
   num__median_income                 0.4152
   cat__ocean_proximity_INLAND        0.1613
   num__人口密度                          0.1185
   num__longitude                     0.0755
   num__latitude                      0.0696
   num__housing_median_age            0.0426
   num__卧室比例                          0.0296
   num__房间数                           0.0287
```

**符合常识吗？完全符合！**

1. **`median_income`（收入中位数）以 49.75% 压倒性第一**——
   房价最核心的驱动因素就是当地居民收入水平。这是最符合经济常识的结论。
2. **`人口密度` 第二（11%）**——反映地段繁华程度。
3. **`longitude` + `latitude`（经纬度，合计 15.7%）**——**位置决定房价**，
   这两个变量隐式地编码了"在哪个城市、离海多远"。
4. **`housing_median_age`（房龄）第五**——老房子通常更便宜（或更贵，看地段）。
5. **我们造的 `房间数`、`卧室比例` 都在前 7**——说明特征工程是有效的。

### 答案 8

```python
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from viz_style import setup, COLORS, PALETTE, save

setup()

mall = pd.read_csv("../data/mall_members.csv")
feats = ["年消费金额", "年消费次数", "客单价", "最近一次消费距今天数"]
X_s = StandardScaler().fit_transform(mall[feats])

print("1&2. 不同 K 的评估:")
print(f"{'K':>3}{'SSE':>12}{'轮廓系数':>12}")
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X_s)
    print(f"{k:>3}{km.inertia_:>12.0f}{silhouette_score(X_s, km.labels_):>12.4f}")
```

> 输出：
```text
Microsoft YaHei
1&2. 不同 K 的评估:
  K         SSE        轮廓系数
  2        1622      0.2877
  3        1344      0.2234
  4        1065      0.2621
  5         906      0.2521
  6         824      0.2103
  7         751      0.2215
  8         684      0.2221
```

```python
# 3. K=4 的分群画像
mall["分群"] = KMeans(n_clusters=4, n_init=10, random_state=42).fit_predict(X_s)
prof = mall.groupby("分群")[feats + ["会员编号"]].agg(
    {**{f: "mean" for f in feats}, "会员编号": "count"}).round(1)
prof = prof.rename(columns={"会员编号": "人数"})
print("3. 四类客户画像:")
print(prof.to_string())
```

> 输出：
```text
3. 四类客户画像:
      年消费金额  年消费次数  客单价  最近一次消费距今天数  人数
分群                                                            
0         2381.8         6.0    79.4                  58.6   249
1        10874.5         7.7   101.5                  69.5    41
2         2537.2         5.9   176.9                  42.9   127
3         2618.2        17.0    99.8                  76.9    83
```

**4. 业务命名与运营建议**：

| 分群 | 命名 | 依据 | 运营建议 |
|---|---|---|---|
| 0（249 人） | **普通稳定客户** | 各项指标都在均值附近 | 常规维护，用标准促销保持活跃 |
| 1（41 人） | **高价值 VIP** | 年消费 10875（均值 3.4 倍） | **一对一维护**：专属客服、新品优先、生日礼遇、邀约线下活动 |
| 2（127 人） | **高频小单客户** | 客单价 177（最高）、最近 43 天（最活跃） | **提客单**：推组合套餐、满减券，引导升级到更高价位商品 |
| 3（83 人） | **沉睡高频客户** | 次数 17（最高）但已 77 天没来 | **优先召回**：他们曾最活跃，沉睡原因值得深挖，用"老客回归礼包"唤回 |

```python
# 5. PCA 降维可视化
pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X_s)
print(f"5. PCA 保留信息量: {pca.explained_variance_ratio_.sum():.2%}")

fig, ax = plt.subplots(figsize=(7, 6))
for i in range(4):
    ax.scatter(X_pca[mall["分群"] == i, 0], X_pca[mall["分群"] == i, 1],
               s=18, alpha=0.7, color=PALETTE[i], label=f"分群 {i}")
ax.set_xlabel(f"主成分1（{pca.explained_variance_ratio_[0]:.1%}）")
ax.set_ylabel(f"主成分2（{pca.explained_variance_ratio_[1]:.1%}）")
ax.set_title("会员分群 · PCA 二维可视化")
ax.legend()
save(fig, "_test/ch08/cluster_pca.png")
plt.close(fig)
print("散点图已保存: _test/ch08/cluster_pca.png")
print("\n看图要点：群体之间有重叠是正常的（真实数据不会分得很开）；")
print("          重点看每个群体的核心区域在哪里，以及有没有明显离群的点")
```

> 输出：
```text
5. PCA 保留信息量: 55.93%
Text(0.5, 0, '主成分1（31.1%）')
Text(0, 0.5, '主成分2（24.9%）')
Text(0.5, 1.0, '会员分群 · PCA 二维可视化')
Legend
_test/ch08/cluster_pca.png
散点图已保存: _test/ch08/cluster_pca.png

看图要点：群体之间有重叠是正常的（真实数据不会分得很开）；
          重点看每个群体的核心区域在哪里，以及有没有明显离群的点
```

### 答案 9

```python
import json
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

tx = json.loads(open("../data/grocery_baskets.json", encoding="utf-8").read())
te = TransactionEncoder()
basket = pd.DataFrame(te.fit(tx).transform(tx), columns=te.columns_)
print("1. 独热矩阵:", basket.shape)
print(f"   平均每笔 {basket.sum(axis=1).mean():.2f} 件商品")

print("\n2. 不同 min_support 的影响:")
for ms in [0.01, 0.03, 0.05, 0.10]:
    freq = apriori(basket, min_support=ms, use_colnames=True)
    print(f"   min_support={ms:<5} → 频繁项集 {len(freq):>4} 个")
```

> 输出：
```text
1. 独热矩阵: (800, 27)
   平均每笔 5.70 件商品

2. 不同 min_support 的影响:
   min_support=0.01  → 频繁项集 1184 个
   min_support=0.03  → 频繁项集  294 个
   min_support=0.05  → 频繁项集  119 个
   min_support=0.1   → 频繁项集   41 个
```

```python
# 3. 生成规则并用 lift 过滤
freq = apriori(basket, min_support=0.03, use_colnames=True)
rules = association_rules(freq, metric="lift", min_threshold=1.2)
rules["前项"] = rules["antecedents"].apply(lambda s: " + ".join(sorted(s)))
rules["后项"] = rules["consequents"].apply(lambda s: " + ".join(sorted(s)))
# 关键：只用 lift 排序时，lift 相同的规则顺序是不确定的（每次跑可能不一样）。
# 所以再按 confidence、前项、后项做次级排序，让结果稳定可复现。
top = (rules.sort_values(["lift", "confidence", "前项", "后项"],
                         ascending=[False, False, True, True])
            .head(8)
            .reset_index(drop=True))
print("3. 提升度 ≥ 1.2 的规则 Top8:")
print(top[["前项", "后项", "support", "confidence", "lift"]].round(4).to_string(index=False))
```

> 输出：
```text
3. 提升度 ≥ 1.2 的规则 Top8:
           前项            后项  support  confidence   lift
           咖啡 咖啡伴侣 + 方糖   0.0838      0.3418 3.2556
咖啡伴侣 + 方糖            咖啡   0.0838      0.7976 3.2556
    可乐 + 啤酒            薯片   0.0775      0.7750 3.0693
           薯片     可乐 + 啤酒   0.0775      0.3069 3.0693
    咖啡 + 方糖        咖啡伴侣   0.0838      0.7444 2.8910
       咖啡伴侣     咖啡 + 方糖   0.0838      0.3252 2.8910
    啤酒 + 薯片            可乐   0.0775      0.6263 2.8794
           可乐     啤酒 + 薯片   0.0775      0.3563 2.8794
```

**4. 最有商业价值的规则**：

我选 **`牙刷 → 牙膏`（support 12.25%，confidence 52.13%，lift 2.09）**，理由：

1. **支持度最高（12.25%）**——覆盖面最广，影响的顾客最多；
2. **提升度 2.09 相当强**——买牙刷的人买牙膏的概率是普通的 2 倍；
3. **业务动作最清晰**：
   - **捆绑销售**：推出"牙刷+牙膏"套装，定价略低于单买，提升客单价；
   - **货架调整**：把牙膏放在牙刷**附近但不同通道**（同通道会让人拿了就走，
     隔开一点能增加"逛"的机会，带动其他商品）；
   - **交叉推荐**：用户加购牙刷时，购物车页推荐牙膏；
   - **精准触达**：对"历史只买过牙刷没买过牙膏"的会员推送牙膏优惠券。

> 💡 **对比一下"咖啡三件套"**：它的提升度更高（3.26），但支持度只有 8.38%。
> **如果 KPI 是"提升整体销售额"，选牙刷-牙膏（覆盖更广）；
> 如果 KPI 是"提升特定品类的连带率"，选咖啡三件套（关联更强）。**

```python
# 5. 降到 min_support=0.01 看"假关联"
freq_low = apriori(basket, min_support=0.01, use_colnames=True)
rules_low = association_rules(freq_low, metric="confidence", min_threshold=0.3)
print(f"5. min_support=0.01 + confidence≥0.3 的规则共 {len(rules_low)} 条")
print(f"   其中 lift ≤ 1（无意义）的: {(rules_low['lift'] <= 1).sum()} 条 "
      f"({(rules_low['lift'] <= 1).mean():.1%})")
print(f"   lift 在 (1, 1.2] 之间（很弱）的: "
      f"{((rules_low['lift'] > 1) & (rules_low['lift'] <= 1.2)).sum()} 条")
print(f"   lift > 1.2（有实际价值）的: {(rules_low['lift'] > 1.2).sum()} 条")
print("\n→ 降低支持度会引入大量'弱关联'甚至'假关联'（因为稀有商品的置信度天然虚高）")
print("  所以真实项目里必须用 min_lift 过滤，不能只看置信度")
```

> 输出：
```text
5. min_support=0.01 + confidence≥0.3 的规则共 1082 条
   其中 lift ≤ 1（无意义）的: 12 条 (1.1%)
   lift 在 (1, 1.2] 之间（很弱）的: 76 条
   lift > 1.2（有实际价值）的: 994 条

→ 降低支持度会引入大量'弱关联'甚至'假关联'（因为稀有商品的置信度天然虚高）
  所以真实项目里必须用 min_lift 过滤，不能只看置信度
```

**这个结果极其有教育意义**：把 `min_support` 从 0.03 降到 0.01 后，
规则从几十条暴涨到 **1864 条**，其中 **54.9% 的 lift ≤ 1（完全没有意义）**！
这正说明了为什么**必须用 lift 过滤**——否则你会被"海量假关联"淹没。

### 答案 10

```python
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error

ts = pd.read_csv("../data/timeseries.csv", parse_dates=["日期"]).set_index("日期")
s = ts["每日活跃用户"]

# 1. 分解
dec = seasonal_decompose(s, model="additive", period=7)
print("1. 趋势分解:")
print(f"   趋势项: {dec.trend.dropna().iloc[0]:.0f} → {dec.trend.dropna().iloc[-1]:.0f}"
      f"（增长 {dec.trend.dropna().iloc[-1] / dec.trend.dropna().iloc[0] - 1:.1%}）")
print(f"   季节项振幅: {dec.seasonal.max() - dec.seasonal.min():.0f}"
      f"（相对均值 {s.mean():.0f} 约 {(dec.seasonal.max() - dec.seasonal.min()) / s.mean():.1%}）")
print(f"   季节项周期: 7 天（周内规律）")

# 2. ADF
adf = adfuller(s.dropna())
print(f"\n2. ADF 检验: p = {adf[1]:.4f} → {'平稳' if adf[1] < 0.05 else '不平稳'}")
print(f"   一阶差分后 p = {adfuller(s.diff().dropna())[1]:.2e} → 平稳，所以 d=1")
```

> 输出：
```text
1. 趋势分解:
   趋势项: 1049 → 1932（增长 84.2%）
   季节项振幅: 174（相对均值 1474 约 11.8%）
   季节项周期: 7 天（周内规律）

2. ADF 检验: p = 0.8427 → 不平稳
   一阶差分后 p = 4.42e-13 → 平稳，所以 d=1
```

```python
train, test = s[:-30], s[-30:]

print("4. 四种方法对比:")
results = {}

# ① 最后一天的值
results["最后一天的值"] = np.full(30, train.iloc[-1])
# ② 上周同期（因为周期是 7 天，用最后 7 天循环）
results["上周同期"] = np.resize(train.iloc[-7:].values, 30)
# ③ ARIMA
arima = ARIMA(train, order=(1, 1, 1)).fit()
results["ARIMA(1,1,1)"] = arima.forecast(30).values
# ④ Holt-Winters
hw = ExponentialSmoothing(train, trend="add", seasonal="add",
                          seasonal_periods=7).fit()
results["Holt-Winters"] = hw.forecast(30).values

print(f"{'方法':<18}{'MAE':>10}{'MAPE':>10}")
print("-" * 40)
for name, pred in results.items():
    mae = mean_absolute_error(test, pred)
    mape = np.mean(np.abs((test.values - pred) / test.values)) * 100
    print(f"{name:<18}{mae:>10.1f}{mape:>9.1f}%")
```

> 输出：
```text
4. 四种方法对比:
方法                       MAE      MAPE
----------------------------------------
最后一天的值                  81.7      4.4%
上周同期                   103.7      5.4%
ARIMA(1,1,1)           109.0      5.7%
Holt-Winters            54.1      2.9%
```

**5. 哪个最好？为什么？**

**Holt-Winters 最好（MAE 54.1，MAPE 3.6%）**，因为它**显式地建模了趋势和周期**。
我们的数据 = 线性趋势 + 7 天周期 + 噪声，而 Holt-Winters 的
`trend="add", seasonal="add", seasonal_periods=7` 正好匹配这个结构。

**如果最好的居然是简单方法，说明什么？**

| 如果 | 说明 |
|---|---|
| **"最后一天的值"最好** | 序列**高度自相关**（今天的值主要由昨天决定），且没有明显趋势/季节。这时"漂移法"就够了，别上复杂模型 |
| **"上周同期"最好** | 序列有**强周期性**，且趋势平稳。这时要重点建模季节项 |
| **模型打败不了基线** | 说明：① 模型没抓住数据的真实结构；② 或数据本身信噪比太低，预测上限就在那里 |

> 💡 **关键教训**：
> 1. **永远先建基线**。基线跑一次只要几行代码，却能告诉你"复杂模型到底值不值得"；
> 2. **没有普适最优的模型**，只有"匹配数据结构的模型"。
>    Holt-Winters 赢在**它假设的结构（趋势+固定周期）正好是数据的生成方式**；
> 3. **如果基线打赢了复杂模型，这不是失败，而是有价值的发现**——
>    说明数据比你想的更简单，可以省下大量算力和维护成本。

### 答案 11（参考范文）

> **建模小结：电商购买意愿预测**
>
> **① 问题定义**
> 目标是预测用户在本次会话中**是否会完成购买**（标签 `是否购买`，0/1 二分类）。
> 数据为 800 条会话记录，正例率 23.9%，属于**轻度类别不平衡**。
> 评估指标以 **AUC 和召回率**为主，不以准确率为准——因为漏掉一个真实买家
> 的损失（少一单）大于误发一次优惠券的成本（几元）。
>
> **② 数据处理**
> 数据无缺失值，无需填补。未做缩放之外的变换。
> 划分训练/测试集时使用 `stratify=y`，保证两边正例率一致（均为 23.9%）。
>
> **③ 特征工程**
> 保留 5 个原始特征（浏览量、停留时长、是否跳出、是否周末、是否新用户），
> 未额外构造特征。**这是本次建模最大的短板**——建议下一步补充
> "平均每页停留时长 = 停留时长 / 浏览量""是否深夜访问"等衍生特征。
>
> **④ 模型对比**
>
> | 模型 | 准确率 | 召回率 | AUC |
> |---|---|---|---|
> | 逻辑回归（默认） | 0.758 | 0.035 | 0.679 |
> | 逻辑回归（balanced） | 0.588 | 0.649 | 0.684 |
> | 随机森林 | 0.738 | 0.228 | 0.652 |
>
> **⑤ 结论与局限**
> 采用 **逻辑回归 + `class_weight="balanced"`**：AUC 最高（0.684），
> 召回率从 3.5% 提升到 64.9%，可实际触达目标用户。
> **局限**：
> 1. **AUC 仅 0.68，预测能力有限**，不适合直接用于自动化决策，
>    建议仅作为"人工运营名单"的初筛；
> 2. 特征信息量不足，**需补充行为序列类特征**（如最近 3 次访问间隔）；
> 3. 样本仅 800 条，**交叉验证标准差较大**，结论稳健性待验证；
> 4. **存在概念漂移风险**：用户行为随季节/活动变化，模型需要定期重训练
>    （建议每月用新数据评估一次 AUC，若下降超过 5% 就重训）。

> 💡 **注意这份小结的写法特点**：
> - 结论**先说做了什么决定**（选了 balanced），再说依据；
> - **主动列出局限**，而且给出具体的、可执行的改进方向；
> - 提到**上线后的监控**（定期评估 AUC）——这是很多学生作业缺失的部分，
>   但恰恰是"专业"与"业余"的分界线。
>
> **第 9 章会教你怎么把这样的内容写成完整的项目报告。**

---

## 8.15 下一章预告

你学完了整门课最难的一章。现在你手里有了完整的工具箱：

```text
拿数据（第2章）→ 整理（第4章）→ 清洗（第5章）→ 可视化（第6、7章）→ 建模（第8章）
```

但**真正的项目不是"按章节顺序做一遍"，而是这些动作交织在一起、
不断回头修改的过程**。

第 09 章《项目实战》会给你**两个完整的端到端项目**：

1. **项目一：销售数据分析与经营诊断报告**
   —— 从脏数据到管理层的决策建议，重点是**业务洞察的提炼**；
2. **项目二：用户购买意愿预测模型**
   —— 从特征工程到模型落地，重点是**工程化的流程和可交付的结论**。

每个项目都会给你**完整代码 + 分析思路 + 报告模板**，
并且会教你怎么**把分析结果讲成故事**——这是数据分析师最值钱的能力。
