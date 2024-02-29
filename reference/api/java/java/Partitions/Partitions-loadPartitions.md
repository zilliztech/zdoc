---
displayed_sidbar: javaSidebar
slug: /java/Partitions-loadPartitions
beta: false
notebook: false
type: docx
token: R8BCd0rePoAMjixwJo9ceziqnjf
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# loadPartitions()

```java
public void loadPartitions(LoadPartitionsReq request)
```

## Request Syntax{#request-syntax}

```java
loadPartitions(LoadPartitionsReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionNames(List<String> partitionNames)`

    A list of the names of the partitions to load.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq._builder_()
        .collectionName("test_partition")
        .partitionNames(Collections._singletonList_("test_partition"))
        .build();
client.loadPartitions(loadPartitionsReq);
```

