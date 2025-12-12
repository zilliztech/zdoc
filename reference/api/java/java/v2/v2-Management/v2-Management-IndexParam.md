---
title: "IndexParam | Java | v2"
slug: /java/java/v2-Management-IndexParam
sidebar_label: "IndexParam"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation prepares index parameters to build indexes for a specific collection. | Java | v2"
type: docx
token: FUNwdQQqAon41YxMWiIcHIBmned
sidebar_position: 10
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - IndexParam
  - javaV226
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# IndexParam

This operation prepares index parameters to build indexes for a specific collection.

```java
io.milvus.v2.common.IndexParam
```

## Request Syntax\{#request-syntax}

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

- `indexType(IndexParam.[IndexType](./v2-Management-IndexType) indexType)`

    The name of the algorithm used to arrange data in the specific field. On Zilliz Cloud, the index type is always **AUTOINDEX**. For details, refer to [AUTOINDEX Explained](/docs/autoindex-explained).

- `metricType(IndexParam.[MetricType](./v2-Management-MetricType) metricType)`

    The algorithm that is used to measure similarity between vectors. Possible values: `IP`, `L2`, `COSINE`, `HAMMING`, `JACCARD`, `BM25` (used only for full text search). For more information, refer to [Metric Types](https://milvus.io/docs/metric.md).

    This is available only when the specified field is a vector field.

- `extraParams(Map<String, Object> extraParams)`

    Extra index parameters. For details, refer to [In-memory Index](https://milvus.io/docs/index.md), [On-disk Index](https://milvus.io/docs/disk_index.md), and [GPU index](https://milvus.io/docs/gpu_index.md).

**RETURN TYPE:**

*IndexParam*

**RETURNS:**

An **IndexParam** object.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
// define index param for field "vector"
IndexParam indexParam = IndexParam.builder()
        .metricType(IndexParam.MetricType.L2)
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .fieldName("vector")
        .indexName("idx")
        .build();
```

