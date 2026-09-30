---
title: Python 数据分析与可视化 · 零基础完整学习教程
date: 2026-09-26 10:00:00
permalink: /pyviz/00-overview/
series: pyviz
chapter: 0
desc: 环境准备、目录结构与本教程的阅读顺序
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- 教程总览
keywords: Python 数据分析, 数据可视化, Python 数据分析与可视化 · 零基础完整学习教程, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: Python 数据分析与可视化 · 零基础完整学习教程
toc: true
comments: true
---
> 本教程根据你的本科课程大纲（数据分析概念 → 数据集获取与存储 → NumPy → Pandas →
> 数据预处理 → Matplotlib → 机器学习与数据挖掘 → 项目实践）重写并大幅扩充，
> 面向**完全零基础**的读者，所有代码都已在你本机的 `pyviz` 环境中实际运行验证。

---

## 0. 你应该从哪里开始

**第一步**：确认环境已就绪（如果你的电脑已经装好，跳过到"第二步"）。
打开 Anaconda Prompt，执行：

```powershell
conda activate pyviz
python -c "import pandas, matplotlib, seaborn, sklearn; print('环境正常')"
```

如果输出 `环境正常`，说明环境没问题，直接看第二步。

**第二步**：按顺序读。**不要跳章**。第 3、4 章是整门课的地基，
第 5、6 章是你未来 80% 时间会反复用的内容，第 7~9 章是加分项。

**第三步**：每章的代码**一定自己敲一遍**，不要复制粘贴。
数据分析是手艺，看会 ≠ 会。每章末尾有练习题和参考答案，先自己做再看答案。

---

## 1. 完整学习路径

### 1.1 路线图

```text
                        ┌─────────────────────────────────────┐
   第 0 阶段              │  00 学习路径总览（本章）             │
   准备期（1~2 天）       │  ├─ 环境搭建：conda + Jupyter        │
                        │  └─ 数据准备：data/ 目录下 12 个数据集 │
                        └────────────────┬────────────────────┘
                                         │
                        ┌────────────────▼────────────────────┐
   第 1 阶段              │  01 数据分析概念                     │
   建立认知（1 天）       │  数据→信息→知识、分析流程、方法体系、  │
                        │  工具库全景图、数据思维               │
                        └────────────────┬────────────────────┘
                                         │
                        ┌────────────────▼────────────────────┐
   第 2 阶段              │  02 数据获取与存储                   │
   学会拿数据（2 天）     │  CSV/Excel/JSON → SQL 数据库 →      │
                        │  网页抓取 → API → 格式选型           │
                        └────────────────┬────────────────────┘
                                         │
              ┌──────────────────────────┴──────────────────────────┐
              │                                                     │
   ┌──────────▼─────────────┐                    ┌──────────────────▼──────────┐
   │ 03 NumPy 数组与矩阵     │                    │  （可先跳过，回头再学）        │
   │ 3 天：ndarray、索引、   │                    │                              │
   │ 广播、矩阵运算、随机数  │                    │                              │
   └──────────┬─────────────┘                    └──────────────────────────────┘
              │
   ┌──────────▼─────────────┐
   │ 04 Pandas 数据分析 ★★★  │  ← 全课程最重要的一章，占你未来 50% 工作量
   │ 5 天：Series/DataFrame、│
   │ 索引、筛选、分组聚合、  │
   │ 合并、透视、时间序列    │
   └──────────┬─────────────┘
              │
   ┌──────────▼─────────────┐
   │ 05 数据预处理 ★★★       │  ← 真实工作 60% 时间在做这件事
   │ 3 天：缺失值、异常值、  │
   │ 类型转换、标准化、      │
   │ 离散化、特征工程        │
   └──────────┬─────────────┘
              │
              ├───────────────────────────────┐
              │                               │
   ┌──────────▼─────────────┐    ┌────────────▼────────────────┐
   │ 06 Matplotlib 可视化 ★★★│    │ 07 Seaborn 与 Plotly 进阶   │
   │ 3 天：绘图流程、11 类   │    │ 2 天：统计图、分面、热力图、 │
   │ 图表、样式、子图、中文  │    │ 回归图、交互图、动态图       │
   └──────────┬─────────────┘    └────────────┬────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                 ┌────────────▼────────────────┐
  第 3 阶段        │ 08 机器学习与数据挖掘        │
  能力升级（8 天）  │ 8 天：sklearn 全流程、特征工程、│
                 │ 回归、分类、聚类、关联规则、  │
                 │ 降维、时间序列、调参、评估    │
                 └────────────┬────────────────┘
                              │
                 ┌────────────▼────────────────┐
  第 4 阶段        │ 09 项目实战                  │
  综合运用（5 天）  │ 两个端到端项目 + 分析报告写法 │
                 └────────────┬────────────────┘
                              │
                 ┌────────────▼────────────────┐
  随时查阅         │ 附录：速查表 / 报错手册 / 术语表│
                 └─────────────────────────────┘
```

