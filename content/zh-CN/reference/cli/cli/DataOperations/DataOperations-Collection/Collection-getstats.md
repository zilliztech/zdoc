---
title: "get-stats | Cloud"
slug: /cli/cli/Collection-getstats
sidebar_label: "get-stats"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取集合统计信息（行数等）。 | Cloud"
type: docx
token: XTHTd7x3soBmeTx9ftwc369PnCe
sidebar_position: 7
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
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

此操作用于获取集合统计信息（行数等）。

## 概述\{#synopsis}

```bash
zilliz collection get-stats
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--partition-names <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    指定集合名称。

- **--database** (*string*) -

    指定数据库名称。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群所属的数据库。

- **--output, -o** (*string*) -

    指定输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection get-stats --name my_collection
```
