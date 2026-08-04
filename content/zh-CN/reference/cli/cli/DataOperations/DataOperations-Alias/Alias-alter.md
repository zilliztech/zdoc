---
title: "alter | Cloud"
slug: /cli/cli/Alias-alter
sidebar_label: "alter"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将别名重新分配给另一个集合。 | Cloud"
type: docx
token: PLvbdUqI6onWmWxFPYKcgcFpnwb
sidebar_position: 1
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - hnsw algorithm
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

此操作将别名重新分配给另一个集合。

## 描述\{#description}

您可以为集合分配一个别名，并针对该别名执行搜索/查询，由关联的集合进行响应。使用此命令可更改与指定别名关联的集合。

运行此命令且不带任何参数时，将触发一组交互式提示来帮助您完成设置。

## 概要\{#synopsis}

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

    **[必需]**

    指定新的目标集合。

- **--alias** (*string*) -

    **[必需]**

    指定要重新分配的别名名称。

- **--database** (*string*) -

    指定数据库名称。

    如果已使用 `zilliz context set` 配置集群，则在未配置此选项时，会自动应用该集群所属的数据库。

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

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz alias alter --collection new_collection --alias my_alias
```
