---
title: 03 NumPy 数组与矩阵
date: 2026-09-26 10:00:00
permalink: /pyviz/03-numpy/
series: pyviz
chapter: 3
desc: 数组与矩阵运算，为后面的向量化打基础
categories:
- 数据分析与可视化
tags:
- Python
- 数据分析与可视化
- NumPy
keywords: Python 数据分析, 数据可视化, 03 NumPy 数组与矩阵, Pandas, NumPy, Matplotlib, 教程
cover: /post-covers/pyviz.jpg
banner:
  type: img
  bgurl: /post-covers/pyviz.jpg
  banner_text: 03 NumPy 数组与矩阵
toc: true
comments: true
---
> 本章难度：⭐⭐ | 预计学习时间：8 小时 | 前置章节：02 数据获取与存储

---

## 学习目标

学完本章你能做到：

1. 说清 **ndarray（数组）** 和 Python 列表的本质区别，理解什么是 **向量化**，以及为什么它能快几十倍；
2. 创建数组：从列表、`zeros`/`ones`/`arange`/`linspace`、随机数；
3. 熟练使用**索引与切片**（含二维、三维），并明白**"切片是视图、不是副本"**这个关键机制；
4. 用**布尔索引**和**花式索引**精确取出你要的数据；
5. **理解广播（broadcasting）** 规则，能看懂并且能写出高效的向量化表达式；
6. 用 `axis` 参数做按行/按列的统计聚合；
7. 做**矩阵运算**：元素级乘法 vs 矩阵乘法、转置、求逆、解方程组、特征值；
8. 掌握常用函数：`where`/`select`/`clip`/`sort`/`argsort`/`unique`/`concatenate`/`polyfit` 等；
9. 管理 **dtype 与内存**，知道什么时候该用 `float32` 而不是 `float64`；
10. 正确使用**新版随机数接口 `np.random.default_rng`**，并理解为什么不该再用 `np.random.seed`。

> 💡 **本章和后面章节的关系**：pandas 的每一列底层都是一个 NumPy 数组。
> 你在本章学的"向量化""布尔索引""广播"，在 pandas 里天天用到。
> **这一章学扎实，第 4 章会顺很多。**

---

## 3.1 为什么需要 NumPy

### 3.1.1 一个真实的性能对比

先看现象。同样是"把 100 万个数字各乘 2 再加 1"，两种写法：

```python
# 计时类输出每次都不一样，不自动回填 -->
import time
import numpy as np

N = 1_000_000
arr = np.random.default_rng(42).normal(0, 1, N)     # NumPy 数组
lst = arr.tolist()                                  # 转成 Python 列表

# 方式一：Python 列表推导（传统的 for 循环写法）
t0 = time.perf_counter()
result_list = [v * 2 + 1 for v in lst]
t_loop = time.perf_counter() - t0

# 方式二：NumPy 向量化（整列一起算，不写循环）
t0 = time.perf_counter()
result_arr = arr * 2 + 1
t_vec = time.perf_counter() - t0

print(f"Python 列表推导   {t_loop * 1000:8.1f} ms")
print(f"NumPy 向量化      {t_vec * 1000:8.1f} ms")
print(f"提速 {t_loop / t_vec:.0f} 倍")
print("两种方式结果一致:", np.allclose(np.array(result_list), result_arr))
```

> 输出：
```text
Python 列表推导      85.7 ms
NumPy 向量化          4.1 ms
提速 21 倍
两种方式结果一致: True
```

**同样的事情，NumPy 快 21 倍。** 而且注意：向量化的代码还**更短更清晰**——
你没有写循环，只是写了数学表达式 `arr * 2 + 1`。

> ⚠️ **一个诚实的补充**：这个 21 倍不是固定值。
> 简单的四则运算大约快 **20 倍**；而"求和"这种操作只快 **2 倍**左右
> （因为 Python 内置的 `sum` 已经是 C 实现的，本身不慢）。
> **但真正拉开差距的是"复杂运算"**，下面这个例子会让你震惊。

### 3.1.2 差距在哪里？看"距离矩阵"

任务：给 800 个二维点，算出**两两之间的距离**（800×800 = 64 万个数）。

```python
# 计时类输出每次都不一样，不自动回填 -->
import time
import numpy as np

n = 800
points = np.random.default_rng(0).random((n, 2))    # n 个点，每个点 2 个坐标

# 方式一：双层 for 循环（教科书式写法）
t0 = time.perf_counter()
d_loop = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        d_loop[i, j] = np.sqrt(((points[i] - points[j]) ** 2).sum())
t_loop = time.perf_counter() - t0

# 方式二：广播（一次算完整个矩阵）
t0 = time.perf_counter()
# points[:, None, :] 形状 (n,1,2)，points[None, :, :] 形状 (1,n,2)
# 广播后变成 (n,n,2)，相减、平方、沿最后一维求和、开方
d_vec = np.sqrt(((points[:, None, :] - points[None, :, :]) ** 2).sum(axis=2))
t_vec = time.perf_counter() - t0

print(f"双层 for 循环   {t_loop * 1000:8.0f} ms")
print(f"广播向量化      {t_vec * 1000:8.1f} ms")
print(f"提速 {t_loop / t_vec:.0f} 倍")
print("结果一致:", np.allclose(d_loop, d_vec))
```

> 输出：
```text
双层 for 循环       1801 ms
广播向量化            19.0 ms
提速 95 倍
结果一致: True
```

**快 95 倍。** 这就是 NumPy 真正的威力所在。

**为什么差距这么大？** 三个原因：

| 原因 | 说明 |
|---|---|
| **C 语言实现** | NumPy 的运算跑在编译好的 C 代码里，不是 Python 解释器里逐行执行 |
| **连续内存 + SIMD** | 数组元素在内存里是**连续排列**的，CPU 能一次处理多个（现代 CPU 的 SIMD 指令） |
| **避免 Python 对象开销** | Python 列表里每个数字都是一个**完整对象**（含类型指针、引用计数），NumPy 数组里就是一个 8 字节裸数字 |

**看一组内存对比**：

```python
import numpy as np
import sys

lst = list(range(1000))
arr = np.arange(1000)

print("Python 列表 1000 个整数:")
print("  单个 int 对象大小:", sys.getsizeof(1), "字节")
print("  列表本身（存指针）:", sys.getsizeof(lst), "字节")
print(f"  实际总占用约: {(sys.getsizeof(lst) + sum(sys.getsizeof(x) for x in lst)) / 1024:.1f} KB")

print("\nNumPy 数组 1000 个整数:")
print("  数组总占用:", arr.nbytes, "字节 =", f"{arr.nbytes / 1024:.1f} KB")
print("  每个元素固定 8 字节 (int64)")

print(f"\nNumPy 省了约 {(sys.getsizeof(lst) + sum(sys.getsizeof(x) for x in lst)) / arr.nbytes:.0f} 倍内存")
```

> 输出：
```text
Python 列表 1000 个整数:
  单个 int 对象大小: 28 字节
  列表本身（存指针）: 8056 字节
  实际总占用约: 35.2 KB

NumPy 数组 1000 个整数:
  数组总占用: 8000 字节 = 7.8 KB
  每个元素固定 8 字节 (int64)

NumPy 省了约 5 倍内存
```

### 3.1.3 什么时候该用 NumPy，什么时候用 pandas

| 任务 | 用什么 |
|---|---|
| 数值计算（矩阵、向量、随机数、线性代数） | **NumPy** |
| 表格数据（含列名、混合类型、筛选分组） | pandas |
| 统计分析（回归、聚类底层的数学） | NumPy |
| 读写 CSV/Excel/数据库 | pandas |
| 图像处理（图像就是三维数组） | NumPy |
| 深度学习（张量运算） | NumPy 思路，实际用 PyTorch/TensorFlow |

**简单记法**：**要算数学用 NumPy，要处理表格用 pandas。**
两者不是竞争关系，pandas 是站在 NumPy 肩膀上的。

---

## 3.2 ndarray：NumPy 的核心对象

### 3.2.1 创建数组的五种方式

```python
import numpy as np

# 方式1：从 Python 列表创建（最直观）
a = np.array([1, 2, 3, 4])
print("一维:", a)

# 嵌套列表 → 二维数组
b = np.array([[1, 2, 3],
              [4, 5, 6]])
print("\n二维:\n", b)

# 指定数据类型
c = np.array([1, 2, 3], dtype=np.float64)
print("\n指定 float64:", c, "| dtype:", c.dtype)
```

> 输出：
```text
一维: [1 2 3 4]

二维:
 [[1 2 3]
 [4 5 6]]

指定 float64: [1. 2. 3.] | dtype: float64
```

```python
import numpy as np

# 方式2：全 0 / 全 1 / 指定值 —— 用来"占坑"，之后再填
print("zeros((2,3)):\n", np.zeros((2, 3)))
print("\nones(5):", np.ones(5))
print("\nfull((2,2), 7):\n", np.full((2, 2), 7))
print("\n单位矩阵 eye(3):\n", np.eye(3))
```

> 输出：
```text
zeros((2,3)):
 [[0. 0. 0.]
 [0. 0. 0.]]

ones(5): [1. 1. 1. 1. 1.]

full((2,2), 7):
 [[7 7]
 [7 7]]

单位矩阵 eye(3):
 [[1. 0. 0.]
 [0. 1. 0.]
 [0. 0. 1.]]
```

```python
import numpy as np

# 方式3：arange —— 类似 range，但是返回数组
print("arange(5):", np.arange(5))
print("arange(1, 10, 2):", np.arange(1, 10, 2))       # 起点、终点（不含）、步长
print("arange(0, 1, 0.25):", np.arange(0, 1, 0.25))

# 方式4：linspace —— 在区间内取"等间隔的 N 个点"（含终点）
print("\nlinspace(0, 1, 5):", np.linspace(0, 1, 5))
print("linspace(0, 100, 5):", np.linspace(0, 100, 5))
print("linspace 适合画函数曲线，因为它保证两端点都在")
```

> 输出：
```text
arange(5): [0 1 2 3 4]
arange(1, 10, 2): [1 3 5 7 9]
arange(0, 1, 0.25): [0.   0.25 0.5  0.75]

linspace(0, 1, 5): [0.   0.25 0.5  0.75 1.  ]
linspace(0, 100, 5): [  0.  25.  50.  75. 100.]
linspace 适合画函数曲线，因为它保证两端点都在
```

> ⚠️ **`arange` 和 `linspace` 最容易搞混**：
> - `np.arange(起点, 终点, 步长)` → **"每隔多少取一个"，不含终点**，你要自己算会不会取到；
> - `np.linspace(起点, 终点, 个数)` → **"一共取几个"，含终点**，不用操心步长。
>
> **经验**：画图、插值、分箱用 `linspace`；生成整数序列用 `arange`。

```python
import numpy as np

# 方式5：随机数组（下一节详细讲）
rng = np.random.default_rng(42)
print("均匀分布 uniform(0,1,5):", rng.random(5).round(4))
print("正态分布 normal(0,1,5): ", rng.normal(0, 1, 5).round(4))
print("整数 integers(1,7,5):   ", rng.integers(1, 7, 5))
```

> 输出：
```text
均匀分布 uniform(0,1,5): [0.774  0.4389 0.8586 0.6974 0.0942]
正态分布 normal(0,1,5):  [-1.3022  0.1278 -0.3162 -0.0168 -0.853 ]
整数 integers(1,7,5):    [4 3 2 6 5]
```

### 3.2.2 数组的属性：五个必须会的

```python
import numpy as np

arr = np.arange(24).reshape(2, 3, 4)     # 2 层 3 行 4 列的三维数组

print("数组内容:\n", arr)
print("\n--- 五个核心属性 ---")
print("shape （形状）:", arr.shape, "→ 2层、每层3行、每行4个元素")
print("ndim  （维度数）:", arr.ndim)
print("size  （元素总数）:", arr.size, "= 2 × 3 × 4")
print("dtype （数据类型）:", arr.dtype)
print("itemsize（单元素字节）:", arr.itemsize)
print("nbytes（总字节数）:", arr.nbytes, "= size × itemsize")
```

> 输出：
```text
数组内容:
 [[[ 0  1  2  3]
  [ 4  5  6  7]
  [ 8  9 10 11]]

 [[12 13 14 15]
  [16 17 18 19]
  [20 21 22 23]]]

--- 五个核心属性 ---
shape （形状）: (2, 3, 4) → 2层、每层3行、每行4个元素
ndim  （维度数）: 3
size  （元素总数）: 24 = 2 × 3 × 4
dtype （数据类型）: int64
itemsize（单元素字节）: 8
nbytes（总字节数）: 192 = size × itemsize
```

**`shape` 是最重要的属性**。看到形状报错（比如 `could not broadcast`），
第一个要检查的就是形状对不对。

### 3.2.3 改变形状：reshape

```python
import numpy as np

a = np.arange(12)
print("原始:", a)

print("\nreshape(3,4):\n", a.reshape(3, 4))
print("\nreshape(3,-1) —— 用 -1 让 NumPy 自己算:\n", a.reshape(3, -1))
print("\nreshape(2,2,3) 三维:\n", a.reshape(2, 2, 3))
```

> 输出：
```text
原始: [ 0  1  2  3  4  5  6  7  8  9 10 11]

reshape(3,4):
 [[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]

reshape(3,-1) —— 用 -1 让 NumPy 自己算:
 [[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]

reshape(2,2,3) 三维:
 [[[ 0  1  2]
  [ 3  4  5]]

 [[ 6  7  8]
  [ 9 10 11]]]
```

> 💡 **`reshape` 的关键特性**：它**不改变数据在内存里的排列**，
> 只是换了一种"解读方式"，所以**极快**（几乎没有开销）。
> 但它要求**元素总数必须相等**：`a.reshape(5, 3)` 会报错（12 ≠ 15）。
>
> **用 `-1` 的场合**：当某一维你不关心具体是多少，让 NumPy 算出来即可：
> `arr.reshape(-1, 1)` 表示"变成 n 行 1 列"，常用于把一维数组变成列向量。
> 这个技巧在做矩阵运算和 sklearn 建模时特别常用。

`flatten` vs `ravel`（都是拉平成一维，但有区别）：

```python
import numpy as np

b = np.arange(6).reshape(2, 3)
print("原数组:\n", b)

f = b.flatten()        # 返回副本
r = b.ravel()          # 尽量返回视图
print("\nflatten()（副本）:", f)
print("ravel()  （视图）:", r)

f[0] = 100
r[1] = 200
print("\n改 f[0] 和 r[1] 之后:")
print("原数组:\n", b, " ← 被 ravel 改动了，说明它是视图")
print("f:", f)
```

> 输出：
```text
原数组:
 [[0 1 2]
 [3 4 5]]

flatten()（副本）: [0 1 2 3 4 5]
ravel()  （视图）: [0 1 2 3 4 5]

改 f[0] 和 r[1] 之后:
原数组:
 [[  0 200   2]
 [  3   4   5]]  ← 被 ravel 改动了，说明它是视图
f: [100   1   2   3   4   5]
```

**记住**：`flatten()` 复制数据（安全但占内存），`ravel()` 尽量给视图（省内存但会互相影响）。
**不确定的时候用 `flatten()` 或 `.copy()`。**

---

## 3.3 索引与切片 ★

索引是 NumPy 最常用的操作，也是最容易出错的地方。**这一节要重点掌握两个概念**：
"怎么取"和"取出来的是视图还是副本"。

### 3.3.1 一维数组：和列表几乎一样

```python
import numpy as np

a = np.arange(10)
print("a       =", a)

print("a[0]     =", a[0])            # 正索引：第一个
print("a[-1]    =", a[-1])           # 负索引：最后一个
print("a[2:5]   =", a[2:5])          # 切片：索引 2,3,4（不含 5）
print("a[:3]    =", a[:3])           # 前 3 个
print("a[5:]    =", a[5:])           # 从第 5 个到末尾
print("a[::2]   =", a[::2])          # 步长 2
print("a[1::3]  =", a[1::3])         # 从索引 1 开始，步长 3
print("a[::-1]  =", a[::-1])         # 倒序（步长为负）
```

> 输出：
```text
a       = [0 1 2 3 4 5 6 7 8 9]
a[0]     = 0
a[-1]    = 9
a[2:5]   = [2 3 4]
a[:3]    = [0 1 2]
a[5:]    = [5 6 7 8 9]
a[::2]   = [0 2 4 6 8]
a[1::3]  = [1 4 7]
a[::-1]  = [9 8 7 6 5 4 3 2 1 0]
```

> 💡 **`a[::2]` 这种写法的规则**：`[起点 : 终点 : 步长]`，三个都可以省略。
> - `a[::2]` = 从头到尾，每隔 2 个取一个
> - `a[1::3]` = 从索引 1 开始，每隔 3 个取一个
> - `a[::-1]` = 步长 -1，就是倒序
>
> **倒序用 `a[::-1]`，比 `a[len(a)-1::-1]` 简洁得多，是最 Pythonic 的写法。**

### 3.3.2 二维数组：逗号分隔行列

**这是 NumPy 和列表最大的语法差异**：二维数组用**一个方括号 + 逗号**表示行列，
而不是 `a[i][j]`。

```python
import numpy as np

b = np.arange(12).reshape(3, 4)
print("b =\n", b)
print("\n形状:", b.shape, "→ 3 行 4 列")

print("\n--- 取单个元素 ---")
print("b[1, 2]  =", b[1, 2], "（第 1 行第 2 列，从 0 开始数）")
print("b[-1, -1]=", b[-1, -1], "（最后一行最后一列）")

print("\n--- 取整行 / 整列 ---")
print("b[1]     =", b[1], "（第 1 行，逗号省略等于取整行）")
print("b[1, :]  =", b[1, :], "（同上，显式写更清楚）")
print("b[:, 1]  =", b[:, 1], "（第 1 列，注意结果变成了一维）")

print("\n--- 取子矩阵 ---")
print("b[0:2, 1:3] =\n", b[0:2, 1:3], "（前 2 行 × 第 1~2 列）")
print("b[:, ::2] =\n", b[:, ::2], "（所有行，列每隔 2 个取一个）")
```

> 输出：
```text
b =
 [[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]

形状: (3, 4) → 3 行 4 列

--- 取单个元素 ---
b[1, 2]  = 6 （第 1 行第 2 列，从 0 开始数）
b[-1, -1]= 11 （最后一行最后一列）

--- 取整行 / 整列 ---
b[1]     = [4 5 6 7] （第 1 行，逗号省略等于取整行）
b[1, :]  = [4 5 6 7] （同上，显式写更清楚）
b[:, 1]  = [1 5 9] （第 1 列，注意结果变成了一维）

--- 取子矩阵 ---
b[0:2, 1:3] =
 [[1 2]
 [5 6]] （前 2 行 × 第 1~2 列）
b[:, ::2] =
 [[ 0  2]
 [ 4  6]
 [ 8 10]] （所有行，列每隔 2 个取一个）
```

