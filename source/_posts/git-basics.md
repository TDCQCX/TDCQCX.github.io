---
title: Git 基础教程 — 从零开始掌握版本控制
date: 2026-09-20 10:00:00
permalink: /2026/09/20/git-basics/
categories:
- 技术教程
tags:
- Git
- 版本控制
- 命令行
- 工具
keywords: Git 教程, 版本控制, Git 入门, commit, branch, merge, rebase, 撤销修改, .gitignore, 团队协作
cover: /post-covers/git-basics.jpg
banner:
  type: img
  bgurl: /post-covers/git-basics.jpg
  banner_text: Git 基础教程 — 从零开始掌握版本控制
toc: true
comments: true
---

# Git 基础教程 — 从零开始掌握版本控制

> 这篇教程假设你从没用过 Git。全文按"先能存下自己的代码，再学会和别人协作，最后学会处理出错的场面"来组织。
> 读完前 5 节就可以应付日常的单人开发；第 6 节之后是团队协作与救火技巧。

## 目录

1. [Git 到底解决什么问题](#1-git-到底解决什么问题)
2. [安装与最小配置](#2-安装与最小配置)
3. [三个区域：工作区、暂存区、仓库](#3-三个区域工作区暂存区仓库)
4. [第一次提交：把代码存进历史](#4-第一次提交把代码存进历史)
5. [查看历史与差异](#5-查看历史与差异)
6. [分支：并行开发的基础](#6-分支并行开发的基础)
7. [远程仓库与协作流程](#7-远程仓库与协作流程)
8. [撤销与回退：出错了怎么办](#8-撤销与回退出错了怎么办)
9. [.gitignore：哪些文件不该进仓库](#9-gitignore哪些文件不该进仓库)
10. [实战：一个完整的日常流程](#10-实战一个完整的日常流程)
11. [常见问题 FAQ](#11-常见问题-faq)

---

## 1. Git 到底解决什么问题

没有版本控制时，你可能这样保存文件：

```
论文.docx
论文-修改版.docx
论文-最终版.docx
论文-最终版2.docx
论文-最终版2-真的最终.docx
```

这种方式的三个致命问题：

1. **说不清改了什么**。两个文件之间的差异只能靠肉眼比对。
2. **无法回退**。想回到上周三的状态，只能凭记忆手改。
3. **无法协作**。两个人同时改同一个文件，合并靠互相传 U 盘。

Git 用一套**内容寻址**的存储解决了这些问题：它把每次保存（提交）压缩成一个不可变的快照，并给每个快照算出一个哈希值作为编号。于是你能精确地说出"回到 `a3f9c21` 那个状态"，也能让 Git 自动比对任意两个快照之间的差异。

一个常见的误解是"Git 只适合写代码"。实际上任何**以文本为主、需要追踪修改历史**的工作都适合：配置文件、Markdown 笔记、LaTeX 论文、数据库脚本等。

### Git 与 GitHub 的区别

这两个词经常被混用，但完全是两回事：

| | Git | GitHub / GitLab / Gitee |
|---|---|---|
| 是什么 | 本地运行的版本控制软件 | 托管 Git 仓库的在线服务 |
| 能否离线用 | 能，全部功能都在本地 | 不能，依赖网络 |
| 谁提供 | 开源项目，免费 | 商业公司 |

换句话说：**没有 GitHub 也能用 Git**（很多公司在内网自建 Git 服务）；但 GitHub 离开 Git 就无法工作。

---

## 2. 安装与最小配置

### 安装

- **Windows**：到 [git-scm.com](https://git-scm.com/) 下载安装包，一路默认即可。安装后开始菜单里会多出 "Git Bash"，它提供了一个类 Linux 的命令行环境。
- **macOS**：终端里执行 `git --version`，系统会提示安装命令行开发者工具。
- **Linux**：`sudo apt install git`（Debian/Ubuntu）或 `sudo dnf install git`（Fedora）。

验证安装：

```bash
git --version
# 输出示例: git version 2.43.0
```

### 必做的三项配置

Git 会把每次提交的作者写进历史，所以先告诉它你是谁：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

再加一条让命令行更好用的配置：

```bash
# 给行尾转换设成自动处理, Windows 与 Linux 混合协作时不至于整文件都算改动
git config --global core.autocrlf input   # Windows 上建议 true
```

`--global` 表示对当前用户的所有仓库生效。如果某个仓库需要用别的身份，进入该仓库后去掉 `--global` 再执行一次即可。

查看当前配置：

```bash
git config --list
```

> **小提示**：`user.email` 建议用你以后注册代码托管平台的那个邮箱，这样平台才能把提交正确地算到你名下。

---

## 3. 三个区域：工作区、暂存区、仓库

理解 Git 最关键的一步，是搞清三个区域：

```
工作区（你正在编辑的文件夹）
    |  git add
    v
暂存区（准备提交的内容清单）
    |  git commit
    v
本地仓库（.git 目录，历史都在这里）
    |  git push
    v
远程仓库（GitHub 等）
```

- **工作区**：你实际看到、编辑的文件。
- **暂存区**（staging area / index）：一个"待提交清单"。你可以只把一部分改动放进清单，其余留着下次提交。
- **本地仓库**：`.git` 目录，所有历史快照都存在这里。这也是为什么删掉 `.git` 就等于丢掉全部历史。

"为什么要多一个暂存区？"——因为它让**一次提交可以只包含相关的改动**。比如你顺手修了一个错别字又写完了新功能，可以分两次提交，历史读起来就干净。

### 初始化仓库

```bash
cd 你的项目目录
git init
```

这条命令会创建一个 `.git` 目录。如果想从已有的远程仓库开始，用 `git clone`：

```bash
git clone https://github.com/用户名/仓库名.git
```

### 查看状态

`git status` 是你最该养成习惯的命令，任何犹豫的时候先执行它：

```bash
git status
```

它会告诉你：当前在哪个分支、哪些文件被改动、哪些改动已暂存。

---

## 4. 第一次提交：把代码存进历史

### 标准三步

```bash
# 1. 看看动了什么
git status

# 2. 把要提交的文件放进暂存区
git add 文件名
# 或一次性加入所有改动
git add .

# 3. 提交, 并写清楚这次改了什么
git commit -m "修复登录页在 Safari 下按钮错位"
```

### 提交信息怎么写

提交信息是留给未来的自己和同事的。一条好的信息回答"为什么改"，而不只是"改了什么"：

```
# 不好: 看不出意图
fix bug

# 好: 别人扫一眼历史就知道发生了什么
修复登录页在 Safari 下的按钮错位

Safari 对 flex 子项默认 min-width:auto 的处理与 Chrome 不同,
给按钮容器补上 min-width:0 即可。
```

习惯上第一行控制在 50 个字符内，空一行后再写详细说明。

### 跳过暂存区直接提交

如果确定所有改动都要提交（注意：仅限已**被跟踪**的文件）：

```bash
git commit -am "提交信息"
```

`-a` 不会包含新建的、还没 `add` 过的文件，这点容易踩坑。

---

## 5. 查看历史与差异

### 查看提交历史

```bash
git log                 # 完整历史
git log --oneline       # 每个提交压成一行, 最常用
git log --oneline --graph --all   # 用字符画出分支图
```

输出示例：

```
a3f9c21 (HEAD -> main, origin/main) 修复登录页按钮错位
7b2e10d 新增用户导出功能
c19a4f8 初始化项目
```

### 查看差异

```bash
git diff                # 工作区 vs 暂存区
git diff --staged       # 暂存区 vs 上次提交(提交前必看)
git diff HEAD           # 工作区 vs 上次提交(全部未提交改动)
git diff main feature   # 两个分支之间
```

`git diff --staged` 特别值得在每次 `commit` 前执行一次——它能防止你把调试用的 `console.log` 或临时密码一起提交上去。

### 查看某一行是谁改的

```bash
git blame 文件名
```

每行前面会标出最后一次修改它的提交哈希和作者。排查"这行古怪的代码是谁写的、为什么这么写"时非常有用。

---

## 6. 分支：并行开发的基础

分支是 Git 最强大的特性：它让你在不影响主线的前提下试验新想法，成本几乎为零。

```bash
git branch                    # 列出本地分支
git branch 新分支名            # 创建分支
git switch 新分支名            # 切换分支
git switch -c 新分支名         # 创建并切换(一步到位)
git branch -d 已合并的分支      # 删除分支
```

> 老教程里用 `git checkout` 切换分支。新版本 Git 引入了语义更清晰的 `git switch`（切分支）和 `git restore`（还原文件），建议优先使用。`checkout` 仍然可用，只是它同时承担了太多职责。

### 合并分支

```bash
git switch main
git merge 你的分支
```

合并有两种结果：

- **快进合并（fast-forward）**：目标分支没有新提交，Git 直接把指针往前挪，历史是一条直线。
- **三方合并**：两边都有新提交，Git 会生成一个合并提交。如果同一文件的同一处被两边改了，就会产生**冲突**。

### 处理冲突

冲突时 Git 会在文件里插入标记：

```
<<<<<<< HEAD
这是 main 分支的内容
=======
这是 feature 分支的内容
>>>>>>> feature
```

处理步骤：

1. 打开文件，人工决定保留哪一版（或融合两版）；
2. 把 `<<<<<<<`、`=======`、`>>>>>>>` 三行标记**全部删掉**；
3. `git add 该文件`；
4. `git commit` 完成合并。

任何时候搞不清状态，`git status` 都会告诉你下一步该做什么。

---

## 7. 远程仓库与协作流程

### 关联远程仓库

```bash
git remote add origin https://github.com/用户名/仓库名.git
git remote -v            # 查看已关联的远程
```

### 推送与拉取

```bash
git push -u origin main   # 第一次推送并建立跟踪关系
git push                  # 之后可以简写
git pull                  # 拉取远程更新并合并到本地
```

### 团队协作的标准流程

1. `git pull` 把远程最新改动同步下来（**开工前必做**）；
2. `git switch -c feature/xxx` 建一个功能分支；
3. 在自己的分支上提交；
4. `git push -u origin feature/xxx` 推上去；
5. 在平台上发起 Pull Request / Merge Request，请人评审；
6. 评审通过后合并进 main。

这个流程的核心好处是：**main 分支永远是能用的**，任何人都能随时基于它开始新工作。

### 推送被拒绝怎么办

如果看到这样的报错：

```
! [rejected] main -> main (fetch first)
```

说明远程有你本地没有的提交。先拉再推：

```bash
git pull --rebase
git push
```

`--rebase` 会把你的提交"掰"到远程最新提交之后，历史更整洁。若不想改写历史，直接用 `git pull`（会生成一个合并提交）也可以。

---

## 8. 撤销与回退：出错了怎么办

这是最容易让人紧张的部分。按"改动还没提交"和"已经提交"分两类处理。

### 情况一：改动还没提交

```bash
# 撤销某个文件的全部未暂存改动(危险: 会丢掉编辑内容)
git restore 文件名

# 把已 add 的文件移出暂存区, 但保留文件内容
git restore --staged 文件名

# 撤销最近一次提交, 但把改动留在工作区(最常用的软回退)
git reset --soft HEAD~1
```

> `git restore 文件名` 会**永久丢弃**你未保存的编辑，执行前确认不需要那些内容。这也是为什么建议频繁提交——提交过的内容才真正安全。

### 情况二：已提交但想反悔

```bash
# 撤销提交并保留改动在暂存区
git reset --soft HEAD~1

# 撤销提交并保留改动在工作区(未暂存)
git reset --mixed HEAD~1

# 彻底丢弃最近一次提交及其改动(危险!)
git reset --hard HEAD~1
```

`--hard` 会真正删掉数据。如果只是想撤销一个已经推送到远程的提交，更安全的做法是**新建一个反向提交**：

```bash
git revert 提交哈希
```

`revert` 不改写历史，只是新增一个"抵消那次改动"的提交，团队协作时更友好。

### 情况三：误删了分支或丢了一个提交

```bash
git reflog
```

`reflog` 记录了 HEAD 的每一次移动。找到丢失的提交哈希后：

```bash
git switch -c 恢复的分支 丢失的哈希
```

只要没做过垃圾回收，Git 通常能帮你找回来。这是 Git 最让人安心的一点。

---

## 9. .gitignore：哪些文件不该进仓库

在项目根目录建一个 `.gitignore`，列出不需要纳入版本控制的文件：

```gitignore
# 依赖目录, 体积大且可由 package.json 重建
node_modules/

# 构建产物
dist/
public/
*.log

# 编辑器与系统文件
.vscode/
.idea/
.DS_Store
Thumbs.db

# 本地配置与凭据(重要: 绝不能提交)
.env
.env.local
*.pem
config.local.*
```

### 三条容易踩的规则

1. **已经被跟踪的文件，加进 `.gitignore` 不会生效**。需要先取消跟踪：

   ```bash
   git rm --cached 文件名
   ```

2. **`!` 可以写例外**：

   ```gitignore
   *.log
   !important.log    # 除了这个文件
   ```

3. **`/` 开头表示只匹配仓库根目录**，`目录/` 结尾表示只匹配目录：

   ```gitignore
   /build      # 只忽略根目录下的 build
   build/      # 忽略任意层级的 build 目录
   ```

> **安全提醒**：`.env`、密钥文件、数据库密码这类内容一旦提交，即使后来删掉，**历史记录里仍然存在**。补救需要使用 `git filter-repo` 之类的工具重写历史，并立即轮换已泄露的凭据。最好的策略是从一开始就写进 `.gitignore`。

---

## 10. 实战：一个完整的日常流程

把上面的知识串起来。假设你要给项目加一个导出功能：

```bash
# 1. 同步最新代码
git switch main
git pull

# 2. 开一个功能分支
git switch -c feature/export-users

# 3. ...写代码...

# 4. 看看改了哪些文件
git status
git diff

# 5. 分次提交, 保持历史清晰
git add src/export.js
git commit -m "新增用户导出模块"

git add src/routes.js
git commit -m "注册导出接口路由"

# 6. 提交前再确认一次暂存内容
git diff --staged

# 7. 推送到远程
git push -u origin feature/export-users

# 8. 在平台上创建 Pull Request, 等评审

# 9. 合并后删掉本地分支
git switch main
git pull
git branch -d feature/export-users
```

---

## 11. 常见问题 FAQ

**Q：`git pull` 和 `git fetch` 有什么区别？**

`fetch` 只把远程更新下载到本地，不动你的工作区；`pull` 等于 `fetch` + `merge`（或 `rebase`）。想先看看远程改了什么再决定，用 `fetch`。

**Q：提交信息写错了怎么改？**

```bash
git commit --amend -m "新的提交信息"
```

注意这会改写最后一次提交的哈希，**如果已经推送到共享分支，不要这么做**。

**Q：不小心提交了一个大文件怎么办？**

在它成为历史之前撤销：

```bash
git reset --soft HEAD~1
git restore --staged 大文件
# 把它加进 .gitignore, 然后重新提交
```

**Q：`HEAD` 是什么？**

HEAD 是"你当前所在位置"的指针，通常指向某个分支的最新提交。`HEAD~1` 表示它的上一个提交，`HEAD~2` 再往前一个。

**Q：为什么每次都要先 `git pull`？**

因为 Git 不能自动合并"你没见过的"远程改动。先拉取能让你在本地解决冲突，而不是在推送时才发现被拒绝。

**Q：怎么撤销一个已经在远程的提交？**

用 `git revert 提交哈希` 生成反向提交，再 `git push`。不要用 `git reset --hard` 去改已经共享的历史，那会让所有同事的分支错乱。

**Q：Git 和 SVN 最大的差别是什么？**

Git 是分布式的，每个克隆都是完整仓库，离线也能提交、看历史、切分支；SVN 是集中式的，多数操作需要连接服务器。这也是 Git 分支操作几乎瞬间完成的原因。

