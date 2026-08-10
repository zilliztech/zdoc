---
title: "get-stats | Cloud"
slug: /cli/cli/Partition-getstats
sidebar_label: "get-stats"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取 Partition 统计信息。 | Cloud"
type: docx
token: VEEzdJ5tyoaFVbxG6JvcDpULnMg
sidebar_position: 3
keywords: 
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
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

此操作获取 Partition 统计信息。

## 说明\{#description}

此命令返回指定 Partition 中的 Entity 数量。

## 语法\{#synopsis}

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

    指示 Collection 名称。

- **--partition** (*string*) -

    **[必需]**

    指示 Partition 名称。

- **--database** (*string*) -

    指示 Database 名称。

- **--output, -o** (*string*) -

    指示输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指示当输出设置为 `table` 或 `csv` 时，是否省略标头行。

- **--query, -q** (*string*) -

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition get-stats --collection my_collection --partition my_partition
```
