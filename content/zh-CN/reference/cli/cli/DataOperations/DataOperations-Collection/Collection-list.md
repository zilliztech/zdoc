---
title: "list | Cloud"
slug: /cli/cli/Collection-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有 collection。 | Cloud"
type: docx
token: N10RdNXeNoseZNxkxBtcLGa1nKf
sidebar_position: 9
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
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

此操作会列出所有 collection。

## 概要\{#synopsis}

```bash
zilliz collection list
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--database** (*string*) -

    指定数据库名称。

    如果使用 `zilliz context set` 配置了集群，则当此选项未配置时，将自动应用该集群所属的数据库。

- **--output, -o** (*string*) -

    指定输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection list
```
