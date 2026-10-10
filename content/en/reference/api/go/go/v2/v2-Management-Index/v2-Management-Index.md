---
title: "Index | Go | v2"
slug: /go/go/v2-Management-Index
sidebar_label: "Index"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Interface for index configuration. Use constructor functions like NewAutoIndex() or NewHNSWIndex() to create instances. | Go | v2"
type: docx
token: ERQodkjAzotUQ3xKvA8c6jmLn3e
sidebar_position: 1
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - Index
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Index

Interface for index configuration. Use constructor functions like NewAutoIndex() or NewHNSWIndex() to create instances.

```go
type Index interface {
    Name() string
    IndexType() IndexType
    Params() map[string]string
}
```

**METHODS:**

- `Name() string`

    Returns the name of the index.

- `IndexType() IndexType`

    Returns the index algorithm type.

- `Params() map[string]string`

    Returns the index parameters as a key-value map.