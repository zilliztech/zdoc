---
title: "Alias | Go | v2"
slug: /go/go/v2-Collection-Alias
sidebar_label: "Alias"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents a collection alias with its associated database and collection name. | Go | v2"
type: docx
token: GwIxdz90jojeBNx965VcTJHnnFd
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - Alias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Alias

Represents a collection alias with its associated database and collection name.

```go
type Alias struct {
    DbName string
    Alias string
    CollectionName string
}
```

**FIELDS:**

- **DbName** (*string*)

    The name of the associated database.

- **Alias** (*string*)

    The alias name.

- **CollectionName** (*string*)

    The name of the associated collection.