### 1.2 章节清单与预计时间

| 章节 | 文件 | 难度 | 预计时间 | 学完你能做什么 |
|---|---|---|---|---|
| 0 | `00_学习路径总览.md` | ⭐ | 0.5 h | 把环境和数据集准备好，知道整条路线怎么走 |
| 1 | `01_数据分析概念.md` | ⭐ | 3 h | 说清数据分析是什么、有哪些方法、用什么工具 |
| 2 | `02_数据获取与存储.md` | ⭐⭐ | 5 h | 从 CSV/Excel/数据库/网页/API 把数据拿到手 |
| 3 | `03_NumPy数组与矩阵.md` | ⭐⭐ | 8 h | 用数组做数值计算，理解向量化为什么比 for 快 100 倍 |
| 4 | `04_Pandas数据分析.md` | ⭐⭐⭐ | 15 h | 清洗、筛选、分组、聚合、合并、透视任意表格数据 |
| 5 | `05_数据预处理.md` | ⭐⭐⭐ | 8 h | 把脏数据变成能建模的数据 |
| 6 | `06_Matplotlib可视化.md` | ⭐⭐⭐ | 9 h | 画出规范、好看、能放进报告的中文图表 |
| 7 | `07_Seaborn与Plotly.md` | ⭐⭐ | 6 h | 一行画出统计图，做可交互的动态图表 |
| 8 | `08_机器学习与数据挖掘.md` | ⭐⭐⭐ | 24 h | 用 sklearn 完成回归/分类/聚类/关联规则/PCA/时间序列全流程 |
| 9 | `09_项目实战.md` | ⭐⭐⭐ | 15 h | 独立完成一个数据分析项目并写成报告 |
| 附 | `appendix/` | — | 随时查 | 速查、报错排查、术语对照 |

**总计约 95 小时**。按每天 2 小时算，大约 7 周。赶时间的话，
优先顺序是：**4 → 6 → 5 → 3 → 2 → 7 → 8 → 9**。

### 1.3 三条学习路径（按你的目标选）

**路径 A：应付课程作业 / 考试**
`01 → 02 → 03 → 04 → 05 → 06`，每章的"练习"和"小结"必看，
机器学习章节只读 08 章的概念部分。

**路径 B：做数据分析岗 / 实习**
全读。重点砸在 04、05、06，08 章至少把回归和分类跑通一遍，
09 章项目要真正自己重做一遍（不看答案）。

**路径 C：做科研 / 毕设数据处理**
`02 → 03 → 04 → 05 → 06 → 07`，然后跳到 08 章的"回归"和"聚类"两节，
时间序列那一节也建议看（很多实验数据是时间序列）。

---

## 2. 环境搭建（详细版，零基础照做即可）

### 2.1 已经帮你做好的部分

我在这台电脑上已经创建好了独立环境 `pyviz`：

| 项目 | 值 |
|---|---|
| 环境名 | `pyviz` |
| 位置 | `D:\conda\miniconda3\envs\pyviz` |
| Python | 3.11.16 |
| 已装库 | numpy 2.4.6、pandas 3.0.6、matplotlib 3.11.2、seaborn 0.13.2、scikit-learn 1.9.1、statsmodels、plotly、polars、mlxtend、jupyterlab 等 |

**为什么单独建一个环境？** 你机器上还有 `yolov8`、`lenet` 两个用于深度学习的环境。
如果把数据科学的库直接装进它们，可能升级掉某个库、导致你原来的视觉项目跑不起来。
conda 环境就是"每个项目一个独立工具箱"，互相不干扰。

**为什么不用 `D:\python\python.exe`？** 那个是系统级 Python 3.12，装了 numpy，
但数据分析需要 matplotlib、pandas、scikit-learn 等十几个包，装到全局解释器里
以后很难清理。学习阶段一律用 conda 环境。

