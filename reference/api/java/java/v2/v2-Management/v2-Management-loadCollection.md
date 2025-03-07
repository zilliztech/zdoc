---
displayed_sidbar: javaSidebar
title: "loadCollection() | Java | v2"
slug: /java/java/v2-Management-loadCollection
sidebar_label: "loadCollection()"
beta: false
notebook: false
description: "This operation loads the data of a specific collection into memory. | Java | v2"
type: docx
token: XEWvdbuFHoLOo7xKrAJcqip6n5J
sidebar_position: 7
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollection()
  - javaV225
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# loadCollection()

This operation loads the data of a specific collection into memory.

```java
public void loadCollection(LoadCollectionReq request)
```

<Admonition type="info" icon="📘" title="Notes">

<p>This operation is required only if the target collection is not loaded. A collection is in the <strong>NotLoad</strong> state only if you have released the collection or you have created the collection without any index parameters.</p>

</Admonition>

## Request Syntax{#request-syntax}

```java
loadCollection(LoadCollectionReq.builder()
    .collectionName(String collectionName)
    .numReplicas(Integer numReplicas)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

- `numReplicas(Integer numReplicas)`

    The number of replicas to create upon collection load.

    The value defaults to **1**, indicating that one replica is to be created upon collection load.

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
// load collection "test"
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);
```

