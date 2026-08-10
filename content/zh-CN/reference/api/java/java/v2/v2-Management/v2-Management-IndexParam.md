---
title: "IndexParam | Java | v2"
slug: /java/java/v2-Management-IndexParam
sidebar_label: "IndexParam"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "IndexParam 定义了在 Collection 字段上配置索引的参数。 | Java | v2"
type: docx
token: SXgodgq99ozZoHxfnakc0fpCnJh
sidebar_position: 10
keywords: 
  - milvus 数据库
  - milvus 向量数据库
  - Zilliz Cloud
  - 什么是 milvus
  - zilliz
  - zilliz cloud
  - 云
  - IndexParam
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# IndexParam

IndexParam 定义了在 Collection 字段上配置索引的参数。

```java
IndexParam.builder()
    .fieldName(String fieldName)
    .indexType(IndexType indexType)
    .metricType(MetricType metricType)
    .extraParams(Map<String, Object> extraParams)
    .build()
```

**构建器方法：**

- `fieldName(String fieldName)` -

    要建立索引的字段名称。

- `indexType(IndexType indexType)` -

    要在该字段上构建的索引类型。可用的索引类型请参见 IndexType。

- `metricType(MetricType metricType)` -

    用于向量相似性度量的指标类型。可用的指标类型请参见 MetricType。

- `extraParams(Map<String, Object> extraParams)` -

    其他索引特定参数，以键值对形式提供。例如，对于 HNSW 索引，可使用 `{"M": 16, "efConstruction": 256}`。

**返回：**

*IndexParam*

**异常：**

*MilvusClientException*

当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.common.IndexParam;

IndexParam indexParam = IndexParam.builder()
    .fieldName("vector")
    .indexType(IndexParam.IndexType.HNSW)
    .metricType(IndexParam.MetricType.COSINE)
    .extraParams(Map.of("M", 16, "efConstruction", 256))
    .build();
```
