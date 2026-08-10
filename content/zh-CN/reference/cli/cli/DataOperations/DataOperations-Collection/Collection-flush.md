---
title: "flush | Cloud"
slug: /cli/cli/Collection-flush
sidebar_label: "flush"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将 Collection 数据刷新到磁盘。 | Cloud"
type: docx
token: DIVvdqJlOoneFwxqs0xcG313nmg
sidebar_position: 5
keywords: 
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - flush
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# flush

此操作会将 Collection 数据刷新到磁盘。

## 说明\{#description}

运行此命令会封存当前正在增长的 Segment，并将其保存到磁盘。手动运行此命令可能会产生大量较小的 Segment，从而影响搜索性能。 

建议您依赖 Zilliz Cloud 将数据刷新到磁盘，而不是手动运行此命令。

## 用法\{#usage}

```bash
zilliz collection flush
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

**选项：**

- **--name** (*string*) -

    **[必需]**

    指定 Collection 名称。

- **--database** (*string*) -

    指定 Database 名称。

    如果集群是使用 `zilliz context set` 配置的，则在未配置此选项时，会自动应用其所属的 Database。

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

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection flush --name my_collection
```
