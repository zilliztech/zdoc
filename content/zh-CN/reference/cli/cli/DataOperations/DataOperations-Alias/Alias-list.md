---
title: "list | Cloud"
slug: /cli/cli/Alias-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有别名。 | Cloud"
type: docx
token: L8PEdl4Dio11q5x4rPBc4OFZn8b
sidebar_position: 5
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作列出所有别名。

## 概要\{#synopsis}

```bash
zilliz alias list [OPTIONS]
```

## 选项\{#options}

- **--database** (*string*) -

    **[REQUIRED]**

    指定数据库名称。

    如果使用 `zilliz context set` 配置了集群，则当此选项未配置时，会自动应用其所属的数据库。

- **--collection** (*string*) -

    指定按集合名称进行筛选。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

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
zilliz alias list --database default
```