### 2.2 验证环境

打开 **Anaconda Prompt**（开始菜单里搜 Anaconda），依次输入：

```powershell
conda activate pyviz
python -c "import sys, numpy, pandas, matplotlib, seaborn, sklearn; print(sys.version); print('numpy', numpy.__version__); print('pandas', pandas.__version__); print('matplotlib', matplotlib.__version__); print('sklearn', sklearn.__version__)"
```

> 输出：
> ```text
> 3.11.16 (main, ...) [MSC v.1938 64 bit (AMD64)]
> numpy 2.4.6
> pandas 3.0.6
> matplotlib 3.11.2
> sklearn 1.9.1
> ```

看到这些版本号就说明环境完全正常。

> ⚠️ **常见报错**：`'conda' 不是内部或外部命令`
> **原因**：用的是普通 cmd 或 PowerShell，没有加载 conda。
> **解决**：改用 Anaconda Prompt；或者在 PowerShell 里先执行
> `& D:\conda\miniconda3\shell\condabin\conda-hook.ps1`。

### 2.3 启动 Jupyter 并进入工作目录

所有示例代码都假设你的工作目录是教程的 `code` 文件夹，因此：

```powershell
conda activate pyviz
cd "<教程目录>\code"
jupyter lab
```

浏览器会自动打开 JupyterLab。第一次用的话：

1. 左侧文件列表里点 **＋** 或者 `File → New → Notebook`；
2. 选内核时选 **Python 3 (ipykernel)**；
3. 把文件名改成 `ch01_练习.ipynb` 之类；
4. 在单元格里敲代码，按 **Shift + Enter** 运行。

> 📌 **为什么要在 code 目录启动？**
> 因为教程里读数据统一写 `../data/sales_clean.csv`。
> `..` 表示"上一级目录"，从 `code` 上一级就是教程根目录，里面才有 `data` 文件夹。
> 如果你从别的地方启动 Jupyter，这句会报
> `FileNotFoundError: [Errno 2] No such file or directory: '../data/sales_clean.csv'`。

### 2.4 ⚠️ `conda activate` 报 CommandNotFoundError 怎么办（必读）

**症状**：在普通 `cmd` 里敲 `conda activate pyviz`，出现：

```text
CommandNotFoundError: Your shell has not been properly configured to use 'conda activate'.
If using 'conda activate' from a batch script, change your invocation to 'CALL conda.bat activate'.

To initialize your shell, run
    $ conda init <SHELL_NAME>
```

**原因**：**不是你的环境坏了**，而是"这个终端窗口没有加载 conda 的初始化脚本"。
`conda activate` 是一个**由 conda 注入到 shell 里的函数**，
不是独立的可执行程序。没初始化过的 cmd 里根本没有这个函数，所以报"找不到命令"。

**为什么用 Anaconda Prompt 就没问题？** 因为那个快捷方式在启动时会
自动做一次"初始化 + 激活 base"。

**推荐：双击桌面的 `启动pyviz学习环境.bat`（已为你创建）**

我在你桌面上建了一个启动器，双击它就会：

1. 自动激活 `pyviz` 环境；
2. 自动切到 `code` 目录；
3. 打印当前 Python 路径和工作目录；
4. 停留在一个已就绪的 cmd 窗口里。

> 💡 **这个 bat 里有个细节值得说明**：教程目录名含中文
> （`Python数据分析与可视化教程`），而 `.bat` 文件在某些控制台代码页下
> 会把中文路径读错。所以启动器里用的是 **8.3 短路径**
> `<教程目录>\code`（纯 ASCII），
> 并且**所有 `rem` 注释行都写成英文**——避免文件编码导致的乱码。

**方案 2：用 Anaconda Prompt（最标准）**

开始菜单搜索 `Anaconda Prompt` 或 `Anaconda Powershell Prompt`，打开后直接：

```powershell
conda activate pyviz
```

**方案 3：在当前 cmd 里手动激活（不改任何配置）**

```cmd
call D:\conda\miniconda3\Scripts\activate.bat pyviz
```

> 💡 注意是 `call ... activate.bat 环境名`，**不用写 `conda activate`**。
> 也可以写成 `call D:\conda\miniconda3\condabin\conda.bat activate pyviz`，两种都实测可用。

