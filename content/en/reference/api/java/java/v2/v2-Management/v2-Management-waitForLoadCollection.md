---
title: "waitForLoadCollection() | Java | v2"
slug: /java/java/v2-Management-waitForLoadCollection
sidebar_label: "waitForLoadCollection()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "This operation halts the process until the collection is loaded. You can use this method to check the load status of a collection at an interval of 0.5 seconds until the load process is complete. | Java | v2"
type: docx
token: LMsOdAVFQopadPx1N2UcOn0unCf
sidebar_position: 18
keywords: 
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - waitForLoadCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# waitForLoadCollection()

This operation halts the process until the collection is loaded. You can use this method to check the load status of a collection at an interval of 0.5 seconds until the load process is complete.

```java
private void WaitForLoadCollection(String collectionName, long timeoutMs)
```

## Request Syntax\{#request-syntax}

```java
waitForCollectionRelease(String collectionName, long timeoutMs)
```

**PARAMETERS:**

- **collectionName** (*String*) -

    The name of the target collection.

- **timeoutMs** (*long*) -

    The timeout duration for this operation in milliseconds.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
// load collection "test"
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);

// Wait for 10 seconds
client.waitForLoadCollection("test", 10000)
```
