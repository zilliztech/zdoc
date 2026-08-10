---
title: "create | Cloud"
slug: /cli/cli/Partition-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于在 Collection 中创建一个 Partition。 | Cloud"
type: docx
token: JBRhd3cb5owndqxODOxcd08InRe
sidebar_position: 1
keywords: 
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - AI 幻觉
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

此操作用于在 Collection 中创建一个 Partition。

## 描述\{#description}

Partition 是 Collection 的一个子集。每个 Partition 与其父 Collection 共享相同的数据结构，但仅包含 Collection 中的部分数据。

创建 Collection 时，Zilliz Cloud 还会在 Collection 中创建一个名为 **default** 的 Partition。如果您不打算添加其他 Partition，则插入到 Collection 中的所有 Entity 都会进入默认 Partition，所有搜索和查询也都会在其中执行。

您可以根据特定条件添加更多 Partition，并将 Entity 插入其中。然后，您可以将搜索和查询限制在特定的 Partition 内，从而提升搜索性能。

一个 Collection 最多可以包含 1,024 个 Partition。

## 概要\{#synopsis}

```bash
zilliz partition create
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必填]**

    表示 Collection 名称。

- **--partition** (*string*) -

    **[必填]**

    表示 Partition 名称。

    该值应为长度不超过 **255** 个字符的字符串，并且**以下划线 (_) 或字母开头**。

- **--database** (*string*) -

    表示 Database 名称。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition create --collection my_collection --partition my_partition
```
