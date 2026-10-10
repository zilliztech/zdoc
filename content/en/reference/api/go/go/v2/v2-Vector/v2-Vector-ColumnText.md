---
title: "ColumnText | Go | v2"
slug: /go/go/v2-Vector-ColumnText
sidebar_label: "ColumnText"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A ColumnText instance represents a TEXT field column holding string values for insertion, upsert, and query output. Create it with NewColumnText(). | Go | v2"
type: docx
token: RPoPdeGegozh2sxjgXBcKppfneb
sidebar_position: 22
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnText
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnText

A ColumnText instance represents a TEXT field column holding string values for insertion, upsert, and query output. Create it with NewColumnText().

```go
type ColumnText struct {
}
```

**BUILDER METHODS:**

- `Slice(start, end int) Column`

    This returns a sub-column spanning the given row range.

## Example\{#example}

Demonstrates ColumnText usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnText("summary", []string{"first", "second"})
fmt.Println(values.Len())
```
