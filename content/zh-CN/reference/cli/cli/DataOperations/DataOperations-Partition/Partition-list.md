---
title: "list | Cloud"
slug: /cli/cli/Partition-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出 Collection 中的 Partition。 | Cloud"
type: docx
token: QVxadXWKIo8YcHxZgD1c0F0VnXf
sidebar_position: 5
keywords: 
  - 什么是语义搜索
  - Embedding 模型
  - 图像相似性搜索
  - 上下文窗口
  - zilliz
  - zilliz cloud
  - 云
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作列出 Collection 中的 Partition。

## 摘要\{#synopsis}

```bash
zilliz partition list
--collection <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--database** (*string*) -

    表示 Database 名称。

- **--output, -o** (*string*) -

    表示输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition list --collection my_collection
```
