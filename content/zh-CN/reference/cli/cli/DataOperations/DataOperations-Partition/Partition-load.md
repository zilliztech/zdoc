---
title: "load | Cloud"
slug: /cli/cli/Partition-load
sidebar_label: "load"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将分区加载到内存中。 | Cloud"
type: docx
token: GYyKdrbkvozJxVx6uGhcpMfonoe
sidebar_position: 6
keywords: 
  - milvus database
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

此操作将分区加载到内存中。

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

    **[REQUIRED]**

    指定集合名称。

- **--names** (*array*) -

    **[REQUIRED]**

    指定分区名称，以 JSON 数组形式提供。

- **--database** (*string*) -

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition load --collection my_collection --names '["p1", "p2"]'
```
