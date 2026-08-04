---
title: "has | Cloud"
slug: /cli/cli/Partition-has
sidebar_label: "has"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查分区是否存在。 | Cloud"
type: docx
token: IQy0d491iojaTEx3teycfP3snCe
sidebar_position: 4
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - has
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# has

此操作检查分区是否存在。

## 概要\{#synopsis}

```bash
zilliz partition has
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    指定 collection 名称。

- **--partition** (*string*) -

    **[REQUIRED]**

    指定 partition 名称。

- **--database** (*string*) -

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition has --collection my_collection --partition my_partition
```
