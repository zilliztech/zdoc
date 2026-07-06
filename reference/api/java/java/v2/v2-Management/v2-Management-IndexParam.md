---
title: "IndexParam | Java | v2"
slug: /java/java/v2-Management-IndexParam
sidebar_label: "IndexParam"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "IndexParam defines the parameters for configuring an index on a collection field. | Java | v2"
type: docx
token: SXgodgq99ozZoHxfnakc0fpCnJh
sidebar_position: 10
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - IndexParam
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# IndexParam

IndexParam defines the parameters for configuring an index on a collection field.

```java
IndexParam.builder()
    .fieldName(String fieldName)
    .indexType(IndexType indexType)
    .metricType(MetricType metricType)
    .extraParams(Map<String, Object> extraParams)
    .build()
```

**BUILDER METHODS:**

- `fieldName(String fieldName)` -

    The name of the field to index.

- `indexType(IndexType indexType)` -

    The type of index to build on the field. For available index types, refer to IndexType.

- `metricType(MetricType metricType)` -

    The metric type for vector similarity measurement. For available metric types, refer to MetricType.

- `extraParams(Map<String, Object> extraParams)` -

    Additional index-specific parameters as key-value pairs. For example, `{"M": 16, "efConstruction": 256}` for HNSW indexes.

**RETURNS:**

*IndexParam*

**EXCEPTIONS:**

*MilvusClientException*

This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.common.IndexParam;

IndexParam indexParam = IndexParam.builder()
    .fieldName("vector")
    .indexType(IndexParam.IndexType.HNSW)
    .metricType(IndexParam.MetricType.COSINE)
    .extraParams(Map.of("M", 16, "efConstruction", 256))
    .build();
```
