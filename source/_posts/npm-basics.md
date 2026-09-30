---
title: npm 基础教程 — 包管理与依赖治理入门
date: 2026-09-21 10:00:00
permalink: /2026/09/21/npm-basics/
categories:
- 技术教程
tags:
- npm
- Node.js
- 包管理
- 工具
keywords: npm 教程, package.json, package-lock.json, 语义化版本, npm ci, 依赖管理, npx, 镜像源, 供应链安全
cover: /post-covers/npm-basics.jpg
banner:
  type: img
  bgurl: /post-covers/npm-basics.jpg
  banner_text: npm 基础教程 — 包管理与依赖治理入门
toc: true
comments: true
---

# npm 基础教程 — 包管理与依赖治理入门

> Node.js 生态里几乎一切项目都从 `npm install` 开始。但"能装上"和"装得对、装得安全、别人也能装上"是三件事。
> 这篇教程从 package.json 的结构讲到锁文件、依赖分层和供应链安全，读完你能看懂任何 Node 项目的依赖结构。

## 目录

1. [npm 是什么，解决了什么问题](#1-npm-是什么解决了什么问题)
2. [package.json：项目的身份证](#2-packagejson项目的身份证)
3. [依赖的四种类型](#3-依赖的四种类型)
4. [语义化版本号：^ 和 ~ 到底差在哪](#4-语义化版本号-和-到底差在哪)
5. [package-lock.json：为什么必须提交](#5-package-lockjson为什么必须提交)
6. [常用命令速查](#6-常用命令速查)
7. [npx：不安装也能运行工具](#7-npx不安装也能运行工具)
8. [npm scripts：项目任务的入口](#8-npm-scripts项目任务的入口)
9. [镜像源与网络问题](#9-镜像源与网络问题)
10. [依赖安全：供应链风险与应对](#10-依赖安全供应链风险与应对)
11. [常见问题 FAQ](#11-常见问题-faq)

---

## 1. npm 是什么，解决了什么问题

在 npm 出现之前，前端引入第三方库是这样：

```html
<!-- 手动下载 js 文件, 放到项目里, 再手动引用 -->
<script src="js/jquery-1.11.3.min.js"></script>
```

问题很明显：版本靠文件名记忆、更新要手动替换、库之间的依赖关系（jQuery 插件依赖特定版本的 jQuery）全靠人维护、文件散落在各处。

npm 是随 Node.js 一起安装的**包管理器**，它做了三件事：

1. **登记**：用一个 `package.json` 声明"我的项目需要哪些库、什么版本"；
2. **安装**：把这些库连同它们自己的依赖，递归装进 `node_modules/`；
3. **锁定**：用 `package-lock.json` 记录"上次装成功时每个包的确切版本"，保证换台机器装出完全一样的结果。

验证是否已安装：

```bash
node -v     # Node.js 版本
npm -v      # npm 版本, 随 Node.js 一起安装
```

> **注意**：`npm` 是包管理器，`node` 是运行时，两者不是一回事。常见误区是"我装了 npm 所以能跑 JS"——实际执行 JS 文件的是 `node`。

---

## 2. package.json：项目的身份证

在空目录里执行 `npm init -y` 会生成一份带默认值的 `package.json`：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 关键字段说明

| 字段 | 作用 |
|---|---|
| `name` | 包名。发布到 npm 时必须全局唯一，只能用小写字母、数字、`-`、`_` |
| `version` | 版本号，遵循语义化版本（见第 4 节） |
| `scripts` | 可复用的命令别名，用 `npm run 名字` 调用 |
| `dependencies` | 运行时需要的依赖 |
| `devDependencies` | 只在开发/构建时需要的依赖 |
| `private` | 设为 `true` 可防止误发布到公共仓库，**私有项目强烈建议加上** |
| `engines` | 声明需要的 Node 版本，例如 `{"node": ">=18"}` |
| `type` | 设为 `"module"` 后 `.js` 文件按 ES Module 解析 |

### 一个更实用的模板

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "dev": "node --watch src/index.js",
    "build": "node scripts/build.js",
    "lint": "eslint ."
  }
}
```

---

## 3. 依赖的四种类型

很多人只区分 `dependencies` 和 `devDependencies`，其实 npm 有四种：

| 类型 | 命令 | 什么时候装 | 典型例子 |
|---|---|---|---|
| `dependencies` | `npm i 包名` | 生产运行也装 | express、vue |
| `devDependencies` | `npm i -D 包名` | 只在开发时装 | eslint、vite、jest |
| `peerDependencies` | 手动写 | 由**使用者**提供 | 插件声明"我需要 vue" |
| `optionalDependencies` | `npm i -O 包名` | 装不上也不报错 | 特定平台的二进制加速包 |

### 怎么判断该放哪一类

问自己一个问题：**"部署到服务器后，运行时代码会 require 它吗？"**

- 会 → `dependencies`
- 不会，只是构建/测试/格式化用 → `devDependencies`

放错的实际代价：把 eslint 放进 `dependencies`，生产环境的依赖体积会凭空增大几十 MB，还可能引入不必要的漏洞面。

### 安装命令速查

```bash
npm install                 # 安装 package.json 里声明的全部依赖
npm install 包名            # 安装并写入 dependencies
npm install -D 包名         # 安装并写入 devDependencies
npm install 包名@1.2.3      # 安装指定版本
npm install 包名@latest     # 安装最新版
npm uninstall 包名          # 卸载并从 package.json 移除
npm update                  # 在版本范围内更新到最新
```

> `npm install` 可以简写成 `npm i`，`--save` 现在是默认行为，不用再写。

---

## 4. 语义化版本号：^ 和 ~ 到底差在哪

版本号写成 `主版本.次版本.修订号`（major.minor.patch），例如 `2.14.3`。语义化版本（SemVer）的约定是：

- **主版本号**变化 → 有不兼容的改动（breaking change）
- **次版本号**变化 → 新增功能，向后兼容
- **修订号**变化 → 修 bug，向后兼容

`package.json` 里的前缀决定了**允许自动升级到哪个范围**：

| 写法 | 允许升级到 | 示例：从 2.14.3 出发 |
|---|---|---|
| `^2.14.3` | 主版本不变，次版本和修订任意 | 可升到 2.99.9，**不会**到 3.0.0 |
| `~2.14.3` | 次版本不变，修订任意 | 可升到 2.14.99，**不会**到 2.15.0 |
| `2.14.3` | 精确锁定 | 只有 2.14.3 |
| `>=2.14.3` | 大于等于均可 | 可能装到 3.x，风险高 |
| `*` 或 `latest` | 任意版本 | 不推荐用于生产 |

### 实用建议

- **应用项目**：用 `^`，享受安全补丁的自动更新。
- **库项目**：`dependencies` 用 `^`，但要注意主版本升级会让下游用户被迫跟随。
- **生产环境**：真正锁定版本的是 `package-lock.json`，它比 `package.json` 里的范围更精确。

> `^` 的例外：当主版本号为 `0` 时（如 `0.2.3`），npm 认为 `^0.2.3` 只能升到 `0.2.x`——因为 0.x 阶段 API 还不稳定。这是很多人会忽略的细节。

---

## 5. package-lock.json：为什么必须提交

这是依赖管理里最重要、也最常被误解的一件事。

`package.json` 写的是**范围**（`^1.2.3`），而 `package-lock.json` 记录的是**确切结果**——包括每个包的实际版本、下载地址、完整性哈希，以及完整的依赖树。

为什么必须提交进版本库：

1. **构建可复现**。没有锁文件时，今天装到 `1.2.9`，下个月 `1.2.15` 发布后就装到 `1.2.15`，行为可能悄悄改变（"在我机器上是好的"大多源于此）。
2. **安装更快**。有了完整依赖树，npm 不必反复向仓库查询版本信息。
3. **安全可审计**。锁文件里的完整性哈希能发现被篡改的包。

### npm install 与 npm ci 的区别

| | `npm install` | `npm ci` |
|---|---|---|
| 读取 | package.json + lock，可能更新 lock | 只读 lock，**绝不修改** |
| node_modules | 增量更新 | 先整体删除再安装 |
| 适用场景 | 日常开发 | CI/CD、生产部署 |

CI 流水线里应该用 `npm ci`。它要求 lock 文件与 package.json 完全一致，不一致会直接报错——这正是你想要的：**尽早发现有人改了 package.json 却忘了更新锁文件**。

> **团队约定**：把 `package-lock.json` 提交进 Git。如果你的项目用 Yarn 或 pnpm，对应的 `yarn.lock`、`pnpm-lock.yaml` 同理，而且**一个项目只应保留一种锁文件**。

---

## 6. 常用命令速查

```bash
# 环境与诊断
npm -v                        # npm 版本
npm outdated                  # 列出可升级的依赖
npm ls --depth=0              # 只看顶层依赖树
npm why 包名                  # 这个包为什么被装进来
npm doctor                    # 体检当前环境

# 安装与维护
npm install                   # 安装全部依赖
npm ci                        # 按锁文件精确安装(CI 用)
npm prune                     # 清掉 package.json 里没声明的包
npm dedupe                    # 尝试减少重复依赖

# 安全
npm audit                     # 漏洞扫描
npm audit fix                 # 自动修复(可能改动版本范围)
npm audit fix --dry-run       # 先看会改什么

# 发布(仅库作者需要)
npm login
npm publish
npm version patch             # 自动改版本号并打 tag
```

### npm outdated 与 npm audit 的区别

- `npm outdated` 关心"有没有新版本"，输出的是版本对比；
- `npm audit` 关心"有没有已知漏洞"，输出的是安全问题。

两者都该定期跑，但优先级不同：**先看 audit，再看 outdated**。前者是风险，后者是维护。

---

## 7. npx：不安装也能运行工具

`npx` 随 npm 一起安装，用于**临时运行一个命令行工具**，而不用全局安装：

```bash
# 不安装到全局, 直接运行一次
npx create-vite my-app
npx prettier --write src/
npx serve public
```

它的行为规则：

1. 先在**当前项目的** `node_modules/.bin` 里找同名命令；
2. 找不到再去全局安装的包里找；
3. 还找不到就临时下载最新版执行，用完即弃。

### 为什么这比全局安装好

- 全局安装的版本会"跟着你一辈子"，不同项目需要不同版本时就会冲突；
- `npx` 用的往往是项目 `devDependencies` 里的版本，和团队其他人一致。

### 需要注意的两点

- 临时下载执行意味着**你信任了那个包的最新版**，在敏感环境里建议先用 `npm view 包名` 确认来源；
- 想让 `npx` 明确只用本地版本，加 `--no-install`，本地没有就直接报错（CI 里更安全）。

---

## 8. npm scripts：项目任务的入口

`scripts` 字段把长命令收进短别名：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.vue",
    "test": "vitest run"
  }
}
```

调用方式：

```bash
npm run dev
npm run build
npm run lint
```

### 生命周期钩子

npm 会在特定命令前后自动执行同名钩子：

```json
{
  "scripts": {
    "prebuild": "node scripts/clean.js",
    "build": "vite build",
    "postbuild": "node scripts/report.js"
  }
}
```

执行 `npm run build` 时，实际顺序是 `prebuild` → `build` → `postbuild`。

### 三个实用细节

1. **`npm run` 会自动把 `node_modules/.bin` 加进 PATH**，所以脚本里可以直接写 `vite` 而不用写 `./node_modules/.bin/vite`。
2. **`test` 和 `start` 可以省略 `run`**：直接 `npm test`、`npm start`。
3. **传参用 `--`**：

   ```bash
   npm run lint -- --fix
   ```

   这样 `--fix` 会传给 eslint 而不是被 npm 吞掉。

---

## 9. 镜像源与网络问题

国内网络直接访问 npm 官方源常常很慢或超时。可以切换镜像：

```bash
# 临时使用一次
npm install --registry=https://registry.npmmirror.com

# 永久切换
npm config set registry https://registry.npmmirror.com

# 看当前用的是哪个源
npm config get registry

# 改回官方源
npm config set registry https://registry.npmjs.org/
```

也可以写进项目根目录的 `.npmrc`，让团队统一（这个文件应该提交）：

```ini
registry=https://registry.npmmirror.com
strict-ssl=true
```

### 常用排查顺序

装不上依赖时按这个顺序查：

```bash
npm config get registry      # 1. 源对不对
npm ping                     # 2. 能不能通
npm cache verify             # 3. 缓存是否损坏
npm cache clean --force      # 4. 必要时清理后重装
```

> **安全提醒**：使用第三方镜像时，确认镜像开启了 HTTPS 且校验完整性哈希。`package-lock.json` 里记录的 `integrity` 字段会在安装时校验，这是防止内容被替换的一道防线，**不要用 `--no-verify` 之类参数绕过它**。

---

## 10. 依赖安全：供应链风险与应对

现代项目平均有几十上百个间接依赖。任何一个环节被投毒，都可能让恶意代码进入你的构建产物——这就是**供应链攻击**。

常见手法：

- 抢注与知名包相似的名字（typosquatting），例如 `crossenv` 仿 `cross-env`；
- 接管已废弃的包名，然后发布带恶意代码的新版本；
- 在 `postinstall` 钩子里执行脚本，安装即触发。

### 日常防护清单

1. **锁文件必须提交**，CI 用 `npm ci`；
2. **定期审计**：

   ```bash
   npm audit
   ```

3. **审查新增依赖**。安装前先看一眼：

   ```bash
   npm view 包名            # 维护者、最近发布时间、仓库地址
   npm view 包名 dist.tarball   # 下载地址
   ```

   判断要点：下载量是否合理、最近是否还在维护、仓库地址是否真实、是否有大量可疑的 `postinstall`。

4. **谨慎使用 `--ignore-scripts`**。它能阻止安装脚本执行（降低风险），但某些包依赖脚本完成编译，可能装不上。在 CI 里可以先试：

   ```bash
   npm ci --ignore-scripts
   ```

5. **不要把密钥写进代码**。`.env`、`*.pem` 一律加进 `.gitignore`（参见 Git 教程第 9 节）。

6. **不在生产环境装 devDependencies**：

   ```bash
   npm ci --omit=dev
   ```

> **如果发现漏洞**：先看 `npm audit` 给出的修复建议版本，评估是否在主版本范围内（可安全升级），若必须跨主版本升级，先在自己的分支测试兼容性。**不要盲目执行 `npm audit fix --force`**，它可能把你的依赖升到不兼容的大版本。

---

## 11. 常见问题 FAQ

**Q：`node_modules` 要不要提交进 Git？**

不要。它体积大、平台相关、而且完全可以从 `package.json` + 锁文件重建。务必写进 `.gitignore`。

**Q：删掉 `node_modules` 重新装，能解决大部分诡异问题吗？**

通常可以。这是最有效的"重启大法"：

```bash
rm -rf node_modules package-lock.json
npm install
```

注意这样会重置锁文件，**在团队项目里更好的做法是只删 `node_modules` 并保留锁文件**：

```bash
rm -rf node_modules
npm ci
```

**Q：全局安装和本地安装有什么区别？**

本地安装（`npm i 包名`）进项目的 `node_modules`，只有这个项目能用，版本随项目走；全局安装（`npm i -g 包名`）装到系统目录，所有项目共享，容易产生版本冲突。**除命令行工具外都建议本地安装。**

**Q：`npm install` 报 EACCES 权限错误怎么办？**

不要用 `sudo npm install`，那会让文件属主变成 root，后续更麻烦。正确做法是把 npm 的全局目录改到用户目录下，或者用 Node 版本管理工具（nvm、fnm）安装 Node。

**Q：怎么知道某个包为什么被安装了？**

```bash
npm why 包名
```

它会打印完整的依赖链路，告诉你"是 A 依赖 B，B 依赖了这个包"。

**Q：`npm run` 和直接执行命令有什么区别？**

`npm run` 会自动把 `node_modules/.bin` 加进 PATH，并且支持 pre/post 钩子。所以项目内的工具应该通过 scripts 调用，而不是要求每个人都全局安装。

**Q：如何只安装生产依赖？**

```bash
npm ci --omit=dev
```

或临时跳过安装脚本：

```bash
npm ci --omit=dev --ignore-scripts
```

