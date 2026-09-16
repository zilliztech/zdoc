---
title: "CompactionState | Go | v2"
slug: /go/go/v2-Management-CompactionState
sidebar_label: "CompactionState"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "枚举 Compaction 操作可能处于的各种状态。 | Go | v2"
type: docx
token: StsddnE0ho6w73xxaGucPja3nMc
sidebar_position: 3
keywords: 
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - 云
  - CompactionState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CompactionState

枚举 Compaction 操作可能处于的各种状态。

```go
type CompactionState commonpb
```

**取值：**

- **CompactionStateRunning** = CompactionState(commonpb.CompactionState_Executing)

    Compaction 操作当前正在执行。

- **CompactionStateCompleted** = CompactionState(commonpb.CompactionState_Completed)

    Compaction 操作已完成。