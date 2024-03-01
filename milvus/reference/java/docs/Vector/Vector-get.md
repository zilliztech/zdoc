---
displayed_sidbar: javaSidebar
slug: /java/Vector-get
beta: false
notebook: false
type: docx
token: XeXxd6ylAoSZ05xkXEqcS84XnIc
sidebar_position: 2
---

# get()

This operation gets specific entities by their IDs.

```java
public GetResp get(GetReq request)
```

## Request Syntax{#request-syntax}

```java
get(GetReq.builder()
    .collectionName(String collectionName)
    .ids(List<Object> ids)
    .partitionName(String partitionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `ids(List<Object> ids)`

    A specific entity ID or a list of entity IDs.

- `partitionName(String partitionName)`

    The name of a partition.

__RETURN TYPE:__

_GetResp_

__RETURNS:__

A __GetResp__ object representing one or more queried entities.

__PARAMETERS:__

- __getResults__ (_List\<QueryResp.QueryResult\>_)

    A list of __QueryResp.QueryResult__ objects.

- __fields__ (_Map\<String,Object\>_)

    A map that contains key-value pairs of field names and their values.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GetReq getReq = GetReq._builder_()
        .collectionName("test")
        .ids(Collections._singletonList_("1"))
        .build();
GetResp statusR = client_v2.get(getReq);
```

