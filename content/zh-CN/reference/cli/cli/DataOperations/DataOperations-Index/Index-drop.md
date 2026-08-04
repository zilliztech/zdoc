---
title: "drop | Cloud"
slug: /cli/cli/Index-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个索引。| Cloud"
type: docx
token: EJO8dhKSYoWk3AxksTrcGCzdnxf
sidebar_position: 3
keywords: 
  - 什么是向量数据库
  - 什么是向量数据库
  - 向量数据库对比
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

此操作会删除一个索引。

## 概要\{#synopsis}

```bash
zilliz index drop
--collection <value>
--index-name <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--yes]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    指定集合名称。

- **--index-name** (*string*) -

    **[REQUIRED]**

    指定要删除的索引名称。

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

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--yes, -y** (*boolean*) -

    指定是否跳过确认提示。

## 示例\{#example}

```bash
zilliz index drop --collection my_collection --index-name my_index
```