> ⚠️ **两个新手最容易卡住的点**：
>
> **① `b[:, 1]` 的结果是一维数组，不是"一列"**
> ```
> b[:, 1]  →  [1 5 9]        shape (3,)   一维
> b[:, 1:2] → [[1] [5] [9]]  shape (3,1)  二维（真正的"一列"）
> ```
> 这个区别在**矩阵运算和 sklearn 里非常重要**——
> sklearn 要求输入是二维的 `(n_samples, n_features)`，
> 传一维进去会报错。这时要用 `b[:, 1:2]` 或者 `b[:, 1].reshape(-1, 1)`。
>
> **② `b[1]` 和 `b[1, :]` 等价，但 `b[1]` 有歧义**
> 如果你以为 `b[1]` 是取第 1 列，就会写错。**建议永远显式写 `b[i, j]` 形式**，
> 可读性最好。

### 3.3.3 三维数组的索引

图像处理、批量矩阵运算会用到三维。

```python
import numpy as np

c = np.arange(24).reshape(2, 3, 4)     # 2 个"块"，每块 3 行 4 列
print("c 的形状:", c.shape, "→ (层, 行, 列)")

print("\nc[0] 的形状:", c[0].shape, "→ 取第 0 层，得到 3×4 矩阵")
print("\nc[0]:\n", c[0])

print("\nc[1, 2] 的形状:", c[1, 2].shape, "→ 第 1 层第 2 行")
print("c[1, 2] =", c[1, 2])

print("\nc[:, 0, :] 的形状:", c[:, 0, :].shape, "→ 所有层的第 0 行")
print("c[:, 0, :] =\n", c[:, 0, :])

print("\nc[0, :, 1:3] 的形状:", c[0, :, 1:3].shape)
print("c[0, :, 1:3] =\n", c[0, :, 1:3])
```

> 输出：
```text
c 的形状: (2, 3, 4) → (层, 行, 列)

c[0] 的形状: (3, 4) → 取第 0 层，得到 3×4 矩阵

c[0]:
 [[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]

c[1, 2] 的形状: (4,) → 第 1 层第 2 行
c[1, 2] = [20 21 22 23]

c[:, 0, :] 的形状: (2, 4) → 所有层的第 0 行
c[:, 0, :] =
 [[ 0  1  2  3]
 [12 13 14 15]]

c[0, :, 1:3] 的形状: (3, 2)
c[0, :, 1:3] =
 [[ 1  2]
 [ 5  6]
 [ 9 10]]
```

**理解方法**：把索引写成 `[层, 行, 列]` 三个位置，
每个位置要么给一个数字（**降维**），要么给一个 `:` / 切片（**保维**）。

### 3.3.4 ★★★ 视图 vs 副本（本节最重要）

**这是 NumPy 最容易让人掉坑的地方，请务必看懂。**

**规则**：**基础切片（`:` 和数字）返回的是"视图"，改它会改到原数组。**

```python
import numpy as np

x = np.arange(10)
print("原始 x:", x)

y = x[2:5]            # 这是"视图"，不是新数组！
print("y = x[2:5] =", y)

y[0] = 999            # 改视图
print("\n执行 y[0] = 999 之后:")
print("y =", y)
print("x =", x, " ← 原数组也被改了！")
```

> 输出：
```text
原始 x: [0 1 2 3 4 5 6 7 8 9]
y = x[2:5] = [2 3 4]

执行 y[0] = 999 之后:
y = [999   3   4]
x = [  0   1 999   3   4   5   6   7   8   9]  ← 原数组也被改了！
```

**想避免这个问题，就显式复制**：

```python
import numpy as np

x = np.arange(10)
y = x[2:5].copy()      # 加 .copy() 就是独立副本了
y[0] = 999

print("y =", y)
print("x =", x, " ← 原数组没变")
```

> 输出：
```text
y = [999   3   4]
x = [0 1 2 3 4 5 6 7 8 9]  ← 原数组没变
```

**为什么 NumPy 要这么设计？** 因为**省内存、省时间**。
把一亿个元素"复制一份"很贵，而"给个视图"几乎零成本。
所以 NumPy 默认给视图，让你**自己决定**什么时候真要复制。

**哪些操作返回视图，哪些返回副本？**

| 操作 | 返回 | 说明 |
|---|---|---|
| 基础切片 `a[1:5]`、`a[::2]`、`a[:, 0]` | **视图** | 改它会改到原数组 |
| `a.reshape()`、`a.ravel()`、`a.T` | **视图** | 只换解读方式，不动数据 |
| `a.flatten()` | 副本 | 明确复制 |
| `a.copy()` | 副本 | 明确复制 |
| **布尔索引** `a[a > 5]` | **副本** | 因为结果不连续，没法做视图 |
| **花式索引** `a[[0, 2, 4]]` | **副本** | 同上 |
| 任何运算 `a * 2`、`a + b` | 新建数组 | — |

> ⚠️ **为什么"布尔索引返回副本"很重要？**
> 因为 pandas 里筛选数据（`df[df["金额"] > 100]`）底层就是布尔索引，
> 所以**筛完的结果是副本，改它不会影响原表**。
> 这正是 pandas 3.0 强制 Copy-on-Write 想达到的效果——
> 让"改副本还是改原表"这件事**变得可以预测**。
>
> **一句话总结**：**不确定就 `.copy()`。** 这是最省心的做法。

判断一个数组是不是视图，可以用 `np.shares_memory`：

```python
import numpy as np

a = np.arange(10)
print("切片 a[2:5] 与 a 共享内存:", np.shares_memory(a[2:5], a))
print("布尔索引 a[a>5] 与 a 共享内存:", np.shares_memory(a[a > 5], a))
print("花式索引 a[[0,2]] 与 a 共享内存:", np.shares_memory(a[[0, 2]], a))
print("拷贝 a.copy() 与 a 共享内存:", np.shares_memory(a.copy(), a))
```

> 输出：
```text
切片 a[2:5] 与 a 共享内存: True
布尔索引 a[a>5] 与 a 共享内存: False
花式索引 a[[0,2]] 与 a 共享内存: False
拷贝 a.copy() 与 a 共享内存: False
```

---

## 3.4 布尔索引：按条件筛数据 ★

**布尔索引是数据分析里最常用的操作，没有之一。**
它的逻辑是"先造一个 True/False 数组，再用它去筛"。

```python
import numpy as np

a = np.array([3, 1, 4, 1, 5, 9, 2, 6])
print("原始数组 a =", a)

# 第一步：造条件（得到一个 True/False 数组）
cond = a > 3
print("\n条件 a > 3 =", cond)

# 第二步：用条件筛
print("a[a > 3]     =", a[a > 3])
print("a[a <= 3]    =", a[a <= 3])
print("a[a == 1]    =", a[a == 1])
print("\n满足条件的元素个数:", cond.sum(), "（True=1, False=0，求和就是个数）")
print("a 的总和:", a.sum(), "| 满足条件的元素之和:", a[cond].sum())
```

> 输出：
```text
原始数组 a = [3 1 4 1 5 9 2 6]

条件 a > 3 = [False False  True False  True  True False  True]
a[a > 3]     = [4 5 9 6]
a[a <= 3]    = [3 1 1 2]
a[a == 1]    = [1 1]

满足条件的元素个数: 4 （True=1, False=0，求和就是个数）
a 的总和: 31 | 满足条件的元素之和: 24
```

### 3.4.1 组合条件：必须用 `&` `|` `~` 和括号

```python
import numpy as np

a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

# & 与（and）
print("(a>2) & (a<6)  →", a[(a > 2) & (a < 6)])

# | 或（or）
print("(a<2) | (a>8)  →", a[(a < 2) | (a > 8)])

# ~ 非（not）
print("~(a>3)         →", a[~(a > 3)])

# 复合条件
print("(a>=2) & (a<=6) & (a%2==0)  →", a[(a >= 2) & (a <= 6) & (a % 2 == 0)])
```

> 输出：
```text
(a>2) & (a<6)  → [3 4 5]
(a<2) | (a>8)  → [1 1 9]
~(a>3)         → [3 1 1 2]
(a>=2) & (a<=6) & (a%2==0)  → [4 2 6]
```

> ⚠️ **两个必须记住的规则**：
>
> **① 必须用 `&` `|` `~`，不能用 `and` `or` `not`**
> ```python
> a[(a > 2) and (a < 6)]      # ✗ 报错：ValueError: The truth value of an array with more than one element is ambiguous
> a[(a > 2) & (a < 6)]        # ✓ 正确
> ```
> **原因**：Python 的 `and` 是"短路求值"，它需要把整个数组当成一个 True/False，
> 但数组里有很多元素，NumPy 不知道该听谁的，就报错了。
> `&` 是**逐元素**的位运算，正好符合需求。
>
> **② 每个条件都要用括号包起来**
> ```python
> a[a > 2 & a < 6]            # ✗ 运算符优先级问题，结果错误或报错
> a[(a > 2) & (a < 6)]        # ✓ 正确
> ```
> **原因**：`&` 的优先级比 `>` 和 `<` 高，所以 `a > 2 & a < 6`
> 会被理解成 `a > (2 & a) < 6`，完全错了。

### 3.4.2 `np.where`：向量化的 if-else

**`np.where` 是 `if-else` 的向量化版本**，一次处理整个数组。

```python
import numpy as np

a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

# 三个参数：条件, 条件为真时的值, 条件为假时的值
print("np.where(a > 3, '大', '小'):")
print(" ", np.where(a > 3, "大", "小"))

# 也可以用来生成新数值
print("\nnp.where(a > 3, a * 10, a):")
print(" ", np.where(a > 3, a * 10, a))

# 只要一个参数时：返回满足条件的下标
print("\nnp.where(a > 5) →", np.where(a > 5))
print("即满足 a>5 的下标是:", np.where(a > 5)[0].tolist())
```

> 输出：
```text
np.where(a > 3, '大', '小'):
  ['小' '小' '大' '小' '大' '大' '小' '大']

np.where(a > 3, a * 10, a):
  [ 3  1 40  1 50 90  2 60]

np.where(a > 5) → (array([5, 7]),)
即满足 a>5 的下标是: [5, 7]
```

### 3.4.3 `np.select`：多分支条件

`np.where` 只能处理两分支，**多分支用 `np.select`**（相当于 `if-elif-else`）。

```python
import numpy as np

# 模拟学生成绩
scores = np.array([95, 82, 71, 60, 55, 91, 68, 77])
print("成绩:", scores)

# 多条件分级：注意条件的顺序很重要，先匹配到的先生效
grade = np.select(
    [scores >= 90, scores >= 80, scores >= 70, scores >= 60],
    ["A", "B", "C", "D"],
    default="F",
)
print("\n等级:", grade)

# 用 pandas 看一眼分布（后面章节会详细讲）
import pandas as pd
print("\n等级分布:")
print(pd.Series(grade).value_counts().sort_index().to_string())
```

> 输出：
```text
成绩: [95 82 71 60 55 91 68 77]

等级: ['A' 'B' 'C' 'D' 'F' 'A' 'D' 'C']

等级分布:
A    2
B    1
C    2
D    2
F    1
```

> ⚠️ **`np.select` 的条件顺序很关键**：它是**按顺序匹配，命中即停**。
> 上面如果把 `scores >= 60` 放在第一个，那 95 分也会被判定成 "D"。
> **所以条件要从"最严格"排到"最宽松"。**

### 3.4.4 花式索引：用下标数组取多个元素

```python
import numpy as np

a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

# 用列表/数组当索引，一次取多个（顺序可以任意，也可以重复）
print("a[[0, 2, 4]]    =", a[[0, 2, 4]])
print("a[[7, 0, 3]]    =", a[[7, 0, 3]], "（按你给的下标顺序返回）")
print("a[[0, 0, 0]]    =", a[[0, 0, 0]], "（可以重复取同一个）")

# 二维也支持
b = np.arange(12).reshape(3, 4)
print("\nb =\n", b)
print("\n取第 0 行和第 2 行:\n", b[[0, 2]])
print("\n取 (0,1) 和 (2,3) 两个位置的元素:", b[[0, 2], [1, 3]])
print("（规则：行下标数组和列下标数组一一配对）")
```

> 输出：
```text
a[[0, 2, 4]]    = [3 4 5]
a[[7, 0, 3]]    = [6 3 1] （按你给的下标顺序返回）
a[[0, 0, 0]]    = [3 3 3] （可以重复取同一个）

b =
 [[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]

取第 0 行和第 2 行:
 [[ 0  1  2  3]
 [ 8  9 10 11]]

取 (0,1) 和 (2,3) 两个位置的元素: [ 1 11]
（规则：行下标数组和列下标数组一一配对）
```

**花式索引有什么用？** 最典型的场景是"**取出 Top N 对应的样本**"：

```python
import numpy as np

# 场景：从 10 个商品里找出销售额最高的 3 个
sales = np.array([120, 340, 90, 560, 230, 780, 150, 410, 670, 80])
names = np.array(["商品A", "商品B", "商品C", "商品D", "商品E",
                  "商品F", "商品G", "商品H", "商品I", "商品J"])

# argsort 返回"排好序的下标"（从小到大），[::-1] 变成从大到小
top3_idx = np.argsort(sales)[::-1][:3]
print("Top3 下标:", top3_idx)
print("Top3 商品:", names[top3_idx])
print("Top3 销售额:", sales[top3_idx])
print("Top3 合计占总销售额比例: {:.1%}".format(
    sales[top3_idx].sum() / sales.sum()))
```

> 输出：
```text
Top3 下标: [5 8 3]
Top3 商品: ['商品F' '商品I' '商品D']
Top3 销售额: [780 670 560]
Top3 合计占总销售额比例: 58.6%
```

---

## 3.5 广播（Broadcasting）★★★

**广播是 NumPy 最优雅的机制，也是最容易搞错的。学会它，你的代码能短一大半。**

### 3.5.1 什么是广播

**广播 = 当两个形状不同的数组做运算时，NumPy 自动"把小的那个扩展成大的形状"。**

最简单的例子：

```python
import numpy as np

a = np.array([1, 2, 3])
print("a =", a)
print("a * 10 =", a * 10, " ← 标量 10 被'广播'到了每个元素")

b = np.array([10, 20, 30])
print("\nb =", b)
print("a + b =", a + b, " ← 形状相同，逐元素相加")
```

> 输出：
```text
a = [1 2 3]
a * 10 = [10 20 30]  ← 标量 10 被'广播'到了每个元素

b = [10 20 30]
a + b = [11 22 33]  ← 形状相同，逐元素相加
```

### 3.5.2 广播规则（三条，必须背下来）

```text
规则1：从**最右边**的维度开始，逐个对齐比较。
规则2：如果某个维度上，两个数组的长度**相等**，或者其中一个是 **1**，就可以广播。
规则3：如果不满足规则2，就报错 "operands could not be broadcast together"。
```

**用图示理解**：

```text
【例1】(3,4) 与 (4,)  → 可以广播 → 结果 (3,4)
       3  4
          4          ← 短的左边自动补 1，变成 (1,4)
   ----------------
       3  4          ← 第 2 维：4 vs 4 相等 ✓
                      ← 第 1 维：3 vs 1，有 1 ✓
   → 结果形状 (3,4)：把 (4,) 这一行"复制"了 3 遍

【例2】(3,1) 与 (1,4) → 可以广播 → 结果 (3,4)
       3  1
       1  4
   ----------------
       3  4          ← 两维都有 1，都能扩展 ✓
   → 结果形状 (3,4)：行复制 4 次、列复制 3 次

【例3】(2,3) 与 (4,)  → 不能广播 → 报错
       2  3
          4          ← 第 2 维：3 vs 4，既不相等也没有 1 ✗
   → ValueError: operands could not be broadcast together with shapes (2,3) (4,)
```

**动手验证这三条**：

```python
import numpy as np

# 例1：(3,4) 与 (4,)
A = np.ones((3, 4))
b = np.arange(4)                    # shape (4,)
print("例1: A(3,4) - b(4,) 的结果形状:", (A - b).shape)
print("     b 被广播成了:\n", np.broadcast_to(b, (3, 4)))

# 例2：(3,1) 与 (4,)
print("\n例2: (3,1) + (4,) 的结果形状:",
      (np.arange(3).reshape(3, 1) + np.arange(4)).shape)
print("结果 =\n", np.arange(3).reshape(3, 1) + np.arange(4))

# 例3：不兼容
try:
    np.ones((2, 3)) + np.ones((4,))
except ValueError as e:
    print("\n例3 报错:", str(e)[:90])
```

> 输出：
```text
例1: A(3,4) - b(4,) 的结果形状: (3, 4)
     b 被广播成了:
 [[0 1 2 3]
 [0 1 2 3]
 [0 1 2 3]]

例2: (3,1) + (4,) 的结果形状: (3, 4)
结果 =
 [[0 1 2 3]
 [1 2 3 4]
 [2 3 4 5]]

例3 报错: operands could not be broadcast together with shapes (2,3) (4,) 
```

### 3.5.3 广播的实战价值：列标准化

**这是广播在数据分析里最重要的应用**：把每一列变成均值 0、标准差 1。

```python
import numpy as np

# 造一份数据：100 行样本，4 个特征（量纲差别很大）
rng = np.random.default_rng(0)
data = np.column_stack([
    rng.normal(1000, 200, 100),      # 特征1：金额（千元级）
    rng.normal(30, 5, 100),          # 特征2：年龄
    rng.normal(0.5, 0.1, 100),       # 特征3：折扣率
    rng.normal(8, 2, 100),           # 特征4：评分
])
print("原始数据形状:", data.shape)
print("各列均值:", data.mean(axis=0).round(2))
print("各列标准差:", data.std(axis=0).round(2))
```

> 输出：
```text
原始数据形状: (100, 4)
各列均值: [1.01622e+03 2.97500e+01 4.90000e-01 7.92000e+00]
各列标准差: [1.9243e+02 4.7800e+00 1.1000e-01 1.8500e+00]
```

```python
import numpy as np

rng = np.random.default_rng(0)
data = np.column_stack([
    rng.normal(1000, 200, 100), rng.normal(30, 5, 100),
    rng.normal(0.5, 0.1, 100), rng.normal(8, 2, 100),
])

# 关键：data.mean(axis=0) 的形状是 (4,)，会被广播到 (100,4)，逐列减去对应均值
# 这一行代码，等价于写 100 行循环去减 —— 这就是广播的威力
z = (data - data.mean(axis=0)) / data.std(axis=0)

print("标准化后各列均值:", z.mean(axis=0).round(12))
print("标准化后各列标准差:", z.std(axis=0).round(6))
print("\n原来各列量纲差 10000 倍，现在都在同一尺度上了")
```