**方案 4：一劳永逸（会改注册表）**

```cmd
conda init cmd.exe
```

然后**关闭当前窗口、重新打开**一个新 cmd，之后 `conda activate pyviz` 就能直接用了。

> ⚠️ 这一步会写入
> `HKEY_CURRENT_USER\Software\Microsoft\Command Processor\AutoRun`，
> 让**每个新开的 cmd 窗口**都自动加载 conda。如果你不想改注册表，用方案 1~3。

**不管用哪个方案，激活成功的唯一判据是这一条**：

```cmd
python -c "import sys; print(sys.executable)"
```

**输出必须是**：

```text
D:\conda\miniconda3\envs\pyviz\python.exe
```

如果输出是 `D:\python\python.exe` 或 `C:\...\Python313\...`，
说明**还在用系统 Python，环境没激活成功**。

> 📌 **为什么这一点极其重要？**
> 你的机器上有 4 个 Python：`D:\python\python.exe`(3.12)、
> `C:\...\Python313`(3.13)、conda base(3.8)、以及我们的 `pyviz`(3.11)。
> **只有 `pyviz` 里装了 pandas 3.0.6 等全套库**。
> 用错解释器最常见的症状就是：
> `ModuleNotFoundError: No module named 'pandas'`
> ——**报这个错，先怀疑环境没激活，而不是去 pip install。**

### 2.5 Jupyter 必须会用的 8 个操作

| 操作 | 快捷键 | 说明 |
|---|---|---|
| 运行当前单元格 | `Shift + Enter` | 最常用，运行完自动跳到下一格 |
| 运行当前单元格（不跳） | `Ctrl + Enter` | 反复调同一段代码时用 |
| 新增单元格（下方） | `B`（命令模式） | 先按 `Esc` 进命令模式 |
| 删除单元格 | `D D`（命令模式） | 连按两次 D |
| 切换代码/文字 | `Y` / `M`（命令模式） | Y=代码，M=Markdown 写笔记 |
| 补全代码 | `Tab` | 输入 `df.gr` 按 Tab 会补全 `groupby` |
| 看函数说明 | `Shift + Tab` | 光标放在函数名上，弹出参数文档 |
| 重启内核 | 菜单 `Kernel → Restart` | 变量乱了、报错诡异时的万能解法 |

> 💡 **新手最容易踩的坑**：改了上面的单元格但没重新运行，
> 下面的代码用的是旧变量，结果数据对不上。
> 遇到"结果莫名其妙"就 `Kernel → Restart Kernel and Run All Cells`。

### 2.6 如果你要在别人电脑上重建这个环境

```powershell
conda create -n pyviz python=3.11 -y
conda activate pyviz
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple numpy pandas matplotlib seaborn scikit-learn statsmodels plotly polars mlxtend jupyterlab notebook openpyxl pyarrow missingno requests beautifulsoup4 lxml
```

`-i https://pypi.tuna.tsinghua.edu.cn/simple` 是清华镜像，
不加的话从国外源下载会非常慢甚至超时。

---

## 3. 配套数据集说明

所有数据都在 `data` 目录下，由 `code/gen_data.py` 用**固定随机种子**生成，
你随时可以重新跑一遍得到完全相同的数据：

```powershell
conda activate pyviz
cd "<教程目录>\code"
python gen_data.py
```

### 3.1 数据集总览

所有数据都在 `data` 目录下。**前 8 个由 `code/gen_data.py` 用固定随机种子生成**，
你随时可以重新跑一遍得到完全相同的数据；后 3 个是公开数据集，已下载到本地
（避免联网失败）。

