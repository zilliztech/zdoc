---
title: "describe | Cloud"
slug: /cli/cli/Collection-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取集合的详细信息。 | Cloud"
type: docx
token: A2rOdHew3oMHWNx6ngFc4nAbnyg
sidebar_position: 3
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

此操作用于获取集合的详细信息。

## 概要\{#synopsis}

```bash
zilliz collection describe
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必填]**

    指定集合名称。

- **--database** (*string*) -

    指定数据库名称。

    如果使用 `zilliz context set` 配置了集群，而未配置此选项，则会自动应用该集群所属的数据库。

- **--output, -o** (*string*) -

    指定输出格式。可选值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection describe --name my_collection
```
