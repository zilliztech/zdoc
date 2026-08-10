---
title: "get-stats | Cloud"
slug: /cli/cli/Collection-getstats
sidebar_label: "get-stats"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取 Collection 统计信息（行数等）。 | Cloud"
type: docx
token: XTHTd7x3soBmeTx9ftwc369PnCe
sidebar_position: 7
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量数据库 db
  - 向量 Database 示例
  - zilliz
  - zilliz cloud
  - cloud
  - get-stats
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# get-stats

此操作获取 Collection 统计信息（行数等）。

## 摘要\{#synopsis}

```bash
zilliz collection get-stats
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--partition-names <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    指定 Collection 名称。

- **--database** (*string*) -

    指定 Database 名称。

    如果使用 `zilliz context set` 配置了集群，则在未配置此选项时，会自动应用其所属的 Database。

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
zilliz collection get-stats --name my_collection
```
