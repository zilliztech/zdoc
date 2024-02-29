---
displayed_sidbar: javaSidebar
slug: /java/Vector-delete
beta: false
notebook: false
type: docx
token: DgKidEKLXodqn3xsg0hclkcRntd
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# delete()

This operation deletes entities by their IDs or with a boolean expression.

```java
public DeleteResp delete(DeleteReq request)
```

## Request Syntax{#request-syntax}

```java
delete(DeleteReq.builder()
    .collectionName(String collectionName)
    .expr(String expr)
    .ids(List<Object> ids)
    .partitionName(String partitionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `expr(String expr)`

    A scalar filtering condition to filter matching entities. 

    The value defaults to an empty string, indicating that no condition applies.

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md).

- `ids(List<Object> ids)`

    A specific entity ID or a list of entity IDs.

- `partitionName(String partitionName)`

    The name of a partition.

__RETURN TYPE:__

_DeleteResp_

__RETURNS:__

A __DeleteResp__ object contains the number of deleted entities.

__PARAMETERS:__

- __deleteCnt__ (long)

    The count of deleted entities.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DeleteReq deleteReq = DeleteReq._builder_()
        .collectionName("test")
        .expr("id > 10")
        .build();
client_v2.delete(deleteReq);
```

