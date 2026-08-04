---
title: "get | Cloud"
slug: /cli/cli/Vector-get
sidebar_label: "get"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作按主键 ID 获取实体。 | Cloud"
type: docx
token: Nez2dlNZloLWEPxBHOWcad2anLf
sidebar_position: 2
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
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

此操作按主键 ID 获取实体。

## 概要\{#synopsis}

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

    **[REQUIRED]**

    指定集合名称。

- **--id** (*array*) -

    **[REQUIRED]**

    以 JSON 数组形式指定主键 ID，例如 `'[1, 2, 3]'`。

- **--output-fields** (*array*) -

    以 JSON 数组形式指定要返回的字段，例如 `'["title", "abstract"]'`。

- **--database** (*string*) -

    指定数据库名称。

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
zilliz vector get --collection my_col --id '[1, 2, 3]'
```
