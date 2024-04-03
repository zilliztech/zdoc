---
displayed_sidbar: javaSidebar
slug: /java/Management-IndexParam
beta: false
notebook: false
type: docx
token: J0hLdJ68foCRu5xWsWacORuAnLg
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# IndexParam

This operation prepares index parameters to build indexes for a specific collection.

```java
io.milvus.v2.common.IndexParam
```

## Request Syntax{#request-syntax}

```java
IndexParam.builder()
    .fieldName(String fieldName)
    .indexName(String indexName)
    .indexType(IndexParam.IndexType indexType)
    .metricType(IndexParam.MetricType metricType)
    .extraParams(Map<String, Object> extraParams)
    .build();
```

__BUILDER METHODS:__

- `fieldName(String fieldName)`

    The name of the target field to apply this __IndexParam__ object applies.

- `indexName(String indexName)`

    The name of the index field generated after this __IndexParam__ object has been applied.

- `indexType(IndexParam.IndexType indexType)`

    The name of the algorithm used to arrange data in the specific field. On Zilliz Cloud, the index type is always __AUTOINDEX__. For details, refer to [AUTOINDEX Explained](/docs/autoindex-explained).

- `metricType(IndexParam.MetricType metricType)`

    The distance metric to use for the index. Possible values are __L2__, __IP__, __COSINE__.

- `extraParams(Map<String, Object> extraParams)`

    Extra index parameters. For details, refer to [In-memory Index](https://milvus.io/docs/index.md), [On-disk Index](https://milvus.io/docs/disk_index.md), and [GPU index](https://milvus.io/docs/gpu_index.md).

__RETURN TYPE:__

_IndexParam_

__RETURNS:__

An __IndexParam__ object.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// define index param for field "vector"
IndexParam indexParam = IndexParam.builder()
        .metricType(IndexParam.MetricType._L2_)
        .indexType(IndexParam.IndexType._AUTOINDEX_)
        .fieldName("vector")
        .indexName("idx")
        .build();
```

