---
title: "list | Cloud"
slug: /cli/cli/Cluster-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有集群。 | Cloud"
type: docx
token: F2RtdzmQ0oQlWfxf7SYcT200nNf
sidebar_position: 4
keywords: 
  - Milvus 数据库
  - Milvus 向量数据库
  - Zilliz Cloud
  - 什么是 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作会列出所有集群。

## 说明\{#description}

此命令会为列出的每个集群返回以下字段：

- `clusterId`

- `clusterName`

- `description`

- `regionId`

- `cuType`

- `plan`

- `cuSize`

- `status`

## 概要\{#synopsis}

```bash
zilliz cluster list
[--page-size <value>]
[--page <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--all]
```

## 选项\{#options}

- **--page-size** (*integer*) -

    表示每页条目数。默认值为 **10**。

- **--page** (*integer*) -

    表示页码。默认值为 **1**。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

- **--all, -a** (*boolean*) -

    表示是否获取所有页面。

## 示例\{#example}

```bash
# List all clusters
zilliz cluster list

# Fetch all pages
zilliz cluster list --all
```
