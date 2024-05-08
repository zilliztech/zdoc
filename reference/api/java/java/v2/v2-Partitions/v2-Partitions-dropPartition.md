---
displayed_sidbar: this.displayedSidebar
slug: /java/java/v2-Partitions-dropPartition
beta: FALSE
notebook: FALSE
type: docx
token: NhxzdRsa7o7wEAxtrDocVCy2nCb
sidebar_position: 2
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

