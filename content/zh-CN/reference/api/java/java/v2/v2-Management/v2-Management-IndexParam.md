---
title: "IndexParam | Java | v2"
slug: /java/java/v2-Management-IndexParam
sidebar_label: "IndexParam"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "IndexParam 实例保存用于配置 Collection 字段索引的参数。 | Java | v2"
type: docx
token: PpTcd5ptzoYJjZxRPdMcQvSjnDc
sidebar_position: 10
keywords: 
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - 什么是 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - IndexParam
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# IndexParam

IndexParam 实例保存用于在 Collection 字段上配置索引的参数。

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

    要在字段上构建的索引类型。可用索引类型请参见 IndexType。

- `metricType(MetricType metricType)` -

    用于衡量向量相似度的度量类型。可用度量类型请参见 MetricType。

- `extraParams(Map<String, Object> extraParams)` -

    以键值对形式提供的其他索引专用参数。例如，HNSW 索引可使用 `{"M": 16, "efConstruction": 256}`。

**返回类型：**

*IndexParam*

**返回：**

**IndexParam** 对象包含以下字段：

**参数：**

- **fieldName** (*String*) -

    要建立索引的字段名称。

- **indexName** (*String*) -

    索引的名称。

- **indexType** (*IndexType*) -

    要在字段上构建的索引类型。默认值：`AUTOINDEX`。

- **metricType** (*MetricType*) -

    用于衡量向量相似度的度量类型。

- **extraParams** (*Map&lt;String, Object&gt;*) -

    以键值对形式提供的其他索引专用参数，例如 `nlist` 或 `M`。

**异常：**

*MilvusClientException*

此操作发生错误时会引发此异常。

## 示例\{#example}

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
