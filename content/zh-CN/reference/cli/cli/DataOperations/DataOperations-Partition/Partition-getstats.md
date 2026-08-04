---
title: "get-stats | Cloud"
slug: /cli/cli/Partition-getstats
sidebar_label: "get-stats"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取分区统计信息。 | Cloud"
type: docx
token: VEEzdJ5tyoaFVbxG6JvcDpULnMg
sidebar_position: 3
keywords: 
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
  - zilliz
  - zilliz cloud
  - cloud
  - get-stats
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# get-stats

此操作获取分区统计信息。

## 描述\{#description}

该命令返回指定分区中的实体数量。

## 概要\{#synopsis}

```bash
zilliz partition get-stats
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

    指定集合名称。

- **--partition** (*string*) -

    **[必需]**

    指定分区名称。

- **--database** (*string*) -

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition get-stats --collection my_collection --partition my_partition
```