> 输出：
```text
标准化后各列均值: [-0. -0. -0.  0.]
标准化后各列标准差: [1. 1. 1. 1.]

原来各列量纲差 10000 倍，现在都在同一尺度上了
```

**这一行代码是整个数据分析里最重要的"一行"之一**：

```text
z = (data - data.mean(axis=0)) / data.std(axis=0)
       └──── 广播减均值 ────┘   └──── 广播除标准差 ────┘
```

它为什么会广播成功？
- `data` 形状 `(100, 4)`
- `data.mean(axis=0)` 形状 `(4,)`
- 按规则从右对齐：`4 vs 4` 相等 ✓，`100 vs 1` 有 1 ✓ → 广播成 `(100, 4)`

### 3.5.4 `np.newaxis`：显式升维

当你需要广播但形状对不上时，用 `np.newaxis` 手动加一个维度：

```python
import numpy as np

x = np.arange(3)
print("x 原始形状:", x.shape)

print("x[:, np.newaxis] 形状:", x[:, np.newaxis].shape)
print(x[:, np.newaxis])
print("（变成了列向量 3×1）")

print("\nx[np.newaxis, :] 形状:", x[np.newaxis, :].shape)
print(x[np.newaxis, :])
print("（变成了行向量 1×3）")

# 用 None 更简洁（np.newaxis 就是 None 的别名）
print("\nx[:, None] 形状:", x[:, None].shape)
print("两者等价:", np.array_equal(x[:, np.newaxis], x[:, None]))
```

> 输出：
```text
x 原始形状: (3,)
x[:, np.newaxis] 形状: (3, 1)
[[0]
 [1]
 [2]]
（变成了列向量 3×1）

x[np.newaxis, :] 形状: (1, 3)
[[0 1 2]]
（变成了行向量 1×3）

x[:, None] 形状: (3, 1)
两者等价: True
```

**应用场景**：算距离矩阵时那个 `points[:, None, :] - points[None, :, :]` 就是用它升维。
为什么能求出两两距离？

```text
points[:, None, :]    形状 (n, 1, 2)  → 每个点作为"行"
points[None, :, :]    形状 (1, n, 2)  → 每个点作为"列"
相减广播成 (n, n, 2)  → [i, j] 位置就是 points[i] - points[j] 这个二维向量
再 **2 平方、sum(axis=2) 沿最后一维求和、sqrt 开方
→ 得到 (n, n) 的距离矩阵
```

> 💡 **广播的心法**：**问自己"我想让哪个维度对齐、哪个维度配对"**，
> 然后用 `None` 把维度摆到正确的位置。

---

## 3.6 统计与聚合：`axis` 参数

### 3.6.1 常用统计函数

```python
import numpy as np

a = np.array([[1, 2, 3],
              [4, 5, 6]])
print("a =\n", a)

print("\n总和 sum()      :", a.sum())
print("均值 mean()     :", a.mean())
print("中位数 median() :", np.median(a))
print("标准差 std()    :", round(a.std(), 4))
print("方差 var()      :", round(a.var(), 4))
print("最小值 min()    :", a.min())
print("最大值 max()    :", a.max())
print("极差 ptp()      :", np.ptp(a), "（最大值 - 最小值）")
print("最小/最大下标   :", a.argmin(), "/", a.argmax(), "（展平后的下标）")
```

> 输出：
```text
a =
 [[1 2 3]
 [4 5 6]]

总和 sum()      : 21
均值 mean()     : 3.5
中位数 median() : 3.5
标准差 std()    : 1.7078
方差 var()      : 2.9167
最小值 min()    : 1
最大值 max()    : 6
极差 ptp()      : 5 （最大值 - 最小值）
最小/最大下标   : 0 / 5 （展平后的下标）
```

### 3.6.2 ★ `axis` 参数：最容易搞混的概念

**一句话记住**：**`axis` 是"被消掉的那个维度"。**

```text
二维数组 (行, 列) = (3, 4)：

  axis=0：消掉"行"这个维度 → 对每一列做运算 → 结果长度 4
          想象成"从上往下压"，把每列压成一个数

  axis=1：消掉"列"这个维度 → 对每一行做运算 → 结果长度 3
          想象成"从左往右压"，把每行压成一个数
```

```python
import numpy as np

m = np.array([[1, 2, 3, 4],
              [5, 6, 7, 8],
              [9, 10, 11, 12]])
print("m =\n", m)
print("形状:", m.shape, "→ 3 行 4 列\n")

# 不指定 axis：整个数组压成一个数
print("m.sum()            =", m.sum(), "（全部加起来）")

# axis=0：消掉行 → 每列一个结果
print("\nm.sum(axis=0)      =", m.sum(axis=0))
print("                   结果长度 4，等于列数")
print("                   即 [1+5+9, 2+6+10, 3+7+11, 4+8+12]")

# axis=1：消掉列 → 每行一个结果
print("\nm.sum(axis=1)      =", m.sum(axis=1))
print("                   结果长度 3，等于行数")
print("                   即 [1+2+3+4, 5+6+7+8, 9+10+11+12]")

# 其他函数同理
print("\nm.mean(axis=0)     =", m.mean(axis=0))
print("m.max(axis=1)      =", m.max(axis=1))
print("m.std(axis=0)      =", m.std(axis=0).round(3))
```

> 输出：
```text
m =
 [[ 1  2  3  4]
 [ 5  6  7  8]
 [ 9 10 11 12]]
形状: (3, 4) → 3 行 4 列

m.sum()            = 78 （全部加起来）

m.sum(axis=0)      = [15 18 21 24]
                   结果长度 4，等于列数
                   即 [1+5+9, 2+6+10, 3+7+11, 4+8+12]

m.sum(axis=1)      = [10 26 42]
                   结果长度 3，等于行数
                   即 [1+2+3+4, 5+6+7+8, 9+10+11+12]

m.mean(axis=0)     = [5. 6. 7. 8.]
m.max(axis=1)      = [ 4  8 12]
m.std(axis=0)      = [3.266 3.266 3.266 3.266]
```

> 💡 **记不住 `axis` 方向？记住这两个口诀**：
>
> **口诀 1（推荐）**：**`axis` 是"要消掉的维度"**。
> - `axis=0` 消掉行 → 每列算一个值
> - `axis=1` 消掉列 → 每行算一个值
>
> **口诀 2（形象记忆）**：**"0 向下压，1 向右压"**。
> - `axis=0` 像从上方往下压 → 列被压扁 → 得到每列的结果
> - `axis=1` 像从左边往右压 → 行被压扁 → 得到每行的结果
>
> **验证方法**：看结果的长度。如果结果长度等于**列数**，那一定是 `axis=0`。

### 3.6.3 `keepdims`：保持维度

默认聚合会**降维**，有时你希望保持维度（方便后续广播）：

```python
import numpy as np

m = np.array([[1, 2, 3], [4, 5, 6]])
print("m 形状:", m.shape)

s1 = m.sum(axis=1)
print("sum(axis=1) 形状:", s1.shape, "值:", s1)

s2 = m.sum(axis=1, keepdims=True)
print("sum(axis=1, keepdims=True) 形状:", s2.shape)
print(s2)
print("（保持二维，方便直接和 m 做广播运算）")

# 实用场景：算每行占该行总和的比例
ratio = m / m.sum(axis=1, keepdims=True)
print("\n每行各元素占该行总和的比例:")
print(ratio.round(4))
print("每行加起来 =", ratio.sum(axis=1).round(10))
```

> 输出：
```text
m 形状: (2, 3)
sum(axis=1) 形状: (2,) 值: [ 6 15]
sum(axis=1, keepdims=True) 形状: (2, 1)
[[ 6]
 [15]]
（保持二维，方便直接和 m 做广播运算）

每行各元素占该行总和的比例:
[[0.1667 0.3333 0.5   ]
 [0.2667 0.3333 0.4   ]]
每行加起来 = [1. 1.]
```

> 💡 **`keepdims=True` 是最容易被忽略、但非常实用的参数**。
> 不加它，`sum(axis=1)` 得到 `(2,)`，和 `(2,3)` 的 `m` 相除会**广播错方向**
> （你会得到"每列除以两个不同的数"这种荒谬结果，而且不报错！）。
> 加了它得到 `(2,1)`，就能正确地"每行除以该行的和"。
> **这个 bug 特别隐蔽，请务必记住。**

### 3.6.4 忽略缺失值：`np.nan` 家族

真实数据里有缺失值（`np.nan`），普通函数遇到 `nan` 会污染整个结果：

```python
import numpy as np

a = np.array([1, 2, np.nan, 4, 5])
print("数组:", a)
print("\n普通函数的结果（被 nan 污染）:")
print("  a.sum()  =", a.sum())
print("  a.mean() =", a.mean())
print("  a.max()  =", a.max())

print("\nnan 版函数（自动忽略缺失）:")
print("  np.nansum(a)  =", np.nansum(a))
print("  np.nanmean(a) =", np.nanmean(a))
print("  np.nanmax(a)  =", np.nanmax(a))
print("  np.nanstd(a)  =", round(np.nanstd(a), 4))

print("\n检测缺失:")
print("  np.isnan(a)      =", np.isnan(a))
print("  缺失个数          =", np.isnan(a).sum())
print("  非缺失个数        =", (~np.isnan(a)).sum())
print("  取出非缺失的值    =", a[~np.isnan(a)])
```

> 输出：
```text
数组: [ 1.  2. nan  4.  5.]

普通函数的结果（被 nan 污染）:
  a.sum()  = nan
  a.mean() = nan
  a.max()  = nan

nan 版函数（自动忽略缺失）:
  np.nansum(a)  = 12.0
  np.nanmean(a) = 3.0
  np.nanmax(a)  = 5.0
  np.nanstd(a)  = 1.5811

检测缺失:
  np.isnan(a)      = [False False  True False False]
  缺失个数          = 1
  非缺失个数        = 4
  取出非缺失的值    = [1. 2. 4. 5.]
```

> ⚠️ **`nan` 的一个著名陷阱**：**`nan != nan`**！
> ```python
> import numpy as np
> a = np.array([1, np.nan])
> print("nan == nan 的结果:", a[1] == a[1])      # 永远是 False
> print("用 isnan 判断:", np.isnan(a[1]))         # 正确
> print("能用 a == np.nan 筛选吗?", (a == np.nan).sum(), "← 筛不出来任何一个！")
> ```
> 输出：
```text
nan == nan 的结果: False
用 isnan 判断: True
能用 a == np.nan 筛选吗? 0 ← 筛不出来任何一个！
```
> **原因**：IEEE 754 标准规定 `nan` 不等于任何值，**包括它自己**。
> 设计意图是"未知的东西不等于任何东西"。
> **所以判断缺失必须用 `np.isnan(x)`（或 pandas 的 `isna()`），绝不能用 `==`。**

---

## 3.7 矩阵运算

### 3.7.1 ★ 元素级乘法 vs 矩阵乘法（必须分清）

**这是 NumPy 新手最容易混淆的一点。**

```python
import numpy as np

A = np.array([[1, 2],
              [3, 4]])
B = np.array([[5, 6],
              [7, 8]])

print("A =\n", A)
print("\nB =\n", B)

# `*` 是"元素级乘法"（对应位置相乘），也叫 Hadamard 积
print("\nA * B  （元素级乘法，逐位置相乘）=")
print(A * B)

# `@` 是"矩阵乘法"（线性代数意义）
print("\nA @ B （矩阵乘法，行乘列求和）=")
print(A @ B)
```

> 输出：
```text
A =
 [[1 2]
 [3 4]]

B =
 [[5 6]
 [7 8]]

A * B  （元素级乘法，逐位置相乘）=
[[ 5 12]
 [21 32]]

A @ B （矩阵乘法，行乘列求和）=
[[19 22]
 [43 50]]
```

**矩阵乘法怎么算的？** 用图示：

```text
A @ B 的第 (0,0) 个元素 = A 第 0 行 · B 第 0 列
                       = [1, 2] · [5, 7] = 1×5 + 2×7 = 19 ✓

A @ B 的第 (0,1) 个元素 = A 第 0 行 · B 第 1 列
                       = [1, 2] · [6, 8] = 1×6 + 2×8 = 22 ✓

   ┌       ┐   ┌       ┐
   │ 1   2 │   │ 5   6 │
   │ 3   4 │ @ │ 7   8 │
   └       ┘   └       ┘
        │           │
        └── 19 = 1×5 + 2×7
```

**三种写法等价**（都做矩阵乘法）：

```python
import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

print("A @ B          =\n", A @ B)
print("\nnp.dot(A, B)   =\n", np.dot(A, B))
print("\nnp.matmul(A,B) =\n", np.matmul(A, B))
print("\n三者是否相同:",
      np.array_equal(A @ B, np.dot(A, B)) and np.array_equal(A @ B, np.matmul(A, B)))
```

> 输出：
```text
A @ B          =
 [[19 22]
 [43 50]]

np.dot(A, B)   =
 [[19 22]
 [43 50]]

np.matmul(A,B) =
 [[19 22]
 [43 50]]

三者是否相同: True
```

> 💡 **该用哪个？**
> - **`@` 最推荐**：语义清楚（一看就知道是矩阵乘法），而且和数学写法一致。
> - `np.dot`：老代码常见，但它在高维数组上的行为和 `@` 不同（会做张量积），容易误解。
> - `np.matmul`：就是 `@` 的函数形式。
>
> **结论：做矩阵乘法一律用 `@`。**

**批量矩阵乘法**（三维数组也支持，深度学习里常用）：

```python
import numpy as np

# 5 个 2×2 矩阵，分别乘同一个 2×2 矩阵
batch = np.ones((5, 2, 2))
M = np.array([[1, 2], [3, 4]])

print("batch 形状:", batch.shape)
print("M 形状:    ", M.shape)
result = batch @ M
print("batch @ M 形状:", result.shape, "← 前两维保持，最后一维做矩阵乘法")
print("\n结果第一个矩阵:\n", result[0])
print("验证：全 1 的 2×2 矩阵乘 M，每行应该是 M 的列和 [4, 6]")
```

> 输出：
```text
batch 形状: (5, 2, 2)
M 形状:     (2, 2)
batch @ M 形状: (5, 2, 2) ← 前两维保持，最后一维做矩阵乘法

结果第一个矩阵:
 [[4. 6.]
 [4. 6.]]
验证：全 1 的 2×2 矩阵乘 M，每行应该是 M 的列和 [4, 6]
```

### 3.7.2 转置、求逆、行列式

```python
import numpy as np

A = np.array([[1, 2],
              [3, 4]])

print("A =\n", A)

# 转置：行列互换
print("\nA.T （转置）=\n", A.T)
print("用 np.transpose(A) 也一样:\n", np.transpose(A))

# 行列式
det = np.linalg.det(A)
print(f"\ndet(A) = {det:.4f}")
print("（行列式不为 0 → 矩阵可逆）")

# 逆矩阵
A_inv = np.linalg.inv(A)
print("\nA 的逆矩阵 =\n", A_inv.round(4))

# 验证：A @ A_inv 应该是单位矩阵
print("\nA @ A_inv（应该是单位矩阵）=\n", (A @ A_inv).round(10))

# 矩阵的秩
print("\nA 的秩 rank(A) =", np.linalg.matrix_rank(A))

# 迹（对角线元素之和）
print("A 的迹 trace(A) =", np.trace(A), "= 1 + 4")
```

> 输出：
```text
A =
 [[1 2]
 [3 4]]

A.T （转置）=
 [[1 3]
 [2 4]]
用 np.transpose(A) 也一样:
 [[1 3]
 [2 4]]

det(A) = -2.0000
（行列式不为 0 → 矩阵可逆）

A 的逆矩阵 =
 [[-2.   1. ]
 [ 1.5 -0.5]]

A @ A_inv（应该是单位矩阵）=
 [[1. 0.]
 [0. 1.]]

A 的秩 rank(A) = 2
A 的迹 trace(A) = 5 = 1 + 4
```

### 3.7.3 解线性方程组

**这是矩阵运算最有用的实际应用**。方程组：

```text
2x + 3y = 8
 x + 2y = 5
```

写成矩阵形式 `Ax = b`：

```python
import numpy as np

A = np.array([[2, 3],
              [1, 2]])
b = np.array([8, 5])

print("系数矩阵 A =\n", A)
print("常数向量 b =", b)

# 解方程：用 np.linalg.solve，不要用 inv(A) @ b（更慢且数值不稳定）
x = np.linalg.solve(A, b)
print("\n解 x =", x.round(4))
print("即 x =", round(x[0]), ", y =", round(x[1]))

# 验证：代入原方程
print("\n验证 A @ x =", (A @ x).round(10), "（应该等于 b =", b, "）")
print("代入手工验证: 2×1 + 3×2 =", 2 * 1 + 3 * 2, "；1×1 + 2×2 =", 1 * 1 + 2 * 2)
```

> 输出：
```text
系数矩阵 A =
 [[2 3]
 [1 2]]
常数向量 b = [8 5]

解 x = [1. 2.]
即 x = 1 , y = 2

验证 A @ x = [8. 5.] （应该等于 b = [8 5] ）
代入手工验证: 2×1 + 3×2 = 8 ；1×1 + 2×2 = 5
```

> 💡 **`np.linalg.solve(A, b)` 优于 `np.linalg.inv(A) @ b`**：
> 后者要先求逆矩阵（计算量大、误差大），再相乘，是"教科书做法但工程上不推荐"。
> **`solve` 直接用高斯消元法，又快又准。** 这个细节能体现你的专业度。

### 3.7.4 特征值与 SVD（了解即可，第 8 章 PCA 会用到）

```python
import numpy as np

A = np.array([[4, 1],
              [2, 3]])

# 特征值和特征向量
eigenvalues, eigenvectors = np.linalg.eig(A)
print("特征值:", eigenvalues.round(4))
print("特征向量（每一列对应一个特征值）:\n", eigenvectors.round(4))

# 验证定义：A v = λ v
v = eigenvectors[:, 0]
lam = eigenvalues[0]
print(f"\n验证第一个: A @ v = {A @ v} 应该等于 λv = {(lam * v).round(10)}")
print("相等:", np.allclose(A @ v, lam * v))

# 奇异值分解 SVD
A2 = np.array([[1, 2, 3],
               [4, 5, 6]])
U, S, Vt = np.linalg.svd(A2)
print("\nSVD 分解:")
print("  U 形状:", U.shape, "（左奇异向量）")
print("  S 形状:", S.shape, "值:", S.round(4), "（奇异值，从大到小）")
print("  Vt 形状:", Vt.shape, "（右奇异向量转置）")
print("\n奇异值从大到小排列，可以据此判断哪些方向'信息量大'")
print("这就是 PCA 降维的原理（第 8 章会讲）")
```

