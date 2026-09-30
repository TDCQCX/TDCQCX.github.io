---
title: VS Code 基础教程 — 快捷键、配置与高效工作流
date: 2026-09-25 10:00:00
permalink: /2026/09/25/vscode-basics/
categories:
- 技术教程
tags:
- VS Code
- 编辑器
- 效率
- 工具
keywords: VS Code 教程, 快捷键, settings.json, 多光标, 命令面板, 调试, 任务, 扩展推荐, 远程开发
cover: /post-covers/vscode-basics.jpg
banner:
  type: img
  bgurl: /post-covers/vscode-basics.jpg
  banner_text: VS Code 基础教程 — 快捷键、配置与高效工作流
toc: true
comments: true
---

# VS Code 基础教程 — 快捷键、配置与高效工作流

> VS Code 上手很容易，但大多数人只用到了它 20% 的能力。命令面板、多光标、工作区配置、任务与调试能让日常效率提升一大截。
> 这篇教程按"先建立正确的操作习惯，再配置编辑器，最后打通调试与协作"的顺序展开。

## 目录

1. [为什么值得花时间学 VS Code](#1-为什么值得花时间学-vscode)
2. [界面结构与核心概念](#2-界面结构与核心概念)
3. [命令面板：一切功能的入口](#3-命令面板一切功能的入口)
4. [必学快捷键](#4-必学快捷键)
5. [多光标与批量编辑](#5-多光标与批量编辑)
6. [搜索与替换](#6-搜索与替换)
7. [配置文件：settings.json](#7-配置文件settingsjson)
8. [项目级配置与共享](#8-项目级配置与共享)
9. [任务与调试](#9-任务与调试)
10. [扩展推荐与选择原则](#10-扩展推荐与选择原则)
11. [远程开发与协作](#11-远程开发与协作)
12. [常见问题 FAQ](#12-常见问题-faq)

---

## 1. 为什么值得花时间学 VS Code

VS Code 是目前最主流的代码编辑器。它的优势在于**扩展生态 + 内置功能的平衡**：开箱就有 Git 集成、调试器、终端、搜索替换；需要更多能力时，扩展市场几乎能找到任何语言的工具链。

### 三个值得投入的理由

1. **通用性**。前端、后端、脚本、Markdown、配置文件的编辑都能用同一个工具，不用为每种语言换 IDE。
2. **操作习惯可迁移**。命令面板、多光标、搜索语法在 VS Code 里学一次，换机器、换项目都还用得上。
3. **配置可版本化**。用 `settings.json` 而不是纯图形界面，意味着配置能提交到 Git、能同步到多台机器。

### 编辑器 vs IDE

| | 编辑器（VS Code） | 重型 IDE（IntelliJ IDEA、Visual Studio） |
|---|---|---|
| 启动速度 | 快 | 慢 |
| 内存占用 | 较低 | 较高 |
| 依赖 | 语言能力靠扩展按需加载 | 开箱集成了完整工具链 |
| 适合 | 多语言、轻中量项目、脚本 | 大型单体项目、深度重构 |

VS Code 通过扩展能接近 IDE 的体验，但在超大型项目（几十万文件）的索引和重构能力上仍不如专门的 IDE。

---

## 2. 界面结构与核心概念

打开 VS Code 后依次认识几个区域：

```
┌─────────────────────────────────────────────────────┐
│ 菜单栏 / 标题栏                                       │
├──┬──────────────────────────────────────┬───────────┤
│活│                                       │           │
│动│            编辑区（可多标签/分栏）        │  侧边栏    │
│栏│                                       │  (可选)    │
│  ├──────────────────────────────────────┴───────────┤
│  │              面板（终端 / 问题 / 输出 / 调试）        │
└──┴──────────────────────────────────────────────────┘
```

| 区域 | 作用 | 快捷键 |
|---|---|---|
| 活动栏 | 切换资源管理器、搜索、Git、调试、扩展 | `Ctrl+B` 显示/隐藏整条 |
| 编辑区 | 写代码的地方，可拖标签分栏 | — |
| 侧边栏 | 当前活动栏对应的详细视图 | `Ctrl+B` |
| 面板 | 终端、问题列表、输出、调试控制台 | `Ctrl+J` |

### 四个必须分清的"配置层级"

这是 VS Code 里最容易搞混的部分：

| 层级 | 作用范围 | 存放位置 |
|---|---|---|
| **默认设置** | 全部用户 | 只读，不能改 |
| **用户设置** | 当前计算机的所有项目 | `%APPDATA%\Code\User\settings.json`（Windows） |
| **工作区设置** | 仅当前项目 | 项目里的 `.vscode/settings.json` |
| **文件夹设置** | 多根工作区的某个文件夹 | `.code-workspace` 文件里 |

**优先级从下往上覆盖**：工作区设置 > 用户设置 > 默认设置。

实践建议：

- **个人偏好放用户设置**（字体、主题、快捷键）；
- **项目相关的放工作区设置**（缩进风格、格式化规则、语言版本），并且**提交到 Git**，让团队成员一致；
- 不要把所有东西都塞进工作区设置——那会让每个项目都要重复配一遍。

---

## 3. 命令面板：一切功能的入口

`Ctrl+Shift+P`（macOS 是 `Cmd+Shift+P`）打开命令面板，**输入命令名就能执行任何功能**，不用去翻菜单。

### 为什么这是最重要的一个快捷键

1. **不用记菜单位置**。想"格式化当前文件"，直接输入 `format` 就能看到 `Format Document`。
2. **能看到快捷键**。搜索结果右侧会显示该命令绑定的快捷键，**这是学习快捷键最自然的方式**。
3. **能发现新功能**。搜索 `git`、`debug`、`refactor` 时会看到很多平时没注意的命令。

### 三种前缀

| 前缀 | 作用 |
|---|---|
| `>` | 默认，执行命令 |
| `@` | 跳转到当前文件的符号（函数、类、变量） |
| `#` | 搜索整个工作区的符号 |
| `:` | 跳到指定行号 |

```text
Ctrl+P               打开快速打开文件
Ctrl+P 后输入 @       当前文件的符号列表
Ctrl+P 后输入 #       全局符号搜索
Ctrl+P 后输入 :120    跳到第 120 行
```

`Ctrl+P` 本身是"快速打开"，通过输入不同前缀能切换成不同模式的搜索。**熟练之后可以完全不碰活动栏。**

### 常用命令示例

```text
Ctrl+Shift+P → "Format Document"        格式化当前文件
Ctrl+Shift+P → "Toggle Word Wrap"       切换自动换行
Ctrl+Shift+P → "Change Language Mode"   切换语言模式
Ctrl+Shift+P → "Reload Window"          重新加载窗口(改配置后常用)
```

---

## 4. 必学快捷键

按使用频率排列，**先记住前 10 个就够日常用了**。

### 文件与窗口

| 快捷键 | 作用 |
|---|---|
| `Ctrl+P` | 快速打开文件 |
| `Ctrl+Shift+P` | 命令面板 |
| `Ctrl+N` | 新建文件 |
| `Ctrl+S` | 保存 |
| `Ctrl+Shift+S` | 另存为 |
| `Ctrl+W` | 关闭当前标签 |
| `Ctrl+K Z` | 禅模式（全屏专注，`Esc Esc` 退出） |
| `Ctrl+\` | 分栏 |
| `Ctrl+1/2/3` | 切到第 N 个分栏 |
| `Ctrl+Tab` | 在打开的标签间切换 |

### 编辑

| 快捷键 | 作用 |
|---|---|
| `Ctrl+/` | 切换行注释 |
| `Shift+Alt+A` | 切换块注释 |
| `Alt+↑ / Alt+↓` | 把当前行上移 / 下移 |
| `Shift+Alt+↑ / ↓` | 向上 / 下复制当前行 |
| `Ctrl+Shift+K` | 删除整行 |
| `Alt+点击` | 添加额外光标 |
| `Ctrl+Alt+↑ / ↓` | 在上下行添加光标（列选择） |
| `Ctrl+D` | 选中下一个相同的词 |
| `Ctrl+Shift+L` | 选中所有相同的词 |
| `Ctrl+Space` | 手动触发补全 |
| `Ctrl+Shift+\` | 跳到匹配的括号 |
| `Ctrl+G` | 跳到指定行 |
| `F2` | 重命名符号（会同步更新引用） |
| `Shift+Alt+F` | 格式化整个文档 |
| `Ctrl+K Ctrl+F` | 只格式化选中的代码 |

> **`F2` 重命名值得特别强调**。它由语言服务支持，会**跨文件更新所有引用**，比全局搜索替换安全得多。重命名变量、函数、类时优先用它。

### 导航

| 快捷键 | 作用 |
|---|---|
| `F12` | 跳转到定义 |
| `Alt+F12` | 内联预览定义（不跳走） |
| `Shift+F12` | 查找所有引用 |
| `Ctrl+-` / `Ctrl+Shift+-` | 后退 / 前进（光标位置历史） |
| `Ctrl+Home / Ctrl+End` | 跳到文件首 / 尾 |
| `Ctrl+G` | 跳行 |
| `Ctrl+Shift+O` | 当前文件的符号跳转 |
| `Ctrl+T` | 工作区符号搜索 |

### 终端与面板

| 快捷键 | 作用 |
|---|---|
| `Ctrl+`` ` | 打开 / 关闭集成终端 |
| `Ctrl+Shift+`` ` | 新建终端 |
| `Ctrl+J` | 显示 / 隐藏面板 |
| `Ctrl+Shift+M` | 查看问题（错误与警告） |
| `Ctrl+Shift+U` | 输出面板 |
| `F8` / `Shift+F8` | 跳到下一个 / 上一个问题 |

### 多光标相关（见下一节）

| 快捷键 | 作用 |
|---|---|
| `Alt+点击` | 添加光标 |
| `Ctrl+Alt+↓` | 在下一行加光标 |
| `Ctrl+D` | 选中下一个相同词并加光标 |
| `Ctrl+Shift+L` | 全部选中并加光标 |
| `Shift+Alt+I` | 在选中区域的每行末尾加光标 |
| `Esc` | 取消多光标 |

> **自定义快捷键**：文件 → 首选项 → 键盘快捷方式（或 `Ctrl+K Ctrl+S`）。搜索命令后右键可重新绑定。改键会写入 `keybindings.json`，也能版本化。

---

## 5. 多光标与批量编辑

多光标是 VS Code 最省时间的功能之一。**凡是"要在多处做同样修改"的场景，都先想想能不能用多光标。**

### 五种添加光标的方式

```text
Alt + 点击                      在任意位置添加一个光标
Ctrl+Alt+↓ / Ctrl+Alt+↑        在当前行下方/上方添加光标
Ctrl+D                          选中当前词, 再按一次选中下一个相同的词
Ctrl+Shift+L                    把当前词的所有出现位置全部选中
Shift+Alt+I                     在选中区域的每一行末尾加光标
```

### 典型场景一：批量把驼峰改成蛇形命名

```
原始：
userName  userName  userName

操作：
1. 双击选中 userName
2. Ctrl+Shift+L 选中全部
3. 删除, 输入 user_name
```

### 典型场景二：给多行加前缀

```
原始：
red
green
blue

操作：
1. 选中这三行
2. Shift+Alt+I 在每行末尾加光标
3. 输入 , 补上逗号
```

### 典型场景三：矩形选择（列编辑）

按住 `Shift+Alt` 再拖动鼠标，或 `Ctrl+Alt+↓` 逐行扩展，可以做"按列"的编辑：

```
原始：
1  apple
2  banana
3  cherry

操作：把光标放在第 1 列, Ctrl+Alt+↓ 按两次, 再输入 "item-"
结果：
item-1  apple
item-2  banana
item-3  cherry
```

### 实用技巧

- **`Ctrl+D` 跳过某个匹配**：`Ctrl+K Ctrl+D` 可以跳过当前这个不选中它；
- **多光标时粘贴**：剪贴板有多行内容时，会分别粘贴到各个光标位置；
- **`Esc` 取消**：多光标状态下按 `Esc` 回到单光标。

### 与正则替换的取舍

**跨行、模式不固定的批量修改用搜索替换的正则**（下一节）；**同一位置、同一种替换用多光标更直观**。

---

## 6. 搜索与替换

`Ctrl+Shift+F` 打开全局搜索，`Ctrl+H` 在当前文件内替换。

### 搜索选项

点击搜索框右侧的按钮或使用快捷键：

| 按钮 | 作用 | 快捷键 |
|---|---|---|
| `Aa` | 区分大小写 | `Alt+C` |
| `ab` | 全词匹配 | `Alt+W` |
| `.*` | 使用正则 | `Alt+R` |

### 搜索范围限定

在搜索框输入 `files to include` / `files to exclude` 可以精确限定范围：

```text
files to include: src/**/*.ts             只在 TypeScript 源码里搜
files to exclude: **/node_modules/**,**/dist/**   排除依赖和构建产物
```

也可以用 `Ctrl+Shift+F` 后在 `...` 里配置默认排除规则（见第 7 节）。

### 正则替换的实用例子

**例一：把所有 `console.log(x);` 改成注释**

```text
搜索: ^\s*console\.log\(.*\);\s*$
替换: （留空或写注释）
正则: 开启
```

**例二：把 `var` 改成 `let`**

```text
搜索: \bvar\b
替换: let
正则: 开启, 全词匹配: 开启
```

**例三：交换函数参数顺序**

```text
搜索: (\w+)\.(\w+)\(
替换: $2($1
```

用 `$1`、`$2` 引用捕获组——**这和正则教程里的替换语法一致**。

**例四：给每个匹配补一个后缀**

```text
搜索: (image\d+)
替换: $1_v2
```

### 搜索的隐藏功能

- **搜索结果可以整体复制**：右键结果 → "Copy All"；
- **可以只搜索选中的内容**：选中文本后按 `Ctrl+Shift+F` 会预填搜索词；
- **`Ctrl+Shift+E`** 打开资源管理器，`: ` 后的输入框能按文件名模糊搜索（类似 `Ctrl+P` 但能看到目录结构）。

### 全局搜索排除依赖目录

在 `settings.json` 里配置，能让搜索快很多：

```json
{
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/public": true,
    "**/*.min.js": true,
    "**/package-lock.json": true
  }
}
```

---

## 7. 配置文件：settings.json

用图形界面改设置，VS Code 会自动写入 JSON。**直接编辑 JSON 更快也更精确**，而且能直接复制粘贴分享。

### 打开方式

```text
Ctrl+Shift+P → "Preferences: Open User Settings (JSON)"       用户设置
Ctrl+Shift+P → "Preferences: Open Workspace Settings (JSON)"  工作区设置
```

### 一份实用的用户设置模板

```json
{
  // 编辑器基础
  "editor.fontSize": 15,
  "editor.fontFamily": "Consolas, 'Microsoft YaHei Mono', monospace",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.rulers": [100],
  "editor.renderWhitespace": "boundary",
  "editor.minimap.enabled": false,
  "editor.cursorBlinking": "smooth",
  "editor.smoothScrolling": true,

  // 保存行为
  "files.autoSave": "onFocusChange",
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  "files.encoding": "utf8",

  // 格式化
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },

  // 终端
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.scrollback": 10000,

  // 搜索排除
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/public": true
  },

  // 文件关联
  "files.associations": {
    "*.vue": "vue",
    "*.wxml": "html"
  },

  // 版本控制
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableSmartCommit": true,

  // 其他
  "explorer.confirmDelete": true,
  "explorer.confirmDragAndDrop": true,
  "workbench.startupEditor": "none",
  "telemetry.telemetryLevel": "off"
}
```

### 逐项说明（挑关键的）

| 设置 | 作用 | 为什么这么设 |
|---|---|---|
| `files.autoSave: onFocusChange` | 切走标签时自动保存 | 避免忘记保存导致调试的是旧代码 |
| `files.eol: "\n"` | 统一用 LF | 跨平台协作时不会整文件都算改动 |
| `files.trimTrailingWhitespace` | 保存时去掉行尾空格 | 减少无意义的 diff |
| `files.insertFinalNewline` | 文件末尾补空行 | 符合 POSIX 惯例，Git diff 更干净 |
| `editor.formatOnSave` | 保存时格式化 | 让格式问题在写入时就解决 |
| `source.fixAll: explicit` | 只在手动保存时执行自动修复 | 避免与自动保存配合时频繁触发 |
| `explorer.confirmDelete: true` | 删除前确认 | 防止误删 |
| `telemetry.telemetryLevel: off` | 关闭遥测 | 减少数据外发 |

> **`files.eol: "\n"` 的坑**：如果你的团队里有人用 CRLF、有人用 LF，统一成 LF 能避免"只改了一个字符却显示整个文件都变了"。Windows 上用 Git 时配合 `git config --global core.autocrlf input`（详见 Git 教程）。

### 语言专属设置

按语言覆盖设置，语法是 `"[语言标识]"`：

```json
{
  "[javascript]": {
    "editor.tabSize": 2,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.tabSize": 4,
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[markdown]": {
    "editor.wordWrap": "on",
    "editor.quickSuggestions": {
      "other": true,
      "comments": false,
      "strings": false
    },
    "editor.rulers": [100]
  },
  "[json]": {
    "editor.tabSize": 2
  }
}
```

**Python 用 4 空格、JavaScript 用 2 空格**这类差异，靠语言级设置最省心。

### 格式化器冲突的处理

装了多个格式化扩展时，需要明确指定用哪个：

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

如果某个文件不想被格式化，右键选择 "Format Document With..." → 选择具体格式化器，或为它单独配置。

### 快捷键与代码片段

**自定义快捷键**（`keybindings.json`）：

```json
[
  {
    "key": "ctrl+alt+l",
    "command": "editor.action.formatDocument",
    "when": "editorTextFocus && !editorReadonly"
  },
  {
    "key": "ctrl+alt+t",
    "command": "workbench.action.terminal.toggleTerminal"
  }
]
```

`when` 子句控制生效条件，是避免快捷键冲突的关键。**把常用但手顺不过来的快捷键改掉，比强迫自己适应更有效。**

**自定义代码片段**（`File → Preferences → Configure User Snippets`）：

```json
{
  "Print to console": {
    "prefix": "clg",
    "body": [
      "console.log('$1');",
      "$0"
    ],
    "description": "打印调试信息"
  }
}
```

之后输入 `clg` 按 Tab 就能展开。`$1`、`$2` 是 Tab 停留点，`$0` 是最终位置。

---

## 8. 项目级配置与共享

工作区设置放在项目的 `.vscode/` 目录：

```
项目根/
└── .vscode/
    ├── settings.json      项目设置(提交进 Git)
    ├── extensions.json    推荐扩展(提交进 Git)
    ├── launch.json        调试配置(提交进 Git)
    ├── tasks.json         任务定义(可提交)
    └── keybindings.json   项目快捷键(通常不提交)
```

### 应该提交什么

| 文件 | 是否提交 | 原因 |
|---|---|---|
| `settings.json` | 提交 | 统一缩进、格式化、排除规则 |
| `extensions.json` | 提交 | 新人打开项目会收到扩展推荐 |
| `launch.json` | 提交 | 团队共享调试配置，减少"你那边怎么跑的" |
| `tasks.json` | 提交 | 构建、测试命令统一入口 |
| `keybindings.json` | 不提交 | 个人按键习惯，与项目无关 |

### 推荐扩展示例

`.vscode/extensions.json`：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "editorconfig.editorconfig",
    "streetsidesoftware.code-spell-checker"
  ],
  "unwantedRecommendations": []
}
```

团队成员打开项目时会收到安装提示。**这比自己写一份"请安装这些扩展"的文档有效得多。**

### EditorConfig：跨编辑器的统一

如果团队里有人不用 VS Code，用 `.editorconfig` 更通用：

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

**VS Code、IntelliJ、Vim、Sublime 都支持 EditorConfig**，是跨编辑器协作成本最低的方案。

### 多根工作区

同时处理多个相关项目时（比如前端 + 后端），用工作区文件把它们组织在一起：

```json
{
  "folders": [
    { "path": "frontend" },
    { "path": "backend" },
    { "name": "文档", "path": "../docs" }
  ],
  "settings": {
    "files.exclude": { "**/.git": true }
  }
}
```

保存为 `myapp.code-workspace`，双击即可一次性打开所有项目。**跨项目的搜索和跳转定义在这种模式下才真正可用。**

---

## 9. 任务与调试

### tasks.json：把常用命令收进编辑器

`Ctrl+Shift+P → Tasks: Configure Task` 生成模板，也可以手写：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "安装依赖",
      "type": "shell",
      "command": "npm install",
      "problemMatcher": []
    },
    {
      "label": "本地预览",
      "type": "shell",
      "command": "npx hexo server",
      "isBackground": true,
      "problemMatcher": [],
      "group": "build"
    },
    {
      "label": "构建",
      "type": "shell",
      "command": "npx hexo generate",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": []
    },
    {
      "label": "构建并部署",
      "dependsOrder": "sequence",
      "dependsOn": ["构建"],
      "type": "shell",
      "command": "npx hexo deploy",
      "problemMatcher": []
    }
  ]
}
```

要点：

- `group.build.isDefault: true` 让它成为 `Ctrl+Shift+B` 的默认任务；
- `dependsOrder: sequence` + `dependsOn` 可以把多个任务串起来（类似 npm 的 pre/post）；
- `isBackground: true` 用于长期运行的服务（开发服务器）；
- `problemMatcher` 让命令输出的错误能被解析进"问题"面板，点击直接跳到出错行。

### launch.json：配置调试

以 Node.js 为例：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "调试当前文件",
      "type": "node",
      "request": "launch",
      "program": "${file}",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "调试 npm 脚本",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "附加到进程",
      "type": "node",
      "request": "attach",
      "processId": "${command:PickProcess}",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 调试的四个关键操作

| 操作 | 快捷键 | 作用 |
|---|---|---|
| 设置断点 | `F9` | 在行号左侧点一下，程序执行到此处暂停 |
| 启动调试 | `F5` | 按当前配置启动 |
| 单步跳过 | `F10` | 执行当前行，不进入函数内部 |
| 单步进入 | `F11` | 进入函数内部 |
| 跳出 | `Shift+F11` | 从当前函数返回到调用处 |
| 继续 | `F5` | 继续执行到下一个断点 |

### 调试面板的四个区域

| 区域 | 内容 |
|---|---|
| 变量 | 当前作用域的所有变量，可以展开对象、临时改值 |
| 监视 | 手动添加表达式，持续观察它的值 |
| 调用堆栈 | 当前执行路径，点击可跳到上层调用 |
| 断点 | 管理所有断点，可禁用、可加条件 |

### 条件断点与日志断点

**条件断点**：右键断点 → "Edit Breakpoint" → 输入条件。

```javascript
// 只在 i 等于 5 时暂停, 避免循环里按几十次继续
i === 5

// 只在特定用户时暂停
user.id === 12345
```

**日志断点**（Logpoint）：不暂停，只在调试控制台打印。

```text
i = {i}, user = {user.name}
```

**这在排查循环里的问题时特别有用**——不用改代码加 `console.log`，也不会打乱执行节奏，更不会忘记删掉调试语句。

### Node.js 调试的一个常见坑

用 `node --inspect` 或调试器时，如果代码里有 `await` 但没处理好，断点可能落在预期之外的位置。**排查方法**：先在入口处下断点，确认执行路径是否符合预期，再逐步缩小范围。

---

## 10. 扩展推荐与选择原则

### 按类别的推荐

**通用必备**：

| 扩展 | 作用 |
|---|---|
| EditorConfig for VS Code | 支持 `.editorconfig` |
| ESLint | JavaScript/TypeScript 静态检查 |
| Prettier | 代码格式化 |
| GitLens | 在代码行内显示 Git 作者、提交信息 |
| Code Spell Checker | 拼写检查（含中文注释时需配置忽略） |

**语言相关**：

| 语言 | 扩展 |
|---|---|
| Python | Python（微软官方）、Pylance、Black Formatter |
| Java | Extension Pack for Java |
| Go | Go（官方） |
| C/C++ | C/C++（微软官方） |
| Vue | Vue - Official |
| Markdown | Markdown All in One、markdownlint |
| 数据库 | SQLTools 或各数据库官方扩展 |

**效率类**：

| 扩展 | 作用 |
|---|---|
| Path Intellisense | 路径自动补全 |
| Todo Tree | 聚合所有 TODO/FIXME 注释 |
| Better Comments | 按类型高亮注释（TODO、警告、问题） |
| REST Client | 在编辑器里直接发 HTTP 请求（`.http` 文件） |
| Remote - SSH | 远程开发（见下一节） |

### 四条选择原则

1. **优先官方扩展**。微软或语言官方维护的扩展在稳定性、更新频率、安全审查上都更可靠。
2. **看下载量和最近更新**。下载量高说明经过大量使用验证；长期不更新说明可能已废弃。
3. **控制数量**。每个扩展都会占用内存、拖慢启动。**装了但一个月没用过的就卸掉。**
4. **关注权限**。扩展能读写你的文件、执行命令。来源不明的扩展不要装，尤其是那些下载量很低但功能"很强大"的。

### 排查扩展导致的异常

VS Code 出问题时，第一件事是**排除扩展的影响**：

```text
Ctrl+Shift+P → "Developer: Reload Window With Extensions Disabled"
```

如果禁用扩展后问题消失，就逐个启用定位是哪个扩展。也可以用 `Ctrl+Shift+P → "Extensions: Show Running Extensions"` 看每个扩展的启动耗时，找出拖慢启动的那几个。

### 看扩展性能

```text
Ctrl+Shift+P → "Developer: Startup Performance"
```

输出里会列出各扩展的加载耗时。启动慢时按这个列表清理最有效。

---

## 11. 远程开发与协作

### Remote - SSH：直接在服务器上开发

装 `Remote - SSH` 扩展后，可以连接到远程服务器，**在远程环境中打开文件夹、编辑文件、跑终端**，就像本地一样。

```text
Ctrl+Shift+P → "Remote-SSH: Connect to Host" → 选择 ~/.ssh/config 里的主机
```

好处：

- 代码和运行环境都在服务器上，**不存在"本地环境和服务器不一致"**；
- 本地只需要一个编辑器，不用在本地装整套工具链；
- 大项目在服务器上编译，本地机器不卡。

它依赖 `~/.ssh/config`（详见 SSH 教程）。加上心跳配置能避免长时间不用后断线。

### Dev Containers：容器化的开发环境

用 `.devcontainer/devcontainer.json` 定义开发容器：

```json
{
  "name": "Node.js 开发环境",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"],
      "settings": {
        "editor.formatOnSave": true
      }
    }
  }
}
```

**这是解决"在我机器上能跑"最彻底的办法**：所有人用同一个镜像，依赖版本、系统工具链完全一致。

### 内置 Git 协作

VS Code 内置 Git 支持，常用的几个操作：

| 操作 | 位置 |
|---|---|
| 查看改动 | 活动栏 Git 图标（`Ctrl+Shift+G`） |
| 暂存文件 | 文件右侧的 `+` |
| 暂存部分行 | 在 diff 视图里选中行 → 右键 → Stage Selected Ranges |
| 提交 | 顶部输入框 + `Ctrl+Enter` |
| 查看历史 | 文件右键 → Open Timeline，或装 GitLens |

> **"暂存部分行"是个很实用的功能**：一次改动里既有修 bug 又有新功能时，可以只暂存相关的行，分两次提交，历史更干净（对应 Git 教程第 3 节的暂存区概念）。

### Live Share：实时协作

`Live Share` 扩展支持多人同时编辑同一个文件、共享终端和调试会话。**适合结对编程和远程排障**——对方能看到你的光标和终端输出，比截图描述清楚得多。

---

## 12. 常见问题 FAQ

**Q：设置改了没生效？**

可能是被更高优先级的设置覆盖了。排查方法：

1. `Ctrl+Shift+P → "Preferences: Open Settings (JSON)"` 检查用户设置；
2. 检查项目里有没有 `.vscode/settings.json`（工作区设置优先级更高）；
3. 有些设置在 `settings.json` 里有语法错误会被整体忽略——看有没有红色波浪线。

**Q：某个设置项叫什么名字？**

不要背。两种办法：

1. 在设置界面搜索关键词，点齿轮图标 → "Copy Setting as JSON"；
2. `Ctrl+Shift+P` 输入设置项的中文/英文描述，会出现对应的开关命令。

**Q：终端里输出的中文是乱码？**

Windows 上通常是编码问题。安装项目后检查：

```json
{
  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "args": ["-NoLogo"]
    }
  }
}
```

更常见的原因是该终端程序自身的输出编码。PowerShell 里执行 `[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)` 可以临时修正。

**Q：格式化后代码风格变了，但团队用的不是这个风格？**

根因是默认格式化器不对。在项目 `.vscode/settings.json` 里指定：

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

并确保项目里有对应的格式化配置（如 `.prettierrc`），让所有人的格式一致。

**Q：`Ctrl+D` 选中太多次了怎么办？**

按 `Ctrl+K Ctrl+D` 跳过当前这一个，或者按 `Esc` 取消后重新来。

**Q：`F2` 重命名和全局替换有什么区别？**

`F2` 由语言服务驱动，**只重命名真正的符号引用**，不会误改字符串或注释里的同名文本；全局替换是纯文本匹配，容易误伤。**能用 F2 就用 F2。**

**Q：文件保存后行尾变化导致 Git diff 整文件都变了？**

行尾符不一致。在 `settings.json` 里设 `"files.eol": "\n"`，并检查 Git 的 `core.autocrlf` 设置。已有文件可以一次性统一：

```bash
git add --renormalize .
```

**Q：扩展装多了启动变慢怎么办？**

用 `Developer: Startup Performance` 看哪个扩展耗时最多。注意：**每个打开的窗口都会加载一次扩展**，同时开多个项目窗口时资源占用会叠加。可以考虑用工作区（`.code-workspace`）或者开"工作区信任"来限制扩展在不受信任项目里的加载。

**Q：如何在多台电脑间同步配置？**

三种方式：

1. **内置的 Settings Sync**（`Ctrl+Shift+P → "Turn on Settings Sync"），用 GitHub 或微软账号同步设置、快捷键、扩展、代码片段；
2. **把 `settings.json` 和 `keybindings.json` 放进自己的 dotfiles 仓库**，用软链接或复制部署；
3. **只同步项目相关的到项目仓库**（`.vscode/`），个人偏好手工维护。

推荐组合：个人偏好用 Settings Sync，项目相关配置提交到项目仓库。

**Q：代码提示不工作了？**

按顺序试：`Ctrl+Space` 手动触发；`Ctrl+Shift+P → "Developer: Reload Window"` 重载；检查语言扩展是否安装并启用（某些语言需要专门的语言服务器扩展）；确认文件的语言模式正确（右下角能切换）。

**Q：怎么快速比较两个文件？**

在资源管理器里选中一个文件，右键 → "Select for Compare"，再选另一个文件右键 → "Compare with Selected"。也可以比较两个版本（Git 集成里对文件右键选历史版本对比）。
