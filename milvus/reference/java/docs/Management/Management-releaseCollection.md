---
displayed_sidbar: javaSidebar
slug: /java/Management-releaseCollection
beta: false
notebook: false
type: docx
token: PsSrdeIqnoUt3qxlGNXcTAQbnLh
sidebar_position: 9
---

# releaseCollection()

This operation releases the data of a specific collection from memory.

```java
public void releaseCollection(ReleaseCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
releaseCollection(ReleaseCollectionReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of a collection.

- `partitionNames(List<String> partitionNames)`

    A list of partition names to release.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq._builder_()
        .collectionName("test")
        .build();
client_v2.releaseCollection(releaseCollectionReq);
```