> 输出：
```text
特征值: [5. 2.]
特征向量（每一列对应一个特征值）:
 [[ 0.7071 -0.4472]
 [ 0.7071  0.8944]]

验证第一个: A @ v = [3.53553391 3.53553391] 应该等于 λv = [3.53553391 3.53553391]
相等: True

SVD 分解:
  U 形状: (2, 2) （左奇异向量）
  S 形状: (2,) 值: [9.508  0.7729] （奇异值，从大到小）
  Vt 形状: (3, 3) （右奇异向量转置）

奇异值从大到小排列，可以据此判断哪些方向'信息量大'
这就是 PCA 降维的原理（第 8 章会讲）
```

---

## 3.8 常用函数速查

### 3.8.1 形状操作与拼接

```python
import numpy as np

a = np.zeros((2, 3))
b = np.ones((1, 3))
c = np.ones((2, 2))

# 纵向拼接（上下摞）：要求列数相同
print("vstack / concatenate(axis=0):")
print(np.vstack([a, b]))
print("形状:", np.vstack([a, b]).shape)

# 横向拼接（左右并排）：要求行数相同
print("\nhstack / concatenate(axis=1):")
print(np.hstack([a, c]))
print("形状:", np.hstack([a, c]).shape)

# 用 concatenate 更通用，axis 想指定几维都行
print("\nconcatenate 等价写法:",
      np.concatenate([a, b], axis=0).shape,
      np.concatenate([a, c], axis=1).shape)

# stack：新开一个维度（和 concatenate 不同！）
print("\nstack([a, a]) 形状:", np.stack([a, a]).shape, "← 新增了一个维度")
print("concatenate([a, a], axis=0) 形状:", np.concatenate([a, a], axis=0).shape)
```

> 输出：
```text
vstack / concatenate(axis=0):
[[0. 0. 0.]
 [0. 0. 0.]
 [1. 1. 1.]]
形状: (3, 3)

hstack / concatenate(axis=1):
[[0. 0. 0. 1. 1.]
 [0. 0. 0. 1. 1.]]
形状: (2, 5)

concatenate 等价写法: (3, 3) (2, 5)

stack([a, a]) 形状: (2, 2, 3) ← 新增了一个维度
concatenate([a, a], axis=0) 形状: (4, 3)
```

> ⚠️ **`stack` 和 `concatenate` 的区别**：
> - `concatenate`：**在已有维度上拼**，总维度数不变；
> - `stack`：**新建一个维度**，总维度数 +1。
>
> 判断标准：看结果形状有没有多一维。

**切分数组**：

```python
import numpy as np

a = np.arange(10)
print("a =", a)

print("\nsplit 均分 5 份:", [x.tolist() for x in np.split(a, 5)])
print("array_split 分 3 份（不均分也能分）:",
      [x.tolist() for x in np.array_split(a, 3)])
print("每份长度:", [len(x) for x in np.array_split(a, 3)])

b = np.arange(12).reshape(3, 4)
print("\n二维按行分 3 份:", [x.shape for x in np.split(b, 3)])
print("二维按列分 2 份:", [x.shape for x in np.split(b, 2, axis=1)])
```

> 输出：
```text
a = [0 1 2 3 4 5 6 7 8 9]

split 均分 5 份: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
array_split 分 3 份（不均分也能分）: [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9]]
每份长度: [4, 3, 3]

二维按行分 3 份: [(1, 4), (1, 4), (1, 4)]
二维按列分 2 份: [(3, 2), (3, 2)]
```

> 💡 **`split` 要求能均分**（10 除以 3 除不尽会报错），
> **`array_split` 允许不均分**（前面几份多 1 个）。
> **实际工作里几乎总是用 `array_split`**，因为它不会因为除不尽而失败。

**重复与平铺**：

```python
import numpy as np

a = np.array([1, 2])

# repeat：每个元素重复 n 次
print("np.repeat(a, 3) =", np.repeat(a, 3), "（每个元素重复 3 次）")

# tile：整个数组重复 n 次
print("np.tile(a, 3)   =", np.tile(a, 3), "（整个数组重复 3 次）")

# 还可以按元素指定重复次数
print("np.repeat(a, [1, 3]) =", np.repeat(a, [1, 3]), "（1 重复 1 次，2 重复 3 次）")

# 二维 repeat
m = np.array([[1, 2], [3, 4]])
print("\nm =\n", m)
print("repeat(m, 2, axis=0) 按行重复:\n", np.repeat(m, 2, axis=0))
print("tile(m, (2,1)) 行方向平铺:\n", np.tile(m, (2, 1)))
```

> 输出：
```text
np.repeat(a, 3) = [1 1 1 2 2 2] （每个元素重复 3 次）
np.tile(a, 3)   = [1 2 1 2 1 2] （整个数组重复 3 次）
np.repeat(a, [1, 3]) = [1 2 2 2] （1 重复 1 次，2 重复 3 次）

m =
 [[1 2]
 [3 4]]
repeat(m, 2, axis=0) 按行重复:
 [[1 2]
 [1 2]
 [3 4]
 [3 4]]
tile(m, (2,1)) 行方向平铺:
 [[1 2]
 [3 4]
 [1 2]
 [3 4]]
```

### 3.8.2 排序与查找

```python
import numpy as np

a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

print("原数组:      ", a)
print("np.sort(a):  ", np.sort(a), "← 返回排序后的新数组，a 不变")
print("a 还是:      ", a)

# argsort：返回"排序后的下标"（这个最有用！）
idx = np.argsort(a)
print("\nargsort:", idx)
print("用这些下标取值:", a[idx], "← 就是排好序的结果")

# 降序
idx_desc = np.argsort(a)[::-1]
print("\n降序下标:", idx_desc)
print("降序取值:", a[idx_desc])

# 二维排序
m = np.array([[3, 1, 2], [6, 4, 5]])
print("\nm =\n", m)
print("np.sort(m, axis=1) 每行内部排序:\n", np.sort(m, axis=1))
print("np.sort(m, axis=0) 每列内部排序:\n", np.sort(m, axis=0))
```

> 输出：
```text
原数组:       [3 1 4 1 5 9 2 6]
np.sort(a):   [1 1 2 3 4 5 6 9] ← 返回排序后的新数组，a 不变
a 还是:       [3 1 4 1 5 9 2 6]

argsort: [1 3 6 0 2 4 7 5]
用这些下标取值: [1 1 2 3 4 5 6 9] ← 就是排好序的结果

降序下标: [5 7 4 2 0 6 3 1]
降序取值: [9 6 5 4 3 2 1 1]

m =
 [[3 1 2]
 [6 4 5]]
np.sort(m, axis=1) 每行内部排序:
 [[1 2 3]
 [4 5 6]]
np.sort(m, axis=0) 每列内部排序:
 [[3 1 2]
 [6 4 5]]
```

> 💡 **`np.sort` 不改变原数组**（返回新数组）。
> 如果想原地排序（省内存），用 `a.sort()`（注意没有 `np.`）。
>
> **`argsort` 的价值**：它返回的是**下标**，所以你可以用它"按某个数组的顺序去排列另一个数组"：
> ```python
> sales = np.array([120, 340, 90])
> names = np.array(["A", "B", "C"])
> order = np.argsort(sales)[::-1]      # 销售额从高到低的下标
> print(names[order], sales[order])    # 商品名和销售额同步排序
> ```
> 输出：
```text
['B' 'A' 'C'] [340 120  90]
```
> **这是"按一个键给多个数组排序"的标准做法**，在做排行榜、Top-N 分析时天天用。

**查找与去重**：

```python
import numpy as np

a = np.array([1, 2, 2, 3, 3, 3, 4])

# unique：去重并排序，还能顺便返回计数
values, counts = np.unique(a, return_counts=True)
print("unique 值:  ", values)
print("出现次数:   ", counts)
print("值 → 次数:", dict(zip(values.tolist(), counts.tolist())))

# also return_index / return_inverse
vals, first_idx = np.unique(a, return_index=True)
print("\n每个值第一次出现的位置:", first_idx)

# searchsorted：在有序数组里找插入位置（用于分箱）
bins = np.array([0, 20, 40, 60, 80, 100])
ages = np.array([15, 35, 55, 85])
pos = np.searchsorted(bins, ages)
print("\n年龄:", ages)
print("落在哪个分箱（下标）:", pos)
print("分箱标签:", [f"{bins[p-1]}-{bins[p]}" for p in pos])
```

> 输出：
```text
unique 值:   [1 2 3 4]
出现次数:    [1 2 3 1]
值 → 次数: {1: 1, 2: 2, 3: 3, 4: 1}

每个值第一次出现的位置: [0 1 3 6]

年龄: [15 35 55 85]
落在哪个分箱（下标）: [1 2 3 5]
分箱标签: ['0-20', '20-40', '40-60', '80-100']
```

### 3.8.3 数学与数值函数

```python
import numpy as np

a = np.array([-3.7, -1.2, 0, 1.5, 2.9])

print("a =", a)
print("\nnp.abs(a) 绝对值    :", np.abs(a))
print("np.round(a) 四舍五入 :", np.round(a))
print("np.floor(a) 向下取整 :", np.floor(a))
print("np.ceil(a) 向上取整  :", np.ceil(a))
print("np.trunc(a) 截断取整 :", np.trunc(a))
print("np.sign(a) 符号      :", np.sign(a))
print("np.clip(a, -2, 2)   :", np.clip(a, -2, 2), "← 超出范围的被截断")
```

> 输出：
```text
a = [-3.7 -1.2  0.   1.5  2.9]

np.abs(a) 绝对值    : [3.7 1.2 0.  1.5 2.9]
np.round(a) 四舍五入 : [-4. -1.  0.  2.  3.]
np.floor(a) 向下取整 : [-4. -2.  0.  1.  2.]
np.ceil(a) 向上取整  : [-3. -1.  0.  2.  3.]
np.trunc(a) 截断取整 : [-3. -1.  0.  1.  2.]
np.sign(a) 符号      : [-1. -1.  0.  1.  1.]
np.clip(a, -2, 2)   : [-2.  -1.2  0.   1.5  2. ] ← 超出范围的被截断
```

```python
import numpy as np

a = np.array([1, 4, 9, 16])

print("开方 np.sqrt(a)      :", np.sqrt(a))
print("指数 np.exp([0,1,2]) :", np.exp([0, 1, 2]).round(4))
print("对数 np.log([1,e,e²]):", np.log([1, np.e, np.e ** 2]).round(4))
print("log1p（log(1+x)，处理小值更稳）:", np.log1p([0, 1, 9]).round(4))
print("幂 np.power(a, 0.5)  :", np.power(a, 0.5))
print("三角函数 sin(0,π/2,π):",
      np.sin([0, np.pi / 2, np.pi]).round(10))
```

> 输出：
```text
开方 np.sqrt(a)      : [1. 2. 3. 4.]
指数 np.exp([0,1,2]) : [1.     2.7183 7.3891]
对数 np.log([1,e,e²]): [0. 1. 2.]
log1p（log(1+x)，处理小值更稳）: [0.     0.6931 2.3026]
幂 np.power(a, 0.5)  : [1. 2. 3. 4.]
三角函数 sin(0,π/2,π): [0. 1. 0.]
```

> 💡 **`np.log1p(x)` = `np.log(1+x)`，但为什么要单独有一个函数？**
> 因为当 `x` 非常小时（比如 1e-20），直接算 `1 + x` 会**丢失精度**（浮点数精度不够），
> 而 `log1p` 用了专门的数值算法避免这个问题。
> **处理右偏数据（如销售额、收入）时推荐用 `np.log1p` 而不是 `np.log`**，
> 因为它能正确处理 0 值（`log(0)` 是负无穷，`log1p(0) = 0`）。

### 3.8.4 拟合与相关

```python
import numpy as np

# 造一组有线性关系的数据（加噪声）
rng = np.random.default_rng(42)
x = np.linspace(0, 10, 50)
y = 2.5 * x + 3 + rng.normal(0, 1.5, 50)

# 一次多项式拟合（即线性回归）—— 等价于最小二乘法
coef = np.polyfit(x, y, 1)          # 返回 [斜率, 截距]
print("拟合结果: y = {:.4f} x + {:.4f}".format(coef[0], coef[1]))
print("（真实关系是 y = 2.5x + 3，加了噪声）")

# 用拟合出的系数预测
x_new = np.array([0, 5, 10])
y_pred = np.polyval(coef, x_new)
print("\n预测 x=0,5,10 时的 y:", y_pred.round(3))

# 计算 R²（决定系数）：衡量拟合好坏
y_fit = np.polyval(coef, x)
ss_res = ((y - y_fit) ** 2).sum()          # 残差平方和
ss_tot = ((y - y.mean()) ** 2).sum()       # 总平方和
r2 = 1 - ss_res / ss_tot
print(f"\nR² = {r2:.4f}  （越接近 1 越好；这里因为有噪声所以不到 1）")

# 二次拟合对比
coef2 = np.polyfit(x, y, 2)
y_fit2 = np.polyval(coef2, x)
r2_2 = 1 - ((y - y_fit2) ** 2).sum() / ss_tot
print(f"二次拟合 R² = {r2_2:.4f}（提升很小，说明数据本来就是线性的）")
```

> 输出：
```text
拟合结果: y = 2.5679 x + 2.7975
（真实关系是 y = 2.5x + 3，加了噪声）

预测 x=0,5,10 时的 y: [ 2.798 15.637 28.476]

R² = 0.9784  （越接近 1 越好；这里因为有噪声所以不到 1）
二次拟合 R² = 0.9785（提升很小，说明数据本来就是线性的）
```

```python
import numpy as np

# 相关系数矩阵
x = np.array([1, 2, 3, 4, 5])
y = np.array([2, 4, 5, 4, 5])
z = np.array([5, 4, 3, 2, 1])

# 两两相关系数
print("x 与 y 的相关系数:", round(float(np.corrcoef(x, y)[0, 1]), 4))
print("x 与 z 的相关系数:", round(float(np.corrcoef(x, z)[0, 1]), 4), "← 完全负相关")

# 多变量的相关系数矩阵
data = np.vstack([x, y, z])
corr_matrix = np.corrcoef(data)
print("\n相关系数矩阵（3×3）:")
print(corr_matrix.round(4))
print("\n对角线永远是 1（自己和自己完全相关），矩阵是对称的")

# 协方差
print("\n协方差矩阵:")
print(np.cov(data).round(4))

# 分箱统计（画直方图时的底层数据）
counts, bin_edges = np.histogram(np.array([1, 2, 2, 3, 4, 5, 7, 8, 9]), bins=5)
print("\n直方图分箱计数:", counts)
print("分箱边界:", bin_edges.round(2))
```

> 输出：
```text
x 与 y 的相关系数: 0.7746
x 与 z 的相关系数: -1.0 ← 完全负相关

相关系数矩阵（3×3）:
[[ 1.      0.7746 -1.    ]
 [ 0.7746  1.     -0.7746]
 [-1.     -0.7746  1.    ]]

对角线永远是 1（自己和自己完全相关），矩阵是对称的

协方差矩阵:
[[ 2.5  1.5 -2.5]
 [ 1.5  1.5 -1.5]
 [-2.5 -1.5  2.5]]

直方图分箱计数: [3 2 1 1 2]
分箱边界: [1.  2.6 4.2 5.8 7.4 9. ]
```

---

## 3.9 dtype 与内存管理

### 3.9.1 常用 dtype 一览

```python
import numpy as np

print("整数类型:")
for dt in [np.int8, np.int16, np.int32, np.int64]:
    info = np.iinfo(dt)
    a = np.zeros(1_000_000, dtype=dt)
    print(f"  {dt.__name__:8} 占 {a.nbytes / 1024 / 1024:5.2f} MB/百万元素   "
          f"范围 {info.min:,} ~ {info.max:,}")

print("\n浮点类型:")
for dt in [np.float16, np.float32, np.float64]:
    info = np.finfo(dt)
    a = np.zeros(1_000_000, dtype=dt)
    print(f"  {dt.__name__:8} 占 {a.nbytes / 1024 / 1024:5.2f} MB/百万元素   "
          f"精度约 {info.precision} 位十进制有效数字")

print("\n其他:")
print("  bool     ：True/False，每元素 1 字节")
print("  str_/U   ：固定长度字符串")
print("  object   ：Python 对象（最慢，尽量避免）")
print("  datetime64：日期时间")
```

> 输出：
```text
整数类型:
  int8     占  0.95 MB/百万元素   范围 -128 ~ 127
  int16    占  1.91 MB/百万元素   范围 -32,768 ~ 32,767
  int32    占  3.81 MB/百万元素   范围 -2,147,483,648 ~ 2,147,483,647
  int64    占  7.63 MB/百万元素   范围 -9,223,372,036,854,775,808 ~ 9,223,372,036,854,775,807

浮点类型:
  float16  占  1.91 MB/百万元素   精度约 3 位十进制有效数字
  float32  占  3.81 MB/百万元素   精度约 6 位十进制有效数字
  float64  占  7.63 MB/百万元素   精度约 15 位十进制有效数字

其他:
  bool     ：True/False，每元素 1 字节
  str_/U   ：固定长度字符串
  object   ：Python 对象（最慢，尽量避免）
  datetime64：日期时间
```

**选 dtype 的决策表**：

| 场景 | 推荐 dtype | 理由 |
|---|---|---|
| 年龄、数量、计数 | `int8` / `int16` / `int32` | 值不大，省内存 |
| 默认整数 | `int64` | 不用操心溢出 |
| 金额、科学计算 | **`float64`** | 精度最高，默认选择 |
| 深度学习、大矩阵 | `float32` | 精度够用，内存省一半，GPU 更快 |
| 布尔标记（0/1） | `bool` | 每元素 1 字节 |
| 日期 | `datetime64[D]` | 保留时间语义 |

