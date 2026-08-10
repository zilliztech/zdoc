---
title: "create | Cloud"
slug: /cli/cli/Collection-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作会在当前 Zilliz Cloud 集群上下文中创建一个 Collection。| Cloud"
type: docx
token: Oq1Pd3N3popZ2ExT184cksHfnxh
sidebar_position: 2
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

此操作会在当前 Zilliz Cloud 集群上下文中创建一个 Collection。

## 说明\{#description}

在当前 Zilliz Cloud 集群上下文中创建一个 Collection。对于常见 Schema，您可以使用 CLI 选项；对于高级 Collection 定义和外部 Collection，您可以传入 JSON 请求体。

## 概要\{#synopsis}

```bash
zilliz collection create
[--name <value>]
[--dimension <value>]
[--metric-type <value>]
[--id-type <value>]
[--auto-id]
[--primary-field <value>]
[--vector-field <value>]
[--api-key <value>]
[--database <value>]
[--body <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必填]**

    指定 Collection 名称。

- **--dimension** (*integer*) -

    指定向量维度。除非提供了 `--body`，否则此项为必填。

- **--metric-type** (*string*) -

    指定距离度量。默认值：`COSINE`。可选值：`COSINE`、`L2`、`IP`。

- **--id-type** (*string*) -

    指定主键类型。可选值：`Int64`、`VarChar`。

- **--auto-id** (*boolean*) -

    指定是否由 Zilliz Cloud 自动生成主键值。

- **--primary-field** (*string*) -

    指定主键字段名称。

- **--vector-field** (*string*) -

    指定向量字段名称。

- **--api-key** (*string*) -

    为此命令指定 API 密钥。此值会覆盖环境变量或已配置的 API 密钥。

- **--database** (*string*) -

    指定 Database 名称。

- **--body** (*string*) -

    传入原始 JSON 请求体。使用 JSON 对象字符串或 `file://path`，例如 `file://schema.json`。请求体会与其他标志合并。

## 示例\{#example}

```bash
# Quick create with defaults
zilliz collection create --name my_collection --dimension 768

# Create with a body file
zilliz collection create --body file://schema.json
```
