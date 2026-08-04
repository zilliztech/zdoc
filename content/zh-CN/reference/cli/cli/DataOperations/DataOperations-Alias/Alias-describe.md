---
title: "describe | Cloud"
slug: /cli/cli/Alias-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取别名的详细信息。 | Cloud"
type: docx
token: QsPodYWJfoSCmAxbWatc6dw0nCp
sidebar_position: 3
keywords: 
  - 什么是语义搜索
  - Embedding model
  - 图像相似性搜索
  - Context Window
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

此操作获取别名的详细信息。

## 概要\{#synopsis}

```bash
zilliz alias describe
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--alias** (*string*) -

    **[必需]**

    指定别名名称。

- **--database** (*string*) -

    指定数据库名称。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群所属的数据库。

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
zilliz alias describe --alias my_alias
```