> ⚠️ **精度陷阱**：`float32` 只有约 6~7 位十进制有效数字。
> ```python
> import numpy as np
> a = np.float32(0.1)
> b = np.float64(0.1)
> print("float32 的 0.1:", a)
> print("float64 的 0.1:", b)
> print("float32 累加 10000 次 0.1:", np.float32(0.1) * 10000)
> ```
> 输出：
```text
float32 的 0.1: 0.1
float64 的 0.1: 0.1
float32 累加 10000 次 0.1: 1000.0
```
> 这个例子看起来没问题，但**涉及大数相减、迭代累加时误差会累积**。
> **经验**：**做统计分析用 `float64`；做深度学习推理用 `float32`；
> 需要极致省内存的大矩阵用 `float32`。不确定就用默认的 `float64`。**

### 3.9.2 类型转换与溢出

```python
import numpy as np

# astype：类型转换（会创建新数组）
a = np.array([1.7, 2.3, 3.9, -1.7])
print("原数组:", a)
print("astype(int)  ", a.astype(int), "← 注意是截断，不是四舍五入")
print("np.round 再转", np.round(a).astype(int), "← 这才是四舍五入")
print("astype(str)  ", a.astype(str), "→", a.astype(str).dtype)
print("astype(bool) ", a.astype(bool), "← 非 0 都是 True")
```

> 输出：
```text
原数组: [ 1.7  2.3  3.9 -1.7]
astype(int)   [ 1  2  3 -1] ← 注意是截断，不是四舍五入
np.round 再转 [ 2  2  4 -2] ← 这才是四舍五入
astype(str)   ['1.7' '2.3' '3.9' '-1.7'] → <U32
astype(bool)  [ True  True  True  True] ← 非 0 都是 True
```

> ⚠️ **`astype(int)` 是"截断"（向零取整），不是四舍五入！**
> `1.9` → `1`，`-1.9` → `-1`。**这个差异在算金额、评分时会出问题。**
> 需要四舍五入就先 `np.round()` 再 `astype(int)`。

**整数溢出（一个隐蔽的坑）**：

```python
import numpy as np

# 用 int8 存 127（int8 的最大值），再加 1 会怎样？
a = np.array([127], dtype=np.int8)
print("int8 的 127 + 1 =", (a + np.int8(1))[0], "← 溢出变成了 -128！")

# 用 int64 就没问题
b = np.array([127], dtype=np.int64)
print("int64 的 127 + 1 =", (b + 1)[0])

# 类型提升：小类型和大类型运算会自动提升
print("\n类型提升演示:")
print("int8 + int64 →", (np.int8(1) + np.int64(1)).dtype)
print("int + float →", (np.array([1]) + 1.5).dtype)
```

> 输出：
```text
int8 的 127 + 1 = -128 ← 溢出变成了 -128！
int64 的 127 + 1 = 128

类型提升演示:
int8 + int64 → int64
int + float → float64
```

> ⚠️ **这个坑在真实项目里会咬人**：用 `int8`/`int16` 省内存时，
> 如果没算好取值范围，累加就会溢出，得到**完全错误但看起来合理的负数**。
> **建议**：省内存只在"存储"时用窄类型，**做运算前先 `.astype(np.int64)` 或 `float64`**。

---

## 3.10 随机数：请用 `default_rng`

### 3.10.1 新旧接口对比

| | 旧接口（不推荐） | **新接口（推荐）** |
|---|---|---|
| 创建 | `np.random.seed(42)` 全局设置 | `rng = np.random.default_rng(42)` |
| 调用 | `np.random.rand(3)`、`np.random.normal()` | `rng.random(3)`、`rng.normal()` |
| 状态 | **全局共享**，任何一处调用都会影响后续 | 每个 `rng` 对象独立 |
| 可复现性 | 难以保证（别人一调用 `np.random` 就乱了） | **稳定可靠** |
| 性能 | 较慢 | 更快 |
| 引出 | NumPy 1.17 之前 | NumPy 1.17 引入（现在应该都用它） |

**为什么旧接口不好？看这个例子**：

```python
import numpy as np

# 旧接口：全局状态，容易被"污染"
np.random.seed(42)
a = np.random.rand(3)
np.random.seed(42)
b = np.random.rand(3)
print("旧接口两次结果相同:", np.allclose(a, b))

# 但如果中间有任何其他代码调用了 np.random，就会变：
np.random.seed(42)
c = np.random.rand(3)
_ = np.random.rand(100)          # 别处的代码"偷走"了随机数
d = np.random.rand(3)
print("被别人插一脚后还能复现吗:", np.allclose(c, d), "← 复现失败了！")
```

> 输出：
```text
旧接口两次结果相同: True
被别人插一脚后还能复现吗: False ← 复现失败了！
```

```python
import numpy as np

# 新接口：每个 rng 独立，互不干扰
rng1 = np.random.default_rng(42)
rng2 = np.random.default_rng(42)

a = rng1.random(3)
b = rng2.random(3)
print("两个独立 rng 结果相同:", np.allclose(a, b))

# 即使中间有别的随机调用，也不影响
rng3 = np.random.default_rng(42)
c = rng3.random(3)
_ = np.random.rand(100)          # 别处用旧接口
_ = np.random.default_rng(0).random(50)   # 别处用新接口
d = rng3.random(3)               # 这里的 rng3 状态没被污染
print("c 和 d 是同一序列的连续两段，不受别人影响")
print("c =", c.round(4))
print("d =", d.round(4))
```

> 输出：
```text
两个独立 rng 结果相同: True
c 和 d 是同一序列的连续两段，不受别人影响
c = [0.774  0.4389 0.8586]
d = [0.6974 0.0942 0.9756]
```

### 3.10.2 `default_rng` 常用方法速查

```python
import numpy as np

rng = np.random.default_rng(42)

# 均匀分布 [0, 1)
print("random(5)              :", rng.random(5).round(4))

# 均匀分布 [low, high)
print("uniform(10, 20, 5)     :", rng.uniform(10, 20, 5).round(2))

# 正态分布（均值, 标准差, 个数）
print("normal(0, 1, 5)        :", rng.normal(0, 1, 5).round(4))
print("normal(170, 8, 5) 身高  :", rng.normal(170, 8, 5).round(1))

# 整数 [low, high)
print("integers(1, 7, 5) 掷骰子:", rng.integers(1, 7, 5))

# 从给定数组中抽样（可指定概率）
print("choice(['A','B','C'], 5):", rng.choice(["A", "B", "C"], 5).tolist())
print("choice 带概率             :",
      rng.choice(["A", "B", "C"], 10, p=[0.7, 0.2, 0.1]).tolist())

# 打乱（原地）和排列（返回新数组）
arr = np.arange(10)
rng.shuffle(arr)
print("\nshuffle 后:", arr)
print("permutation(5):", rng.permutation(5))

# 多维形状直接指定
print("\nnormal(0, 1, (2, 3)) 二维:\n", rng.normal(0, 1, (2, 3)).round(3))

# 其他分布
print("\n二项分布 binomial(10, 0.3, 5):", rng.binomial(10, 0.3, 5))
print("泊松分布 poisson(3, 5)       :", rng.poisson(3, 5))
print("指数分布 exponential(1, 5)   :", rng.exponential(1, 5).round(3))
```

> 输出：
```text
random(5)              : [0.774  0.4389 0.8586 0.6974 0.0942]
uniform(10, 20, 5)     : [19.76 17.61 17.86 11.28 14.5 ]
normal(0, 1, 5)        : [0.8794 0.7778 0.066  1.1272 0.4675]
normal(170, 8, 5) 身高  : [163.1 173.  162.3 177.  169.6]
integers(1, 7, 5) 掷骰子: [1 5 5 3 1]
choice(['A','B','C'], 5): ['C', 'B', 'C', 'C', 'C']
choice 带概率             : ['A', 'A', 'A', 'A', 'A', 'B', 'C', 'A', 'A', 'A']

shuffle 后: [2 7 5 3 8 4 1 9 6 0]
permutation(5): [4 3 0 1 2]

normal(0, 1, (2, 3)) 二维:
 [[ 0.543 -0.666  0.232]
 [ 0.117  0.219  0.871]]

二项分布 binomial(10, 0.3, 5): [1 2 0 4 4]
泊松分布 poisson(3, 5)       : [4 2 5 0 2]
指数分布 exponential(1, 5)   : [2.028 0.332 0.05  0.925 2.553]
```

### 3.10.3 为什么"固定随机种子"是硬性要求

```python
# 这一块故意演示"不固定种子"的效果，输出每次都不一样，不自动回填 -->
import numpy as np

# 场景：你在做实验，要给别人（或三个月后的自己）复现结果
def simulate_return(n_days=252, seed=None):
    """模拟一年的每日收益率，算出年化收益"""
    rng = np.random.default_rng(seed)
    daily = rng.normal(0.0004, 0.012, n_days)     # 日均 0.04%，波动 1.2%
    return float((1 + daily).prod() - 1)

print("=== 不固定种子（每次都不一样）===")
for i in range(3):
    print(f"  第{i + 1}次模拟: {simulate_return():.2%}")

print("\n=== 固定种子（每次完全一致，可复现）===")
for i in range(3):
    print(f"  第{i + 1}次模拟: {simulate_return(seed=42):.2%}")

print("\n=== 不同种子（得到不同但可复现的结果）===")
for s in [1, 2, 3]:
    print(f"  seed={s}: {simulate_return(seed=s):.2%}")
```

> 输出：
```text
=== 不固定种子（每次都不一样）===
  第1次模拟: 10.06%
  第2次模拟: 25.11%
  第3次模拟: -17.15%

=== 固定种子（每次完全一致，可复现）===
  第1次模拟: -5.95%
  第2次模拟: -5.95%
  第3次模拟: -5.95%

=== 不同种子（得到不同但可复现的结果）===
  seed=1: -19.32%
  seed=2: 5.39%
  seed=3: 11.83%
```

**结论**：
- **不固定种子** → 结果随时会变，**没人能验证你的结论**，实验白做；
- **固定同一个种子** → 结果可复现，但可能"恰好"碰上好/坏的情况；
- **试多个种子** → 最好的做法：跑 10 个不同种子，**报告均值和范围**，
  这样结论更稳健。

> 💡 **本教程的所有数据集**（`data/` 目录）都是用 `np.random.default_rng(42)` 生成的，
> 所以你跑出来的数字和文档里**完全一致**。这就是固定种子的价值。

---

## 3.11 实战练习：用 NumPy 分析销售数据

前面学的都是"零件"，这一节把它们组装起来，**用 NumPy 完成一个真实的小分析**。

> ⚠️ **重要声明**：真实工作中读 CSV 请用 pandas（下一章）。这里故意用 NumPy
> 读数据并手工处理，目的是**让你体会 pandas 到底帮你省了多少事**——
> 学完第 4 章回头看这一节，你会更有感触。

```python
import numpy as np

# 用 NumPy 读 CSV（跳过表头，指定分隔符和类型）
raw = np.genfromtxt(
    "../data/sales_noheader.csv",      # 无表头、分号分隔
    delimiter=";",
    dtype=str,
    encoding="utf-8",
)
print("读到的数组形状:", raw.shape)
print("前 3 行:\n", raw[:3])
```

> 输出：
```text
读到的数组形状: (1064, 4)
前 3 行:
 [['SO20230300508' '杭州' '家用电器' '3313.8']
 ['SO20231100279' '成都' '手机数码' '15717.66']
 ['SO20231200633' '杭州' '食品饮料' '853.09']]
```

```python
import numpy as np

raw = np.genfromtxt("../data/sales_noheader.csv", delimiter=";",
                    dtype=str, encoding="utf-8")

# 把字符串列转成数值列（NumPy 里必须手工转！）
sales = raw[:, 3].astype(float)        # 销售额
cities = raw[:, 1]                     # 城市
categories = raw[:, 2]                 # 品类

print("销售额数组形状:", sales.shape, "| 类型:", sales.dtype)
print("总销售额: {:,.2f}".format(sales.sum()))
print("平均订单额: {:,.2f}".format(sales.mean()))
print("中位数: {:,.2f}".format(np.median(sales)))
```

> 输出：
```text
销售额数组形状: (1064,) | 类型: float64
总销售额: 1,592,095.89
平均订单额: 1,496.33
中位数: 413.02
```

**分析一：各城市销售额（用布尔索引手工分组）**

```python
import numpy as np

raw = np.genfromtxt("../data/sales_noheader.csv", delimiter=";",
                    dtype=str, encoding="utf-8")
sales = raw[:, 3].astype(float)
cities = raw[:, 1]

print("各城市销售统计:")
print(f"{'城市':<8}{'订单数':>8}{'销售额':>14}{'客单价':>12}")
print("-" * 44)
city_names = np.unique(cities)
for c in city_names:
    mask = cities == c                     # 布尔索引筛出该城市
    sub = sales[mask]
    print(f"{c:<8}{len(sub):>8}{sub.sum():>14,.2f}{sub.mean():>12,.2f}")
```

> 输出：
```text
各城市销售统计:
城市           订单数           销售额         客单价
--------------------------------------------
上海           196    209,239.09    1,067.55
北京           173    324,090.24    1,873.35
广州           150    244,136.20    1,627.57
成都            99    130,822.67    1,321.44
杭州           138    227,776.64    1,650.56
武汉            73    106,733.83    1,462.11
深圳           175    265,469.12    1,516.97
西安            60     83,828.10    1,397.13
```

> 💡 **注意看清这里发生了什么**：为了"按城市分组算统计"，
> 我写了一个 `for` 循环 + 布尔索引，**一共 5 行代码**。
>
> 而 pandas 里只需要**一行**：
> ```python
> df.groupby("城市")["销售额"].agg(订单数="count", 销售额="sum", 客单价="mean")
> ```
> **这就是 pandas 存在的意义** —— 它把"分组聚合"这个最高频的操作变成了一个函数。
> 你以后 80% 的时间都在做这件事，所以值得用 pandas。

**分析二：找出大额订单（布尔索引）**

```python
import numpy as np

raw = np.genfromtxt("../data/sales_noheader.csv", delimiter=";",
                    dtype=str, encoding="utf-8")
sales = raw[:, 3].astype(float)
cities = raw[:, 1]

# 组合条件筛选：销售额 > 10000 且 城市是北京或上海
mask = (sales > 10000) & ((cities == "北京") | (cities == "上海"))
print("大额订单数:", mask.sum())
print("这些订单的城市:", cities[mask])
print("这些订单的销售额:", sales[mask].round(2))
print("\n合计: {:,.2f}".format(sales[mask].sum()))
print("占全部销售额的 {:.1%}".format(sales[mask].sum() / sales.sum()))
```

> 输出：
```text
大额订单数: 9
这些订单的城市: ['北京' '北京' '上海' '北京' '北京' '上海' '北京' '北京' '上海']
这些订单的销售额: [27383.28 13551.26 24512.9  29761.15 13615.22 13962.82 51083.44 17850.2
 10241.46]

合计: 201,961.73
占全部销售额的 12.7%
```

**分析三：销售额分布特征（统计函数）**

```python
import numpy as np

raw = np.genfromtxt("../data/sales_noheader.csv", delimiter=";",
                    dtype=str, encoding="utf-8")
sales = raw[:, 3].astype(float)

print("=== 销售额分布特征 ===")
print(f"订单数      : {sales.size}")
print(f"总销售额    : {sales.sum():,.2f}")
print(f"均值        : {sales.mean():,.2f}")
print(f"中位数      : {np.median(sales):,.2f}")
print(f"标准差      : {sales.std():,.2f}")
print(f"最小值      : {sales.min():,.2f}")
print(f"最大值      : {sales.max():,.2f}")
print(f"\n分位数:")
for q in [10, 25, 50, 75, 90, 95, 99]:
    print(f"  P{q:<3}: {np.percentile(sales, q):>10,.2f}")

# 判断偏态：均值 / 中位数的比值
ratio = sales.mean() / np.median(sales)
print(f"\n均值/中位数 = {ratio:.2f}")
if ratio > 1.5:
    print("→ 严重右偏：少数大额订单拉高了均值，描述数据应优先用中位数")
elif ratio > 1.2:
    print("→ 轻度右偏")
else:
    print("→ 分布比较对称")
```

> 输出：
```text
=== 销售额分布特征 ===
订单数      : 1064
总销售额    : 1,592,095.89
均值        : 1,496.33
中位数      : 413.02
标准差      : 3,365.91
最小值      : 9.11
最大值      : 51,083.44

分位数:
  P10 :      53.02
  P25 :     156.56
  P50 :     413.02
  P75 :   1,306.19
  P90 :   3,793.24
  P95 :   6,205.93
  P99 :  16,496.05

均值/中位数 = 3.62
→ 严重右偏：少数大额订单拉高了均值，描述数据应优先用中位数
```

**分析四：对数变换处理右偏**

```python
import numpy as np

raw = np.genfromtxt("../data/sales_noheader.csv", delimiter=";",
                    dtype=str, encoding="utf-8")
sales = raw[:, 3].astype(float)

# 计算偏度（衡量不对称程度的指标）
def skewness(x):
    """偏度：0 表示对称，>0 右偏（长尾在右），<0 左偏"""
    m = x.mean()
    s = x.std()
    return float(((x - m) ** 3).mean() / s ** 3)

print("原始销售额的偏度:", round(skewness(sales), 3), "← 严重右偏")

# 对数变换后
log_sales = np.log1p(sales)          # log(1+x)，能处理 0 值
print("对数变换后的偏度:", round(skewness(log_sales), 3), "← 明显改善")

print("\n变换前后对比:")
print(f"  {'':12}{'均值':>12}{'标准差':>12}{'偏度':>10}")
print(f"  {'原始':12}{sales.mean():>12,.2f}{sales.std():>12,.2f}{skewness(sales):>10.3f}")
print(f"  {'对数变换':12}{log_sales.mean():>12.4f}{log_sales.std():>12.4f}"
      f"{skewness(log_sales):>10.3f}")

print("\n为什么要做这个变换？")
print("  很多统计方法和模型（如线性回归、t 检验）假设数据近似正态分布。")
print("  右偏数据取对数后会更接近对称，让这些方法的前提成立。")
```

> 输出：
```text
原始销售额的偏度: 6.374 ← 严重右偏
对数变换后的偏度: 0.056 ← 明显改善

变换前后对比:
                        均值         标准差        偏度
  原始              1,496.33    3,365.91     6.374
  对数变换              6.1044      1.5842     0.056

为什么要做这个变换？
  很多统计方法和模型（如线性回归、t 检验）假设数据近似正态分布。
  右偏数据取对数后会更接近对称，让这些方法的前提成立。
```

**分析五：简单线性回归（`polyfit`）**

