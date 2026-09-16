---
title: "CompactionState | Go | v2"
slug: /go/go/v2-Management-CompactionState
sidebar_label: "CompactionState"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Compaction 操作の取り得る状態を列挙します。 | Go | v2"
type: docx
token: StsddnE0ho6w73xxaGucPja3nMc
sidebar_position: 3
keywords: 
  - ハイブリッド検索
  - レキシカル検索
  - 最近傍検索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - CompactionState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CompactionState

Compaction 操作の取り得る状態を列挙します。

```go
type CompactionState commonpb
```

**VALUES:**

- **CompactionStateRunning** = CompactionState(commonpb.CompactionState_Executing)

    Compaction 操作は現在実行中です。

- **CompactionStateCompleted** = CompactionState(commonpb.CompactionState_Completed)

    Compaction 操作が完了しました。
