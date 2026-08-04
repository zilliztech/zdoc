---
title: "describe | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取单个 external-collection 刷新任务的状态。 | Cloud"
type: docx
token: NV6mdzUocoqBpjxpf6Lc649mnjh
sidebar_position: 1
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
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

此操作获取单个 external-collection 刷新任务的状态。

## 描述\{#description}

获取某个 external-collection 刷新任务的当前状态和详细信息。传入由 `zilliz external-collection refresh trigger` 返回的 `jobId`。

## 概要\{#synopsis}

```bash
zilliz external-collection refresh describe
--job-id <value>
```

## 选项\{#options}

- **--job-id** (*integer*) -

    **[必需]**

    指定刷新任务 ID，由 trigger 返回。

## 示例\{#example}

```bash
zilliz -o json external-collection refresh describe --job-id 123456

# Example output
# {
#   "jobId": 123456,
#   "status": "RUNNING"
# }
```
