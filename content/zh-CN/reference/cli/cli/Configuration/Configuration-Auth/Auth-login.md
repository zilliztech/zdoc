---
title: "login | Cloud"
slug: /cli/cli/Auth-login
sidebar_label: "login"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作使用 Zilliz Cloud 对 CLI 进行身份验证，并保存登录状态以供后续命令使用。对于本地交互式使用，请使用浏览器登录；对于脚本或无头环境，请使用 API 密钥登录；登录 Zilliz Cloud 中国站点时，请将 `--cn` 与 `--api-key` 一起使用。 | Cloud"
type: docx
token: GaWqdekPvokCUtxBjRTcpNxInXg
sidebar_position: 1
keywords: 
  - 什么是向量嵌入
  - 向量数据库教程
  - 向量数据库如何工作
  - 向量数据库对比
  - zilliz
  - zilliz cloud
  - cloud
  - 登录
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# login

此操作使用 Zilliz Cloud 对 CLI 进行身份验证，并保存登录状态以供后续命令使用。对于本地交互式使用，请使用浏览器登录；对于脚本或无头环境，请使用 API 密钥登录；登录 Zilliz Cloud 中国站点时，请将 `--cn` 与 `--api-key` 一起使用。

## 描述\{#description}

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

    使用 API 密钥而不是浏览器 OAuth 进行身份验证。如果提供了该选项但未指定值，则会进入交互式提示。

- **--no-browser** (*boolean*) -

    使用设备代码流程，而不打开浏览器。

- **--cn** (*boolean*) -

    对 Zilliz Cloud 中国站点进行身份验证。中国站点使用 API 密钥登录，因此请将 `--cn` 与 `--api-key` 组合使用。

## 示例\{#example}

```bash
# Browser OAuth login
zilliz login

# Login with API key
zilliz login --api-key sk-xxxxxxxxxxxx

# Login to the Zilliz Cloud China site
zilliz login --cn --api-key sk-xxxxxxxxxxxx
```
