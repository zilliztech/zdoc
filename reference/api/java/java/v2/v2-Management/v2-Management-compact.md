---
title: "compact() | Java | v2"
slug: /java/java/v2-Management-compact
sidebar_key: java/v2-Management-compact
sidebar_label: "compact()"
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This operation compacts the collection by merging small segments into larger ones. It is recommended to call this operation after inserting a large amount of data into a collection. | Java | v2"
type: docx
token: FSTVdf6Yuovg9CxQf5acldFWnsb
sidebar_position: 2
keywords: 
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# compact()

This operation compacts the collection by merging small segments into larger ones. It is recommended to call this operation after inserting a large amount of data into a collection.

```java
public CompactResp compact(CompactReq request)
```

## Request Syntax\{#request-syntax}

```java
compact(CompactReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .isClustering(Boolean isClustering)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The name of the target collection.

- `isClustering(Boolean isClustering)` -

    Whether to perform clustering compaction. Defaults to `Boolean.FALSE`.

**RETURNS:**

*CompactResp*

A **CompactResp** object contains a compaction ID.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CompactReq;
import io.milvus.v2.service.utility.response.CompactResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.compact(CompactReq.builder()
    .collectionName("my_collection")
    .build();
);
```
