---
title: "create | Cloud"
slug: /cli/cli/Project-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作用于创建一个新项目。 | Cloud"
type: docx
token: GXhEdTZt9or6nix81GtcENu9n0f
sidebar_position: 1
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
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

此操作用于创建一个新项目。

## 描述\{#description}

创建一个新的 Zilliz Cloud 项目。当你希望在创建项目时绑定区域，请使用一次或多次 `--region`。

## 概要\{#synopsis}

```bash
zilliz project create
--name <value>
--plan <value>
[--region <value>]
[--api-key <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    指定项目名称。

- **--plan** (*string*) -

    **[REQUIRED]**

    指定订阅计划。可选值：`Standard`、`Enterprise`、`BusinessCritical`。

- **--region** (*array*) -

    指定要绑定的区域 ID（可重复使用，例如 `--region aws-us-east-1 --region gcp-us-west1`）。

- **--api-key** (string) -

    为此命令指定 API key。此值会覆盖环境变量或已配置的 API key。

## 示例\{#example}

```bash
# Create a project without regions
zilliz project create --name my-project --plan Standard

# Create a project with multiple regions
zilliz project create --name my-project --plan Standard --region aws-us-east-1 --region gcp-us-west1
```
