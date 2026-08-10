---
title: "has | Cloud"
slug: /cli/cli/Partition-has
sidebar_label: "has"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查 Partition 是否存在。 | Cloud"
type: docx
token: IQy0d491iojaTEx3teycfP3snCe
sidebar_position: 4
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus 数据库
  - Milvus 向量数据库
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

此操作检查 Partition 是否存在。

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

    **[必需]**

    指定 Collection 名称。

- **--partition** (*string*) -

    **[必需]**

    指定 Partition 名称。

- **--database** (*string*) -

    指定 Database 名称。

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
