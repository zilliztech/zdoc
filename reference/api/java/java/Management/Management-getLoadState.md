---
displayed_sidbar: javaSidebar
slug: /java/Management-getLoadState
beta: false
notebook: false
type: docx
token: AzwPdR4pSoSSUAx5vsEc14x3nGf
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# getLoadState()

This operation displays whether a specified collection or partition is loaded or not.

```java
public Boolean getLoadState(GetLoadStateReq request)
```

## Request Syntax{#request-syntax}

```java
getLoadState(GetLoadStateReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of a collection.

- `partitionName(String partitionName)`

    The name of a partition.

__RETURN TYPE:__

_Boolean_

__RETURNS:__

A Boolean value that indicates the status of the specified collection or partition. 

<Admonition type="info" icon="📘" title="Notes">

<p>A collection is in the loaded state if any or all of its partitions are loaded.</p>

</Admonition>

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GetLoadStateReq getLoadStateReq = GetLoadStateReq._builder_()
        .collectionName("test")
        _//.partitionName("partition1")_
        .build();
Boolean resp = client.getLoadState(getLoadStateReq);
```
