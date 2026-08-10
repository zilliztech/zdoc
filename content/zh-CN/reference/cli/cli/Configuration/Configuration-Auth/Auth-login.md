---
title: "登录 | Cloud"
slug: /cli/cli/Auth-login
sidebar_label: "登录"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作会使用 Zilliz Cloud 对 CLI 进行身份验证，并保存登录状态以供后续命令使用。对于本地交互式使用，请使用浏览器登录；对于脚本或无头环境，请使用 API 密钥登录；登录 Zilliz Cloud 中国站点时，请将 `--cn` 与 `--api-key` 结合使用。 | Cloud"
type: docx
token: GaWqdekPvokCUtxBjRTcpNxInXg
sidebar_position: 1
keywords: 
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量数据库对比
  - Zilliz
  - Zilliz Cloud
  - cloud
  - 登录
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# 登录

此操作会使用 Zilliz Cloud 对 CLI 进行身份验证，并保存登录状态以供后续命令使用。对于本地交互式使用，请使用浏览器登录；对于脚本或无头环境，请使用 API 密钥登录；登录 Zilliz Cloud 中国站点时，请将 `--cn` 与 `--api-key` 结合使用。

## 说明\{#description}

使用 Zilliz Cloud 对 CLI 进行身份验证，并保存登录状态以供后续命令使用。对于本地交互式使用，请使用浏览器登录；对于脚本或无头环境，请使用 API 密钥登录。

## 概要\{#synopsis}

```bash
zilliz login
[--api-key <value>]
[--no-browser]
[--cn]
```

## 选项\{#options}

- **--api-key** (*string*) -

    使用 API 密钥而不是浏览器 OAuth 进行身份验证。如果提供该选项但未指定值，则会进行交互式提示。

- **--no-browser** (*boolean*) -

    使用设备代码流程，而不打开浏览器。

- **--cn** (*boolean*) -

    向 Zilliz Cloud 中国站点进行身份验证。中国站点使用 API 密钥登录，因此请将 `--cn` 与 `--api-key` 结合使用。

## 示例\{#example}

```bash
# Browser OAuth login
zilliz login

# Login with API key
zilliz login --api-key sk-xxxxxxxxxxxx

# Login to the Zilliz Cloud China site
zilliz login --cn --api-key sk-xxxxxxxxxxxx
```
