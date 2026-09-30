---
title: curl 基础教程 — 命令行调试 HTTP 接口
date: 2026-09-23 10:00:00
permalink: /2026/09/23/curl-basics/
categories:
- 技术教程
tags:
- curl
- HTTP
- 命令行
- 工具
keywords: curl 教程, HTTP 调试, 接口测试, POST 请求, JSON, 认证, cookie, 超时, 断点续传, 安全
cover: /post-covers/curl-basics.jpg
banner:
  type: img
  bgurl: /post-covers/curl-basics.jpg
  banner_text: curl 基础教程 — 命令行调试 HTTP 接口
toc: true
comments: true
---

# curl 基础教程 — 命令行调试 HTTP 接口

> curl 是几乎所有系统都自带的 HTTP 客户端。它能在没有 Postman、没有浏览器的情况下把一次请求的每个细节都打印出来，是排查接口问题最直接的工具。
> 这篇教程从"把请求发出去"讲到"看懂响应、定位问题、避免把密钥泄露到 shell 历史里"。

## 目录

1. [curl 是什么，什么时候用它](#1-curl-是什么什么时候用它)
2. [第一个请求与响应拆解](#2-第一个请求与响应拆解)
3. [查看请求与响应的细节](#3-查看请求与响应的细节)
4. [GET 请求与查询参数](#4-get-请求与查询参数)
5. [POST 与四种请求体格式](#5-post-与四种请求体格式)
6. [请求头、认证与 Cookie](#6-请求头认证与-cookie)
7. [文件上传与下载](#7-文件上传与下载)
8. [重定向、超时与重试](#8-重定向超时与重试)
9. [保存响应与只取状态码](#9-保存响应与只取状态码)
10. [把 curl 命令转成代码](#10-把-curl-命令转成代码)
11. [安全与调试习惯](#11-安全与调试习惯)
12. [常见问题 FAQ](#12-常见问题-faq)

---

## 1. curl 是什么，什么时候用它

curl（client for URL）是一个用命令行发起网络请求的工具，支持 HTTP、HTTPS、FTP 等几十种协议。因为几乎所有 Linux/macOS 都预装、Windows 10 以后也自带 `curl.exe`，它成了跨环境调试的通用语言。

**curl 比图形化工具强在三点**：

1. **能看见细节**。`-v` 会把完整的请求头和响应头打印出来，包括 TLS 握手、重定向过程。图形工具往往会隐藏这些。
2. **可复制可版本化**。命令就是一行文本，能贴进 issue、写进脚本、存进文档。图形工具的配置大多没法直接复用。
3. **服务器上一定有**。生产环境出问题时，你不能在服务器上装一个 Postman，但一定能敲 curl。

**什么时候不该用它**：需要频繁改参数、管理多套环境变量、看复杂断言结果时，图形化工具（Postman、Insomnia）或脚本（Python requests）效率更高。curl 是"快速确认"的工具，不是"长期维护测试集"的工具。

### 确认可用

```bash
curl --version
# curl 8.4.0 (x86_64-pc-linux-gnu) libcurl/8.4.0 OpenSSL/3.0.11 zlib/1.2.13
```

Windows PowerShell 里有个坑：`curl` 曾经是 `Invoke-WebRequest` 的别名，行为与真正的 curl 不同。用 `curl.exe` 明确调用真正的 curl：

```powershell
curl.exe --version
```

---

## 2. 第一个请求与响应拆解

```bash
curl https://example.com
```

不带任何参数时，curl 把响应体直接打印到终端。

### 拆解一次完整交互

用 `-v`（verbose）看看背后发生了什么：

```bash
curl -v https://example.com
```

输出分三部分，用 `*`、`>`、`<` 区分：

```
*   Trying 93.184.216.34:443...            ← * 是 curl 自己的信息(连接、TLS、耗时)
* Connected to example.com
* SSL connection using TLSv1.3
> GET / HTTP/2                             ← > 是发出的请求
> Host: example.com
> User-Agent: curl/8.4.0
> Accept: */*
>
< HTTP/2 200                               ← < 是收到的响应
< content-type: text/html; charset=UTF-8
< content-length: 1256
<
<!doctype html>                            ← 响应体
```

**这个三段结构是排查问题的关键**：`*` 段的报错说明连不上（DNS、网络、证书），`>` 段有问题说明请求构造错了，`<` 段才是服务端返回的内容。

### 三个层次的详细程度

| 参数 | 输出 |
|---|---|
| 无 | 只有响应体 |
| `-i` | 响应头 + 响应体 |
| `-I` | 只有响应头（发 HEAD 请求） |
| `-v` | 上面全部 + 请求头 + 连接过程（`*` `>` `<`） |
| `-s` | 静默模式，去掉进度条和错误信息 |

`-s` 常和 `-S` 搭配：`-sS` 表示"平时安静，出错时仍然报错"。

---

## 3. 查看请求与响应的细节

### 只看响应头

```bash
curl -I https://example.com
```

输出：

```
HTTP/2 200
content-type: text/html; charset=UTF-8
content-length: 1256
cache-control: max-age=604800
```

`-I` 发的是 HEAD 请求，只取头部不取正文，检查链接是否有效、看缓存策略时最快。

### 响应头 + 正文一起看

```bash
curl -i https://example.com
```

### 只看连接和 TLS 信息

```bash
curl -v --trace-time https://example.com 2>&1 | head -30
```

### 测量各阶段耗时

```bash
curl -w "\\n--- 耗时 ---\\nDNS: %{time_namelookup}s\\n连接: %{time_connect}s\\nTLS握手: %{time_appconnect}s\\n首字节: %{time_starttransfer}s\\n总计: %{time_total}s\\n" -o /dev/null -s https://example.com
```

这是定位"接口慢在哪"的标准手段：DNS 慢说明域名解析有问题，首字节慢说明服务端处理慢，总计远大于首字节说明传输体量大。

### 关键耗时字段

| 变量 | 含义 |
|---|---|
| `time_namelookup` | DNS 解析耗时 |
| `time_connect` | TCP 连接建立耗时 |
| `time_appconnect` | TLS 握手完成耗时 |
| `time_starttransfer` | 收到第一个字节（含服务端处理时间） |
| `time_total` | 整次请求总耗时 |
| `http_code` | HTTP 状态码 |
| `size_download` | 下载字节数 |

---

## 4. GET 请求与查询参数

### 直接拼 URL

```bash
curl "https://api.example.com/search?q=curl&page=2"
```

**URL 里有 `&` 时必须加引号**，否则 shell 会把 `&` 理解成"放到后台执行"，命令行为完全出乎意料。

### 用 -G 和 --data-urlencode 安全传参

手工拼 URL 时，参数里的空格、中文、`&` 都需要转义。更安全的做法是让 curl 处理：

```bash
curl -G "https://api.example.com/search" \\
  --data-urlencode "q=curl 教程" \\
  --data-urlencode "page=2"
```

`-G` 表示"把下面这些数据当作查询参数附到 URL 上"（默认 `--data` 是 POST 请求体）。`--data-urlencode` 会自动做百分号编码，中文和空格都不用自己处理。

### 只取响应的某个字段（配合 jq）

```bash
curl -s "https://api.example.com/users/1" | jq '.name'
```

`jq` 是处理 JSON 的专用工具（见配套教程）。`-s` 去掉进度信息，输出才能干净地交给管道。

---

## 5. POST 与四种请求体格式

### JSON（最常用）

```bash
curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"张明","email":"zhangming@example.com"}'
```

要点：

1. **必须带 `-H "Content-Type: application/json"`**。很多 API 靠这个头决定怎么解析请求体，漏掉会返回 400 或解析失败。
2. **JSON 用单引号包裹**，这样里面的双引号不用转义。
3. `-X POST` 在用了 `-d` 时其实可以省略——curl 看到 `-d` 会自动用 POST。但显式写出来意图更清楚。

### 表单提交（application/x-www-form-urlencoded）

```bash
curl -X POST "https://api.example.com/login" \\
  -d "username=admin&password=secret"
```

`-d` 默认就是这种格式。注意参数值同样需要 URL 编码，含特殊字符时用 `--data-urlencode`：

```bash
curl -X POST "https://api.example.com/login" \\
  --data-urlencode "username=admin" \\
  --data-urlencode "password=p@ss word&x"
```

### multipart 表单（带文件上传）

```bash
curl -X POST "https://api.example.com/upload" \\
  -F "file=@./report.pdf" \\
  -F "title=季度报告"
```

`-F` 会构造 `multipart/form-data`，`@` 表示"读取这个文件的内容"。`-d` 和 `-F` 不能混用。

### 纯文本或其他格式

```bash
curl -X POST "https://api.example.com/raw" \\
  -H "Content-Type: text/plain" \\
  --data-binary @payload.txt
```

`--data-binary` 会**原样发送文件内容**，不做换行处理。相比之下 `-d @file` 会去掉换行符——上传二进制或需要保留格式时一定用 `--data-binary`。

### 四种方式对照

| 场景 | 参数 |
|---|---|
| JSON API | `-H "Content-Type: application/json" -d '{...}'` |
| 表单登录 | `--data-urlencode "k=v"` |
| 上传文件 | `-F "file=@路径"` |
| 原始二进制 | `--data-binary @路径` |

### 其他 HTTP 方法

```bash
curl -X PUT    "https://api.example.com/users/1" -d '{...}'   # 全量更新
curl -X PATCH  "https://api.example.com/users/1" -d '{...}'   # 局部更新
curl -X DELETE "https://api.example.com/users/1"
curl -X HEAD   "https://api.example.com/users/1"
```

---

## 6. 请求头、认证与 Cookie

### 自定义请求头

```bash
curl -H "Accept: application/json" \\
     -H "X-Request-Id: abc-123" \\
     "https://api.example.com/users"
```

需要**删掉**某个默认头时，值留空即可：

```bash
curl -H "User-Agent:" "https://api.example.com/users"
```

### Bearer Token

```bash
curl -H "Authorization: Bearer $TOKEN" "https://api.example.com/profile"
```

### Basic 认证

```bash
# 推荐: curl 会自己拼出正确的 Base64, 且密码不会出现在进程列表里
curl -u "用户名:密码" "https://api.example.com/private"
```

也可以只写用户名，curl 会交互式提示输入密码：

```bash
curl -u "用户名" "https://api.example.com/private"
```

> **不要手工拼 `Authorization: Basic ...`**。手动做 Base64 容易出错，而且明文密码会出现在 shell 历史和进程列表里。用 `-u` 让 curl 处理。

### 发送 Cookie

```bash
curl -b "session=abc123; theme=dark" "https://example.com/dashboard"
```

### 保存与复用 Cookie（模拟登录会话）

```bash
# 1. 登录并把服务器下发的 Cookie 存到文件
curl -c cookies.txt -X POST "https://example.com/login" \\
  -d "username=admin&password=secret"

# 2. 带着这份 Cookie 访问需要登录的页面
curl -b cookies.txt "https://example.com/dashboard"
```

`-c` 是写入 cookie jar，`-b` 是读取。这是调试"登录后跳转异常""会话丢失"这类问题最直接的方法。

---

## 7. 文件上传与下载

### 下载文件

```bash
# -o 指定输出文件名
curl -o report.pdf "https://example.com/report.pdf"

# -O 用 URL 里的文件名
curl -O "https://example.com/files/data.zip"

# 显示进度条(默认就有), 静默下载则不显示
curl -sS -o data.zip "https://example.com/data.zip"
```

### 断点续传

```bash
curl -C - -O "https://example.com/big-file.iso"
```

`-C -` 表示"自动从已下载的位置继续"。下载大文件中断后，重跑这条命令能接着下，不用从头开始。

### 跟随重定向

```bash
curl -L -O "https://example.com/download"
```

很多下载链接是 302 跳到真实地址，不加 `-L` 只会拿到一个空的跳转响应。

### 限制速度与超时

```bash
curl --limit-rate 1M -O "https://example.com/big.iso"       # 限速 1MB/s
curl --max-time 60 -o out.zip "https://example.com/data.zip" # 整次请求最多 60 秒
```

### 上传文件

```bash
# 简单 PUT 上传
curl -T local-file.txt "https://example.com/upload/dest.txt"

# 通过 multipart 表单上传(带其他字段)
curl -F "file=@./photo.jpg" -F "album=旅行" "https://api.example.com/photos"
```

### 一次传多个文件

```bash
curl -F "files=@a.txt" -F "files=@b.txt" "https://api.example.com/upload"
```

---

## 8. 重定向、超时与重试

### 跟随重定向

```bash
curl -L "https://example.com/old-path"
```

`-L` 会跟随 `Location` 头。默认最多跟 50 次，可用 `--max-redirs` 限制。

**只关心最终落在哪里**时：

```bash
curl -sL -o /dev/null -w "%{url_effective}\\n" "https://example.com/old-path"
```

### 超时设置

```bash
# 连接阶段最多等 5 秒
curl --connect-timeout 5 "https://api.example.com/slow"

# 整次请求最多 30 秒
curl --max-time 30 "https://api.example.com/slow"
```

**两个都要设**。只设 `--max-time` 时，如果对端一直不接受连接，你可能要等到总超时才失败；只设 `--connect-timeout` 时，连接上了但对方一直不回数据，请求会一直挂着。

### 失败重试

```bash
curl --retry 3 --retry-delay 2 --retry-connrefused "https://api.example.com/flaky"
```

| 参数 | 作用 |
|---|---|
| `--retry N` | 失败时最多重试 N 次 |
| `--retry-delay S` | 每次重试间隔 S 秒 |
| `--retry-connrefused` | 连接被拒绝时也重试（默认不重试） |
| `--retry-max-time S` | 重试总时长上限 |

### 严格模式

```bash
curl -f "https://api.example.com/maybe-404"
```

`-f`（`--fail`）让 curl 在 HTTP 状态码 >= 400 时返回非零退出码，并且不输出错误页面内容。**写脚本时必须加**，否则 404 的错误页面会被当成正常结果写进文件。

配合 `-sS` 使用：

```bash
curl -fsS -o out.json "https://api.example.com/data" || echo "请求失败"
```

---

## 9. 保存响应与只取状态码

### 保存到文件

```bash
curl -o response.json "https://api.example.com/users"
```

### 只看状态码

```bash
curl -s -o /dev/null -w "%{http_code}\\n" "https://example.com"
# 输出: 200
```

`-o /dev/null` 丢弃响应体，`-w` 打印指定信息。这是**检查接口可用性最常用的组合**，可以批量跑：

```bash
for url in https://a.example.com https://b.example.com; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  echo "$code  $url"
done
```

### 分离响应体与响应头

```bash
# 把头和体分别写到不同文件
curl -D headers.txt -o body.html "https://example.com"

# 只保存响应头
curl -I "https://example.com" > headers.txt
```

### 多种输出信息一次打印

```bash
curl -s -o /dev/null -w "状态码: %{http_code}\\n耗时: %{time_total}s\\n大小: %{size_download} 字节\\n" \\
  "https://api.example.com/data"
```

---

## 10. 把 curl 命令转成代码

浏览器开发者工具的"Copy as cURL"能导出网络面板里的任意请求，这是**复现前端请求**最快捷的路径：F12 → Network → 右键请求 → Copy → Copy as cURL。

拿到 curl 命令后，如果要在代码里用，可以用转换工具：

- [curlconverter.com](https://curlconverter.com/) — 转成 Python、JavaScript、Go、Java 等 20 多种语言；
- VS Code 的 "Paste cURL as Code" 扩展。

比如这条：

```bash
curl -X POST "https://api.example.com/login" \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"secret"}'
```

用 Python requests 等价实现：

```python
import requests

resp = requests.post(
    "https://api.example.com/login",
    json={"username": "admin", "password": "secret"},
    timeout=30,
)
resp.raise_for_status()
print(resp.json())
```

用 JavaScript fetch：

```javascript
const resp = await fetch("https://api.example.com/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "admin", password: "secret" }),
});
if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
const data = await resp.json();
```

> **提醒**：从浏览器复制的 curl 命令里常带着完整的 Cookie 和 Token。转成代码或贴到 issue 之前，**先把凭据替换成占位符**（见第 11 节）。

---

## 11. 安全与调试习惯

### 三条硬性规则

**1. 不要把密钥写进命令。**

命令行会进 shell 历史、进进程列表（`ps aux` 对同机其他用户可见）。

```bash
# 危险: 密码留在了历史里
curl -u "admin:MySecretPass" https://api.example.com

# 好: 从环境变量读
curl -H "Authorization: Bearer $API_TOKEN" https://api.example.com

# 好: 密码从文件读, 且注意文件权限
curl -u "admin:$(cat ~/.api-secret)" https://api.example.com
```

环境变量的用法：

```bash
export API_TOKEN="xxxxx"      # 当前会话有效, 不进历史的是值本身
curl -H "Authorization: Bearer $API_TOKEN" https://api.example.com
unset API_TOKEN               # 用完清掉
```

**2. 分享命令前先清洗。**

贴到 issue、文档、聊天群之前检查这几处：

- `Authorization` 头的值；
- `Cookie` 里的 session；
- URL 查询参数里的 `token`、`key`、`secret`；
- `-d` 请求体里的密码字段。

替换成 `<YOUR_TOKEN_HERE>` 这类占位符。

**3. 调试用的 `-k` 不要带进生产。**

```bash
# -k 关闭证书校验, 只用于本地自签证书的调试
curl -k https://localhost:8443/
```

`-k`（`--insecure`）会跳过 TLS 证书验证，等于失去了防中间人攻击的能力。**只在本地调试自签证书时临时使用**，绝不能出现在脚本或生产配置里。

### 让命令进历史更安全的做法

```bash
# 命令前加空格, bash 默认不会记录(取决于 HISTCONTROL 设置)
 curl -H "Authorization: Bearer secret" https://api.example.com

# 或者显式从历史里删掉刚执行的那条
history -d $(history 1 | awk '{print $1}')
```

### 调试脚本里推荐的基础参数

```bash
curl -fsS --connect-timeout 5 --max-time 30 --retry 2 \\
  -H "Accept: application/json" \\
  "https://api.example.com/data"
```

这一组参数的含义：失败即报错（`-f`）、安静但保留错误（`-sS`）、连接和总时长都有上限、偶发失败自动重试两次。

### 一个完整的排查流程

接口不通时按这个顺序查：

```bash
# 1. DNS 能解析吗
nslookup api.example.com

# 2. 能连上吗(看 * 段有没有 Connected)
curl -v --connect-timeout 5 "https://api.example.com/health"

# 3. 证书有问题吗(看 * 段的 TLS 信息)
curl -vI "https://api.example.com/" 2>&1 | grep -i "SSL\\|TLS\\|certificate"

# 4. 请求构造对吗(看 > 段)
curl -v -X POST "https://api.example.com/api" \\
  -H "Content-Type: application/json" -d '{"k":"v"}'

# 5. 服务端返回什么(看 < 段和响应体)
curl -i "https://api.example.com/api"

# 6. 慢在哪(看各阶段耗时)
curl -w "首字节: %{time_starttransfer}s 总计: %{time_total}s\\n" -o /dev/null -s "https://api.example.com/api"
```

---

## 12. 常见问题 FAQ

**Q：URL 里有 `&` 命令就出错，为什么？**

shell 把 `&` 解释成后台执行。给整个 URL 加引号即可：

```bash
curl "https://api.example.com/a?x=1&y=2"
```

**Q：POST 返回 400，提示解析失败？**

八成是漏了 `Content-Type`。JSON 请求必须带：

```bash
-H "Content-Type: application/json"
```

另外确认 JSON 本身合法，可以用 `jq . <<< '{"a":1}'` 校验。

**Q：中文参数怎么传？**

用 `--data-urlencode` 让 curl 自动编码，不要手工拼：

```bash
curl -G "https://api.example.com/s" --data-urlencode "q=中文查询"
```

**Q：怎么处理自签证书的本地服务？**

调试阶段可以用 `-k`，但更好的做法是把自签 CA 加到信任列表，或用 `--cacert` 指定证书：

```bash
curl --cacert ./local-ca.crt https://localhost:8443/
```

**Q：`-d` 和 `--data-binary` 有什么区别？**

`-d @file` 会去掉文件里的换行符；`--data-binary @file` 原样发送。上传二进制或需要保留换行的内容用后者。

**Q：响应是乱码怎么办？**

先看响应的 `Content-Type` 里声明的编码，再按编码转换：

```bash
curl -s "https://example.com/page" | iconv -f gbk -t utf-8
```

**Q：为什么响应体不完整？**

常见原因是没跟随重定向（加 `-L`）或响应被压缩（加 `--compressed` 让 curl 自动解压）。也可能是 `--max-time` 设得太短被中断。

**Q：怎么只看响应里的某个 JSON 字段？**

```bash
curl -s "https://api.example.com/user/1" | jq -r '.data.name'
```

**Q：curl 和 wget 该用哪个？**

- 需要构造请求（自定义头、方法、请求体）→ curl；
- 只是递归下载整站 → wget 的 `-r` 更方便。

日常调试接口基本都用 curl。

**Q：`-X POST` 和 `-d` 会不会冲突？**

不会，但要注意：如果写了 `-X GET` 又带 `-d`，curl 会用 GET 方法发送请求体——这在多数服务端会报错。**方法和数据要匹配。**

**Q：怎么保存完整的调试信息发给同事？**

```bash
curl -v "https://api.example.com/api" > resp.txt 2> trace.txt
```

`-v` 的信息输出到 stderr，响应体输出到 stdout，所以分别重定向即可。**发送前记得清理 trace.txt 里的凭据。**

