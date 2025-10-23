---
title: "releaseCollection() | Java | v2"
slug: /java/java/v2-Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation releases the data of a specific collection from memory. | Java | v2"
type: docx
token: BA9edMrWMosYWFxwTBAcl2WOnff
sidebar_position: 13
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - releaseCollection()
  - javaV225
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# releaseCollection()

This operation releases the data of a specific collection from memory.

```java
public void releaseCollection(ReleaseCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
releaseCollection(ReleaseCollectionReq.builder()
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Release collection "test"
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
        .collectionName("test")
        .build();
client.releaseCollection(releaseCollectionReq);
```
