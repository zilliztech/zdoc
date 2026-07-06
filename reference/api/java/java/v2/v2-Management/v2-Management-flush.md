---
title: "flush() | Java | v2"
slug: /java/java/v2-Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation flushes the streaming data onto the disk and seals the current segment. | Java | v2"
type: docx
token: N4R0dHR6MoiW2Rx9ClGc9MSlnOe
sidebar_position: 7
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# flush()

This operation flushes the streaming data onto the disk and seals the current segment.

```java
public void flush(FlushReq request)
```

## Request Syntax\{#request-syntax}

```java
flush(FlushReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionNames(List<String> collectionNames)` -

    A list of collection names.

- `waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)` -

    The timeout in milliseconds to wait for flush completion.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.FlushReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.flush(FlushReq.builder()
    .collectionNames(Collections.singletonList("my_collection"))
    .build();
);
```
