---
displayed_sidbar: javaSidebar
slug: /java/Collections-renameCollection
beta: false
notebook: false
type: docx
token: A9XDdBOWEolZ8lxmvcwcNrRInke
sidebar_position: 16
---

# renameCollection()

This operation renames an existing collection.

```java
public void renameCollection(RenameCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
renameCollection(RenameCollectionReq.builder()
    .collectionName(String collectionName)
    .newCollectionName(String newCollectionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

    Setting this to a non-existing collection results in a __MilvusException__.

- `newCollectionName(String newCollectionName)`

    The name of the target collection after this operation.

    Setting this to the value of __old_name__ results in a __MilvusException__.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
RenameCollectionReq renameCollectionReq = RenameCollectionReq._builder_()
        .collectionName("test")
        .newCollectionName("test2")
        .build();
client.renameCollection(renameCollectionReq);
```

