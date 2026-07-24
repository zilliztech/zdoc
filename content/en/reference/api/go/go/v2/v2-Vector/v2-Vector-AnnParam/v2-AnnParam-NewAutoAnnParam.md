---
title: "NewAutoAnnParam() | Go | v2"
slug: /go/go/v2-AnnParam-NewAutoAnnParam
sidebar_label: "NewAutoAnnParam()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This function creates an ANN search parameter set for AUTOINDEX with a configurable search precision level. | Go | v2"
type: docx
token: VFR6dvKoyo0Pl5x6a44cbIJ8n3f
sidebar_position: 2
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - NewAutoAnnParam()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewAutoAnnParam()

This function creates an ANN search parameter set for AUTOINDEX with a configurable search precision level.

```go
func NewAutoAnnParam(level int) autoAnnParam
```

**PARAMETERS:**

- **level** (*int*)

    The search precision level (1-5). Higher values increase recall at the cost of latency.

**RETURNS:**

*[AnnParam](./v2-Vector-AnnParam)*

An ANN search parameter instance. Pass this to a search option via `WithAnnParam()`.

## Example\{#example}

```go
import (
	"github.com/milvus-io/milvus/client/v2/index"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

// Create ANN search parameters
param := index.NewAutoAnnParam(10)

// Use with a search option
option := milvusclient.NewSearchOption("collection_name", limit, vectors).
    WithAnnParam(param)
```
