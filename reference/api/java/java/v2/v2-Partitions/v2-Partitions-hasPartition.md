---
displayed_sidbar: javaSidebar
title: "hasPartition() | Java | v2"
slug: /java/java/v2-Partitions-hasPartition
sidebar_label: "hasPartition()"
beta: false
notebook: false
description: "This operation checks whether the specified partition exists in the specified collection. | Java | v2"
type: docx
token: NS1xdv6f4oQlN4xqnOGc6ssWnTf
sidebar_position: 4
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - hasPartition()
  - javaV225
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# hasPartition()

This operation checks whether the specified partition exists in the specified collection.

```java
public Boolean hasPartition(HasPartitionReq request)
```

## Request Syntax{#request-syntax}

```java
hasPartition(HasPartitionReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionName(String partitionName)`

    The name of the partition to check.

**RETURN TYPE:**

*Boolean*

**RETURNS:**

A boolean value indicating whether the specified partition exists.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// check is partition "test_partition" exists in collection
HasPartitionReq hasPartitionReq = HasPartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
Boolean res = client.hasPartition(hasPartitionReq);
```

