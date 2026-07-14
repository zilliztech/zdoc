---
title: "BulkInsertState | Python | ORM"
slug: /python/python/utility-BulkInsertState
sidebar_label: "BulkInsertState"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "以下の定数を提供する列挙型です。 | Python | ORM"
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

以下の定数を提供する列挙型です。

## Constants\{#constants}

- **ImportPending** = 0

    bulk-insert タスクが保留中であることを示します。

- **ImportFailed** = 1

    bulk-insert タスクが失敗したことを示します。

- **ImportStarted** = 2

    bulk-insert タスクが開始されたことを示します。

- **ImportPersisted** = 5

    bulk-insert タスクが永続化されたことを示します。

- **ImportCompleted** = 6

    bulk-insert タスクが完了したことを示します。

- **ImportFailedAndCleaned** = 7

    bulk-insert タスクが失敗し、データがクリーンアップされたことを示します。

- **ImportUnknownState** = 100

    bulk-insert タスクが不明な状態にあることを示します。
