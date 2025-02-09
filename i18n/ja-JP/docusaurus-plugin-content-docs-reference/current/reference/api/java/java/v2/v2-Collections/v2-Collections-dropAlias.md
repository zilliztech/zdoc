---
displayed_sidbar: javaSidebar
title: "dropAlias() | Java | v2"
slug: /java/java/v2-Collections-dropAlias
sidebar_label: "dropAlias()"
beta: false
notebook: false
description: "This operation drops a specified collection alias. | Java | v2"
type: docx
token: MBy3dDXFbo0buwxkh0IczwLInPf
sidebar_position: 10
keywords: 
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - dropAlias()
  - javaV2
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropAlias()

This operation drops a specified collection alias. 

```java
public void dropAlias(DropAliasReq request)
```

## Request Syntax{#request-syntax}

```java
dropAlias(DropAliasReq.builder()
    .alias(String alias)
    .build()
)
```

**BUILDER METHODS:**

- `alias(String alias)`

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// drop alias "test_alias"
DropAliasReq dropAliasReq = DropAliasReq.builder()
        .alias("test_alias")
        .build();
client.dropAlias(dropAliasReq);
```
