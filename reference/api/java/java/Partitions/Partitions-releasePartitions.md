---
displayed_sidbar: javaSidebar
slug: /java/Partitions-releasePartitions
beta: false
notebook: false
type: docx
token: GrBmdR0LeoNkwJxwZmOcUAIrnIM
sidebar_position: 6
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

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionNames(List<String> partitionNames)`

    A list of the names of the partitions to release.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

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

