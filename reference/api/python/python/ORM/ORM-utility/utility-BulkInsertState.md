---
title: "BulkInsertState | Python | ORM"
slug: /python/python/utility-BulkInsertState
sidebar_label: "BulkInsertState"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This is an enumeration that provides the following constants. | Python | ORM"
type: docx
token: Arn1dIKgwoISFoxT7xVc3UrBnAf
sidebar_position: 2
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - BulkInsertState
  - pymilvus26
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# BulkInsertState

This is an enumeration that provides the following constants.

## Constants\{#constants}

- **ImportPending** = 0

    Indicates that the bulk-insert task is pending.

- **ImportFailed** = 1

    Indicates that the bulk-insert task failed.

- **ImportStarted** = 2

    Indicates that the bulk-insert task has started.

- **ImportPersisted** = 5

    Indicates that the bulk-insert task has been persisted.

- **ImportCompleted** = 6

    Indicates that the bulk-insert task is completed.

- **ImportFailedAndCleaned** = 7

    Indicates that the bulk-insert task failed with data cleaned.

- **ImportUnknownState** = 100

    Indicates that the bulk-insert task is in an unknown state.