---
title: "describe | Cloud"
slug: /cli/cli/Index-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取索引的详细信息。 | Cloud"
type: docx
token: T0VYdnnlIo0VwAxLaBjcryM1n7b
sidebar_position: 2
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
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

此操作获取索引的详细信息。

## 概要\{#synopsis}

```bash
zilliz index describe
--collection <value>
--index-name <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    指定集合名称。

- **--index-name** (*string*) -

    **[必需]**

    指定索引名称。

- **--database** (*string*) -

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz index describe --collection my_collection --index-name my_index
```
