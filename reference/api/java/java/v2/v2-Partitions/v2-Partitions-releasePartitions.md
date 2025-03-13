---
displayed_sidbar: javaSidebar
title: "releasePartitions() | Java | v2"
slug: /java/java/v2-Partitions-releasePartitions
sidebar_label: "releasePartitions()"
beta: false
notebook: false
description: "This operation releases the partitions in a specified collection from memory. | Java | v2"
type: docx
token: VsyQdDkXnoloWYxfjXNchc0dnng
sidebar_position: 7
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - releasePartitions()
  - javaV225
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# releasePartitions()

This operation releases the partitions in a specified collection from memory.

```java
public void releasePartitions(ReleasePartitionsReq request)
```

## Request Syntax{#request-syntax}

```java
releasePartitions(ReleasePartitionsReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionNames(List<String> partitionNames)`

    A list of the names of the partitions to release.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// release partition in collection
ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
        .collectionName("test_partition")
        .partitionNames(Collections.singletonList("test_partition"))
        .build();
client.releasePartitions(releasePartitionsReq);
```

