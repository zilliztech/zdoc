---
title: "get | Cloud"
slug: /cli/cli/Vector-get
sidebar_label: "get"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过主键 ID 获取 Entity。 | Cloud"
type: docx
token: Nez2dlNZloLWEPxBHOWcad2anLf
sidebar_position: 2
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - zilliz
  - zilliz cloud
  - cloud
  - get
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# get

此操作通过主键 ID 获取 Entity。

## 概述\{#synopsis}

```bash
zilliz vector get
--collection <value>
--id <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--id** (*array*) -

    **[必需]**

    表示以 JSON 数组形式提供的主键 ID，例如 `'[1, 2, 3]'`。

- **--output-fields** (*array*) -

    表示要返回的字段，以 JSON 数组形式提供，例如 `'["title", "abstract"]'`。

- **--database** (*string*) -

    表示 Database 名称。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz vector get --collection my_col --id '[1, 2, 3]'
```
