---
title: "create | Cloud"
slug: /cli/cli/Project-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作将创建一个新项目。 | Cloud"
type: docx
token: GXhEdTZt9or6nix81GtcENu9n0f
sidebar_position: 1
keywords: 
  - milvus
  - Zilliz
  - milvus 向量 Database
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

此操作将创建一个新项目。

## 说明\{#description}

创建一个新的 Zilliz Cloud 项目。当您希望在创建项目时绑定区域时，可使用 `--region` 一次或多次。

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

    **[必需]**

    指定项目名称。

- **--plan** (*string*) -

    **[必需]**

    指定订阅计划。可选值：`Standard`、`Enterprise`、`BusinessCritical`。

- **--region** (*array*) -

    指定要绑定的区域 ID（可重复，例如 `--region aws-us-east-1 --region gcp-us-west1`）。

- **--api-key** (string) -

    为此命令指定 API 密钥。此值将覆盖环境变量中的 API 密钥或已配置的 API 密钥。

## 示例\{#example}

```bash
# Create a project without regions
zilliz project create --name my-project --plan Standard

# Create a project with multiple regions
zilliz project create --name my-project --plan Standard --region aws-us-east-1 --region gcp-us-west1
```
