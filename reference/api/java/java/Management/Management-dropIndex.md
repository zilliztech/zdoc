---
displayed_sidbar: javaSidebar
slug: /java/Management-dropIndex
beta: false
notebook: false
type: docx
token: S8BXdtrunoTPiJxR8wScnzncnKh
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# dropIndex()

This operation drops an index from a specific collection.

```java
public void dropIndex(DropIndexReq request)
```

## Request Syntax{#request-syntax}

```java
dropIndex(DropIndexReq.builder()
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .indexName(String indexName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `fieldName(String fieldName)`

    The name of the field on which the index is created.

- `indexName(String indexName)`

    The name of the index to drop.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// drop index for field "vector"
DropIndexReq dropIndexReq = DropIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
client_v2.dropIndex(dropIndexReq);
```

