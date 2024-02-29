---
displayed_sidbar: javaSidebar
slug: /java/Collections-getCollectionStats
beta: false
notebook: false
type: docx
token: IYRldvtMWokHDuxn7LhcGWtEnqh
sidebar_position: 13
---

import Admonition from '@theme/Admonition';


# getCollectionStats()

This operation lists the statistics collected on a specific collection.

```java
public GetCollectionStatsResp getCollectionStats(GetCollectionStatsReq request)
```

## Request Syntax{#request-syntax}

```java
getCollectionStats(GetCollectionStatsReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of a collection.

__RETURN TYPE:__

_GetCollectionStatsResp_

__RETURNS:__

A __GetCollectionStatsResp__ object containing collected statistics on the specified collection.

__PARAMETERS:__

- __numOfEntities__ (_long_)

    The count of entities in the collection.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GetCollectionStatsReq getCollectionStatsReq = GetCollectionStatsReq._builder_()
        .collectionName("test")
        .build();
GetCollectionStatsResp getCollectionStatsResp = client_v2.getCollectionStats(getCollectionStatsReq);
```

