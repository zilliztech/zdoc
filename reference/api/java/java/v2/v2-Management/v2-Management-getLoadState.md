---
displayed_sidbar: javaSidebar
title: "getLoadState() | Java | v2"
slug: /java/java/v2-Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
notebook: false
description: "This operation displays whether a specified collection or partition is loaded or not. | Java | v2"
type: docx
token: QcaFdMJE9oHX1Axe11rcqfiynEd
sidebar_position: 4
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadState()
  - javaV2
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getLoadState()

This operation displays whether a specified collection or partition is loaded or not.

```java
public Boolean getLoadState(GetLoadStateReq request)
```

## Request Syntax{#request-syntax}

```java
getLoadState(GetLoadStateReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

- `partitionName(String partitionName)`

    The name of a partition.

**RETURN TYPE:**

*Boolean*

**RETURNS:**

A Boolean value that indicates the status of the specified collection or partition. 

<Admonition type="info" icon="📘" title="Notes">

<p>A collection is in the loaded state if any or all of its partitions are loaded.</p>

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// get load state for collection "test"
GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.getLoadState(getLoadStateReq);
// return true or false
```
