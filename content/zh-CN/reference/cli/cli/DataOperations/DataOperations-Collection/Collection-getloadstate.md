---
title: "get-load-state | Cloud"
slug: /cli/cli/Collection-getloadstate
sidebar_label: "get-load-state"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取集合加载状态。 | Cloud"
type: docx
token: ROPbdTU6doxFGRxxcfYcgyBPnqg
sidebar_position: 6
keywords: 
  - 什么是向量数据库
  - 向量数据库是什么
  - 向量数据库对比
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - get-load-state
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# get-load-state

此操作用于获取集合加载状态。

## 概要\{#synopsis}

```bash
zilliz collection get-load-state
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

    如果已使用 `zilliz context set` 配置集群，且未配置此选项，则会自动应用其所属的数据库。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--partition-names** (*array*) -

    指定要检查其加载状态的分区名称。你可以多次使用此选项并传入不同的分区名称。

## 示例\{#example}

```bash
zilliz collection get-load-state --name my_collection
```
