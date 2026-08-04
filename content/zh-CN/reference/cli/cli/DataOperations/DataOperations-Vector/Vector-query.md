---
title: "query | Cloud"
slug: /cli/cli/Vector-query
sidebar_label: "query"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作按标量筛选表达式查询实体。 | Cloud"
type: docx
token: VSRhdmsCvodJ7pxwGgqcuvZ3n7g
sidebar_position: 5
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - zilliz
  - zilliz cloud
  - cloud
  - query
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# query

此操作按标量筛选表达式查询实体。

## 描述\{#description}

Zilliz Cloud 提供了一组实用的筛选运算符，帮助您构建满足需求的筛选表达式。详情请参阅[筛选概览](/docs/filtering-overview)及相关页面。

## 概要\{#synopsis}

```bash
zilliz vector query
--collection <value>
--filter <value>
[--limit <value>]
[--database <value>]
[--partition <value>]
[--offset <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    指定集合名称。

- **--filter** (*string*) -

    **[必需]**

    指定标量筛选表达式。

- **--limit** (*integer*) -

    指定返回结果的最大数量。

    该值默认为 **10**，且其与 `offset` 的乘积应小于 **16,384**。

- **--output-fields** (*array*) -

    指定要返回的字段，格式为 JSON 数组。

- **--database** (*string*) -

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--offset** (*integer*) -

    指定在返回匹配结果之前要跳过的结果数量。与 `--limit` 一起用于分页。

    其与 `limit` 的乘积应小于 **16,384**。

- **--partition, -p** (*array*) -

    指定要查询的分区名称列表。未指定时，将查询所有分区。

## 示例\{#example}

```bash
zilliz vector query --collection my_col --filter 'id > 100' --limit 10
```
