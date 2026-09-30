---
title: jq 基础教程 — 命令行处理 JSON 数据
date: 2026-09-23 14:00:00
permalink: /2026/09/23/jq-basics/
categories:
- 技术教程
tags:
- jq
- JSON
- 命令行
- 工具
keywords: jq 教程, JSON 处理, 命令行 JSON, 过滤器, 管道, select, map, 数据提取, API 调试
cover: /post-covers/jq-basics.jpg
banner:
  type: img
  bgurl: /post-covers/jq-basics.jpg
  banner_text: jq 基础教程 — 命令行处理 JSON 数据
toc: true
comments: true
---

# jq 基础教程 — 命令行处理 JSON 数据

> 接口返回一大坨 JSON，肉眼找出某个字段很痛苦。jq 是 JSON 的 `sed`/`awk`：用一条表达式就能过滤、提取、重组数据。
> 这篇教程按"先能取出值，再会筛选和重组"的顺序讲，所有示例都可以直接复制执行。

## 目录

1. [jq 是什么，解决什么问题](#1-jq-是什么解决什么问题)
2. [安装与第一个查询](#2-安装与第一个查询)
3. [访问字段与数组](#3-访问字段与数组)
4. [管道：把多个过滤器串起来](#4-管道把多个过滤器串起来)
5. [数组操作：map 与迭代](#5-数组操作map-与迭代)
6. [筛选：select 与条件表达式](#6-筛选select-与条件表达式)
7. [构造新对象与数组](#7-构造新对象与数组)
8. [排序、去重与聚合](#8-排序去重与聚合)
9. [常用内置函数](#9-常用内置函数)
10. [输出格式控制](#10-输出格式控制)
11. [实战案例](#11-实战案例)
12. [常见问题 FAQ](#12-常见问题-faq)

---

## 1. jq 是什么，解决什么问题

jq 是一个命令行 JSON 处理器。它把 JSON 当作**流**来处理：输入 JSON，经过一系列**过滤器**，输出新的 JSON 或纯文本。

对比一下"取 API 里所有用户的邮箱"这件事：

```bash
# 没有 jq: 靠 grep 和正则, 脆弱且容易出错
curl -s https://api.example.com/users | grep -o '"email":"[^"]*"' | cut -d'"' -f4

# 有 jq: 明确表达"取每个元素的 email 字段"
curl -s https://api.example.com/users | jq -r '.[].email'
```

后者的优势在于**它理解 JSON 的结构**，不受缩进、字段顺序、嵌套层级影响。grep 的做法遇到字段名里出现 `email` 就会误匹配。

### 什么时候用 jq

- 调试 API：快速看清返回结构、提取目标字段；
- 处理日志：日志是 JSON 行格式时，jq 能高效统计和过滤；
- 写脚本：把 JSON 配置转成 shell 变量；
- 数据转换：JSON 转 CSV、重塑结构。

---

## 2. 安装与第一个查询

### 安装

```bash
# Debian / Ubuntu
sudo apt install jq

# macOS
brew install jq

# Windows (scoop)
scoop install jq
# 或者下载 jq.exe 放进 PATH
```

验证：

```bash
jq --version
# jq-1.7.1
```

### 准备示例数据

```bash
cat > users.json << 'EOF'
{
  "total": 3,
  "users": [
    { "id": 1, "name": "张明", "age": 28, "city": "成都", "active": true,  "tags": ["java", "sql"] },
    { "id": 2, "name": "李华", "age": 34, "city": "北京", "active": false, "tags": ["vue"] },
    { "id": 3, "name": "王芳", "age": 25, "city": "成都", "active": true,  "tags": ["python", "sql"] }
  ]
}
EOF
```

### 最简单的一次调用

```bash
jq '.' users.json
```

`.` 是**恒等过滤器**（identity），输出和输入完全相同，只是重新格式化了。它的实际用途是**把压缩的一行 JSON 展开成可读格式**：

```bash
echo '{"a":1,"b":{"c":2}}' | jq .
```

输出：

```json
{
  "a": 1,
  "b": {
    "c": 2
  }
}
```

> 如果你只想要这个"美化"功能，`python -m json.tool` 也能做。jq 的价值在于后面的过滤能力。

---

## 3. 访问字段与数组

### 取字段

```bash
jq '.total' users.json          # 3
jq '.users' users.json          # 整个数组
```

### 取数组元素

```bash
jq '.users[0]' users.json       # 第一个元素
jq '.users[-1]' users.json      # 最后一个元素(负数从末尾数)
jq '.users[0:2]' users.json     # 前两个(切片)
```

### 链式访问

```bash
jq '.users[0].name' users.json  # "张明"
jq '.users[0].tags[1]' users.json  # "sql"
```

### 安全访问：? 运算符

字段不存在时 jq 会报错：

```bash
echo '{"a":1}' | jq '.b.c'
# jq: error: Cannot index null with "c"
```

加 `?` 让缺失路径返回 `null` 而不报错：

```bash
echo '{"a":1}' | jq '.b.c?'
# null
```

在处理结构不稳定的第三方 API 响应时，`?` 很实用。

### 遍历数组的所有元素

```bash
jq '.users[]' users.json        # 逐个输出每个用户对象
jq '.users[].name' users.json   # 逐个输出每个名字
```

`[]`（不加索引）表示"展开数组的每一项"。

### 可选链与默认值

```bash
# 取不到的字段给个默认值
jq '.users[] | .nickname // "未设置"' users.json
```

`//` 是"备用运算符"：左边为 `null` 或 `false` 时取右边的值。

---

## 4. 管道：把多个过滤器串起来

`|` 把左边过滤器的输出交给右边，和 shell 管道的思路一致。

```bash
jq '.users | length' users.json           # 3
jq '.users | .[0] | .name' users.json     # "张明"
jq '.users[] | .city' users.json          # 逐个输出城市
```

等价改写：`.users[0].name` 和 `.users | .[0] | .name` 结果一样。**用管道把长路径拆开，可读性更好**，尤其是需要在中途做转换时。

### 管道的实际用法：先取再筛

```bash
jq '.users | map(select(.active)) | .[].name' users.json
```

读法："取 users 数组 → 只保留 active 为真的 → 输出每个名字"。

### `,` 组合多个输出

```bash
jq '.total, .users[0].name' users.json
# 3
# "张明"
```

逗号让同一个输入产生多个输出，等同于把两条查询合并执行。

---

## 5. 数组操作：map 与迭代

### map：对每个元素做转换

```bash
# 取出所有名字
jq '.users | map(.name)' users.json
# ["张明", "李华", "王芳"]

# 每个用户拼一句描述
jq '.users | map("\\(.name) 来自 \\(.city)")' users.json
# ["张明 来自 成都", "李华 来自 北京", "王芳 来自 成都"]
```

`map(f)` 等价于 `[.[] | f]`——对每个元素应用 f，再把结果收成一个数组。**它保留数组结构**，而 `.users[].name` 输出的是一串独立的字符串。

### map 与 [] 的区别

| 表达式 | 输出 |
|---|---|
| `.users[].name` | 三个独立的值（可以逐个处理） |
| `.users \| map(.name)` | 一个数组 `["张明","李华","王芳"]` |

**要后续整体处理（排序、统计）就用 map；只是遍历输出就用 `[]`。**

### 字符串插值

jq 1.6 起支持 `\\(...)` 插值：

```bash
jq -r '.users[] | "\\(.id)\\t\\(.name)\\t\\(.city)"' users.json
```

配合 `-r` 输出原始文本，可以生成制表符分隔的数据，方便导入表格软件。

### 操作多个字段

```bash
# 每个用户取 name 和 city 两个字段
jq '.users[] | {name, city}' users.json
```

`{name, city}` 是 `{"name": .name, "city": .city}` 的简写——**当键名和字段名相同时可以省略冒号右侧**。

---

## 6. 筛选：select 与条件表达式

### select：按条件过滤

```bash
# 只要成都的用户
jq '.users[] | select(.city == "成都")' users.json

# 只要活跃用户的名字
jq -r '.users[] | select(.active) | .name' users.json
# 张明
# 王芳
```

### 比较运算符

```bash
jq '.users[] | select(.age > 30)' users.json          # 年龄大于 30
jq '.users[] | select(.age >= 25 and .age <= 30)' users.json
jq '.users[] | select(.city == "成都" or .city == "北京")'
jq '.users[] | select(.name != "李华")'
```

### 判断字段存在与类型

```bash
jq '.users[] | select(.email != null)' users.json      # 有 email 字段的
jq '.users[] | select(has("tags"))' users.json         # 含 tags 键的
jq '.users[] | select(.tags | type == "array")' users.json
```

### 字符串匹配

```bash
# 正则匹配
jq '.users[] | select(.name | test("明"))' users.json

# 包含子串
jq '.users[] | select(.name | contains("芳"))' users.json

# 前缀匹配
jq '.users[] | select(.name | startswith("张"))' users.json

# 不区分大小写的正则
jq '.users[] | select(.city | test("成都"; "i"))' users.json
```

### 数组包含判断

```bash
# tags 里含 "sql" 的用户
jq '.users[] | select(.tags | index("sql"))' users.json

# 用 any 检查
jq '.users[] | select(.tags | any(. == "sql"))' users.json
```

### 筛选后保留原结构

```bash
# 输出是数组而非流
jq '.users | map(select(.active))' users.json
jq '{ total: (.users | map(select(.active)) | length), users: (.users | map(select(.active))) }' users.json
```

### 条件表达式 if-then-else

```bash
jq '.users[] | if .age >= 30 then "\\(.name) 是资深" else "\\(.name) 是新人" end' -r users.json
```

---

## 7. 构造新对象与数组

### 构造对象

```bash
jq '.users[] | { id, name, 城市: .city }' users.json
```

输出：

```json
{
  "id": 1,
  "name": "张明",
  "城市": "成都"
}
```

要点：

- `{id}` 简写自 `{id: .id}`；
- 需要改名或加中文键时写成 `{新键: .原字段}`。

### 构造嵌套对象

```bash
jq '{ summary: { count: (.users | length), cities: (.users | map(.city) | unique) } }' users.json
```

输出：

```json
{
  "summary": {
    "count": 3,
    "cities": ["北京", "成都"]
  }
}
```

### 构造数组

```bash
jq '[.users[].name]' users.json              # 名字收集成数组
jq '[(.users[] | select(.active) | .name)]' users.json
```

`[ ... ]` 把流式输出收成一个数组，这是**替代 map 的通用写法**。

### 合并对象

```bash
# + 合并对象, 右边覆盖同名键
jq '.users[0] + { city: "重庆", level: "A" }' users.json
```

### 给数组元素加字段

```bash
jq '.users | map(. + { label: "\\(.name)(\\(.city))" })' users.json
```

---

## 8. 排序、去重与聚合

### 排序

```bash
jq '.users | sort_by(.age)' users.json          # 按年龄升序
jq '.users | sort_by(.age) | reverse' users.json  # 降序
jq '.users | sort_by(-.age)' users.json           # 降序(另一种写法)
jq '.users | sort_by(.city, .age)' users.json     # 多字段排序
```

### 去重

```bash
jq '[.users[].city] | unique' users.json
# ["北京", "成都"]

jq '[.users[].tags[]] | unique' users.json
# ["java", "python", "sql", "vue"]
```

`unique` 会**先排序再去重**。只想删除相邻重复项（保持原顺序）用 `unique_by` 或先用 `group_by`。

### 统计

```bash
jq '.users | length' users.json                    # 3
jq '[.users[].age] | add' users.json               # 求和 87
jq '[.users[].age] | add / length' users.json      # 平均 29
jq '[.users[].age] | min, max' users.json          # 25  34
```

### 分组

```bash
jq '.users | group_by(.city) | map({ city: .[0].city, count: length })' users.json
```

输出：

```json
[
  { "city": "北京", "count": 1 },
  { "city": "成都", "count": 2 }
]
```

### 按条件计数

```bash
jq '[.users[] | select(.active)] | length' users.json    # 2
jq '{ total: (.users|length), active: ([.users[]|select(.active)]|length) }' users.json
```

### 转成另一种索引结构

```bash
# 以 id 为键重建索引
jq '.users | map({ key: (.id | tostring), value: . }) | from_entries' users.json
```

输出是一个以 id 为键的对象，方便后续 `.["1"].name` 这样快速访问。

---

## 9. 常用内置函数

### 类型与转换

| 函数 | 作用 |
|---|---|
| `type` | 返回类型名（"object"/"array"/"string"/"number"/"boolean"/"null"） |
| `tostring` | 转成字符串 |
| `tonumber` | 转成数字 |
| `tojson` | 转成 JSON 字符串 |
| `fromjson` | 解析 JSON 字符串 |

```bash
jq '.users[0] | type' users.json              # "object"
jq '.users[0].id | tostring' users.json       # "1"
jq '"123" | tonumber' <<< '"123"'             # 123
```

### 字符串处理

```bash
jq -r '.users[0].name | ascii_downcase, ascii_upcase' users.json
jq -r '.users[0].name | length' users.json            # 字符数
jq -r '"a,b,c" | split(",")' <<< '"a,b,c"'            # ["a","b","c"]
jq -r '["a","b"] | join("-")' <<< '["a","b"]'         # a-b
jq -r '"  x  " | ltrimstr(" ")' <<< '"  x  "'
jq -r '"hello" | sub("l"; "L")' <<< '"hello"'         # heLlo(只替换第一处)
jq -r '"hello" | gsub("l"; "L")' <<< '"hello"'        # heLLo(全部替换)
```

### 数组与对象

| 函数 | 作用 |
|---|---|
| `keys` / `keys_unsorted` | 取所有键 |
| `values` | 取所有值 |
| `has("k")` | 是否含某个键 |
| `length` | 长度 |
| `add` | 求和（数字）或拼接（字符串/数组） |
| `flatten` | 展平嵌套数组 |
| `unique` | 去重 |
| `reverse` | 反转 |
| `first` / `last` | 首个 / 末尾元素 |
| `del(.k)` | 删除字段 |
| `paths` | 列出所有路径 |

```bash
jq '. | keys' users.json
jq '.users[0] | del(.tags)' users.json
jq '[1,[2,[3]]] | flatten' <<< '[1,[2,[3]]]'    # [1,2,3]
```

### 使用变量

```bash
jq --arg city "成都" '.users[] | select(.city == $city) | .name' users.json
jq --argjson minAge 30 '.users[] | select(.age >= $minAge) | .name' users.json
```

`--arg` 传入字符串，`--argjson` 传入 JSON 值（数字、布尔、对象）。**这是把 shell 变量安全带入 jq 表达式的方式**——不要用字符串拼接，那样在值含特殊字符时会出问题。

---

## 10. 输出格式控制

### 四个最常用的输出选项

| 选项 | 作用 |
|---|---|
| 无 | 格式化 JSON，带缩进和颜色 |
| `-r` | 原始输出（raw），字符串不带引号 |
| `-c` | 紧凑输出，一行一个 JSON |
| `-j` | 不加换行符 |
| `-e` | 按结果设置退出码（无输出或 null 时返回非 0） |

```bash
jq -r '.users[].name' users.json
# 张明
# 李华
# 王芳

jq -c '.users[]' users.json
# {"id":1,"name":"张明",...}
# {"id":2,...}
```

`-r` 是把 jq 结果用在 shell 脚本里的**必备选项**，否则字符串会带上双引号。

### 从文件读取与多个文件

```bash
jq '.' users.json other.json     # 依次处理每个文件
jq -s '.' users.json other.json  # -s 把多个文件合并成一个数组
```

### 输出 TSV / CSV

```bash
# 制表符分隔
jq -r '.users[] | [.id, .name, .city] | @tsv' users.json
# 1	张明	成都
# 2	李华	北京

# 逗号分隔(会正确加引号转义)
jq -r '.users[] | [.id, .name, .city] | @csv' users.json
# 1,"张明","成都"

# 先输出表头
jq -r '["id","name","city"], (.users[] | [.id,.name,.city]) | @tsv' users.json
```

### 用 -e 在脚本里做判断

```bash
if jq -e '.users | any(.active)' users.json > /dev/null; then
  echo "存在活跃用户"
fi
```

`-e` 让 jq 在结果为 `null` 或 `false` 时返回退出码 1，这样能直接用在 `if` 里。

---

## 11. 实战案例

### 案例一：从 API 提取需要的字段

```bash
curl -s https://api.github.com/repos/TDCQCX/TDCQCX.github.io | \\
  jq '{ name, stars: .stargazers_count, forks: .forks_count, updated: .updated_at }'
```

输出：

```json
{
  "name": "TDCQCX.github.io",
  "stars": 0,
  "forks": 0,
  "updated": "2026-09-30T00:00:00Z"
}
```

### 案例二：统计日志里的错误分布

假设日志是每行一个 JSON：

```
{"time":"2026-09-22T10:00:01Z","level":"ERROR","module":"order"}
{"time":"2026-09-22T10:00:02Z","level":"INFO","module":"web"}
{"time":"2026-09-22T10:00:03Z","level":"ERROR","module":"web"}
```

```bash
# 每行的 level 分布
jq -r '.level' app.log | sort | uniq -c | sort -rn

# 只看错误, 按模块聚合
jq -r 'select(.level == "ERROR") | .module' app.log | sort | uniq -c

# 超过 500ms 的慢请求
jq -r 'select(.duration_ms > 500) | "\\(.time) \\(.path) \\(.duration_ms)ms"' app.log
```

### 案例三：比较两个 JSON 的差异

```bash
# 找出只在 a.json 里的键
comm -23 <(jq -r 'keys[]' a.json | sort) <(jq -r 'keys[]' b.json | sort)
```

### 案例四：把嵌套结构拍平

```bash
jq -r '.users[] | . as $u | .tags[] | [$u.name, .] | @tsv' users.json
# 张明	java
# 张明	sql
# 王芳	python
# 王芳	sql
```

这里 `. as $u` 把当前对象存进变量，内层循环遍历 `tags` 时还能引用外层的 `name`。**这是处理"一对多"结构的标准套路。**

### 案例五：校验并格式化配置文件

```bash
# 校验 JSON 合法性(不合法时退出码非 0)
jq empty config.json && echo "JSON 合法"

# 就地格式化
jq . config.json > tmp && mv tmp config.json
```

### 案例六：从 JSON 配置生成环境变量

```bash
eval "$(jq -r '.env | to_entries[] | "export \\(.key)=\\(.value)"' config.json)"
```

例如配置是 `{"env":{"API_URL":"https://a.example.com","DEBUG":"true"}}`，执行后就有了两个环境变量。

> **安全提醒**：`eval` 能执行任意代码，只对**你自己完全可控**的配置文件使用。配置文件来自外部或用户输入时，改成显式读取各个字段。

### 案例七：取数组里满足条件的第一个元素

```bash
jq '.users | map(select(.city == "北京")) | first' users.json
jq '.users | first(.city == "北京")' users.json       # jq 1.6+ 写法
```

---

## 12. 常见问题 FAQ

**Q：输出带引号，怎么去掉？**

加 `-r`：

```bash
jq -r '.users[].name' users.json
```

**Q：报错 `Cannot index string with "x"` 是什么原因？**

路径类型不对——你在一个字符串上继续取字段了。用 `jq .` 先看清结构，或用 `.a?.b?` 让缺失路径返回 null。

**Q：怎么处理字段名里有特殊字符的情况？**

用 `.["字段名"]` 语法：

```bash
jq '.["my-field"]' data.json
jq '.["内容 有空格"]' data.json
```

**Q：jq 能修改原文件吗？**

不能就地改。需要重定向：

```bash
jq '.a = 1' config.json > tmp && mv tmp config.json
```

**Q：怎么把 shell 变量传进 jq 表达式？**

用 `--arg`（字符串）或 `--argjson`（JSON 值），**不要拼接字符串**：

```bash
jq --arg name "张明" '.users[] | select(.name == $name)' users.json
jq --argjson age 30 '.users[] | select(.age > $age)' users.json
```

**Q：`map(select(...))` 和 `select(...)` 有什么区别？**

`.users | map(select(.x))` 得到的是**数组**；`.users[] | select(.x)` 得到的是**元素流**。要保留数组结构就用前者的写法（或用 `[ ... ]` 包裹）。

**Q：怎么只取数组的前 N 个元素？**

```bash
jq '.users[:2]' users.json       # 前 2 个
jq '.users[-2:]' users.json      # 后 2 个
```

**Q：数字精度会丢吗？**

jq 内部用双精度浮点表示数字。**处理超过 15 位有效数字的 ID（如雪花算法 ID、大额金额）时可能丢精度**。遇到这种情况，用 `--argjson` 传入或用 `tostring` 提前转成字符串处理，也可以考虑 jq 1.7 的 `--use-decnum-for-json-number` 之类的选项。

**Q：怎么过滤掉 null 值？**

```bash
jq '.users | map(select(.email != null))' users.json
jq 'with_entries(select(.value != null))' data.json
```

**Q：能处理 JSON 数组以外的东西吗？**

jq 也能读纯文本（用 `-R` 按行读、`-s` 整体读），能把非 JSON 输入转成 JSON 流。处理非结构化日志时很有用：

```bash
jq -R -s 'split("\\n") | map(select(length > 0))' plain.txt
```

**Q：为什么 `jq` 输出有颜色，重定向到文件就没了？**

jq 检测到输出不是终端时自动关闭颜色，这是刻意设计（避免颜色转义码污染文件）。想强制着色用 `-C`。

