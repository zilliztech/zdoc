---
title: "drop | Cloud"
slug: /cli/cli/Partition-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个分区。 | Cloud"
type: docx
token: DT7Jduvj2osqF0xVhwMcU2t7nmd
sidebar_position: 2
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

此操作会删除一个分区。

## 概要\{#synopsis}

```bash
zilliz partition drop
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    指定集合名称。

- **--partition** (*string*) -

    **[必需]**

    指定要删除的分区名称。

- **--database** (*string*) -

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--yes, -y** (*boolean*) -

    指定是否跳过确认提示。

## 示例\{#example}

```bash
zilliz partition drop --collection my_collection --partition my_partition
```
