---
displayed_sidbar: javaSidebar
slug: /java/Collections-hasCollection
beta: false
notebook: false
type: docx
token: HOgkdNByyoAO4GxnLZjcpC8an8c
sidebar_position: 14
---

import Admonition from '@theme/Admonition';


# hasCollection()

This operation checks whether a specific collection exists.

```java
public [Boolean](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Boolean.html) hasCollection(HasCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
hasCollection(HasCollectionReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of a collection.

__RETURN TYPE:__

_bool_

__RETURNS:__

A boolean value indicating whether the specified collection exists.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
HasCollectionReq hasCollectionReq = HasCollectionReq._builder_()
        .collectionName("test")
        .build();
Boolean resp = client.hasCollection(hasCollectionReq);
```

