---
title: "list | Cloud"
slug: /cli/cli/Database-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有数据库。 | Cloud"
type: docx
token: KiwWdLJ8houEeRxGECEcc3glnoh
sidebar_position: 4
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
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

此操作会列出所有数据库。

<Admonition type="info" icon="📘" title="说明">

此命令适用于 Dedicated 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz database list
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

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

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz database list
```
