---
title: "CompactionState | Go | v2"
slug: /go/go/v2-Management-CompactionState
sidebar_label: "CompactionState"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Enumerates the possible states of a compaction operation. | Go | v2"
type: docx
token: StsddnE0ho6w73xxaGucPja3nMc
sidebar_position: 3
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
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

Enumerates the possible states of a compaction operation.

```go
type CompactionState commonpb
```

**VALUES:**

- **CompactionStateRunning** = CompactionState(commonpb.CompactionState_Executing)

    The compaction operation is currently executing.

- **CompactionStateCompleted** = CompactionState(commonpb.CompactionState_Completed)

    The compaction operation has completed.