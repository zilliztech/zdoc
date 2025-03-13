---
displayed_sidbar: javaSidebar
title: "WaitForDropCollection() | Java | v2"
slug: /java/java/v2-Collections-WaitForDropCollection
sidebar_label: "WaitForDropCollection()"
beta: false
notebook: false
description: "This operation halts the process until the collection is dropped. You can use this method to encapsulate the request for a collection drop, ensuring the drop is fully complete before proceeding with further actions. | Java | v2"
type: docx
token: K9E6dtYlJojtOCxTG0EcGBVnnKe
sidebar_position: 23
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - WaitForDropCollection()
  - javaV225
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# WaitForDropCollection()

This operation halts the process until the collection is dropped. You can use this method to encapsulate the request for a collection drop, ensuring the drop is fully complete before proceeding with further actions.

```java
private void WaitForDropCollection(DropCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
WaitForDropCollection(DropCollectionReq.builder()
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

- `async(Boolean async)`

    Whether this operation is asynchronous.

    The value defaults to `Boolean.True`, indicating immediate return while the process may still run in the background.

- `timeout(Long timeout)`

    The timeout duration of the process. The process terminates after the specified duration expires.

    The value defaults to `60000L`, indicating the timeout duration is one minute.

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
client.WaitForDropCollection(dropCollectionReq);
```

