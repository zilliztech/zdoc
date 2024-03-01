---
displayed_sidbar: javaSidebar
slug: /java/Partitions-dropPartition
beta: false
notebook: false
type: docx
token: NhxzdRsa7o7wEAxtrDocVCy2nCb
sidebar_position: 2
---

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

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    (Required) The name of an existing collection.

- `partitionName(String partitionName)`

    (Required) The name of the partition to drop.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DropPartitionReq dropPartitionReq = DropPartitionReq._builder_()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.dropPartition(dropPartitionReq);
```

