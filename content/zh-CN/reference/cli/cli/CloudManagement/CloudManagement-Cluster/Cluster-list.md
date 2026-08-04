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
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作会列出所有集群。

## 描述\{#description}

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

    指定每页的条目数。默认值为 **10**。

- **--page** (*integer*) -

    指定页码。默认值为 **1**。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--all, -a** (*boolean*) -

    指定是否获取所有页面。

## 示例\{#example}

```bash
# List all clusters
zilliz cluster list

# Fetch all pages
zilliz cluster list --all
```
