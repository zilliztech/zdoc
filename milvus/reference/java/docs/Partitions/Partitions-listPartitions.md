---
displayed_sidbar: javaSidebar
slug: /java/Partitions-listPartitions
beta: false
notebook: false
type: docx
token: M2l0dCikPouRErxA1bccCswpnKh
sidebar_position: 4
---

# listPartitions()

This operation lists the partitions in a specified collection.

```java
public List<String> listPartitions(ListPartitionsReq request)
```

## Request Syntax{#request-syntax}

```java
listPartitions(ListPartitionsReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

__RETURN TYPE:__

_List\<String\>_

__RETURNS:__

A list of partition names.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
ListPartitionsReq listPartitionsReq = ListPartitionsReq._builder_()
        .collectionName("test")
        .build();
List<String> res = client_v2.listPartitions(listPartitionsReq);
```

