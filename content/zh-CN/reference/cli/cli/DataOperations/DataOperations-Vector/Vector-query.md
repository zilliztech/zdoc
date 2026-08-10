---
title: "query | Cloud"
slug: /cli/cli/Vector-query
sidebar_label: "query"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过标量过滤表达式查询 Entity。 | Cloud"
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
  - 云
  - query
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# query

此操作通过标量过滤表达式查询 Entity。

## 说明\{#description}

Zilliz Cloud 提供了一组实用的过滤运算符，帮助您构建满足需求的过滤表达式。有关详细信息，请参见 [过滤概述](/docs/filtering-overview) 及相关页面。

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

    **[必填]**

    指定 Collection 名称。

- **--filter** (*string*) -

    **[必填]**

    指定标量过滤表达式。

- **--limit** (*integer*) -

    指定要返回的最大结果数。 

    该值默认为 **10**，并且它与 `offset` 的乘积应小于 **16,384**。

- **--output-fields** (*array*) -

    指定要以 JSON 数组形式返回的字段。

- **--database** (*string*) -

    指定 Database 名称。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

- **--offset** (*integer*) -

    指定在返回匹配结果前要跳过的结果数。与 `--limit` 配合用于分页。

    它与 `limit` 的乘积应小于 **16,384**。

- **--partition, -p** (*array*) -

    指定要查询的 Partition 名称列表。若未指定，则查询所有 Partition。

## 示例\{#example}

```bash
zilliz vector query --collection my_col --filter 'id > 100' --limit 10
```
