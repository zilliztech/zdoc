---
title: "list | Cloud"
slug: /cli/cli/Import-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出集群的导入任务。 | Cloud"
type: docx
token: ObdhdVWTpogXQhx3A0YcdU2yntd
sidebar_position: 1
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
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

此操作列出集群的导入任务。

## 概要\{#synopsis}

```bash
zilliz import list
--cluster-id <value>
[--page-size <value>]
[--page <size>]
[--database <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必填]**

    指定集群 ID，格式类似于 `inxx-xxxxx`。

    如果已使用 `zilliz context set` 配置集群，则在未配置此选项时会自动应用该配置。

- **--page-size** (*integer*) -

    指定每页的条目数。默认值为 **10**。

- **--page** (*integer*) -

    指定当前页码。默认值为 **1**。

- **--database** (*string*) -

    指定所选集群中的数据库名称。

    如果已使用 `zilliz context set` 配置数据库，则在未配置此选项时会自动应用该配置。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

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
zilliz import list --cluster-id in01-xxxxxxxxxxxx
```