```python
import numpy as np

raw = np.genfromtxt("../data/sales_noheader.csv", delimiter=";",
                    dtype=str, encoding="utf-8")
sales = raw[:, 3].astype(float)

# 用订单序号当"时间"，看销售额有没有趋势
x = np.arange(len(sales))
y = sales

# 一次多项式拟合 = 线性回归
coef = np.polyfit(x, y, 1)
print(f"趋势线: 销售额 = {coef[0]:.4f} × 订单序号 + {coef[1]:.2f}")
print(f"斜率 {coef[0]:.4f} > 0，说明随订单序号增加，销售额略微上升")
print(f"（但斜率很小，一年 1064 单才涨 {coef[0] * 1064:.0f} 元，几乎没有趋势）")

# 用拟合值算 R²
y_fit = np.polyval(coef, x)
r2 = 1 - ((y - y_fit) ** 2).sum() / ((y - y.mean()) ** 2).sum()
print(f"\nR² = {r2:.6f}")
print("R² 极低（接近 0），说明'订单序号'几乎解释不了销售额的变化")
print("→ 销售额和订单顺序无关，这是正确的结论（数据是我们随机生成的）")
```

> 输出：
```text
趋势线: 销售额 = -0.2199 × 订单序号 + 1613.23
斜率 -0.2199 > 0，说明随订单序号增加，销售额略微上升
（但斜率很小，一年 1064 单才涨 -234 元，几乎没有趋势）

R² = 0.000403
R² 极低（接近 0），说明'订单序号'几乎解释不了销售额的变化
→ 销售额和订单顺序无关，这是正确的结论（数据是我们随机生成的）
```

> 💡 **这个"负面结论"很有教育意义**：**分析不一定要得出"有发现"的结论。**
> "销售额与订单顺序无关"同样是有价值的结论——它排除了一个可能的解释。
> 很多初学者会强行在噪声里找规律（这叫**数据挖掘谬误**），是专业性的硬伤。

---

## 3.12 本章小结

### 3.12.1 知识点清单

| 类别 | 必会内容 |
|---|---|
| **创建** | `np.array` / `zeros` / `ones` / `full` / `eye` / `arange` / `linspace` / `reshape` |
| **属性** | `shape` / `ndim` / `size` / `dtype` / `itemsize` / `nbytes` |
| **索引** ★ | `a[i]`、`a[i, j]`、`a[i:j, k:l]`、`a[::2]`、`a[::-1]`、`a[:, None]` |
| **视图 vs 副本** ★ | 基础切片是**视图**（会改原数组），布尔/花式索引是**副本**，不确定就 `.copy()` |
| **布尔索引** ★ | `a[a > 3]`、`(a>2) & (a<6)`（**必须用 `&` 并加括号**）、`~` 取反 |
| **条件赋值** | `np.where(条件, 真值, 假值)`、`np.select([条件...], [值...], default=)` |
| **花式索引** | `a[[0,2,4]]`、`np.argsort` 配合做 Top-N |
| **广播** ★★★ | 从右对齐、相等或 1 可扩展；`(data - data.mean(axis=0)) / data.std(axis=0)` |
| **聚合** ★ | `sum/mean/std/min/max/median/percentile/argmin/argmax/any/all`、**`axis` 是被消掉的维度** |
| **缺失值** | `np.isnan`（**不能用 `==` 判断**）、`nansum/nanmean/nanstd` |
| **矩阵运算** ★ | **`*` 是元素级、`@` 才是矩阵乘法**、`.T`、`np.linalg.inv/det/solve/eig/svd`、`np.trace` |
| **形状操作** | `reshape` / `flatten` / `ravel` / `concatenate` / `vstack` / `hstack` / `stack` / `split` / `array_split` |
| **常用函数** | `sort` / `argsort` / `unique` / `clip` / `abs` / `round` / `sqrt` / `log1p` / `exp` / `corrcoef` / `polyfit` / `polyval` / `histogram` / `searchsorted` |
| **dtype** | `int8~int64` / `float16~64` / `bool` / `astype`（**是截断不是四舍五入**）、整数溢出风险 |
| **随机数** ★ | **`rng = np.random.default_rng(seed)`**，不要再用 `np.random.seed` |
| **统计概念** | 偏度、分位数、R²、相关系数 |

### 3.12.2 最容易出错的 8 个点（自查清单）

```text
1. axis 方向搞反       → 记住：axis 是"被消掉的维度"，0 消行、1 消列
2. 用了 and/or         → 必须用 &/|/~，而且每个条件加括号
3. 忘了 keepdims       → 分组比例、逐行归一化必须加 keepdims=True
4. 切片以为是副本       → 基础切片是视图！要副本就 .copy()
5. 用 * 做矩阵乘法      → 矩阵乘法用 @，* 是逐元素相乘
6. 用 == 判断 nan       → nan != nan，必须用 np.isnan()
7. astype(int) 当四舍五入 → 它是截断，要四舍五入先 np.round()
8. 还在用 np.random.seed → 换成 np.random.default_rng(seed)
```

### 3.12.3 一张图记住广播

```text
两条数组：(3, 4) 和 (4,)

步骤1：维度数补齐（短的左边补 1）     (3, 4)
                                    (1, 4)

步骤2：逐维比较，相等或有 1 即可         3 vs 1  → 有 1，扩展成 3 ✓
                                       4 vs 4  → 相等 ✓

步骤3：结果形状取每维最大值              (3, 4)

结果：(4,) 被复制了 3 遍，变成 (3,4)

--------------------------------------------------

不兼容的情况：(2, 3) 和 (4,)
                               2  3
                                  4   ← 3 vs 4：既不相等也没 1 ✗
报错：operands could not be broadcast together with shapes (2,3) (4,)
```

---

## 3.13 练习

> 建议新建 notebook，每题一个单元格。**不要用 for 循环解决问题**——
> 本章的目的是练向量化思维，能用 NumPy 函数就用。

**练习 1（创建与属性）**
1. 创建一个 5×6 的全 1 数组，打印它的 `shape`、`ndim`、`size`、`dtype`、`nbytes`；
2. 创建一个从 10 到 50（含）、步长 4 的整数数组；
3. 创建一个 0 到 1 之间均匀分布的 8 个数（用 `linspace`）；
4. 创建一个 100 个元素的数组，内容服从均值 175、标准差 7 的正态分布（固定种子 42）。

**练习 2（索引切片）**
用 `np.arange(60).reshape(4, 5, 3)` 创建数组，然后取出：
1. 第 2 层的全部内容（形状应该是 `(5,3)`）；
2. 所有层的第 0 行（形状 `(4,3)`）；
3. 第 1 层、第 2~3 行、第 1 列之后的所有元素；
4. 所有层的最后一列（形状 `(4,5)`）。

**练习 3（视图 vs 副本）**
1. 创建 `a = np.arange(12)`，取 `b = a[3:7]`，修改 `b[0] = 999`，
   打印 `a` 和 `b`，解释发生了什么；
2. 用 `np.shares_memory` 验证 `b` 是不是视图；
3. 改成用 `.copy()` 重做一遍，说明差异；
4. 判断以下哪些是视图：`a[:]`、`a[::2]`、`a[a > 5]`、`a[[1,2]]`、`a.reshape(3,4)`、`a.flatten()`。
   用代码验证你的判断。

**练习 4（布尔索引与条件赋值）**
已知成绩数组 `scores = np.array([88, 92, 75, 60, 45, 98, 55, 81, 73, 90])`：
1. 筛出及格（≥60）的成绩；
2. 筛出 70~90 分之间的成绩；
3. 用 `np.select` 把成绩分成 A(≥90)/B(≥80)/C(≥70)/D(≥60)/F(其他) 五个等级；
4. 统计各等级人数（提示：`np.unique(..., return_counts=True)`）；
5. 把所有低于 60 分的成绩提升 5 分（值替换），打印前后对比。

**练习 5（广播）**
1. 创建形状 `(5, 3)` 的随机数组（种子 0），把每列都减去该列的均值；
2. 创建形状 `(4, 1)` 和 `(1, 5)` 的数组，让它们相加，打印结果形状；
3. 判断下列形状组合能否广播，并验证：
   `(3,4)+(4,)`、`(3,1)+(1,4)`、`(2,3)+(3,2)`、`(5,)+(5,1)`、`(2,3,4)+(3,4)`；
4. 用广播和 `keepdims` 把矩阵 `(5,4)` 的每一行归一化（每行除以该行的和）。

**练习 6（axis 与聚合）**
1. 创建 `(4, 5)` 的数组（`arange(20).reshape(4,5)`），分别算全部元素之和、
   按列求和（`axis=0`）、按行求和（`axis=1`），并说明结果长度为什么是这样；
2. 对同样数组计算按列均值和按行均值；
3. 找出每列的最大值以及它在第几行；
4. 用 `keepdims=True` 计算"每行元素占该行总和的比例"，验证每行加起来等于 1。

**练习 7（矩阵运算）**
1. 创建矩阵 `A = [[2,1],[5,3]]` 和 `B = [[1,4],[2,6]]`，分别计算 `A*B` 和 `A@B`，解释差异；
2. 计算 A 的转置、行列式、逆矩阵，并验证 `A @ inv(A)` 是单位矩阵；
3. 解方程组：`3x + 2y - z = 1`，`2x - 2y + 4z = -2`，`-x + 0.5y - z = 0`；
4. 验证你的解代回原方程成立。

**练习 8（常用函数）**
1. 生成 20 个 0~100 的随机整数（种子 7），排序并找出最大的 3 个值及其原始下标；
2. 计算这 20 个数的均值、中位数、标准差、极差、偏度；
3. 找出其中所有能被 3 整除的数；
4. 用 `np.clip` 把所有小于 20 的值改成 20，大于 80 的值改成 80；
5. 统计修改后每个十位区间的数量（如 20-29、30-39...），用 `np.histogram` 实现。

**练习 9（性能对比）**
1. 生成 100 万个 0~1 的随机数（种子 42）；
2. 用 Python 列表推导算出"大于 0.5 的数的平均值"；
3. 用 NumPy 布尔索引做同样的事；
4. 分别计时，计算加速比；
5. 用 `np.allclose` 验证两种方式结果一致。

**练习 10（综合实战：用 NumPy 分析学生成绩）**
读 `../data/students.csv`（300 行，可用 `np.genfromtxt`，注意有中文表头
和缺失值，缺失值会变成 `nan`），完成：
1. 计算期末成绩的均值、中位数、标准差（注意用 `np.nanmean` 等忽略缺失）；
2. 找出期末成绩最高的 5 位学生（打印学号——提示：`argsort` 配合花式索引）；
3. 统计不及格（<60）的人数，以及他们占总有效人数的比例；
4. 把期末成绩做 Min-Max 归一化到 [0,1]，再算 Z-score 标准化，比较两者的分布特征；
5. 计算"每周自习小时"和"期末成绩"的相关系数，说明这个系数意味着什么。

---

## 3.14 练习参考答案

### 答案 1

```python
import numpy as np

# 1. 5×6 全 1 数组的属性
a = np.ones((5, 6))
print("1. 5×6 全 1 数组:")
print("   shape   :", a.shape)
print("   ndim    :", a.ndim)
print("   size    :", a.size)
print("   dtype   :", a.dtype)
print("   itemsize:", a.itemsize)
print("   nbytes  :", a.nbytes, "= 30 × 8")

# 2. 10 到 50、步长 4
b = np.arange(10, 51, 4)
print("\n2. arange(10, 51, 4) =", b)

# 3. 0 到 1 之间 8 个均匀的数
c = np.linspace(0, 1, 8)
print("\n3. linspace(0, 1, 8) =", c.round(4))

# 4. 正态分布，固定种子
rng = np.random.default_rng(42)
d = rng.normal(175, 7, 100)
print("\n4. 正态分布 100 个（均值175、标准差7）:")
print("   样本均值:", round(d.mean(), 3), "（应接近 175）")
print("   样本标准差:", round(d.std(), 3), "（应接近 7）")
print("   最小/最大:", round(d.min(), 2), "/", round(d.max(), 2))
```

> 输出：
```text
1. 5×6 全 1 数组:
   shape   : (5, 6)
   ndim    : 2
   size    : 30
   dtype   : float64
   itemsize: 8
   nbytes  : 240 = 30 × 8

2. arange(10, 51, 4) = [10 14 18 22 26 30 34 38 42 46 50]

3. linspace(0, 1, 8) = [0.     0.1429 0.2857 0.4286 0.5714 0.7143 0.8571 1.    ]

4. 正态分布 100 个（均值175、标准差7）:
   样本均值: 174.648 （应接近 175）
   样本标准差: 5.409 （应接近 7）
   最小/最大: 161.34 / 189.99
```

> 💡 **注意第 4 题的样本均值 175.399 ≠ 175**。
> 这是正常的：**样本均值本身也是随机的**，样本量 100 时会有波动。
> 样本量越大，越接近理论值。这体现了**抽样误差**的概念（第 8 章会讲）。

### 答案 2

```python
import numpy as np

arr = np.arange(60).reshape(4, 5, 3)
print("arr 形状:", arr.shape, "→ (层, 行, 列)")

# 1. 第 2 层全部
r1 = arr[2]
print("\n1. 第 2 层 arr[2]:")
print("   形状:", r1.shape)
print(r1)

# 2. 所有层的第 0 行
r2 = arr[:, 0, :]
print("\n2. 所有层第 0 行 arr[:, 0, :]:")
print("   形状:", r2.shape)
print(r2)

# 3. 第 1 层、第 2~3 行、第 1 列之后
r3 = arr[1, 2:4, 1:]
print("\n3. arr[1, 2:4, 1:]:")
print("   形状:", r3.shape)
print(r3)

# 4. 所有层的最后一列
r4 = arr[:, :, -1]
print("\n4. 所有层最后一列 arr[:, :, -1]:")
print("   形状:", r4.shape)
print(r4)
```

> 输出：
```text
arr 形状: (4, 5, 3) → (层, 行, 列)

1. 第 2 层 arr[2]:
   形状: (5, 3)
[[30 31 32]
 [33 34 35]
 [36 37 38]
 [39 40 41]
 [42 43 44]]

2. 所有层第 0 行 arr[:, 0, :]:
   形状: (4, 3)
[[ 0  1  2]
 [15 16 17]
 [30 31 32]
 [45 46 47]]

3. arr[1, 2:4, 1:]:
   形状: (2, 2)
[[22 23]
 [25 26]]

4. 所有层最后一列 arr[:, :, -1]:
   形状: (4, 5)
[[ 2  5  8 11 14]
 [17 20 23 26 29]
 [32 35 38 41 44]
 [47 50 53 56 59]]
```

> 💡 **第 4 题的形状是 `(4,5)` 而不是 `(4,5,1)`**：
> 因为用了**单个整数** `-1` 做索引，那个维度被"消掉"了。
> 如果想保留维度，要写 `arr[:, :, -1:]`（切片形式），结果形状是 `(4,5,1)`。

### 答案 3

```python
import numpy as np

# 1. 切片是视图
a = np.arange(12)
b = a[3:7]
print("a =", a)
print("b = a[3:7] =", b)

b[0] = 999
print("\nb[0] = 999 之后:")
print("a =", a, " ← a[3] 也被改成了 999")
print("b =", b)
```

> 输出：
```text
a = [ 0  1  2  3  4  5  6  7  8  9 10 11]
b = a[3:7] = [3 4 5 6]

b[0] = 999 之后:
a = [  0   1   2 999   4   5   6   7   8   9  10  11]  ← a[3] 也被改成了 999
b = [999   4   5   6]
```

**解释**：`a[3:7]` 返回的是**视图**——它和 `a` 共享同一块内存，
`b[0]` 和 `a[3]` 其实是**同一个位置**，所以改一个另一个也变。

```python
import numpy as np

a = np.arange(12)
b = a[3:7]

# 2. 验证是不是视图
print("2. np.shares_memory(b, a) =", np.shares_memory(b, a), "→ 是视图")

# 3. 用 copy() 重做
c = a[3:7].copy()
c[0] = -1
print("\n3. 用 .copy() 之后:")
print("   np.shares_memory(c, a) =", np.shares_memory(c, a), "→ 不是视图")
print("   a =", a, "（没被改动）")
print("   c =", c)
```

> 输出：
```text
2. np.shares_memory(b, a) = True → 是视图

3. 用 .copy() 之后:
   np.shares_memory(c, a) = False → 不是视图
   a = [ 0  1  2  3  4  5  6  7  8  9 10 11] （没被改动）
   c = [-1  4  5  6]
```

```python
import numpy as np

# 4. 判断哪些是视图
a = np.arange(12)
cases = {
    "a[:]":          a[:],
    "a[::2]":        a[::2],
    "a[a > 5]":      a[a > 5],
    "a[[1,2]]":      a[[1, 2]],
    "a.reshape(3,4)": a.reshape(3, 4),
    "a.flatten()":   a.flatten(),
}

print("4. 视图判断结果:")
print(f"{'表达式':<18}{'形状':<12}{'是视图？'}")
print("-" * 42)
for expr, arr in cases.items():
    is_view = np.shares_memory(arr, a)
    print(f"{expr:<18}{str(arr.shape):<12}{'是' if is_view else '否'}")
```

> 输出：
```text
4. 视图判断结果:
表达式               形状          是视图？
------------------------------------------
a[:]              (12,)       是
a[::2]            (6,)        是
a[a > 5]          (6,)        否
a[[1,2]]          (2,)        否
a.reshape(3,4)    (3, 4)      是
a.flatten()       (12,)       否
```

**结论表**：

| 表达式 | 结果 | 原因 |
|---|---|---|
| `a[:]` | 视图 | 基础切片 |
| `a[::2]` | 视图 | 基础切片（带步长） |
| `a[a > 5]` | **副本** | 布尔索引，结果不连续，无法做视图 |
| `a[[1,2]]` | **副本** | 花式索引，同上 |
| `a.reshape(3,4)` | 视图 | 只换解读方式，不动数据 |
| `a.flatten()` | **副本** | 明确复制 |

### 答案 4

```python
import numpy as np

scores = np.array([88, 92, 75, 60, 45, 98, 55, 81, 73, 90])
print("成绩:", scores)

# 1. 及格
print("\n1. 及格(>=60):", scores[scores >= 60])

# 2. 70~90 之间
print("2. 70~90 之间:", scores[(scores >= 70) & (scores <= 90)])

# 3. 分等级
grades = np.select(
    [scores >= 90, scores >= 80, scores >= 70, scores >= 60],
    ["A", "B", "C", "D"],
    default="F",
)
print("\n3. 等级:", grades)

# 4. 各等级人数
labels, counts = np.unique(grades, return_counts=True)
print("\n4. 各等级人数:")
for lb, ct in zip(labels, counts):
    print(f"   {lb}: {ct} 人  {'█' * ct}")

# 5. 低于 60 分的加 5 分
adjusted = np.where(scores < 60, scores + 5, scores)
print("\n5. 提分前后对比:")
print("   原成绩:", scores)
print("   调整后:", adjusted)
print("   被修改的位置:", np.where(scores < 60)[0].tolist())
```

