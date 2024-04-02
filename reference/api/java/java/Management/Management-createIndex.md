---
displayed_sidbar: javaSidebar
slug: /java/Management-createIndex
beta: false
notebook: false
type: docx
token: LZQ9dbJxQoUhATxciEacmuF4nvh
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# createIndex()

This operation creates an index for a specific collection.

```java
public void createIndex(CreateIndexReq request)
```

## Request Syntax{#request-syntax}

```java
createIndex(CreateIndexReq.builder()
    .collectionName(String collectionName)
    .indexParams(List<IndexParam> indexParams)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

- `indexParams(List<IndexParam> indexParams)`

    A list of __IndexParam__ objects.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// create an index for field "vector"
IndexParam indexParam = IndexParam.builder()
        .metricType(IndexParam.MetricType._L2_)
        .indexType(IndexParam.IndexType._AUTOINDEX_)
        .fieldName("vector")
        .build();
CreateIndexReq createIndexReq = CreateIndexReq.builder()
        .collectionName("test")
        .indexParams(Collections.singletonList(indexParam))
        .build();
client.createIndex(createIndexReq);
```

