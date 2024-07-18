---
displayed_sidbar: javaSidebar
slug: /java/java/v2-Collections-getCollectionStats
beta: false
notebook: false
type: docx
token: XgfcdpBWCof3pfxhUudcRZajnPc
sidebar_position: 13
displayed_sidebar: javaSidebar

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

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

**RETURN TYPE:**

*GetCollectionStatsResp*

**RETURNS:**

A **GetCollectionStatsResp** object containing collected statistics on the specified collection.

**PARAMETERS:**

- **numOfEntities** (*long*)

    The count of entities in the collection.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GetCollectionStatsReq getCollectionStatsReq = GetCollectionStatsReq.builder()
        .collectionName("test")
        .build();
GetCollectionStatsResp getCollectionStatsResp = client.getCollectionStats(getCollectionStatsReq);
```

