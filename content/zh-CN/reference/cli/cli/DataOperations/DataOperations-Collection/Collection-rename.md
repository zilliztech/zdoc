---
title: "重命名 | Cloud"
slug: /cli/cli/Collection-rename
sidebar_label: "rename"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于重命名 Collection。 | Cloud"
type: docx
token: N1uadJS98ojQhixbOQacLOwknke
sidebar_position: 13
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - cloud
  - 重命名
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# rename

此操作用于重命名 Collection。

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

    **[必填]**

    表示当前 Collection 名称。

- **--new-name** (*string*) -

    **[必填]**

    表示新的 Collection 名称。

    该值应为最多 255 个字符的字母数字字符串，并以下划线 (_) 或字母开头。

- **--database** (*string*) -

    表示当前 Database 名称。

- **--new-database** (*string*) -

    表示目标 Database 名称（用于跨 Database 重命名）。

- **--output, -o** (*string*) -

    表示输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection rename --name old_collection --new-name new_collection
```
