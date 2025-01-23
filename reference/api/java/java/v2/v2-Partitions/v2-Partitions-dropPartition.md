---
displayed_sidbar: javaSidebar
title: "dropPartition() | Java | v2"
slug: /java/java/v2-Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
notebook: false
description: "This operation drops a specified partition from the current collection. | Java | v2"
type: docx
token: JTdSdyToooA6Srx2HolcmTPunoe
sidebar_position: 2
keywords: 
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - dropPartition()
  - javaV2
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropPartition()

This operation drops a specified partition from the current collection.

Before dropping a partition, you must first release it.

```java
public void dropPartition(DropPartitionReq request)
```

## Request Syntax{#request-syntax}

```java
dropPartition(DropPartitionReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    (Required) The name of an existing collection.

- `partitionName(String partitionName)`

    (Required) The name of the partition to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.dropPartition(dropPartitionReq);
```

