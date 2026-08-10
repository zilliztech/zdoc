---
title: "alter | Cloud"
slug: /cli/cli/Alias-alter
sidebar_label: "alter"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将别名重新分配给另一个 Collection。 | Cloud"
type: docx
token: PLvbdUqI6onWmWxFPYKcgcFpnwb
sidebar_position: 1
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - hnsw 算法
  - zilliz
  - zilliz cloud
  - cloud
  - alter
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# alter

此操作会将别名重新分配给另一个 Collection。

## 说明\{#description}

您可以为一个 Collection 分配别名，并通过该别名执行搜索/queries，以便由关联的 Collection 响应。使用此命令可更改与指定别名关联的 Collection。

运行此命令时，如果未提供任何提示参数，则会触发一组交互式提示，帮助您完成设置。

## 语法\{#synopsis}

```bash
zilliz alias alter
--collection <value>
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必填]**

    指定新的目标 Collection。

- **--alias** (*string*) -

    **[必填]**

    指定要重新分配的别名名称。

- **--database** (*string*) -

    指定 Database 名称。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群所属的 Database。

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

## 示例\{#example}

```bash
zilliz alias alter --collection new_collection --alias my_alias
```
