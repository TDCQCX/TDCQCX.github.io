---
title: SQL 基础教程 — 从查询语句到多表关联
date: 2026-09-21 14:00:00
permalink: /2026/09/21/sql-basics/
categories:
- 技术教程
tags:
- SQL
- 数据库
- 后端
- 工具
keywords: SQL 教程, 数据库入门, SELECT, JOIN, GROUP BY, 索引, 事务, 子查询, 数据库基础
cover: /post-covers/sql-basics.jpg
banner:
  type: img
  bgurl: /post-covers/sql-basics.jpg
  banner_text: SQL 基础教程 — 从查询语句到多表关联
toc: true
comments: true
---

# SQL 基础教程 — 从查询语句到多表关联

> 这篇教程面向"要开始接触数据库，但还没写过 SQL"的读者。语法以标准 SQL 为主，示例在 MySQL / PostgreSQL / SQLite 上都能跑。
> 前 5 节覆盖日常 90% 的查询场景，第 6 节之后涉及关联、聚合、索引与事务。

## 目录

1. [数据库与表的基本概念](#1-数据库与表的基本概念)
2. [SELECT：查询的骨架](#2-select查询的骨架)
3. [WHERE：筛选出你要的行](#3-where筛选出你要的行)
4. [排序、去重与分页](#4-排序去重与分页)
5. [增删改：写入数据](#5-增删改写入数据)
6. [聚合与分组](#6-聚合与分组)
7. [多表关联 JOIN](#7-多表关联-join)
8. [子查询与集合运算](#8-子查询与集合运算)
9. [表约束与数据类型](#9-表约束与数据类型)
10. [索引：为什么查询会快](#10-索引为什么查询会快)
11. [事务：要么全成功，要么全失败](#11-事务要么全成功要么全失败)
12. [安全：SQL 注入与参数化查询](#12-安全sql-注入与参数化查询)
13. [常见问题 FAQ](#13-常见问题-faq)

---

## 1. 数据库与表的基本概念

关系型数据库把数据放在**表**里，表由**行**（记录）和**列**（字段）组成。可以把它想成一堆严格约束过的 Excel 表格：

- 每个表有固定的列名和数据类型；
- 每一行代表一条完整记录；
- 表之间通过**主键**和**外键**建立关系。

一篇教程的示例数据长这样：

```
users 表
+----+--------+----------------------+--------+
| id | name   | email                | city   |
+----+--------+----------------------+--------+
| 1  | 张明   | zhangming@example.com | 成都   |
| 2  | 李华   | lihua@example.com     | 北京   |
| 3  | 王芳   | wangfang@example.com  | 成都   |
+----+--------+----------------------+--------+

orders 表
+----+---------+--------+-------+
| id | user_id | amount | month |
+----+---------+--------+-------+
| 1  | 1       | 99.00  | 1     |
| 2  | 1       | 199.00 | 2     |
| 3  | 3       | 50.00  | 2     |
+----+---------+--------+-------+
```

`orders.user_id` 指向 `users.id`——这就是**外键关系**。第 7 节会用它演示关联查询。

### SQL 语句的分类

| 类别 | 代表语句 | 用途 |
|---|---|---|
| DQL | `SELECT` | 查询数据 |
| DML | `INSERT` / `UPDATE` / `DELETE` | 增删改数据 |
| DDL | `CREATE` / `ALTER` / `DROP` | 定义表结构 |
| DCL | `GRANT` / `REVOKE` | 权限管理 |
| TCL | `COMMIT` / `ROLLBACK` | 事务控制 |

日常开发 80% 的时间花在 DQL 上。

> **约定**：本文用大写写 SQL 关键字（`SELECT`、`FROM`），表名列名用小写。这只是习惯，SQL 本身不区分大小写——但**字符串字面量区分**，别把数据写成大写了。

---

## 2. SELECT：查询的骨架

最小的查询：

```sql
SELECT * FROM users;
```

`*` 表示"所有列"。虽然写起来方便，但**生产代码里应避免**，理由有三个：

1. 表结构一变（加了大字段），查询结果和传输量都跟着变；
2. 明确列出字段能让数据库有机会走"覆盖索引"，性能更好；
3. 读者一眼就知道这条查询需要哪些数据。

```sql
-- 推荐写法
SELECT id, name, city FROM users;
```

### 给列起别名

```sql
SELECT
    id,
    name AS 姓名,
    email AS 邮箱
FROM users;
```

`AS` 可以省略（`name 姓名`），但加上更清晰。

### 对列做计算

```sql
SELECT
    id,
    name,
    amount,
    amount * 0.9 AS discounted
FROM orders;
```

### 拼接字符串

不同数据库的拼接运算符不同：

```sql
-- 标准 / PostgreSQL / SQLite
SELECT name || '(' || city || ')' AS label FROM users;

-- MySQL
SELECT CONCAT(name, '(', city, ')') AS label FROM users;
```

---

## 3. WHERE：筛选出你要的行

`WHERE` 决定哪些行进入结果集。语法是"列 运算符 值"。

```sql
SELECT id, name FROM users WHERE city = '成都';
```

### 比较运算符

| 运算符 | 含义 | 示例 |
|---|---|---|
| `=` | 等于 | `city = '成都'` |
| `<>` 或 `!=` | 不等于 | `city <> '北京'` |
| `>` `<` `>=` `<=` | 大小比较 | `amount > 100` |
| `BETWEEN ... AND ...` | 闭区间 | `amount BETWEEN 50 AND 200` |
| `IN (...)` | 属于其中之一 | `city IN ('成都', '北京')` |
| `LIKE` | 模糊匹配 | `name LIKE '张%'` |
| `IS NULL` | 是空值 | `email IS NULL` |

### AND / OR / NOT 的优先级

```sql
-- 想表达: 成都的用户 或者 北京且金额大于100的订单? 这样写是错的
SELECT * FROM users WHERE city = '成都' OR city = '北京' AND amount > 100;

-- 正确: 用括号明确分组
SELECT * FROM users WHERE city = '成都' OR (city = '北京' AND amount > 100);
```

**`AND` 的优先级高于 `OR`**，所以只要混用就加括号。这是最常见的逻辑错误来源。

### LIKE 的通配符

```sql
SELECT * FROM users WHERE name LIKE '张%';    -- 以"张"开头
SELECT * FROM users WHERE name LIKE '%明';    -- 以"明"结尾
SELECT * FROM users WHERE name LIKE '%华%';   -- 包含"华"
SELECT * FROM users WHERE name LIKE '_明';    -- 两个字且第二个是"明"
```

`%` 匹配任意长度（含 0），`_` 匹配恰好一个字符。

> **性能提醒**：`LIKE '%关键词%'` 这种前置通配符会让索引失效，数据量大时非常慢。全文检索应该用数据库的全文索引功能（如 PostgreSQL 的 `tsvector`）或专门的搜索引擎。

### NULL 的特殊性

`NULL` 表示"未知"，它不等于任何值，**连自己都不等于**：

```sql
-- 错误: 永远查不到结果
SELECT * FROM users WHERE email = NULL;

-- 正确
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;
```

同理，`NULL` 参与任何算术或比较运算，结果通常还是 `NULL`。

---

## 4. 排序、去重与分页

### ORDER BY 排序

```sql
SELECT id, name, amount FROM orders ORDER BY amount DESC;
SELECT id, name FROM users ORDER BY city ASC, name DESC;
```

- `ASC` 升序（默认，可省略），`DESC` 降序；
- 多列排序按书写顺序依次生效：先按 `city` 排，同一个 city 内再按 `name` 倒序。

### LIMIT / OFFSET 分页

```sql
-- 第 1 页: 前 10 条
SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 0;

-- 第 2 页
SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 10;
```

要点：

- **分页必须配合 `ORDER BY`**。没有排序时，"前 10 条"的顺序由数据库自行决定，翻页可能重复或漏数据。
- **`OFFSET` 越大越慢**。数据库仍需扫描并丢弃前面所有行。数据量很大时改用"游标分页"：

  ```sql
  -- 记住上一页最后一条的 id, 下一页从它之后取
  SELECT * FROM orders WHERE id > 100 ORDER BY id LIMIT 10;
  ```

### DISTINCT 去重

```sql
SELECT DISTINCT city FROM users;
```

`DISTINCT` 作用于**整行**——`SELECT DISTINCT city, name` 是"城市+姓名"这个组合去重，不是只对城市去重。

---

## 5. 增删改：写入数据

### INSERT 插入

```sql
-- 指定列, 推荐: 不受表结构顺序影响
INSERT INTO users (name, email, city)
VALUES ('赵敏', 'zhaomin@example.com', '上海');

-- 一次插入多行
INSERT INTO users (name, email, city)
VALUES
    ('孙涛', 'suntao@example.com', '广州'),
    ('周静', 'zhoujing@example.com', '上海');
```

> 显式列出列名是个好习惯。一旦表结构变动或列顺序调整，没写列名的语句会静默地插错位置。

### UPDATE 更新

```sql
UPDATE users
SET city = '重庆'
WHERE id = 3;
```

> **务必带 `WHERE`**。漏掉条件的 `UPDATE` 会更新全表所有行，这是生产事故的经典成因。
> 建议习惯：先写 `SELECT * FROM users WHERE 条件` 确认识别到的行，再把 `SELECT *` 换 `UPDATE ... SET`。

### DELETE 删除

```sql
DELETE FROM orders WHERE id = 3;
```

同样**必须检查 `WHERE`**。若想清空整表且不需要回滚，`TRUNCATE TABLE 表名` 比 `DELETE FROM 表名` 快得多（但它不进事务日志）。

### 安全地做批量修改

```sql
-- 1. 先用 SELECT 核对影响范围
SELECT COUNT(*) FROM users WHERE city = '成都';

-- 2. 在事务里执行, 确认无误再提交
BEGIN;
UPDATE users SET city = '蓉城' WHERE city = '成都';
SELECT COUNT(*) FROM users WHERE city = '蓉城';
COMMIT;   -- 有问题就改成 ROLLBACK
```

---

## 6. 聚合与分组

聚合函数把多行压成一行：

| 函数 | 作用 |
|---|---|
| `COUNT()` | 计数 |
| `SUM()` | 求和 |
| `AVG()` | 平均值 |
| `MAX()` / `MIN()` | 最大 / 最小 |

```sql
-- 全表统计
SELECT
    COUNT(*)    AS 订单数,
    SUM(amount) AS 总金额,
    AVG(amount) AS 平均金额,
    MAX(amount) AS 最大单笔
FROM orders;
```

### GROUP BY 分组统计

```sql
-- 每个用户的订单数与消费总额
SELECT
    user_id,
    COUNT(*)    AS order_count,
    SUM(amount) AS total
FROM orders
GROUP BY user_id;
```

### 执行顺序（理解 SQL 的关键）

SQL 的**书写顺序**和**执行顺序**不同：

```
书写顺序: SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY -> LIMIT
执行顺序: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
```

这解释了两个常见困惑：

1. **为什么 `WHERE` 里不能用聚合函数？** 因为 `WHERE` 在 `GROUP BY` 之前执行，那时还没有分组结果。要过滤分组结果用 `HAVING`：

   ```sql
   -- 找出消费总额超过 150 的用户
   SELECT user_id, SUM(amount) AS total
   FROM orders
   GROUP BY user_id
   HAVING SUM(amount) > 150;
   ```

2. **为什么 `SELECT` 里定义的别名不能在 `WHERE` 用？** 同上，`SELECT` 在 `WHERE` 之后才被计算。但 `ORDER BY` 在 `SELECT` 之后，所以可以用别名。

### WHERE 与 HAVING 的对照

| | `WHERE` | `HAVING` |
|---|---|---|
| 过滤对象 | 原始行 | 分组后的结果 |
| 能否用聚合函数 | 不能 | 能 |
| 执行时机 | `GROUP BY` 前 | `GROUP BY` 后 |

**先把能过滤的行用 `WHERE` 过滤掉，性能更好**——数据量小了，分组的开销才小。

---

## 7. 多表关联 JOIN

关联查询把多张表按条件拼在一起，是关系型数据库的核心能力。

### INNER JOIN：只保留两边都匹配的行

```sql
SELECT
    u.name,
    o.amount,
    o.month
FROM users AS u
INNER JOIN orders AS o ON o.user_id = u.id;
```

结果只包含"既在 users 里、又在 orders 里有订单"的用户。用表格数据看：

| name | amount | month |
|---|---|---|
| 张明 | 99.00 | 1 |
| 张明 | 199.00 | 2 |
| 王芳 | 50.00 | 2 |

李华没有订单，所以不出现。

### LEFT JOIN：保留左表全部行

```sql
SELECT
    u.name,
    COALESCE(SUM(o.amount), 0) AS total
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.name;
```

结果：

| name | total |
|---|---|
| 李华 | 0 |
| 张明 | 298.00 |
| 王芳 | 50.00 |

李华被保留，订单金额为 0。`LEFT JOIN` 是"以左表为准"的关联，常用于"查所有用户，包括还没下单的"。

> 上面用 `COALESCE(SUM(o.amount), 0)` 而不是 `SUM(o.amount)` 的原因：李华在 `orders` 里没有匹配行，`SUM` 会返回 `NULL`。`COALESCE` 把 `NULL` 换成 0，输出更好看。

### 四种 JOIN 一览

| 类型 | 保留哪边的行 |
|---|---|
| `INNER JOIN` | 只保留两边都匹配的 |
| `LEFT JOIN` | 左表全部 + 右表匹配的（右表缺失填 `NULL`） |
| `RIGHT JOIN` | 右表全部 + 左表匹配的 |
| `FULL OUTER JOIN` | 两边全部（MySQL 不支持，需用 `UNION` 模拟） |

### JOIN 的三个实用建议

1. **一定要写 `ON` 条件**。漏写会变成笛卡尔积——两张各 1 万行的表会产出 1 亿行，直接把数据库拖垮（MySQL 里写成 `CROSS JOIN` 才表示有意为之）。
2. **小表驱动大表**。多数优化器能自动处理，但知道这个原则有助于理解执行计划。
3. **关联字段必须有索引**。外键列上没有索引时，`JOIN` 的代价会随数据量急剧上升。

---

## 8. 子查询与集合运算

### 标量子查询（返回单个值）

```sql
-- 查询金额高于平均值的订单
SELECT id, amount
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);
```

### IN 子查询（返回一列）

```sql
-- 查询有订单的用户
SELECT name FROM users
WHERE id IN (SELECT user_id FROM orders);
```

### EXISTS 子查询

```sql
-- 同上, 但通常更快: 找到一条匹配就立即返回, 不必取出全部结果
SELECT name FROM users AS u
WHERE EXISTS (
    SELECT 1 FROM orders AS o WHERE o.user_id = u.id
);
```

`IN` 与 `EXISTS` 的取舍：子查询结果集小用 `IN` 更直观，外层表小、内层表大时 `EXISTS` 往往更快。

### UNION 合并结果

```sql
SELECT name, 'user' AS source FROM users
UNION
SELECT name, 'vip' AS source FROM vip_users;
```

- `UNION` 会**去重**；
- `UNION ALL` 保留全部（包括重复行），也更快——不需要排序去重。**确定没有重复或不在乎重复时优先用 `UNION ALL`**。

---

## 9. 表约束与数据类型

```sql
CREATE TABLE users (
    id       INTEGER      PRIMARY KEY AUTOINCREMENT,
    name     VARCHAR(50)  NOT NULL,
    email    VARCHAR(120) NOT NULL UNIQUE,
    city     VARCHAR(50)  DEFAULT '未知',
    age      INTEGER      CHECK (age >= 0 AND age <= 150),
    created  DATETIME     DEFAULT CURRENT_TIMESTAMP
);
```

### 常用约束

| 约束 | 作用 |
|---|---|
| `PRIMARY KEY` | 主键，唯一且非空，一张表只能有一个 |
| `NOT NULL` | 不允许为空 |
| `UNIQUE` | 值必须唯一（允许 NULL） |
| `DEFAULT` | 不填时的默认值 |
| `CHECK` | 值必须满足的表达式 |
| `FOREIGN KEY` | 引用另一张表的主键 |

### 数据类型选择建议

| 场景 | 推荐 | 说明 |
|---|---|---|
| 主键 | `INTEGER` 自增 或 `UUID` | 自增省空间；UUID 便于分布式生成 |
| 短文本 | `VARCHAR(n)` | `n` 按实际需要设，别一律 255 |
| 长文本 | `TEXT` | 不限长度 |
| 金额 | `DECIMAL(10,2)` | **绝不用 `FLOAT`**，浮点会丢精度 |
| 时间 | `DATETIME` / `TIMESTAMP` | 存 UTC，展示时再转本地时区 |
| 布尔 | `BOOLEAN` / `TINYINT(1)` | 依数据库而定 |

> **金额为什么不能用浮点**：`0.1 + 0.2` 在二进制浮点下等于 `0.30000000000000004`。财务数据必须用定点小数类型，否则累加会出现分位误差。同理，时间要存 UTC，避免跨时区时出现莫名的偏移。

### 外键与级联

```sql
CREATE TABLE orders (
    id      INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

`ON DELETE CASCADE` 表示删除用户时自动删掉他的订单。级联很方便，但要谨慎——它能一次删除大量数据，且不易察觉。

---

## 10. 索引：为什么查询会快

没有索引时，数据库要**逐行扫描**整张表（全表扫描）才能找到目标行。索引相当于书的目录，让数据库直接跳到目标位置。

### 建索引

```sql
-- 单列索引
CREATE INDEX idx_users_city ON users(city);

-- 复合索引
CREATE INDEX idx_orders_user_month ON orders(user_id, month);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 删除索引
DROP INDEX idx_users_city;
```

### 什么时候该建索引

**该建**：

- `WHERE` 里频繁出现的列；
- `JOIN` 的关联列（外键列）；
- `ORDER BY` / `GROUP BY` 用到的列。

**不该建**：

- 区分度极低的列（如性别只有两种值，索引几乎没用）；
- 极少被查询的列；
- 频繁大量写入的表上不要堆太多索引。

### 索引的代价

索引不是免费的：

1. **占空间**：复合索引可能和表本身差不多大；
2. **拖慢写入**：每次 `INSERT` / `UPDATE` / `DELETE` 都要同步维护索引。

所以"索引越多越好"是错的。**只给真正需要的查询建索引。**

### 复合索引的最左前缀原则

`idx_orders_user_month (user_id, month)` 这个索引：

| 查询条件 | 能否用上索引 |
|---|---|
| `WHERE user_id = 1` | 能 |
| `WHERE user_id = 1 AND month = 2` | 能 |
| `WHERE month = 2` | **不能** |
| `WHERE month = 2 AND user_id = 1` | 能（优化器会自动重排） |

**索引按从左到右的顺序生效**，跳过最左列就用不上。

### 索引失效的常见写法

```sql
-- 索引失效: 对列做了函数运算
SELECT * FROM users WHERE UPPER(name) = 'ZHANGMING';

-- 索引失效: 前置通配符
SELECT * FROM users WHERE name LIKE '%明';

-- 索引失效: 隐式类型转换(若 id 是字符串类型)
SELECT * FROM users WHERE id = 123;
```

### 用执行计划确认

不要凭猜。用 `EXPLAIN` 看数据库实际打算怎么执行：

```sql
EXPLAIN SELECT * FROM users WHERE city = '成都';

-- MySQL 里更详细的输出
EXPLAIN ANALYZE SELECT * FROM users WHERE city = '成都';
```

关注输出里的访问类型：出现 `ALL`（全表扫描）通常意味着需要优化，`ref` / `range` / `const` 表示用上了索引。

---

## 11. 事务：要么全成功，要么全失败

转账是经典例子：A 账户扣 100、B 账户加 100，这两个操作必须一起成功。如果只完成了前半步，钱就凭空消失了。

```sql
BEGIN;                                        -- 开启事务

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;                                       -- 全部生效
-- 若中途发现异常:
-- ROLLBACK;                                  -- 全部撤销
```

### ACID 四个特性

| 特性 | 含义 |
|---|---|
| **原子性** Atomicity | 事务内的操作要么全做，要么全不做 |
| **一致性** Consistency | 事务前后数据满足所有约束 |
| **隔离性** Isolation | 并发事务互不干扰（靠隔离级别控制） |
| **持久性** Durability | 提交后即使断电也不丢失 |

### 隔离级别与并发问题

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---|---|---|---|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 否 | 可能 | 可能 |
| REPEATABLE READ | 否 | 否 | 可能 |
| SERIALIZABLE | 否 | 否 | 否 |

级别越高越安全，但并发性能越差。多数数据库默认 `READ COMMITTED`（MySQL InnoDB 默认 `REPEATABLE READ`）。

### 死锁

两个事务互相等待对方持有的锁时形成死锁，数据库会检测到并**回滚其中一个**。应用层需要能处理这种失败——捕获异常后重试整个事务。

降低死锁概率的做法：

1. **统一加锁顺序**。所有事务都按相同顺序访问表/行；
2. **缩短事务**。不要在事务里做网络请求、文件 IO 或等用户输入；
3. **让事务尽快拿到锁**，减少交叉等待的窗口。

> **重要提醒**：事务应该尽量短。把一次 HTTP 请求放在事务中间，会长时间持有锁，在高并发下迅速演变成大面积超时。

---

## 12. 安全：SQL 注入与参数化查询

这是数据库相关最严重的风险。看一个反面例子：

```python
# 危险! 千万不要这样写
sql = "SELECT * FROM users WHERE name = '" + user_input + "'"
cursor.execute(sql)
```

如果 `user_input` 传入 `' OR '1'='1`，拼出来的语句变成：

```sql
SELECT * FROM users WHERE name = '' OR '1'='1'
```

条件恒为真，整张表的数据都被返回。更糟的输入还能附加 `DROP TABLE` 之类的语句。

### 正确做法：参数化查询

```python
# 正确: 用占位符, 让数据库把输入当作"值"而不是"代码"
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))
```

不同驱动的占位符写法：

| 驱动 | 占位符 |
|---|---|
| Python sqlite3 | `?` |
| Python psycopg | `%s` |
| Java JDBC | `?` |
| PHP PDO | `:name` 或 `?` |
| Node.js mysql2 | `?` |

**关键点**：参数化查询不是"转义字符串"，而是把 SQL 语句和参数分成两条通道传给数据库。语句结构在参数到达前就已经编译完成，因此输入无法改变语句语义。

### 其他防护措施

1. **最小权限原则**。应用连接数据库的账号只给必需的权限，不要用 root。Web 应用通常只需要 `SELECT/INSERT/UPDATE/DELETE`，不需要 `DROP`。
2. **限制输入长度与类型**，在应用层先做一层校验。
3. **不要把数据库错误详情返回给前端**，错误信息会暴露表结构。
4. **ORM 不是绝对安全**。ORM 的原始 SQL 接口同样可能被注入，拼接字符串的地方要格外小心。

---

## 13. 常见问题 FAQ

**Q：`WHERE` 和 `HAVING` 到底怎么选？**

能放在 `WHERE` 的过滤条件就放 `WHERE`（在分组前减少数据量，性能更好）；只有需要过滤**聚合结果**时才用 `HAVING`。

**Q：`COUNT(*)` 和 `COUNT(列名)` 有什么区别？**

`COUNT(*)` 统计所有行；`COUNT(列名)` **不统计该列为 `NULL` 的行**。想要"总行数"用 `COUNT(*)`。

**Q：为什么我的查询有时快有时慢？**

常见原因：数据量增长导致原本能走索引的查询退化为全表扫描；参数不同导致执行计划不同；并发高时锁等待。用 `EXPLAIN ANALYZE` 看实际执行情况，别猜。

**Q：`DELETE`、`TRUNCATE`、`DROP` 的区别？**

- `DELETE FROM t`：删行，可带 `WHERE`，可回滚，逐行记录日志，慢；
- `TRUNCATE TABLE t`：清空整表，不可带 `WHERE`，通常不可回滚，极快，会重置自增值；
- `DROP TABLE t`：连表结构一起删除。

**Q：一个查询里能用多少张表 JOIN？**

语法上没有硬限制，但超过 5-6 张表的关联通常说明数据模型需要调整，或者应该拆成多个查询在应用层组合。表越多，优化器越难选到好的执行计划。

**Q：`NULL` 参与计算会怎样？**

几乎任何运算结果都是 `NULL`。用 `COALESCE(列, 默认值)` 或 `IFNULL(列, 默认值)`（MySQL）给个兜底值。判断是否为空必须用 `IS NULL`，不能用 `= NULL`。

**Q：怎么找出重复数据？**

```sql
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```

**Q：`VARCHAR(255)` 是不是万能的？**

不是。长度限制是数据校验的一部分，按业务实际需要设置更合理。另外很多数据库里索引有长度上限，过长的 `VARCHAR` 列可能无法建索引或只能建前缀索引。

