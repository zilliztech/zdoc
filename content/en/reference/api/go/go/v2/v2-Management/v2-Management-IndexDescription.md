---
title: "IndexDescription | Go | v2"
slug: /go/go/v2-Management-IndexDescription
sidebar_label: "IndexDescription"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Describes an index including its type, parameters, build state, and row counts. | Go | v2"
type: docx
token: Wyvhd3725onAmAxegk1caOHonQg
sidebar_position: 15
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - IndexDescription
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# IndexDescription

Describes an index including its type, parameters, build state, and row counts.

```go
type IndexDescription struct {
    index.Index
    State index.IndexState
    PendingIndexRows int64
    TotalRows int64
    IndexedRows int64
}
```

**FIELDS:**

- **index.Index** *(embedded)*

    Inherits methods from index.Index.

- **State** (*index.IndexState*)

    The current state.

- **PendingIndexRows** (*int64*)

    The number of rows pending indexing.

- **TotalRows** (*int64*)

    The total number of rows.

- **IndexedRows** (*int64*)

    The number of indexed rows.