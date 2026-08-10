---
title: "get-load-state | Cloud"
slug: /cli/cli/Collection-getloadstate
sidebar_label: "get-load-state"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取 Collection 的加载状态。 | Cloud"
type: docx
token: ROPbdTU6doxFGRxxcfYcgyBPnqg
sidebar_position: 6
keywords: 
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
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

此操作用于获取 Collection 的加载状态。

## 简介\{#synopsis}

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

    指定 Collection 名称。

- **--database** (*string*) -

    指定 Database 名称。

    如果使用 `zilliz context set` 配置了集群，则在未配置此选项时，会自动应用其所属的 Database。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

- **--partition-names** (*array*) -

    指定要检查其加载状态的 Partition 名称。您可以使用不同的 Partition 名称多次链式使用此选项。

## 示例\{#example}

```bash
zilliz collection get-load-state --name my_collection
```
