---
title: "BulkInsertState | Python | ORM"
slug: /python/python/utility-BulkInsertState
sidebar_label: "BulkInsertState"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。 | Python | ORM"
type: docx
token: Arn1dIKgwoISFoxT7xVc3UrBnAf
sidebar_position: 2
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - BulkInsertState
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# BulkInsertState

这是一个提供以下常量的枚举。

## 常量\{#constants}

- **ImportPending** = 0

    表示批量插入任务正在等待中。

- **ImportFailed** = 1

    表示批量插入任务失败。

- **ImportStarted** = 2

    表示批量插入任务已开始。

- **ImportPersisted** = 5

    表示批量插入任务已持久化。

- **ImportCompleted** = 6

    表示批量插入任务已完成。

- **ImportFailedAndCleaned** = 7

    表示批量插入任务失败且数据已清理。

- **ImportUnknownState** = 100

    表示批量插入任务处于未知状态。
