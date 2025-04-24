---
displayed_sidbar: javaSidebar
title: "dropCollection() | Java | v2"
slug: /java/java/v2-Collections-dropCollection
sidebar_label: "dropCollection()"
beta: false
notebook: false
description: "This operation drops a collection. | Java | v2"
type: docx
token: PsAGd1CNqosvirxDJ5ncIHudnSg
sidebar_position: 15
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollection()
  - javaV225
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropCollection()

This operation drops a collection.

```java
public void dropCollection(DropCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
dropCollection(DropCollectionReq.builder()
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `async(Boolean async)`

    Whether this operation is asynchronous.

    The value defaults to `Boolean.True`, indicating immediate return while the process may still run in the background.

- `timeout(Long timeout)`

    The timeout duration of the process. The process terminates after the specified duration expires.

    The value defaults to `60000L`, indicating the timeout duration is **1** minute.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// drop a collection: test
DropCollectionReq dropCollectionReq = DropCollectionReq.builder()
        .collectionName("test")
        .build();
client.dropCollection(dropCollectionReq);
// check if dropped
client.hasCollection(HasCollectionReq.builder()
        .collectionName("test")
        .build());
// false
```

