---
title: "describe | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取单个外部 Collection 刷新作业的状态。| Cloud"
type: docx
token: NV6mdzUocoqBpjxpf6Lc649mnjh
sidebar_position: 1
keywords: 
  - RAG
  - NLP
  - 神经网络
  - 深度学习
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

此操作获取单个外部 Collection 刷新作业的状态。

## 说明\{#description}

获取一个外部 Collection 刷新作业的当前状态和详细信息。传入由 `zilliz external-collection refresh trigger` 返回的 `jobId`。

## 语法\{#synopsis}

```bash
zilliz external-collection refresh describe
--job-id <value>
```

## 选项\{#options}

- **--job-id**（*integer*）-

    **[必填]**

    指定刷新作业 ID，由 trigger 返回。

## 示例\{#example}

```bash
zilliz -o json external-collection refresh describe --job-id 123456

# Example output
# {
#   "jobId": 123456,
#   "status": "RUNNING"
# }
```
