---
displayed_sidbar: this.displayedSidebar
slug: /java/java/v2-Management-IndexParam
beta: FALSE
notebook: FALSE
type: docx
token: J0hLdJ68foCRu5xWsWacORuAnLg
sidebar_position: 5
displayed_sidebar: javaSidebar

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

**BUILDER METHODS:**

- `fieldName(String fieldName)`

    The name of the target field to apply this **IndexParam** object applies.

- `indexName(String indexName)`

    The name of the index field generated after this **IndexParam** object has been applied.

- `indexType(IndexParam.IndexType indexType)`

    The name of the algorithm used to arrange data in the specific field. On Zilliz Cloud, the index type is always **AUTOINDEX**. For details, refer to [AUTOINDEX Explained](/docs/autoindex-explained).

- `metricType(IndexParam.MetricType metricType)`

    The distance metric to use for the index. Possible values are **L2**, **IP**, **COSINE**.

- `extraParams(Map<String, Object> extraParams)`

    Extra index parameters. For details, refer to [In-memory Index](https://milvus.io/docs/index.md), [On-disk Index](https://milvus.io/docs/disk_index.md), and [GPU index](https://milvus.io/docs/gpu_index.md).

**RETURN TYPE:**

*IndexParam*

**RETURNS:**

An **IndexParam** object.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// define index param for field "vector"
IndexParam indexParam = IndexParam.builder()
        .metricType(IndexParam.MetricType.L2)
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .fieldName("vector")
        .indexName("idx")
        .build();
```

