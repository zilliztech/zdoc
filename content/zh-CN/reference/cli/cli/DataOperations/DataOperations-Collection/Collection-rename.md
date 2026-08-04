---
title: "rename | Cloud"
slug: /cli/cli/Collection-rename
sidebar_label: "rename"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于重命名集合。 | Cloud"
type: docx
token: N1uadJS98ojQhixbOQacLOwknke
sidebar_position: 13
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - rename
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# rename

此操作用于重命名集合。

## 概要\{#synopsis}

```bash
zilliz collection rename
--name <value>
--new-name <value>
[--database <value>]
[--new-database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

**选项：**

- **--name** (*string*) -

    **[必需]**

    指定当前集合名称。

- **--new-name** (*string*) -

    **[必需]**

    指定新的集合名称。

    该值应为最多 255 个字符的字母数字字符串，并且以下划线 (_) 或字母开头。

- **--database** (*string*) -

    指定当前数据库名称。

- **--new-database** (*string*) -

    指定目标数据库名称（用于跨数据库重命名）。

- **--output, -o** (*string*) -

    指定输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection rename --name old_collection --new-name new_collection
```
