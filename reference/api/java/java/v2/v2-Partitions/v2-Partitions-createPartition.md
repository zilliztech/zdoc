---
displayed_sidbar: javaSidebar
title: "createPartition() | Java | v2"
slug: /java/java/v2-Partitions-createPartition
sidebar_label: "createPartition()"
beta: false
notebook: false
description: "This operation creates a partition in the target collection. | Java | v2"
type: docx
token: CadTdZ5YGocDymxaIOvcr08pnxd
sidebar_position: 1
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - createPartition()
  - javaV225
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createPartition()

This operation creates a partition in the target collection.

```java
public void createPartition(CreatePartitionReq request)
```

## Request Syntax{#request-syntax}

```java
createPartition(CreatePartitionReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    (Required) The name of an existing collection.

- `partitionName(String partitionName)`

    (Required) The name of the partition to create.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// create a partition "test_partition" in collection "test"
CreatePartitionReq createPartitionReq = CreatePartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.createPartition(createPartitionReq);
```

