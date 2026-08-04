---
title: "flush | Cloud"
slug: /cli/cli/Collection-flush
sidebar_label: "flush"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将 collection 数据刷新到磁盘。 | Cloud"
type: docx
token: DIVvdqJlOoneFwxqs0xcG313nmg
sidebar_position: 5
keywords: 
  - 什么是向量数据库
  - 什么是向量数据库
  - 向量数据库对比
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

此操作会将 collection 数据刷新到磁盘。

## 描述\{#description}

运行此命令会封存当前仍在增长的 segment，并将其保存到磁盘。手动运行此命令可能会产生大量小 segment，从而影响搜索性能。

建议依赖 Zilliz Cloud 将数据刷新到磁盘，而不是手动运行此命令。

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

    指定 collection 名称。

- **--database** (*string*) -

    指定数据库名称。

    如果已使用 `zilliz context set` 配置集群，而此选项未配置，则会自动应用其所属的数据库。

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

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection flush --name my_collection
```
