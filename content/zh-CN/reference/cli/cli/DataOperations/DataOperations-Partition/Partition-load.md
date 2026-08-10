---
title: "load | Cloud"
slug: /cli/cli/Partition-load
sidebar_label: "load"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将 Partition 加载到内存中。 | Cloud"
type: docx
token: GYyKdrbkvozJxVx6uGhcpMfonoe
sidebar_position: 6
keywords: 
  - milvus Database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - load
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# load

此操作会将 Partition 加载到内存中。

## 概要\{#synopsis}

```bash
zilliz partition load
--collection <value>
--names <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--names** (*array*) -

    **[必需]**

    表示以 JSON 数组形式提供的 Partition 名称。

- **--database** (*string*) -

    表示 Database 名称。

- **--output, -o** (*string*) -

    表示输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition load --collection my_collection --names '["p1", "p2"]'
```
