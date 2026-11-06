---
title: "describe | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the status of a single external-コレクション refresh job. | Cloud"
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

---

import Admonition from '@theme/Admonition';


# describe

This operation gets the status of a single external-コレクション refresh job.

## 説明\{#description}

1 つの外部コレクションのリフレッシュジョブの現在のステータスと詳細を取得します。`zilliz external-collection refresh trigger` によって返される `jobId` を渡します。リフレッシュジョブは、`RefreshInProgress` から `RefreshCompleted` または `RefreshFailed` に遷移します。

## Synopsis\{#synopsis}

```bash
zilliz external-collection refresh describe
--job-id <value>
```

## Options\{#options}

- **--job-id** (*integer*) -

    **[REQUIRED]**

    trigger によって返される refresh ジョブ ID を指定します。

## Example\{#example}

```bash
zilliz -o json external-collection refresh describe --job-id 123456

# Example output
# {
#   "jobId": 123456,
#   "state": "RefreshInProgress"
# }
```
