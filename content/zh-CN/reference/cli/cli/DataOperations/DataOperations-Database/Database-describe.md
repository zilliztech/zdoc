---
title: "describe | Cloud"
slug: /cli/cli/Database-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可获取 Database 的详细信息。（仅 Dedicated） | Cloud"
type: docx
token: A8XSdcz0UoXHnyxHPcOcaLExn3o
sidebar_position: 2
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus benchmark
  - Zilliz
  - Zilliz Cloud
  - 云
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

此操作可获取 Database 的详细信息。（仅 Dedicated）

<Admonition type="info" title="Notes">

此命令适用于 Dedicated 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz database describe
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--name** （*string*） -

    **[必需]**

    指示 Database 名称。

- **--output, -o** （*string*） -

    指示输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** （*boolean*） -

    指示当输出设置为 `table` 或 `csv` 时是否省略标题行。

- **--query, -q** （*string*） -

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz database describe --name my_database
```