> 输出：
```text
成绩: [88 92 75 60 45 98 55 81 73 90]

1. 及格(>=60): [88 92 75 60 98 81 73 90]
2. 70~90 之间: [88 75 81 73 90]

3. 等级: ['B' 'A' 'C' 'D' 'F' 'A' 'F' 'B' 'C' 'A']

4. 各等级人数:
   A: 3 人  ███
   B: 2 人  ██
   C: 2 人  ██
   D: 1 人  █
   F: 2 人  ██

5. 提分前后对比:
   原成绩: [88 92 75 60 45 98 55 81 73 90]
   调整后: [88 92 75 60 50 98 60 81 73 90]
   被修改的位置: [4, 6]
```

> 💡 第 5 题的**替代写法**（用布尔索引直接赋值）：
> ```python
> s = scores.copy()
> s[s < 60] += 5
> print("布尔索引直接赋值:", s)
> ```
> 输出：
```text
布尔索引直接赋值: [88 92 75 60 50 98 60 81 73 90]
```
> 两种写法结果一样。**`np.where` 更适合"保留原数组不动"的场景，
> 布尔索引赋值更适合"原地修改"的场景。**

### 答案 5

```python
import numpy as np

# 1. 每列减去列均值
rng = np.random.default_rng(0)
a = rng.normal(100, 15, (5, 3))
print("1. 原始数据 (5,3):")
print(a.round(2))
print("   原各列均值:", a.mean(axis=0).round(4))

centered = a - a.mean(axis=0)          # (5,3) - (3,) 广播
print("\n   减均值后各列均值:", centered.mean(axis=0).round(12))
print("   形状保持:", centered.shape)

# 2. (4,1) + (1,5)
b = np.ones((4, 1)) * np.arange(4)[:, None]
c = np.ones((1, 5)) * np.arange(5)[None, :]
print("\n2. (4,1) + (1,5):")
print("   b 形状:", b.shape, "| c 形状:", c.shape)
print("   结果形状:", (b + c).shape)
print(b + c)
```

> 输出：
```text
1. 原始数据 (5,3):
[[101.89  98.02 109.61]
 [101.57  91.96 105.42]
 [119.56 114.21  89.44]
 [ 81.02  90.65 100.62]
 [ 65.12  96.72  81.31]]
   原各列均值: [93.8325 98.3117 97.2811]

   减均值后各列均值: [-0. -0.  0.]
   形状保持: (5, 3)

2. (4,1) + (1,5):
   b 形状: (4, 1) | c 形状: (1, 5)
   结果形状: (4, 5)
[[0. 1. 2. 3. 4.]
 [1. 2. 3. 4. 5.]
 [2. 3. 4. 5. 6.]
 [3. 4. 5. 6. 7.]]
```

```python
import numpy as np

# 3. 广播兼容性判断与验证
tests = [
    ((3, 4), (4,)),
    ((3, 1), (1, 4)),
    ((2, 3), (3, 2)),
    ((5,), (5, 1)),
    ((2, 3, 4), (3, 4)),
]

print("3. 广播兼容性测试:")
print(f"{'形状A':<14}{'形状B':<14}{'结果形状':<16}{'是否兼容'}")
print("-" * 56)
for sa, sb in tests:
    try:
        res = (np.zeros(sa) + np.zeros(sb)).shape
        ok = "兼容"
    except ValueError:
        res = "-"
        ok = "不兼容"
    print(f"{str(sa):<14}{str(sb):<14}{str(res):<16}{ok}")
```

> 输出：
```text
3. 广播兼容性测试:
形状A           形状B           结果形状            是否兼容
--------------------------------------------------------
(3, 4)        (4,)          (3, 4)          兼容
(3, 1)        (1, 4)        (3, 4)          兼容
(2, 3)        (3, 2)        -               不兼容
(5,)          (5, 1)        (5, 5)          兼容
(2, 3, 4)     (3, 4)        (2, 3, 4)       兼容
```

**逐条解释**：

| 形状 A | 形状 B | 结果 | 原因 |
|---|---|---|---|
| `(3,4)` | `(4,)` | `(3,4)` | B 补成 `(1,4)`，第2维相等、第1维有 1 |
| `(3,1)` | `(1,4)` | `(3,4)` | 两维都有 1，都能扩展 |
| `(2,3)` | `(3,2)` | **不兼容** | 从右对齐：`3 vs 2` 既不相等也没 1 ✗ |
| `(5,)` | `(5,1)` | `(5,5)` | B 是 `(5,1)`，A 补成 `(1,5)`：`1 vs 5` ✓、`5 vs 1` ✓。**注意结果不是 `(5,1)` 而是 `(5,5)`** |
| `(2,3,4)` | `(3,4)` | `(2,3,4)` | B 补成 `(1,3,4)`，第1维有 1 |

> ⚠️ **第 4 条最反直觉**：`(5,) + (5,1)` 的结果是 `(5,5)` 而不是 `(5,1)`。
> 因为 `(5,)` 补成 `(1,5)`，然后 `1 vs 5` 扩展成 5，`5 vs 1` 扩展成 5。
> **这个"外积"效果有时候很有用，有时候是 bug 的来源。**
> 如果你想得到 `(5,1)`，要写成 `(5,1) + (5,1)`，或者 `np.arange(5)[:, None] + 0`。

```python
import numpy as np

# 4. 用 keepdims 逐行归一化
m = np.array([[1., 2., 3., 4.],
              [5., 6., 7., 8.],
              [2., 4., 6., 8.],
              [1., 1., 1., 1.],
              [10., 20., 30., 40.]])
print("4. 原始矩阵 (5,4):")
print(m)

# 正确做法：keepdims=True 让形状变成 (5,1)，能正确广播
row_sum = m.sum(axis=1, keepdims=True)
print("\n   每行之和 (5,1):")
print(row_sum)

normalized = m / row_sum
print("\n   逐行归一化后:")
print(normalized.round(4))
print("\n   验证每行和:", normalized.sum(axis=1).round(10))

# 对比：不加 keepdims 会怎样？
# 这里用 try/except 把真实的报错抓出来给你看（不同形状组合会报错或算错）
print("\n   ⚠️ 不加 keepdims 的对比实验:")
try:
    wrong = m / m.sum(axis=1)          # (5,4) 除以 (5,)
    print("   居然没报错？结果形状:", wrong.shape)
    print("   验证每行和:", wrong.sum(axis=1).round(4))
except ValueError as e:
    print("   报错了:", str(e))
    print("   → 解释：m.sum(axis=1) 的形状是 (5,)，")
    print("     要和 (5,4) 相除，广播时按'从右对齐'比较 4 vs 5，")
    print("     既不相等也没有 1，所以无法广播，直接报错。")
    print("     【结论】要让'每一行除以本行的和'，必须写 keepdims=True")
    print("     让形状变成 (5,1)，这时 4 vs 1 有 1 → 可以广播（列方向复制 4 份）")
```

> 输出：
```text
4. 原始矩阵 (5,4):
[[ 1.  2.  3.  4.]
 [ 5.  6.  7.  8.]
 [ 2.  4.  6.  8.]
 [ 1.  1.  1.  1.]
 [10. 20. 30. 40.]]

   每行之和 (5,1):
[[ 10.]
 [ 26.]
 [ 20.]
 [  4.]
 [100.]]

   逐行归一化后:
[[0.1    0.2    0.3    0.4   ]
 [0.1923 0.2308 0.2692 0.3077]
 [0.1    0.2    0.3    0.4   ]
 [0.25   0.25   0.25   0.25  ]
 [0.1    0.2    0.3    0.4   ]]

   验证每行和: [1. 1. 1. 1. 1.]

   ⚠️ 不加 keepdims 的对比实验:
   报错了: operands could not be broadcast together with shapes (5,4) (5,) 
   → 解释：m.sum(axis=1) 的形状是 (5,)，
     要和 (5,4) 相除，广播时按'从右对齐'比较 4 vs 5，
     既不相等也没有 1，所以无法广播，直接报错。
     【结论】要让'每一行除以本行的和'，必须写 keepdims=True
     让形状变成 (5,1)，这时 4 vs 1 有 1 → 可以广播（列方向复制 4 份）
```

> 💡 **这里其实有两种可能的"错法"，都要知道**：
>
> **情况 A（上面遇到的）**：形状 `(5,4) ÷ (5,)` → **直接报错**。
> 因为从右对齐比较是 `4 vs 5`，既不相等也没 1。这种错法很"友好"，
> 因为它立刻告诉你出问题了。
>
> **情况 B（更危险的）**：如果你误写成 `m / m.sum(axis=0)`
> （比如把 axis 记错成 0），形状是 `(5,4) ÷ (4,)` → **能广播、不报错，
> 但结果完全是错的**（变成了"每列除以该列的和"，而你想要的是按行）。
>
> ```python
> import numpy as np
> m = np.array([[1., 2., 3., 4.],
>               [5., 6., 7., 8.],
>               [2., 4., 6., 8.],
>               [1., 1., 1., 1.],
>               [10., 20., 30., 40.]])
> # axis 记错成 0：不报错，但算的是"按列归一化"
> wrong = m / m.sum(axis=0)
> print("按列归一化（不是我们想要的）:")
> print(wrong.round(4))
> print("验证每行和:", wrong.sum(axis=1).round(4), "← 不等于 1，说明算错了")
> ```
>
> 输出：
```text
按列归一化（不是我们想要的）:
[[0.0526 0.0606 0.0645 0.0645]
 [0.2632 0.1818 0.1505 0.129 ]
 [0.1053 0.1212 0.129  0.129 ]
 [0.0526 0.0303 0.0215 0.0161]
 [0.5263 0.6061 0.6452 0.6452]]
验证每行和: [0.2423 0.7245 0.4846 0.1206 2.4227] ← 不等于 1，说明算错了
```
>
> **结论**：情况 B 更可怕——**它不报错，只是悄悄给你错的结果**。
> 所以写"按行/按列归一化"这类代码时，**一定要验证结果**：
> 按行归一化后每行之和应该等于 1，按列归一化后每列之和应该等于 1。
> **"跑通"不等于"算对"，这是数据分析里最需要养成的警觉。**

### 答案 6

```python
import numpy as np

a = np.arange(20).reshape(4, 5)
print("a =\n", a)
print("形状:", a.shape, "→ 4 行 5 列\n")

print("1. 各种求和:")
print("   全部之和 a.sum()          =", a.sum())
print("   按列求和 a.sum(axis=0)    =", a.sum(axis=0), f"长度 {a.sum(axis=0).size} = 列数")
print("   按行求和 a.sum(axis=1)    =", a.sum(axis=1), f"长度 {a.sum(axis=1).size} = 行数")
print("\n   为什么？axis=0 消掉'行'这个维度，所以每列留一个结果（5 个）")
print("          axis=1 消掉'列'这个维度，所以每行留一个结果（4 个）")

print("\n2. 均值:")
print("   按列均值:", a.mean(axis=0))
print("   按行均值:", a.mean(axis=1))
```

> 输出：
```text
a =
 [[ 0  1  2  3  4]
 [ 5  6  7  8  9]
 [10 11 12 13 14]
 [15 16 17 18 19]]
形状: (4, 5) → 4 行 5 列

1. 各种求和:
   全部之和 a.sum()          = 190
   按列求和 a.sum(axis=0)    = [30 34 38 42 46] 长度 5 = 列数
   按行求和 a.sum(axis=1)    = [10 35 60 85] 长度 4 = 行数

   为什么？axis=0 消掉'行'这个维度，所以每列留一个结果（5 个）
          axis=1 消掉'列'这个维度，所以每行留一个结果（4 个）

2. 均值:
   按列均值: [ 7.5  8.5  9.5 10.5 11.5]
   按行均值: [ 2.  7. 12. 17.]
```

```python
import numpy as np

a = np.arange(20).reshape(4, 5)

# 3. 每列最大值及其所在行
col_max = a.max(axis=0)
col_argmax = a.argmax(axis=0)
print("3. 每列最大值:")
print("   最大值:  ", col_max)
print("   所在行号:", col_argmax)
print("   验证:")
for j in range(a.shape[1]):
    print(f"     第 {j} 列: 最大值 {col_max[j]} 在第 {col_argmax[j]} 行 "
          f"（该位置的值是 {a[col_argmax[j], j]}）")

# 4. keepdims 做逐行比例
row_sum = a.sum(axis=1, keepdims=True)
ratio = a / row_sum
print("\n4. 每行元素占该行总和的比例（保留3位）:")
print(ratio.round(3))
print("\n   每行比例之和:", ratio.sum(axis=1).round(10))

# 验证不加 keepdims 会出错
print("\n   对比：不加 keepdims 时形状是", a.sum(axis=1).shape,
      "，无法正确按行广播")
```

> 输出：
```text
3. 每列最大值:
   最大值:   [15 16 17 18 19]
   所在行号: [3 3 3 3 3]
   验证:
     第 0 列: 最大值 15 在第 3 行 （该位置的值是 15）
     第 1 列: 最大值 16 在第 3 行 （该位置的值是 16）
     第 2 列: 最大值 17 在第 3 行 （该位置的值是 17）
     第 3 列: 最大值 18 在第 3 行 （该位置的值是 18）
     第 4 列: 最大值 19 在第 3 行 （该位置的值是 19）

4. 每行元素占该行总和的比例（保留3位）:
[[0.    0.1   0.2   0.3   0.4  ]
 [0.143 0.171 0.2   0.229 0.257]
 [0.167 0.183 0.2   0.217 0.233]
 [0.176 0.188 0.2   0.212 0.224]]

   每行比例之和: [1. 1. 1. 1.]

   对比：不加 keepdims 时形状是 (4,) ，无法正确按行广播
```

> 💡 **`argmax(axis=0)` 返回的是"在该列内的行号"**（0~3），
> 而不是"展平后的全局下标"。这一点和 `a.argmax()`（不带 axis）不同——
> 后者返回展平后的全局下标。**这个差异很容易出错，要注意。**

### 答案 7

```python
import numpy as np

A = np.array([[2, 1], [5, 3]])
B = np.array([[1, 4], [2, 6]])

print("A =\n", A)
print("\nB =\n", B)

print("1. A * B （元素级乘法）=")
print(A * B)
print("   算法: 2×1=2, 1×4=4, 5×2=10, 3×6=18（对应位置分别相乘）")

print("\n   A @ B （矩阵乘法）=")
print(A @ B)
print("   算法: 第(0,0)项 = 2×1 + 1×2 = 4")
print("         第(0,1)项 = 2×4 + 1×6 = 14")
print("         第(1,0)项 = 5×1 + 3×2 = 11")
print("         第(1,1)项 = 5×4 + 3×6 = 38")
```

> 输出：
```text
A =
 [[2 1]
 [5 3]]

B =
 [[1 4]
 [2 6]]
1. A * B （元素级乘法）=
[[ 2  4]
 [10 18]]
   算法: 2×1=2, 1×4=4, 5×2=10, 3×6=18（对应位置分别相乘）

   A @ B （矩阵乘法）=
[[ 4 14]
 [11 38]]
   算法: 第(0,0)项 = 2×1 + 1×2 = 4
         第(0,1)项 = 2×4 + 1×6 = 14
         第(1,0)项 = 5×1 + 3×2 = 11
         第(1,1)项 = 5×4 + 3×6 = 38
```

```python
import numpy as np

A = np.array([[2, 1], [5, 3]])

# 2. 转置、行列式、逆矩阵
print("2. A 的基本运算:")
print("   转置 A.T =\n", A.T)
print("\n   行列式 det(A) =", round(float(np.linalg.det(A)), 6))
print("   （det = 2×3 - 1×5 = 1，不为 0，所以可逆）")

A_inv = np.linalg.inv(A)
print("\n   逆矩阵 inv(A) =\n", A_inv)
print("\n   验证 A @ inv(A) （应为单位阵）=")
print((A @ A_inv).round(10))

print("\n   用 solve 验证等价性:")
print("   inv(A) @ [1,2] =", (A_inv @ np.array([1, 2])).round(6))
print("   solve(A,[1,2]) =", np.linalg.solve(A, np.array([1, 2])).round(6))
```

> 输出：
```text
2. A 的基本运算:
   转置 A.T =
 [[2 5]
 [1 3]]

   行列式 det(A) = 1.0
   （det = 2×3 - 1×5 = 1，不为 0，所以可逆）

   逆矩阵 inv(A) =
 [[ 3. -1.]
 [-5.  2.]]

   验证 A @ inv(A) （应为单位阵）=
[[ 1.  0.]
 [-0.  1.]]

   用 solve 验证等价性:
   inv(A) @ [1,2] = [ 1. -1.]
   solve(A,[1,2]) = [ 1. -1.]
```

```python
import numpy as np

# 3. 解三元方程组
#   3x + 2y -  z = 1
#   2x - 2y + 4z = -2
#  - x + 0.5y - z = 0
A = np.array([[3., 2., -1.],
              [2., -2., 4.],
              [-1., 0.5, -1.]])
b = np.array([1., -2., 0.])

print("3. 解方程组:")
print("系数矩阵 A =\n", A)
print("常数项 b =", b)

x = np.linalg.solve(A, b)
print("\n解: x =", x.round(6))
print(f"即 x = {x[0]:.4f}, y = {x[1]:.4f}, z = {x[2]:.4f}")

# 4. 验证
print("\n4. 验证（A @ x 应该等于 b）:")
print("   A @ x =", (A @ x).round(10))
print("   b     =", b)
print("   完全一致:", np.allclose(A @ x, b))

print("\n   逐个方程验证:")
print(f"   3×{x[0]:.4f} + 2×{x[1]:.4f} - 1×{x[2]:.4f} = "
      f"{3 * x[0] + 2 * x[1] - x[2]:.6f}  (应为 1)")
print(f"   2×{x[0]:.4f} - 2×{x[1]:.4f} + 4×{x[2]:.4f} = "
      f"{2 * x[0] - 2 * x[1] + 4 * x[2]:.6f}  (应为 -2)")
print(f"  -1×{x[0]:.4f} + 0.5×{x[1]:.4f} - 1×{x[2]:.4f} = "
      f"{-x[0] + 0.5 * x[1] - x[2]:.6f}  (应为 0)")
```

