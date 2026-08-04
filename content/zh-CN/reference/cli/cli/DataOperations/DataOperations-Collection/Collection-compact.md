---
title: "compact | Cloud"
slug: /cli/cli/Collection-compact
sidebar_label: "compact"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会压缩 collection segment 以优化存储。 | Cloud"
type: docx
token: PgZ0dL39ho6wLbxJKANcm0jyn9b
sidebar_position: 1
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
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

此操作会压缩 collection segment 以优化存储。

## 描述\{#description}

Zilliz Cloud 会按间隔自动压缩 collection segment。在大多数情况下，您无需手动运行此命令，除非您需要优化 collection 中的存储。

聚类压缩旨在提升大型 collection 的搜索性能并降低成本。本指南将帮助您了解聚类压缩，以及此功能如何提升搜索性能。与普通压缩不同，聚类压缩会根据标量字段中的值，重新分布 collection segment 中的实体。

在不带任何选项的情况下运行此命令，会触发一组交互式提示，帮助您完成设置。

## 概要\{#synopsis}

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

    指定 collection 名称。您可以运行 `zilliz collection list` 获取所有现有 collection 的列表。

- **--database** (*string*) -

    指定数据库名称。

    如果已使用 `zilliz context set` 配置 cluster，并且未配置此选项，则会自动应用其所属的数据库。

- **--output, -o** (*string*) -

    指定输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

- **--clustering** (*boolean*) -

    指定是否执行聚类压缩。

## 示例\{#example}

```bash
zilliz collection compact --name my_collection
```
