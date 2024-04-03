---
displayed_sidbar: javaSidebar
slug: /java/Partitions-hasPartition
beta: false
notebook: false
type: docx
token: E00Tdat7lom0LcxpaeicTEZvnig
sidebar_position: 3
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

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionName(String partitionName)`

    The name of the partition to check.

__RETURN TYPE:__

_Boolean_

__RETURNS:__

A boolean value indicating whether the specified partition exists.

__EXCEPTIONS:__

- __MilvusClientExceptions__

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

