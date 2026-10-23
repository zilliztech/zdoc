---
title: "drop | Cloud"
slug: /cli/cli/Database-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除 Database。（仅 Dedicated） | Cloud"
type: docx
token: WjbrdMFuXoR2etxfpMdcmIebnCh
sidebar_position: 3
keywords: 
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - Zilliz
  - Zilliz Cloud
  - 云
  - 删除
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

此操作会删除 Database。（仅 Dedicated）

<Admonition type="info" title="Notes">

此命令适用于 Dedicated 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz database drop
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--name** （*string*） -

    **[必需]**

    指示要删除的 Database 名称。

- **--output, -o** （*string*） -

    指示输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** （*boolean*） -

    指示当输出设置为 `table` 或 `csv` 时是否省略表头行。

- **--query, -q** （*string*） -

    指示用于筛选输出的 JMESPath 表达式。

- **--yes, -y** （*boolean*） -

    指示是否跳过确认提示。

## 示例\{#example}

```bash
zilliz database drop --name my_database
```
