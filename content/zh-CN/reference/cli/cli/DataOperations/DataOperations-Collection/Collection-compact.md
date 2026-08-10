---
title: "compact | Cloud"
slug: /cli/cli/Collection-compact
sidebar_label: "compact"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会对 Collection 的 Segment 执行 Compaction 以优化存储。| Cloud"
type: docx
token: PgZ0dL39ho6wLbxJKANcm0jyn9b
sidebar_position: 1
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - zilliz
  - zilliz cloud
  - cloud
  - compact
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# compact

此操作会对 Collection 的 Segment 执行 Compaction 以优化存储。

## 说明\{#description}

Zilliz Cloud 会定期自动对 Collection 的 Segment 执行 Compaction。在大多数情况下，您无需手动运行此命令，除非您需要优化 Collection 中的存储。

聚类 Compaction 旨在提升大型 Collection 中的搜索性能并降低成本。本指南将帮助您了解聚类 Compaction，以及此功能如何提升搜索性能。与普通 Compaction 不同，聚类 Compaction 会根据标量字段中的值，重新分布 Collection 各个 Segment 内的 Entity。

运行此命令时如果不带任何选项，将触发一组交互式提示来帮助您完成设置。

## 语法\{#synopsis}

```bash
zilliz collection compact
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--clustering]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    指定 Collection 名称。您可以运行 `zilliz collection list` 获取所有现有 Collection 的列表。

- **--database** (*string*) -

    指定 Database 名称。

    如果集群是使用 `zilliz context set` 配置的，则在未配置此选项时，会自动应用其所属的 Database。

- **--output, -o** (*string*) -

    指定输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--clustering** (*boolean*) -

    指定是否执行聚类 Compaction。

## 示例\{#example}

```bash
zilliz collection compact --name my_collection
```
