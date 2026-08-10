---
title: "list | Cloud"
slug: /cli/cli/Collection-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有 Collection。 | Cloud"
type: docx
token: N10RdNXeNoseZNxkxBtcLGa1nKf
sidebar_position: 9
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - zilliz
  - zilliz cloud
  - 云
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作会列出所有 Collection。

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

    指示 Database 名称。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用其所属的 Database。

- **--output, -o** (*string*) -

    指示输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection list
```
