---
displayed_sidbar: javaSidebar
slug: /java/Partitions-createPartition
beta: false
notebook: false
type: docx
token: QNp6dzHNlofyPoxbysFcrfTunMh
sidebar_position: 1
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

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    (Required) The name of an existing collection.

- `partitionName(String partitionName)`

    (Required) The name of the partition to create.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreatePartitionReq createPartitionReq = CreatePartitionReq._builder_()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.createPartition(createPartitionReq);
```

