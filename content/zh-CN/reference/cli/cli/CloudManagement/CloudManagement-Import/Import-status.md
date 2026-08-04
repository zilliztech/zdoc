---
title: "status | Cloud"
slug: /cli/cli/Import-status
sidebar_label: "status"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取导入作业的状态。 | Cloud"
type: docx
token: Lu5EdzR9So5gUCxL71YcX30Enkh
sidebar_position: 3
keywords: 
  - 托管向量数据库
  - Pinecone 向量数据库
  - 音频搜索
  - 什么是语义搜索
  - zilliz
  - zilliz cloud
  - cloud
  - 状态
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# status

此操作用于获取导入作业的状态。

## 概要\{#synopsis}

```bash
zilliz import status
--job-id <value>
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

**选项：**

- **--job-id** (*string*) -

    **[必需]**

    表示导入作业 ID，格式类似于 `job-xxxxx`。

- **--cluster-id** (*string*) -

    **[必需]**

    表示指定导入作业中所涉及集群的 ID，格式类似于 `inxx-xxxxx`。

    如果已使用 `zilliz context set` 配置集群，则在未配置此选项时会自动应用该集群。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz import status --job-id job-xxxx --cluster-id in01-xxxxxxxxxxxx
```
