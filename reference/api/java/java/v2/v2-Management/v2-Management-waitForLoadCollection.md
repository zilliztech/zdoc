---
displayed_sidbar: javaSidebar
title: "waitForLoadCollection() | Java | v2"
slug: /java/java/v2-Management-waitForLoadCollection
sidebar_label: "waitForLoadCollection()"
beta: false
notebook: false
description: "This operation halts the process until the collection is loaded. You can use this method to check the load status of a collection at an interval of 0.5 seconds until the load process is complete. | Java | v2"
type: docx
token: LMsOdAVFQopadPx1N2UcOn0unCf
sidebar_position: 15
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - waitForLoadCollection()
  - javaV225
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# waitForLoadCollection()

This operation halts the process until the collection is loaded. You can use this method to check the load status of a collection at an interval of 0.5 seconds until the load process is complete.

```java
private void WaitForLoadCollection(String collectionName, long timeoutMs)
```

## Request Syntax{#request-syntax}

```java
waitForCollectionRelease(String collectionName, long timeoutMs)
```

**PARAMETERS:**

- **collectionName** (*String*) -

    The name of the target collection.

- **timeoutMs** (*long*) -

    The timeout duration for this operation in milliseconds.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// load collection "test"
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);

// Wait for 10 seconds
client.waitForLoadCollection("test", 10000)
```

