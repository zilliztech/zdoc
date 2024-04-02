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
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `async(Boolean async)`

    Whether this operation is asynchronous.

    The value defaults to `Boolean.True`, indicating immediate return while the process may still run in the background.

- `timeout(Long timeout)`

    The timeout duration of the process. The process terminates after the specified duration expires.

    The value defaults to `60000L`, indicating the timeout duration is __1__ minute.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// drop a collection: test
DropCollectionReq dropCollectionReq = DropCollectionReq.builder()
        .collectionName("test")
        .build();
client.dropCollection(dropCollectionReq);
// check if dropped
client.hasCollection(HasCollectionReq.builder()
        .collectionName("test")
        .build());
// false
```

