---
title: Nginx 基础教程 — 静态站点、反向代理与常见配置
date: 2026-09-24 14:00:00
permalink: /2026/09/24/nginx-basics/
categories:
- 技术教程
tags:
- Nginx
- 服务器
- 运维
- 工具
keywords: Nginx 教程, 反向代理, 静态站点, 配置文件, location 匹配, HTTPS, 负载均衡, 缓存, 日志排查
cover: /post-covers/nginx-basics.jpg
banner:
  type: img
  bgurl: /post-covers/nginx-basics.jpg
  banner_text: Nginx 基础教程 — 静态站点、反向代理与常见配置
toc: true
comments: true
---

# Nginx 基础教程 — 静态站点、反向代理与常见配置

> Nginx 是 Web 服务里最常见的组件：托管静态站点、做反向代理、终止 TLS、做负载均衡。
> 这篇教程从配置文件的结构讲起，覆盖 location 匹配规则（最容易出错的部分）、反向代理、HTTPS 与日志排查。

## 目录

1. [Nginx 是什么，用在哪](#1-nginx-是什么用在哪)
2. [安装与进程模型](#2-安装与进程模型)
3. [配置文件结构](#3-配置文件结构)
4. [托管静态站点](#4-托管静态站点)
5. [location 匹配规则](#5-location-匹配规则)
6. [反向代理](#6-反向代理)
7. [HTTPS 配置](#7-https-配置)
8. [负载均衡](#8-负载均衡)
9. [缓存与压缩](#9-缓存与压缩)
10. [安全与限流](#10-安全与限流)
11. [日志与排查](#11-日志与排查)
12. [常用命令速查](#12-常用命令速查)
13. [常见问题 FAQ](#13-常见问题-faq)

---## 1. Nginx 是什么，用在哪

Nginx 是一个高性能的 HTTP 服务器和反向代理服务器。它的核心特点是**事件驱动 + 异步非阻塞**：少量 worker 进程就能处理数万并发连接，内存占用还很低。

### 四种典型用途

| 用途 | 说明 |
|---|---|
| **静态文件服务** | 直接返回 HTML/CSS/JS/图片，速度快、内存占用低 |
| **反向代理** | 把请求转发给后端应用（Node、Java、Python），对外只暴露 Nginx |
| **TLS 终止** | 在 Nginx 上配置证书，内部用明文与后端通信，简化证书管理 |
| **负载均衡** | 把流量分发到多个后端实例 |

### 正向代理与反向代理的区别

这是最容易混淆的一对概念：

- **正向代理**代理的是**客户端**。客户端明确知道自己通过代理访问外网（例如企业网关）。
- **反向代理**代理的是**服务端**。客户端以为自己在直接访问服务器，不知道背后有多少实例。

Nginx 做的是反向代理：它是**服务器的门面**。

### 为什么要把 Nginx 放在应用前面

1. **静态资源效率更高**。Nginx 处理静态文件的性能远好于大多数应用框架。
2. **统一入口**。证书、压缩、缓存、限流配置集中在一处，不用在每个应用里重复实现。
3. **后端可以只监听 127.0.0.1**。应用不直接暴露到公网，攻击面小得多。
4. **平滑重启与滚动升级**。后端更新时 Nginx 可以优雅地切换流量。

---

## 2. 安装与进程模型

### 安装

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install nginx

# CentOS / RHEL 系
sudo dnf install nginx

# macOS
brew install nginx
```

### 配置文件的默认位置

| 路径 | 用途 |
|---|---|
| `/etc/nginx/nginx.conf` | 主配置 |
| `/etc/nginx/conf.d/*.conf` | 按站点拆分的配置（多数发行版自动 include） |
| `/etc/nginx/sites-available/` | Debian/Ubuntu 可用站点配置 |
| `/etc/nginx/sites-enabled/` | 实际生效的站点（软链接到此目录） |
| `/etc/nginx/snippets/` | 可复用的配置片段 |
| `/var/log/nginx/access.log` | 访问日志 |
| `/var/log/nginx/error.log` | 错误日志 |

### 进程模型

Nginx 启动后有两个角色：

```
master 进程          读配置、管理 worker、处理信号
  ├── worker 进程    实际处理请求（数量通常等于 CPU 核数）
  ├── worker 进程
  └── worker 进程
```

**master 只做管理，worker 干活**。这个设计让 Nginx 能平滑重启：新 worker 起来接管流量，旧 worker 处理完手上的请求再退出，用户完全不感知。

### 信号控制

```bash
nginx -s reload     # 重载配置(不中断服务, 最常用)
nginx -s quit       # 优雅停止(处理完当前请求再退出)
nginx -s stop       # 快速停止
nginx -s reopen     # 重新打开日志文件(日志切割后执行)
```

用 systemd 时：

```bash
sudo systemctl reload nginx     # 等价于 nginx -s reload
sudo systemctl restart nginx    # 完全重启(会短暂中断)
sudo systemctl status nginx
```

> **优先用 `reload` 而不是 `restart`**。`reload` 不中断现有连接，`restart` 会有短暂的拒绝服务窗口。

### 改配置前必须先测语法

```bash
sudo nginx -t
```

输出 `syntax is ok` 和 `test is successful` 才去 reload。**这一步能拦住绝大多数配置错误**——如果配置有语法问题就 reload，Nginx 会继续用旧配置运行（这是好设计），但你的新改动不会生效，容易误以为改了没用。

---

## 3. 配置文件结构

Nginx 配置是**分层的指令块**结构：

```nginx
# 全局层: 影响整个 Nginx
user  www-data;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /run/nginx.pid;

# events 层: 连接处理方式
events {
    worker_connections 1024;
}

# http 层: 所有 HTTP 相关配置
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    # server 块: 一个站点(虚拟主机)
    server {
        listen 80;
        server_name example.com www.example.com;

        # location 块: 按路径匹配处理规则
        location / {
            root /var/www/html;
            index index.html;
        }
    }
}
```

### 三层块的作用

| 块 | 作用 | 可以出现多次 |
|---|---|---|
| `http` | HTTP 全局设置，包含所有 server | 一般一次 |
| `server` | 一个虚拟主机（域名 + 端口） | 是 |
| `location` | 某个 URL 路径的处理方式 | 是 |

**指令有继承关系**：内层块继承外层设置，内层可以覆盖。比如在 `http` 里设了 `gzip on;`，所有 server 都生效。

### 一个可直接用的站点模板

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    root /var/www/example;
    index index.html;

    charset utf-8;

    access_log /var/log/nginx/example.access.log;
    error_log  /var/log/nginx/example.error.log;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

要点：

- `listen [::]:80` 同时监听 IPv6；
- `charset utf-8` 避免中文乱码；
- `try_files $uri $uri/ =404` 是静态站点的标准写法：按顺序找文件，找不到就返回 404。

### 拆分与复用配置

站点多了以后把每个站点放在独立文件里：

```bash
sudo cp my-site.conf /etc/nginx/conf.d/
# Debian/Ubuntu 的惯例
sudo ln -s /etc/nginx/sites-available/my-site /etc/nginx/sites-enabled/
```

公共部分抽取成片段：

```nginx
# /etc/nginx/snippets/ssl-params.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
```

然后在 server 块里引用：

```nginx
include snippets/ssl-params.conf;
```

**把重复配置抽成 snippet 是保持配置可维护的关键**，否则改一个安全参数要在十几个站点文件里各改一次。

---## 4. 托管静态站点

### 最简配置

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/example;
    index index.html;
}
```

`root` 指定文件根目录，`index` 指定默认文件。访问 `http://example.com/a/b.html` 会读取 `/var/www/example/a/b.html`。

### 单页应用（SPA）的配置

Vue/React 这类前端路由的应用，直接刷新子路径会 404（因为服务器上没有那个文件）。需要用 `try_files` 把请求都交给 `index.html`：

```nginx
server {
    listen 80;
    server_name app.example.com;
    root /var/www/app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

含义：先找真实文件，再找目录，都没有就返回 `index.html` 让前端路由处理。**这是 SPA 部署最容易漏的一步。**

### 静态资源缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff2|woff|ttf|ico)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

注意点：

- `~*` 表示不区分大小写的正则匹配；
- **只对带内容哈希的文件名加 `immutable`**。如果文件名不含哈希（比如 `main.js`），用 `immutable` 会导致浏览器在缓存有效期内不检查更新，发新版用户看不到。这种情况应该用较短的 `expires` 或改用 `no-cache` 配合 ETag。
- `access_log off` 减少日志噪音（静态资源请求量最大，日志价值低）。

### 更稳妥的缓存策略

```nginx
# HTML 不缓存, 保证用户总能拿到最新的入口文件
location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate";
}

# 带哈希指纹的资源长期缓存
location ~* \.[0-9a-f]{8,}\.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 其他静态资源中等时长
location ~* \.(png|jpg|jpeg|gif|svg|woff2)$ {
    expires 30d;
}
```

**核心原则：入口文件不缓存，带内容哈希的资源长期缓存。** 这样既能享受缓存收益，又能保证发版后用户及时看到新内容。

### 禁止访问敏感文件

```nginx
# 禁止访问隐藏文件(如 .git、.env)
location ~ /\. {
    deny all;
    return 404;
}
```

这一条**非常重要**。如果站点目录是 Git 仓库的工作副本且没做这层防护，`.git/config`、`.env` 这类文件可能被直接下载。

### 目录列表（谨慎开启）

```nginx
location /downloads/ {
    autoindex on;
    autoindex_exact_size off;
    autoindex_localtime on;
}
```

`autoindex on` 会把目录内容列出来。**只在不含敏感文件的目录上开启**，否则等于把文件清单公开。

---

## 5. location 匹配规则

这是 Nginx 里最容易出错的部分。理解匹配的**优先级顺序**是关键。

### 四种修饰符

| 修饰符 | 含义 | 示例 |
|---|---|---|
| `=` | 精确匹配 | `location = /favicon.ico` |
| `^~` | 前缀匹配，且不再检查正则 | `location ^~ /static/` |
| `~` | 正则匹配（区分大小写） | `location ~ \.php$` |
| `~*` | 正则匹配（不区分大小写） | `location ~* \.(jpg|png)$` |
| 无 | 普通前缀匹配 | `location /api/` |

### 匹配顺序（重点）

1. **先找精确匹配 `=`**。命中就立即使用，结束。
2. **再找最长前缀匹配**。记下最长的那条。
3. **如果最长前缀匹配带 `^~`**，直接使用它，不再检查正则。
4. **否则按配置文件中出现的顺序检查正则**。**第一个命中的正则胜出**。
5. **正则都不命中**，使用第 2 步记下的最长前缀匹配。

> **关键结论**：正则匹配的优先级**高于**普通前缀匹配。所以 `location /api/` 和 `location ~ \.json$` 同时存在时，`/api/data.json` 会走正则那条，即使前缀更长。

### 举例说明

```nginx
server {
    location = /exact        { return 200 "精确匹配\n"; }
    location ^~ /static/     { return 200 "前缀+^~\n"; }
    location ~ \.png$       { return 200 "正则 png\n"; }
    location /              { return 200 "兜底\n"; }
}
```

| 请求路径 | 命中 | 原因 |
|---|---|---|
| `/exact` | 精确匹配 | `=` 优先级最高 |
| `/static/a.png` | 前缀+^~ | `^~` 命中后跳过正则 |
| `/img/a.png` | 正则 png | 正则优先于普通前缀 |
| `/other` | 兜底 | 只有 `/` 能匹配 |

### 用 ^~ 保护静态目录

如果 `/static/` 目录下有 `.js`、`.css`，而你又配置了正则来处理这些后缀，可能出意外。用 `^~` 明确指定：

```nginx
location ^~ /static/ {
    root /var/www;
    expires 30d;
}
```

### 尾部斜杠的差异

```nginx
location /api { ... }     # 匹配 /api, /api/, /apixyz
location /api/ { ... }    # 只匹配 /api/ 开头的, 不匹配 /apixyz
```

**带尾部斜杠更精确**。需要严格限定目录时用带斜杠的写法。

### 用 location 实现跳转

```nginx
# 永久重定向
location = /old-page {
    return 301 /new-page;
}

# 把整个目录跳到新域名
location /blog/ {
    return 301 https://newblog.example.com$request_uri;
}
```

注意 `$request_uri` 包含完整的原始路径和查询串，是重定向时保留参数的常用做法。

> **301 与 302 的区别**：301 是永久重定向，浏览器会缓存它，改错了很难让用户更新；302 是临时重定向，不缓存。**不确定或可能再改时用 302**。

---## 6. 反向代理

把请求转发给后端应用：

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

访问 `api.example.com/users` 会被转发到本机 3000 端口的 `/users`。

### 必须补的代理头

只写 `proxy_pass` 时，后端拿不到真实信息。加上这几个头：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;

    # 把真实的主机名/协议/客户端 IP 传给后端
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host  $host;
}
```

| 头 | 作用 |
|---|---|
| `Host` | 后端据此生成正确的链接、做虚拟主机路由 |
| `X-Real-IP` | 客户端真实 IP |
| `X-Forwarded-For` | 经过的代理链，供日志和风控使用 |
| `X-Forwarded-Proto` | 原始协议（http/https），后端判断是否要跳转 HTTPS 时必需 |

**漏掉 `X-Forwarded-Proto` 会导致后端误判为 HTTP，产生重定向死循环**——这是配置反向代理后最常见的故障。

### proxy_pass 路径的细微差别（重要）

`proxy_pass` 后面**有没有尾部路径**，行为完全不同：

```nginx
# 情况 1: 不带路径 -> 原样转发
location /api/ {
    proxy_pass http://127.0.0.1:3000;
}
# /api/users  ->  http://127.0.0.1:3000/api/users

# 情况 2: 带路径 -> 替换掉 location 匹配的部分
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
}
# /api/users  ->  http://127.0.0.1:3000/users
```

规律：**`location` 加上 `proxy_pass` 的路径拼接后，就是最终发给后端的 URI**。情况 2 里 `/api/` 被替换成了 `/`。

排查时需要特别注意：如果后端收到的是 `/api/users` 而它只认 `/users`，就要给 `proxy_pass` 加上结尾的 `/`。

### 超时设置

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;

    proxy_connect_timeout 5s;      # 与后端建连超时
    proxy_send_timeout    60s;     # 向后端发送请求超时
    proxy_read_timeout    60s;     # 等待后端响应超时

    proxy_buffering on;            # 缓冲后端响应
    proxy_buffer_size 8k;
}
```

`proxy_read_timeout` 默认 60 秒。**后端有耗时接口时（如导出大报表）必须调大**，否则会看到 504 Gateway Timeout。

### 长连接与 WebSocket

WebSocket 需要额外的头才能升级协议：

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;   # WebSocket 是长连接, 超时要放宽
}
```

`proxy_http_version 1.1` 是必须的——WebSocket 升级需要 HTTP/1.1。

### 上传大文件

默认限制是 1MB，上传稍大的文件就会返回 413：

```nginx
location /upload {
    client_max_body_size 100m;
    proxy_pass http://127.0.0.1:3000;
}
```

可以放在 `http`、`server` 或 `location` 层。

### 后端拿到真实 IP 的前提

Nginx 自己在反向代理之后时（例如放在云负载均衡后面），`$remote_addr` 会是上一级代理的 IP。这时需要信任上游代理并读取转发头：

```nginx
set_real_ip_from 10.0.0.0/8;
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

> **安全提醒**：`set_real_ip_from` 只应包含**你确实信任的**代理网段。如果把 `0.0.0.0/0` 加进去，任何人都能伪造 `X-Forwarded-For` 来伪装 IP，导致限流、封禁、审计全部失效。

---

## 7. HTTPS 配置

### 用 Certbot 自动申请证书（推荐）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot 会自动改 Nginx 配置、申请证书、设置自动续期。完成后可以查看自动续期定时任务：

```bash
sudo certbot renew --dry-run    # 测试续期流程
```

### 手写配置

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    # 全部跳到 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 安全参数建议抽成 snippet 复用
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    root /var/www/example;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 强制 HTTPS 的几种做法

```nginx
# 做法 1: HTTP 全站跳 HTTPS(推荐)
server {
    listen 80 default_server;
    return 301 https://$host$request_uri;
}
```

**不要用 `if ($scheme = http) { return 301 ... }` 这种写法**，`if` 在 Nginx 里有"if is evil"的说法，容易产生意外行为。用独立的 server 块做跳转最清晰。

### 安全响应头

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

| 头 | 防的问题 |
|---|---|
| `X-Content-Type-Options: nosniff` | 阻止浏览器猜 MIME 类型导致的脚本执行 |
| `X-Frame-Options: SAMEORIGIN` | 防点击劫持（禁止被其他站点 iframe 嵌入） |
| `Referrer-Policy` | 控制跨站时泄露的 Referer 信息量 |
| `Strict-Transport-Security` | 强制后续访问走 HTTPS |

> **HSTS 要先确认理解再启用**。一旦浏览器记下 HSTS，在 `max-age` 有效期内**无法通过"继续访问"绕过证书警告**。如果证书配置有问题又启用了长期 HSTS，会让用户完全无法访问，且只能等 max-age 过期。
>
> 建议先用较短的 `max-age`（比如 300）验证无误后再逐步调大。

### 关于 always 参数

`add_header` 默认只在 2xx/3xx 响应上加头，4xx/5xx 不加。加 `always` 让所有响应都带上——**排查问题时有用的头在错误响应里才最关键**。

### OCSP Stapling（可选）

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
resolver 223.5.5.5 119.29.29.29 valid=300s;
```

它能让 TLS 握手更快。`resolver` 必须配置，否则 stapling 不生效。

---

## 8. 负载均衡

### 基本配置

```nginx
upstream backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

默认策略是**轮询**（round-robin），请求依次分给各个后端。

### 几种调度策略

```nginx
# 权重(性能不同的机器给不同权重)
upstream backend {
    server 10.0.0.1:3000 weight=3;   # 分到 3 倍流量
    server 10.0.0.2:3000 weight=1;
}

# 最少连接(把新请求给当前连接数最少的)
upstream backend {
    least_conn;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}

# IP 哈希(同一客户端固定到同一台, 用于会话粘性)
upstream backend {
    ip_hash;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
}
```

| 策略 | 适用场景 |
|---|---|
| 轮询（默认） | 后端配置相同、请求耗时均匀 |
| `weight` | 机器性能有差异 |
| `least_conn` | 请求耗时长短不一（长连接、大文件） |
| `ip_hash` | 需要会话粘性且没做集中式 session 存储 |

**更好的会话方案是共享 session**（Redis 等），而不是 `ip_hash`。后者在客户端换 IP（移动网络）时会丢失会话，且负载分布可能不均。

### 健康检查与故障转移

```nginx
upstream backend {
    server 10.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:3000 max_fails=3 fail_timeout=30s;
    server 10.0.0.3:3000 backup;    # 备用, 其他都挂了才用

    keepalive 32;    # 与后端保持长连接
}
```

含义：某台后端在 30 秒内失败 3 次就暂时踢出，30 秒后再试；`backup` 标的主机平时不接流量。

> **开源版 Nginx 的健康检查是"被动"的**：只有真实请求失败后才标记节点不可用。主动健康检查（定期探测 `/health`）需要 Nginx Plus 或第三方模块。想用成熟的主动探测，可以考虑 OpenResty、Traefik、HAProxy，或让上游负载均衡器承担这一职责。

### 保持与后端的长连接

```nginx
upstream backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

`proxy_set_header Connection ""` 是必需的——它清掉默认的 `close`，让连接得以复用。**高并发下开启长连接能显著降低握手开销。**

---## 9. 缓存与压缩

### gzip 压缩

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;              # 太小的文件压缩没收益
gzip_comp_level 5;                 # 1-9, 5 是压缩率与 CPU 的平衡点
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/json
    application/xml
    image/svg+xml;
```

要点：

- **`text/html` 不需要列出来**，Nginx 默认就压缩它；
- **不要压缩图片、视频、zip**——它们已经是压缩格式，再压只是浪费 CPU；
- `gzip_vary on` 让缓存能正确区分压缩与非压缩版本。

### 关于 brotli

Brotli 的压缩率通常优于 gzip（尤其对文本）。开源 Nginx 需要额外编译 `ngx_brotli` 模块，或使用 OpenResty / 云服务商提供的版本：

```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript application/json image/svg+xml;
```

### 反向代理缓存

```nginx
# 在 http 层定义缓存区
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m
                 max_size=1g inactive=60m use_temp_path=off;

server {
    location /api/public/ {
        proxy_cache my_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        proxy_cache_use_stale error timeout updating;

        # 便于调试: 在响应头里显示是否命中缓存
        add_header X-Cache-Status $upstream_cache_status;

        proxy_pass http://127.0.0.1:3000;
    }
}
```

`X-Cache-Status` 的值（`HIT`、`MISS`、`EXPIRED`、`BYPASS`）能让你直接确认缓存是否按预期工作。

> **缓存注意点**：
> 1. **只缓存对所有人相同的响应**。带用户信息的接口绝对不能缓存，否则会把 A 的数据返回给 B。
> 2. **只对 GET/HEAD 缓存**。Nginx 默认不缓存其他方法。
> 3. **先确认后端是否有 `Cache-Control: private`**，Nginx 会尊重上游的这些头。
> 4. 缓存目录要预留足够磁盘，`max_size` 满了会按 LRU 淘汰。

---

## 10. 安全与限流

### 限流：控制请求速率

```nginx
# http 层: 定义限流区
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    location /api/ {
        # burst=20: 允许突发 20 个请求排队
        # nodelay: 突发请求立即处理, 不延迟
        limit_req zone=api_limit burst=20 nodelay;

        # 超限时返回 429 而不是默认的 503
        limit_req_status 429;

        proxy_pass http://127.0.0.1:3000;
    }
}
```

`$binary_remote_addr` 比 `$remote_addr` 省内存（二进制形式），10m 大约能存 16 万个地址。

### 限制并发连接数

```nginx
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    location /download/ {
        limit_conn conn_limit 5;         # 每个 IP 最多 5 个并发连接
        limit_conn_status 429;
    }
}
```

### 限速下载

```nginx
location /files/ {
    limit_rate 500k;              # 每个连接限速 500KB/s
    limit_rate_after 2m;          # 前 2MB 不限速, 之后开始限
}
```

### 禁止访问敏感路径

```nginx
# 阻止访问点开头的文件(.git/.env/.htaccess)
location ~ /\. {
    deny all;
    return 404;
}

# 阻止访问常见敏感后缀
location ~* \.(sql|bak|log|conf|ini|key|pem)$ {
    deny all;
    return 404;
}

# 阻止直接执行上传目录里的脚本
location ^~ /uploads/ {
    location ~ \.(php|jsp|asp)$ {
        deny all;
    }
}
```

> **返回 404 而不是 403**：403 会明确告诉探测者"这个文件存在但你没权限"，404 则不透露任何信息。**减少信息泄露是安全配置的基本原则。**

### 隐藏版本号

```nginx
# http 层
server_tokens off;
```

默认的错误页和响应头会带 Nginx 版本号，攻击者可以据此查找对应版本的漏洞。关掉它能少暴露一点信息（虽然不能替代及时更新）。

### 只允许特定方法

```nginx
location /api/ {
    if ($request_method !~ ^(GET|POST|PUT|DELETE|PATCH|OPTIONS)$) {
        return 405;
    }
    proxy_pass http://127.0.0.1:3000;
}
```

这里用 `if` 是安全的——**只做 `return` 的 `if` 不会产生常见的陷阱**。但复杂逻辑仍应避免在 `if` 里写。

### 安全配置清单

| 项目 | 配置 |
|---|---|
| 隐藏版本 | `server_tokens off;` |
| 敏感文件 | `location ~ /\. { deny all; }` |
| 上传目录不可执行 | 单独 location + `deny` |
| 请求体限制 | `client_max_body_size` 按需设置 |
| 超时控制 | `client_body_timeout`、`send_timeout` |
| 限流 | `limit_req_zone` + `limit_req` |
| HTTPS | 强制跳转 + HSTS（谨慎） |
| 安全响应头 | nosniff / SAMEORIGIN / Referrer-Policy |
| 及时更新 | 关注发行版的 nginx 安全更新 |

---

## 11. 日志与排查

### 自定义日志格式

```nginx
# http 层
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" rt=$request_time '
                'urt=$upstream_response_time';

access_log /var/log/nginx/access.log main;
```

关键字段：

| 变量 | 含义 |
|---|---|
| `$request_time` | Nginx 从收到请求到发完响应的总耗时 |
| `$upstream_response_time` | 后端处理耗时 |
| `$status` | 状态码 |
| `$request` | 请求行（方法 + 路径 + 协议） |

> **`$request_time` 与 `$upstream_response_time` 的差值就是 Nginx 自身的开销 + 网络传输时间**。如果总耗时远大于后端耗时，问题在传输环节（响应体大、客户端网络慢）；反之则在后端。

### 常用排查命令

```bash
# 看错误日志的实时输出
sudo tail -f /var/log/nginx/error.log

# 统计状态码分布
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head

# 找出访问最多的 IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# 找出最慢的请求(需要日志里有 rt=)
grep -o 'rt=[0-9.]*' /var/log/nginx/access.log | sort -t= -k2 -rn | head -20

# 找出 5xx 错误对应的 URL
awk '$9 ~ /^5/ {print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head

# 实时统计每分钟请求数
awk '{print $4}' /var/log/nginx/access.log | cut -d: -f1-2 | uniq -c
```

### 常见状态码的原因

| 状态码 | 常见原因 |
|---|---|
| **400 Bad Request** | 请求头过大（`large_client_header_buffers`）、请求格式异常 |
| **403 Forbidden** | 文件权限不对、`deny` 规则命中、SELinux 限制 |
| **404 Not Found** | `root` 路径错、文件不存在、`try_files` 配置问题 |
| **413** | 请求体超过 `client_max_body_size` |
| **499** | **客户端主动断开**（不是服务端错误） |
| **500** | 后端应用报错、Nginx 配置里脚本执行失败 |
| **502 Bad Gateway** | 后端没启动、端口不对、后端崩了 |
| **504 Gateway Timeout** | 后端处理超时（`proxy_read_timeout` 太短或后端确实慢） |

> **499 是个容易误判的状态**：它表示客户端在服务端返回前就断开了连接。常见于用户等不及刷新、超时设置不合理、或上游代理提前放弃。**它不是 Nginx 的错误，排查方向应该在客户端超时设置或后端响应速度。**

### 502 的排查顺序

```bash
# 1. 后端进程在跑吗
ps aux | grep node          # 或 java / python

# 2. 后端监听的端口对吗
ss -tlnp | grep 3000
curl -v http://127.0.0.1:3000/health

# 3. Nginx 配置的地址对吗
nginx -T | grep proxy_pass

# 4. 看错误日志的具体原因
sudo tail -50 /var/log/nginx/error.log
```

`error.log` 里的 `connect() failed (111: Connection refused)` 明确说明后端没在监听；`no live upstreams` 说明所有后端都被标记为不可用了。

### 调试配置时的小技巧

```bash
# 打印最终生效的完整配置(包含所有 include 展开)
sudo nginx -T

# 定位某个指令最终来自哪个文件
sudo nginx -T | grep -n "proxy_pass" -B5
```

`nginx -T` 会把所有 include 展开成完整配置，**排查"我改了为什么没生效"时最有用**——很可能你的配置被另一个文件里的规则覆盖了。

---

## 12. 常用命令速查

```bash
# 测试配置语法(改配置后必做)
sudo nginx -t

# 重载配置(不中断服务)
sudo systemctl reload nginx
# 或
sudo nginx -s reload

# 输出最终生效的完整配置
sudo nginx -T

# 查看版本与编译参数
nginx -v
nginx -V

# 服务管理
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx
sudo systemctl enable nginx     # 开机自启

# 查看进程
ps aux | grep nginx

# 查看监听端口
sudo ss -tlnp | grep nginx

# 日志切割后重新打开日志文件
sudo nginx -s reopen

# 检查站点配置文件是否被包含
grep -r "include" /etc/nginx/nginx.conf
```

---

## 13. 常见问题 FAQ

**Q：改了配置但没生效？**

三步走：

1. `sudo nginx -t` 确认语法正确；
2. `sudo nginx -s reload` 实际重载；
3. `sudo nginx -T` 查看**最终生效**的配置（很可能被另一个 include 的规则覆盖了）。

**Q：404 但文件确实存在？**

常见原因：

- `root` 路径写错（相对路径是相对 Nginx 的前缀目录，容易出错，**建议一律用绝对路径**）；
- 文件权限不对（Nginx 的 worker 用户读不到）：`chmod 755` 目录、`chmod 644` 文件；
- SELinux 阻止访问（CentOS/RHEL 上常见）：`sudo ausearch -m avc -ts recent` 查看；
- 目录缺少执行位（`x`），导致无法进入。

**Q：403 Forbidden 怎么排查？**

按顺序检查：文件权限（目录需要 `x`，文件需要 `r`）、属主是否与 Nginx worker 用户匹配、是否有 `deny all` 命中、SELinux 是否拦截。用 `namei -l /path/to/file` 一次性看完整路径每一级的权限。

**Q：502 和 504 有什么区别？**

- **502 Bad Gateway**：Nginx 连不上后端，或后端返回了无效响应 → 看后端进程和端口；
- **504 Gateway Timeout**：连上了但后端响应太慢 → 调 `proxy_read_timeout` 或优化后端。

**Q：proxy_pass 加不加尾部斜杠有什么影响？**

见第 6 节。简单记法：**`proxy_pass` 的路径会替换 `location` 匹配到的部分**。后端报 404 时，先确认它收到的实际 URI 是什么（在后端日志里看）。

**Q：怎么让 SPA 前端路由不报 404？**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Q：为什么 location 正则的优先级比前缀高，^~ 又能盖过正则？**

这是 Nginx 的既定规则：精确 `=` > `^~` 前缀 > 正则（按出现顺序） > 普通前缀（最长优先）。**记住这个顺序能省下大量调试时间。**

**Q：如何配置多个域名共用一个 server 块？**

```nginx
server_name a.example.com b.example.com;
```

或者用通配符 `*.example.com`。注意 `server_name` 里第一个是默认服务器（在没匹配到时使用）。

**Q：默认站点返回了别人的内容？**

没配置 `default_server` 时，Nginx 用第一个 server 块处理无法匹配的请求。**显式指定一个默认 server 并返回 444（直接断连）是个好做法**：

```nginx
server {
    listen 80 default_server;
    server_name _;
    return 444;
}
```

**Q：怎么启用 HTTP/2？**

```nginx
listen 443 ssl;
http2 on;
```

Nginx 1.25.1 之后用 `http2 on;` 这种写法；更早的版本写在 listen 行里：`listen 443 ssl http2;`。

**Q：Nginx 和 Apache 该选哪个？**

- 静态资源与高并发反向代理 → Nginx 更合适；
- 依赖 `.htaccess`、大量 mod_ 模块的传统 PHP 应用 → Apache 更省事。

常见做法是 Nginx 在前做静态与代理，Apache/PHP-FPM 在后处理动态请求。

**Q：怎么备份和回滚配置？**

```bash
# 改动前备份
sudo cp -a /etc/nginx /etc/nginx.bak.$(date +%F)

# 出问题时回滚
sudo cp -a /etc/nginx.bak.2026-09-24/. /etc/nginx/
sudo nginx -t && sudo systemctl reload nginx
```

用 Git 管理 `/etc/nginx` 是更规范的做法，能看到每次改动的差异。
