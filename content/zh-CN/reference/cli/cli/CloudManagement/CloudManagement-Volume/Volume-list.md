---
title: "list | Cloud"
slug: /cli/cli/Volume-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出项目中的所有卷。 | Cloud"
type: docx
token: OShTd6lMhoaxK2xDlExcmzXTnLd
sidebar_position: 3
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
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

此操作列出项目中的所有卷。

## 简介\{#synopsis}

```bash
zilliz volume list
--project-id <value>
[--page-size <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--project-id** (*string*) -

    **[必需]**

    指定项目 ID。

    如果已使用 `zilliz context set` 配置项目，则在未配置此选项时会自动应用该项目。

- **--page-size** (*integer*) -

    指定每页的条目数量。默认值为 **10**。

- **--page** (*integer*) -

    指定当前页码。默认值为 **1**。

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

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz volume list --project-id proj-xxxxxxxxxxxx
```
