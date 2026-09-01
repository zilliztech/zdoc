---
title: "LoadState | Go | v2"
slug: /go/go/v2-Management-LoadState
sidebar_label: "LoadState"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents the load state of a collection or partition, including progress percentage. | Go | v2"
type: docx
token: XWSAdFkdDoaDPnxOtkEcuFETngL
sidebar_position: 20
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - LoadState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadState

Represents the load state of a collection or partition, including progress percentage.

```go
type LoadState struct {
    State LoadStateCode
    Progress int64
}
```

**FIELDS:**

- **State** (*LoadStateCode*)

    The current state.

- **Progress** (*int64*)

    The progress percentage.