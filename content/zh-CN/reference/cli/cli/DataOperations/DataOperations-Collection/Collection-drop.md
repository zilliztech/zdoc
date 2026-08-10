---
title: "drop | Cloud"
slug: /cli/cli/Collection-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个 Collection。此操作不可逆。 | Cloud"
type: docx
token: IM2CdOqn5oKCTUxFVImcbDCRnFc
sidebar_position: 4
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量数据库
  - 什么是向量 Database
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

此操作会删除一个 Collection。此操作不可逆。

## 摘要\{#synopsis}

```bash
zilliz collection drop
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    表示要删除的 Collection 名称。

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

- **--yes, -y** (*boolean*) -

    表示是否跳过确认提示。

## 示例\{#example}

```bash
zilliz collection drop --name my_collection
```