| 文件 | 规模 | 用于哪几章 | 特点 |
|---|---|---|---|
| `sales.csv` | 1230 行 × 14 列 | 第 5 章、项目一 | **故意做脏**：8 类问题，见 3.3 |
| `sales_clean.csv` | 1064 行 × 14 列 | 第 3、4 章 | 已清洗，可直接练查询和分组 |
| `students.csv` | 300 行 × 12 列 | 第 3、6、8 章 | 成绩数据，含缺失和异常值，适合回归 |
| `timeseries.csv` | 1096 行 × 4 列 | 第 4、6、8 章 | 三年逐日数据，有趋势+年周期+周周期 |
| `mall_members.csv` | 500 行 × 7 列 | 第 8 章 | 会员消费数据，适合 K-Means 分群 |
| `shopping_intent.csv` | 800 行 × 6 列 | 第 8 章、项目二 | 购买意愿预测，**正例率 23.88%** |
| `销售与会员.xlsx` | 3 个工作表 | 第 2 章 | Excel 多表读取，含"表头不在第一行"的坑 |
| `company.db` | SQLite 3 张表 | 第 2 章 | SQL 查询练习（`sales`/`members`/`products`） |
| `california_housing.csv` | 20640 行 × 10 列 | 第 8 章 | 加州房价，经典回归数据集 |
| `titanic.csv` | 891 行 × 12 列 | 第 8 章 | 泰坦尼克生存预测，经典分类数据集 |
| `gapminder.csv` | 1704 行 × 6 列 | 第 7 章 | 各国历年寿命/收入，适合动态图 |

**第 02 章另外用到的格式文件**（也由 `gen_data.py` 生成）：

| 文件 | 用途 |
|---|---|
| `orders.json` | 嵌套 JSON（含数组嵌套），练 `json_normalize` 摊平 |
| `logs.jsonl` | JSON Lines，练分块/流式读取 |
| `sales.parquet` | 列式存储，练类型保留与只读部分列 |
| `sales_gbk.csv` | GBK 编码，练编码问题 |
| `sales_noheader.csv` | 无表头 + 分号分隔，练 `header`/`sep`/`names` |
| `demo_page.html` | 本地网页，练表格抓取（**不依赖外网**） |

**第 08 章关联规则专用**：

| 文件 | 用途 |
|---|---|
| `grocery_baskets.json` | 800 笔超市购物篮，**有真实关联模式**，能挖出 lift>1 的规则 |
| `grocery_baskets.csv` | 同样的数据，CSV 形式 |

> ⚠️ **为什么关联规则要单独造一份数据？**
> 因为用销售订单表做关联规则**没有意义**——每笔订单几乎都涉及全部 5 个品类，
> 算出来的提升度（lift）全部等于 1.0。**真实的购物篮分析必须用"每笔只买少数几件"的数据。**
> 这个"坑"本身在第 8 章是一个教学点。

### 3.2 数据字典（列名含义）

主数据集 `sales.csv` / `sales_clean.csv` 共 14 列：

| 列名 | 类型 | 含义 | 示例 |
|---|---|---|---|
| 订单编号 | 字符串 | 订单唯一标识 | `SO20230300508` |
| 订单日期 | 日期 | 下单日期 | `2023-03-01` |
| 省份区域 | 字符串 | 所属大区 | 华北/华东/华南/华中/西南/西北 |
| 城市 | 字符串 | 下单城市 | 北京、上海…… |
| 商品类别 | 字符串 | 一级品类 | 手机数码、家用电器…… |
| 商品名称 | 字符串 | 具体商品 | 智能手机、空气炸锅…… |
| 单价 | 浮点数 | 商品单价（元） | `3313.80` |
| 数量 | 整数 | 购买件数 | `2` |
| 折扣 | 浮点数 | 折扣系数（0.7 表示打七折） | `0.9` |
| 销售额 | 浮点数 | 实付金额 = 单价 × 数量 × 折扣 | `3313.80` |
| 客户年龄 | 浮点数 | 客户年龄（18~69） | `32.0` |
| 客户性别 | 字符串 | 男/女 | `男` |
| 支付方式 | 字符串 | 支付宝/微信支付/银行卡/花呗 | `支付宝` |
| 下单渠道 | 字符串 | APP/小程序/网页/线下门店 | `线下门店` |

### 3.3 `sales.csv` 里故意埋的 8 个坑（精确行数）

第 5 章会逐个教你识别和修复。**这些行数都验证过，可以放心引用**：

| # | 坑 | 行数 | 对应技能 |
|---|---|---|---|
| 1 | `城市` 前后带空格 | **61 行** | `.str.strip()` |
| 2 | `数量` 混入 `"3件"` 这类带单位的字符串 | **25 行** | `pd.to_numeric(..., errors="coerce")` |
| 3 | `销售额` 缺失（真 NaN） | **49 行** | 缺失值处理 |
| 4 | `客户年龄` 缺失 | **43 行** | 缺失值处理 |
| 5 | 负销售额（退货没标出来） | **23 行** | 异常值识别 / 业务标记 |
| 6 | 日期三种写法混在一起 | 1205 + 62 + 25 行 | 日期解析 |
| 7 | 完全重复行 29 行；`订单编号` 重复 **30 行** | — | `drop_duplicates()` |
| 8 | `客户性别` 是空字符串 | **21 行** | 空字符串 ≠ 缺失值 |

