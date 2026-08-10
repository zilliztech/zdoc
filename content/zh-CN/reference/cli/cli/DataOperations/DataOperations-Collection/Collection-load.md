---
title: "load | Cloud"
slug: /cli/cli/Collection-load
sidebar_label: "load"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将 Collection 加载到内存中以供搜索。 | Cloud"
type: docx
token: SOaOdH3o6o7dsyx1VjPc4LPynqc
sidebar_position: 10
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - hnsw 算法
  - zilliz
  - zilliz cloud
  - cloud
  - load
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# load

此操作会将 Collection 加载到内存中以供搜索。

## 概要\{#synopsis}

```bash
zilliz collection load
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--database** (*string*) -

    表示 Database 名称。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用其所属的 Database。

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
zilliz collection load --name my_collection
```
