---
title: "IndexParam | Java | v2"
slug: /java/java/v2-Management-IndexParam
sidebar_label: "IndexParam"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A IndexParam instance holds the parameters for configuring an index on a collection field. | Java | v2"
type: docx
token: PpTcd5ptzoYJjZxRPdMcQvSjnDc
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

A IndexParam instance holds the parameters for configuring an index on a collection field.

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

    The metric type used to measure vector similarity. For available metric types, refer to MetricType.

- `extraParams(Map<String, Object> extraParams)` -

    Additional index-specific parameters as key-value pairs. For example, `{"M": 16, "efConstruction": 256}` for HNSW indexes.

**RETURN TYPE:**

*IndexParam*

**RETURNS:**

An **IndexParam** object contains the following fields:

**PARAMETERS:**

- **fieldName** (*String*) -

    The name of the field to index.

- **indexName** (*String*) -

    The name of the index.

- **indexType** (*IndexType*) -

    The type of index to build on the field. Default: `AUTOINDEX`.

- **metricType** (*MetricType*) -

    The metric type used to measure vector similarity.

- **extraParams** (*Map&lt;String, Object&gt;*) -

    Additional index-specific parameters as key-value pairs, such as `nlist` or `M`.

**EXCEPTIONS:**

*MilvusClientException*

This exception is raised when an error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.common.IndexParam;

import java.util.HashMap;

IndexParam indexParam = IndexParam.builder()
    .fieldName("vector")
    .indexType(IndexParam.IndexType.HNSW)
    .metricType(IndexParam.MetricType.COSINE)
    .extraParams(new HashMap<String, Object>() {{
        put("M", 16);
        put("efConstruction", 256);
    }})
    .build();
```