**清洗后的关键数字**（项目一和文档里的报告都基于它）：

```text
原始 1230 行
  → 按订单编号去重 30 行
  → 剔除不可用 113 行（销售额缺失 49 + 年龄缺失 43 + 性别空串 21，有重叠）
  → 清洗后 1087 行（含 23 笔退货）
  → 分析口径 1064 笔有效销售，总销售额 1,592,095.89 元
```

> 💡 **注意"113 行"不等于"49 + 43 + 21 = 113"**——恰好相等是个巧合，
> 实际上三类问题有重叠（某一行可能同时缺金额和年龄）。**真实清洗中不能简单相加。**

**其他数据集的关键统计**：

| 数据集 | 关键数字 |
|---|---|
| `sales_clean.csv` | 1064 行；销售额合计 1,592,095.89；区域：华南 50.96 万 / 华东 43.70 万 / 华北 32.41 万；品类：手机数码 56.8% / 家用电器 33.5% |
| `students.csv` | 300 行；`每周自习小时` 缺失 12 个；`期末成绩` 缺失 5 个；`总评成绩` 有 **3 行等于 -1**（表示缺考） |
| `timeseries.csv` | 1096 行，2022-01-01 ~ 2024-12-31 逐日；ADF 检验 p=0.84（不平稳），一阶差分后平稳 |
| `mall_members.csv` | 500 行；年消费金额 293 ~ 28,775；**K-Means 必须先标准化** |
| `shopping_intent.csv` | 800 行；正例率 **23.88%**；三模型 AUC 都在 0.64~0.67（**特征信息量是瓶颈**） |
| `california_housing.csv` | 20640 行；`total_bedrooms` 缺失 207 个；`median_house_value` 有 965 个封顶值 500001（建模时应剔除） |
| `titanic.csv` | 891 行；`Age` 缺失 177、`Cabin` 缺失 687、`Embarked` 缺失 2；生还率 38.38% |
| `gapminder.csv` | 1704 行，1952~2007 每 5 年 |

---

## 4. 使用建议

### 4.1 关于 pandas 版本

本环境是 **pandas 3.0.6**，而网上大量教程和教材是基于 pandas 1.x / 2.x 的。
两者有若干**不兼容**的写法，照抄旧教程会直接报错。本教程统一使用 **3.0 的正确写法**，
并在每个受影响的地方用这个标记提示你差异：

> 📌 **pandas 2.x 与 3.0 差异**：……

完整差异清单见 `appendix/A3_版本差异与常见报错手册.md`。

### 4.2 关于"跑不通"

教程里的所有代码都在你的 `pyviz` 环境实测通过。如果你跑出报错，先检查三件事：

1. **工作目录对不对**：`../data/xxx.csv` 能不能找到（用 `import os; os.getcwd()` 看）；
2. **是不是没重启内核**：改了上面的单元格却没重跑；
3. **是不是漏了导入**：常见的是忘了 `import matplotlib.pyplot as plt`。

附录 A3 收录了本机实测会遇到的全部报错及解决方案。

### 4.3 不要做的事

- ❌ 不要在 `base` 环境或 `yolov8` / `lenet` 环境里装这些包；
- ❌ 不要用 `pip install` 装 conda 环境里已有的包（会搞乱依赖）；
- ❌ 不要复制粘贴完就跑，代码要自己敲——手感是练出来的；
- ❌ 不要跳过第 4 章直接学机器学习。没有 pandas 基础，机器学习章节你连数据都读不进来。

---

## 5. 文件目录结构