> 输出：
```text
3. 解方程组:
系数矩阵 A =
 [[ 3.   2.  -1. ]
 [ 2.  -2.   4. ]
 [-1.   0.5 -1. ]]
常数项 b = [ 1. -2.  0.]

解: x = [ 1. -2. -2.]
即 x = 1.0000, y = -2.0000, z = -2.0000

4. 验证（A @ x 应该等于 b）:
   A @ x = [ 1. -2. -0.]
   b     = [ 1. -2.  0.]
   完全一致: True

   逐个方程验证:
   3×1.0000 + 2×-2.0000 - 1×-2.0000 = 1.000000  (应为 1)
   2×1.0000 - 2×-2.0000 + 4×-2.0000 = -2.000000  (应为 -2)
  -1×1.0000 + 0.5×-2.0000 - 1×-2.0000 = -0.000000  (应为 0)
```

> 💡 **`solve` 遇到无解或无穷多解会怎样？** 会报 `LinAlgError: Singular matrix`
> （奇异矩阵 = 行列式为 0）。这就是"方程组无唯一解"的数学表现。
> 真实工作中遇到这个错误，要去检查**是不是有重复或线性相关的方程**
> （比如两个条件其实说的是同一件事）。

### 答案 8

```python
import numpy as np

rng = np.random.default_rng(7)
data = rng.integers(0, 101, 20)
print("随机数组:", data)
print("形状:", data.shape)

# 1. 排序 + Top3 及其原始下标
sorted_data = np.sort(data)
print("\n1. 排序后:", sorted_data)

# argsort 给的是"从小到大"的下标，[::-1] 变成从大到小
order_desc = np.argsort(data)[::-1]
top3_idx = order_desc[:3]
print("\n   Top3 的值:", data[top3_idx])
print("   Top3 的原始下标:", top3_idx)
print("   （验证：下标 %s 在原始数组里的值分别是 %s）"
      % (top3_idx.tolist(), data[top3_idx].tolist()))
```

> 输出：
```text
随机数组: [95 63 69 90 58 78 84 22  5 30 28 88 92  0 50 82 13 80 12 47]
形状: (20,)

1. 排序后: [ 0  5 12 13 22 28 30 47 50 58 63 69 78 80 82 84 88 90 92 95]

   Top3 的值: [95 92 90]
   Top3 的原始下标: [ 0 12  3]
   （验证：下标 [0, 12, 3] 在原始数组里的值分别是 [95, 92, 90]）
```

```python
import numpy as np

rng = np.random.default_rng(7)
data = rng.integers(0, 101, 20)

# 2. 统计量
def skewness(x):
    m, s = x.mean(), x.std()
    return float(((x - m) ** 3).mean() / s ** 3)

print("2. 统计量:")
print("   均值      :", round(data.mean(), 3))
print("   中位数    :", np.median(data))
print("   标准差    :", round(data.std(), 3))
print("   方差      :", round(data.var(), 3))
print("   最小值    :", data.min())
print("   最大值    :", data.max())
print("   极差      :", np.ptp(data))
print("   偏度      :", round(skewness(data), 4))

# 3. 能被 3 整除的
div3 = data[data % 3 == 0]
print("\n3. 能被 3 整除的数:", div3, f"（共 {div3.size} 个）")
print("   验证:", [x for x in div3.tolist() if x % 3 == 0])
```

> 输出：
```text
2. 统计量:
   均值      : 54.3
   中位数    : 60.5
   标准差    : 31.572
   方差      : 996.81
   最小值    : 0
   最大值    : 95
   极差      : 95
   偏度      : -0.3279

3. 能被 3 整除的数: [63 69 90 78 84 30  0 12] （共 8 个）
   验证: [63, 69, 90, 78, 84, 30, 0, 12]
```

```python
import numpy as np

rng = np.random.default_rng(7)
data = rng.integers(0, 101, 20)

# 4. clip 截断
clipped = np.clip(data, 20, 80)
print("4. clip(data, 20, 80):")
print("   原始:", data)
print("   截断后:", clipped)
changed = np.where(data != clipped)[0]
print(f"   被修改的位置: {changed.tolist()}（共 {changed.size} 个）")

# 5. 十位区间统计
counts, edges = np.histogram(clipped, bins=np.arange(20, 91, 10))
print("\n5. 十位区间数量分布:")
print(f"   {'区间':<14}{'数量':>6}  直方图")
print("   " + "-" * 44)
for i, c in enumerate(counts):
    lo, hi = int(edges[i]), int(edges[i + 1])
    print(f"   {f'{lo}-{hi - 1}':<14}{c:>6}  {'█' * c}")
print(f"\n   合计: {counts.sum()} 个（应等于 20）")
print(f"   分箱边界: {edges.astype(int).tolist()}")
```

> 输出：
```text
4. clip(data, 20, 80):
   原始: [95 63 69 90 58 78 84 22  5 30 28 88 92  0 50 82 13 80 12 47]
   截断后: [80 63 69 80 58 78 80 22 20 30 28 80 80 20 50 80 20 80 20 47]
   被修改的位置: [0, 3, 6, 8, 11, 12, 13, 15, 16, 18]（共 10 个）

5. 十位区间数量分布:
   区间                数量  直方图
   --------------------------------------------
   20-29              6  ██████
   30-39              1  █
   40-49              1  █
   50-59              2  ██
   60-69              2  ██
   70-79              1  █
   80-89              7  ███████

   合计: 20 个（应等于 20）
   分箱边界: [20, 30, 40, 50, 60, 70, 80, 90]
```

### 答案 9

```python
# 计时类输出每次都不一样，不自动回填 -->
import time
import numpy as np

rng = np.random.default_rng(42)
N = 1_000_000
arr = rng.random(N)
lst = arr.tolist()

print("数据量:", N)
print("原始数组均值:", round(arr.mean(), 6))
print()

# 方式一：Python 列表推导
t0 = time.perf_counter()
big = [v for v in lst if v > 0.5]
mean_loop = sum(big) / len(big)
t_loop = time.perf_counter() - t0

# 方式二：NumPy 布尔索引
t0 = time.perf_counter()
mask = arr > 0.5
mean_np = arr[mask].mean()
t_np = time.perf_counter() - t0

print(f"方式一（列表推导）:")
print(f"  筛选出 {len(big):,} 个，均值 {mean_loop:.8f}")
print(f"  耗时 {t_loop * 1000:.1f} ms")
print(f"\n方式二（NumPy）：")
print(f"  筛选出 {mask.sum():,} 个，均值 {mean_np:.8f}")
print(f"  耗时 {t_np * 1000:.1f} ms")
print(f"\n加速比: {t_loop / t_np:.1f} 倍")
print(f"结果一致: {np.allclose(mean_loop, mean_np)}")
```

> 输出：
```text
数据量: 1000000
原始数组均值: 0.499431

方式一（列表推导）:
  筛选出 500,206 个，均值 0.74990908
  耗时 54.4 ms

方式二（NumPy）：
  筛选出 500,206 个，均值 0.74990908
  耗时 5.8 ms

加速比: 9.4 倍
结果一致: True
```

> 💡 **补充观察**：如果只是"求和"这种简单操作，NumPy 的优势会小很多：
> ```python
> # 计时类输出每次都不一样，不自动回填 -->
> import time
> import numpy as np
> 
> rng = np.random.default_rng(42)
> arr = rng.random(1_000_000)
> lst = arr.tolist()
> 
> t0 = time.perf_counter()
> s1 = sum(lst)
> t1 = time.perf_counter() - t0
> 
> t0 = time.perf_counter()
> s2 = arr.sum()
> t2 = time.perf_counter() - t0
> 
> print(f"Python sum : {t1 * 1000:.2f} ms")
> print(f"numpy.sum  : {t2 * 1000:.2f} ms")
> print(f"加速比     : {t1 / t2:.1f} 倍")
> print("结果一致:", abs(s1 - s2) < 1e-6)
> ```
> 输出：
```text
Python sum : 3.94 ms
numpy.sum  : 1.85 ms
加速比     : 2.1 倍
结果一致: True
```
> **为什么只有 2 倍？** 因为 Python 内置的 `sum()` 本身就是 C 实现的，
> 已经很快了。**NumPy 的优势在"复杂运算"和"避免逐元素 Python 对象操作"上**，
> 而不是"任何操作都快 N 倍"。理解这一点很重要，避免盲目迷信。

### 答案 10

```python
import numpy as np

# students.csv 有中文表头和缺失值
# genfromtxt 读中文表头要小心，这里跳过第 1 行
data = np.genfromtxt(
    "../data/students.csv",
    delimiter=",",
    skip_header=1,
    dtype=None,              # None = 自动推断每列类型
    encoding="utf-8",
    names=None,
)
```

> ⚠️ **上面这种写法会遇到麻烦**：`students.csv` 里既有文本列（学号、姓名、班级）
> 又有数值列，还有缺失值。**`np.genfromtxt` 处理这种"混合类型 + 缺失值"
> 的表格非常吃力**——它会因为某一行缺值而把整列变成字符串。
>
> **这正是 pandas 存在的理由。** 我们下面用**更实际的做法**：
> 先只读数值部分。

```python
import numpy as np

# 用 Python 标准库 csv 读，只取数值列 —— 这是 NumPy 时代的老办法
import csv

rows = []
with open("../data/students.csv", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for r in reader:
        rows.append(r)

print("总行数:", len(rows))

# 提取需要的列（缺失值要处理成 nan）
def to_float(v):
    """空字符串转成 nan，其他转 float"""
    v = (v or "").strip()
    if v == "":
        return np.nan
    try:
        return float(v)
    except ValueError:
        return np.nan

study_hours = np.array([to_float(r["每周自习小时"]) for r in rows])
final_scores = np.array([to_float(r["期末成绩"]) for r in rows])
student_ids = np.array([r["学号"] for r in rows])

print("每周自习小时 形状:", study_hours.shape, "缺失:", np.isnan(study_hours).sum())
print("期末成绩     形状:", final_scores.shape, "缺失:", np.isnan(final_scores).sum())
```

> 输出：
```text
总行数: 300
每周自习小时 形状: (300,) 缺失: 12
期末成绩     形状: (300,) 缺失: 5
```

```python
import numpy as np

# 这里把上面的变量直接沿用（如果你单独跑这段，请先跑上一段）

print("1. 期末成绩统计（用 nan 版函数忽略缺失）:")
print(f"   有效数据个数: {(~np.isnan(final_scores)).sum()}")
print(f"   均值        : {np.nanmean(final_scores):.4f}")
print(f"   中位数      : {np.nanmedian(final_scores):.4f}")
print(f"   标准差      : {np.nanstd(final_scores):.4f}")
print(f"   最小值      : {np.nanmin(final_scores):.2f}")
print(f"   最大值      : {np.nanmax(final_scores):.2f}")

print("\n   对比：如果不忽略缺失会怎样？")
print(f"   普通 mean() = {final_scores.mean()}  ← 变成了 nan（被污染）")
```

> 输出：
```text
1. 期末成绩统计（用 nan 版函数忽略缺失）:
   有效数据个数: 295
   均值        : 71.3193
   中位数      : 71.1000
   标准差      : 11.4307
   最小值      : 38.90
   最大值      : 100.00

   对比：如果不忽略缺失会怎样？
   普通 mean() = nan  ← 变成了 nan（被污染）
```

```python
import numpy as np

# 2. 期末成绩最高的 5 位学生
# 技巧：把 nan 替换成 -inf，这样它们就不会被排到前面
scores_for_rank = np.where(np.isnan(final_scores), -np.inf, final_scores)
top5_idx = np.argsort(scores_for_rank)[::-1][:5]

print("2. 期末成绩 Top5:")
print(f"   {'排名':<6}{'学号':<12}{'期末成绩'}")
print("   " + "-" * 30)
for rank, idx in enumerate(top5_idx, 1):
    print(f"   {rank:<6}{student_ids[idx]:<12}{final_scores[idx]:.1f}")

# 3. 不及格统计
valid = final_scores[~np.isnan(final_scores)]
fail = valid[valid < 60]
print(f"\n3. 不及格统计:")
print(f"   有效成绩人数: {valid.size}")
print(f"   不及格人数  : {fail.size}")
print(f"   不及格率    : {fail.size / valid.size:.2%}")
print(f"   不及格成绩  : {np.sort(fail).round(1).tolist()[:10]}...")
```

> 输出：
```text
2. 期末成绩 Top5:
   排名    学号          期末成绩
   ------------------------------
   1     20230071    100.0
   2     20230238    100.0
   3     20230070    98.1
   4     20230020    96.5
   5     20230263    94.9

3. 不及格统计:
   有效成绩人数: 295
   不及格人数  : 44
   不及格率    : 14.92%
   不及格成绩  : [38.9, 40.1, 41.7, 43.3, 46.6, 47.2, 49.5, 49.8, 50.1, 50.1]...
```

```python
import numpy as np

# 4. 归一化与标准化
valid_mask = ~np.isnan(final_scores)
v = final_scores[valid_mask]

# Min-Max 归一化到 [0, 1]
minmax = (v - v.min()) / (v.max() - v.min())
# Z-score 标准化
zscore = (v - v.mean()) / v.std()

print("4. 两种变换的对比:")
print(f"   {'指标':<16}{'原始':>12}{'MinMax':>12}{'Z-score':>12}")
print("   " + "-" * 54)
print(f"   {'最小值':<16}{v.min():>12.2f}{minmax.min():>12.4f}{zscore.min():>12.4f}")
print(f"   {'最大值':<16}{v.max():>12.2f}{minmax.max():>12.4f}{zscore.max():>12.4f}")
print(f"   {'均值':<16}{v.mean():>12.2f}{minmax.mean():>12.4f}{zscore.mean():>12.4f}")
print(f"   {'标准差':<16}{v.std():>12.2f}{minmax.std():>12.4f}{zscore.std():>12.4f}")

print("\n   区别:")
print("   MinMax  → 范围固定在 [0,1]，但均值/标准差随数据变化")
print("   Z-score → 均值固定为 0、标准差固定为 1，但范围不固定")
print("\n   用途:")
print("   MinMax  ：需要固定范围的场景（如图像像素 0~255、神经网络输入）")
print("   Z-score ：需要比较'偏离平均水平多少个标准差'，也抗量纲差异")
```

> 输出：
```text
4. 两种变换的对比:
   指标                        原始      MinMax     Z-score
   ------------------------------------------------------
   最小值                    38.90      0.0000     -2.8362
   最大值                   100.00      1.0000      2.5091
   均值                     71.32      0.5306      0.0000
   标准差                    11.43      0.1871      1.0000

   区别:
   MinMax  → 范围固定在 [0,1]，但均值/标准差随数据变化
   Z-score → 均值固定为 0、标准差固定为 1，但范围不固定

   用途:
   MinMax  ：需要固定范围的场景（如图像像素 0~255、神经网络输入）
   Z-score ：需要比较'偏离平均水平多少个标准差'，也抗量纲差异
```

```python
import numpy as np

# 5. 相关系数
# 只保留两个变量都非缺失的行
both = (~np.isnan(study_hours)) & (~np.isnan(final_scores))
h = study_hours[both]
s = final_scores[both]
print("5. 相关性分析（样本量:", h.size, "）")

corr = np.corrcoef(h, s)[0, 1]
print(f"   每周自习小时 与 期末成绩 的相关系数: {corr:.4f}")

# 解读
abs_corr = abs(corr)
if abs_corr >= 0.6:
    strength = "强"
elif abs_corr >= 0.4:
    strength = "中等"
elif abs_corr >= 0.2:
    strength = "弱"
else:
    strength = "几乎无"
print(f"   强度判断: {strength}相关（|r| = {abs_corr:.3f}）")
print(f"   方向: {'正' if corr > 0 else '负'}相关")

# 用分组对比印证
print("\n   交叉验证：按自习时长分 3 组看平均成绩")
q1, q2 = np.percentile(h, [33.3, 66.7])
groups = {
    f"低({h.min():.1f}-{q1:.1f}h)": s[h <= q1],
    f"中({q1:.1f}-{q2:.1f}h)": s[(h > q1) & (h <= q2)],
    f"高({q2:.1f}-{h.max():.1f}h)": s[h > q2],
}
for name, g in groups.items():
    print(f"     {name:<20} 人数 {g.size:>3}  平均成绩 {g.mean():.2f}")
print("\n   结论：自习时间越多，平均成绩越高，与相关系数的方向一致。")
print("   注意：这只能说明'相关'，不能证明'多自习一定导致成绩提高'——")
print("        也可能是'学习能力强的学生更愿意自习'（反向因果/共同原因）。")
```

> 输出：
```text
5. 相关性分析（样本量: 283 ）
   每周自习小时 与 期末成绩 的相关系数: 0.3519
   强度判断: 弱相关（|r| = 0.352）
   方向: 正相关

   交叉验证：按自习时长分 3 组看平均成绩
     低(0.0-9.9h)          人数  94  平均成绩 67.57
     中(9.9-13.8h)         人数  96  平均成绩 70.44
     高(13.8-24.4h)        人数  93  平均成绩 76.30

   结论：自习时间越多，平均成绩越高，与相关系数的方向一致。
   注意：这只能说明'相关'，不能证明'多自习一定导致成绩提高'——
        也可能是'学习能力强的学生更愿意自习'（反向因果/共同原因）。
```

> 💡 **这一题的三个重要教学点**：
> 1. **`np.genfromtxt` 处理"混合类型 + 缺失值"的表格很吃力**——
>    这就是 pandas 存在的意义。第 4 章你会看到同一件事用 pandas 有多简单。
> 2. **算相关系数前必须处理缺失值**。上面的做法是"只保留两个变量都有的行"
>    （成对删除），这是最简单的方式，但**当缺失比例高时会损失大量样本**。
>    第 5 章会讲更严谨的缺失值处理策略。
> 3. **相关系数 0.645 只是"相关"**。要下"多自习能提高成绩"的因果结论，
>    需要控制其他变量（如高考数学分、是否参加辅导班），或者做随机实验。

---

## 3.15 下一章预告

你现在掌握了 NumPy 这个"数学引擎"。但如你所见，
**用 NumPy 处理表格数据（按城市分组、处理缺失值、读取 CSV）实在太麻烦了**——
上面练习 10 为了算个分组平均，写了一堆代码。

第 04 章《Pandas 数据分析》就是来解决这个问题的。它是**整门课最重要的一章**：

- `Series` 和 `DataFrame`：带列名的数据结构
- 一行代码搞定分组聚合：`df.groupby("城市")["销售额"].sum()`
- 自动处理缺失值、日期、字符串
- 强大的筛选、合并、透视能力
- **而它的底层，就是你刚学的 NumPy 数组**

> 所以第 3 章没有白学：pandas 里的向量化、布尔索引、广播，
> 全都是本章的知识。**这一章是地基，第 4 章是房子。**
