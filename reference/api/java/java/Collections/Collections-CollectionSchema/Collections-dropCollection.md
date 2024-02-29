---
displayed_sidbar: javaSidebar
slug: /java/Collections-dropCollection
beta: false
notebook: false
type: docx
token: KMYzdRhVjo5OqOxlB9acFeMgnOh
sidebar_position: 11
---

import Admonition from '@theme/Admonition';


# dropCollection()

This operation drops a collection.

```java
public void dropCollection(DropCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
dropCollection(DropCollectionReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DropCollectionReq dropCollectionReq = DropCollectionReq._builder_()
        .collectionName("test")
        .build();
client.dropCollection(dropCollectionReq);
```