```text
Python数据分析与可视化教程/
├── 00_学习路径总览.md            ← 你正在读的文件
├── 01_数据分析概念.md
├── 02_数据获取与存储.md
├── 03_NumPy数组与矩阵.md
├── 04_Pandas数据分析.md
├── 05_数据预处理.md
├── 06_Matplotlib可视化.md
├── 07_Seaborn与Plotly.md
├── 08_机器学习与数据挖掘.md
├── 09_项目实战.md
├── _写作规范与数据字典.md         ← 教程的施工图（数据口径以它为准）
├── appendix/
│   ├── A1_pandas速查表.md
│   ├── A2_可视化速查表.md
│   ├── A3_版本差异与常见报错手册.md      ← 遇到报错先来这里搜
│   └── A4_术语表.md
├── data/                        ← 所有数据集（19 个文件）
│   ├── sales.csv                  脏数据（第 5 章、项目一）
│   ├── sales_clean.csv            干净数据（第 3、4 章）
│   ├── students.csv
│   ├── timeseries.csv
│   ├── mall_members.csv
│   ├── shopping_intent.csv
│   ├── 销售与会员.xlsx
│   ├── company.db
│   ├── sales.parquet / sales_gbk.csv / sales_noheader.csv   （第 2 章）
│   ├── orders.json / logs.jsonl / demo_page.html            （第 2 章）
│   ├── grocery_baskets.json / grocery_baskets.csv           （第 8 章关联规则）
│   ├── california_housing.csv
│   ├── titanic.csv
│   └── gapminder.csv
└── code/                        ← 在这里启动 Jupyter
    ├── gen_data.py                生成全部数据集（可重复运行）
    ├── viz_style.py               统一绘图风格（第 6 章起共用）
    ├── probe.py / probe2.py / probe3.py / probe_ml.py   环境探测与实测脚本
    ├── verify_docs.py             ★ 检查教程里所有代码块能否跑通
    ├── check_outputs.py           比对文档输出与真实输出
    ├── fix_outputs.py             ★ 把真实输出自动回填进文档
    ├── check_fences.py            检查 Markdown 围栏配对
    ├── normalize_blocks.py        统一输出块格式
    ├── mark_timing_blocks.py      标记计时代码块（输出会变，不自动回填）
    ├── dedupe_fences.py           清理重复围栏
    ├── project1/                  ★ 项目一完整代码（clean/analysis/charts/run_all）
    ├── project2/                  ★ 项目二完整代码（features/train/charts/run_all）
    └── _test/                     各章验证脚本与中间产物
```

---

## 6. 教程代码的验证机制（为什么你可以放心跟着敲）

这套教程里**每一个 Python 代码块都在你的 `pyviz` 环境里真实执行过**，
而且**文档里写的"输出"都是从真实运行结果自动回填的**，不是手抄的。

验证工具就在 `code/` 目录下，你也可以自己跑：

```powershell
conda activate pyviz
cd "<教程目录>\code"

# ① 检查所有教程里的代码能否跑通
python verify_docs.py
# 预期看到：总计 646 块，失败 0 块

# ② 检查 Markdown 围栏是否配对（避免渲染错乱）
python check_fences.py
# 预期看到：合计问题数 0

# ③ 检查文档输出和真实输出是否一致
python fix_outputs.py 04
# 预期看到：需更新 0

# ④ 重新生成全部数据集（固定随机种子，结果可复现）
python gen_data.py

# ⑤ 跑两个完整项目
cd project1 && python run_all.py
cd ../project2 && python run_all.py
```

**为什么要有这套机制？** 因为教程最坑人的不是讲错概念，
而是"**照着敲却跑不通**"，或者"**运行结果和书上写的不一样**"。
这套工具从根上消灭了这两类问题。

---

## 7. 现在开始

```powershell
conda activate pyviz
cd "<教程目录>\code"
jupyter lab
```

然后打开本目录下的 `01_数据分析概念.md`，开始第一章。

> 💡 建议：在 JupyterLab 里同时开一个 Notebook 和一个 Markdown 预览。
> 左边看教程，右边敲代码，学一章存一个 `.ipynb` 文件作为你的学习笔记。

---

## 8. 学完之后：三个去处

1. **项目作品集**：把第 09 章的"结课练习"认真做完，
   放进简历或作品集。**面试官不会问你"知不知道 groupby"，
   他会问"你分析过什么数据、得出什么结论、产生了什么影响"。**
2. **真实数据练手**：Kaggle、天池，或者你自己的消费记录、运动数据、游戏战绩。
   **真实数据永远是脏的**，只有在脏数据上练过才算真会。
3. **回来查手册**：附录 A1~A4 是设计成"长期使用"的速查手册，
   尤其是 **A3 报错手册**——你以后遇到的报错，八成能在里面找到答案。
