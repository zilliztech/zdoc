---
title: "createCollection() | Java | v2"
slug: /java/java/v2-Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作使用默认或自定义设置创建集合。 | Java | v2"
type: docx
token: GEvkd6lHion0nUxgdIRcxtqqnHb
sidebar_position: 7
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - createCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createCollection()

此操作使用默认或自定义设置创建集合。 

```java
public void createCollection(CreateCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
createCollection(CreateCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .description(String description)
    .dimension(Integer dimension)
    .primaryFieldName(String primaryFieldName)
    .idType(DataType idType)
    .maxLength(Integer maxLength)
    .vectorFieldName(String vectorFieldName)
    .metricType(String metricType)
    .autoID(Boolean autoID)
    .enableDynamicField(Boolean enableDynamicField)
    .numShards(Integer numShards)
    .collectionSchema(CollectionSchema collectionSchema)
    .indexParams(List<IndexParam> indexParams)
    .numPartitions(Integer numPartitions)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .properties(final Map<String, String> properties)
    .build()
);
```

**BUILDER 方法：**

- `databaseName(String databaseName)` -

    数据库名称。如未指定，则默认为当前数据库。

- `collectionName(String collectionName)` -

    目标集合的名称。

- `description(String description)` -

    集合的描述。默认为 `""`。

- `dimension(Integer dimension)` -

    向量字段的维度。

- `primaryFieldName(String primaryFieldName)` -

    主键字段的名称。默认为 `"id"`。

- `idType(DataType idType)` -

    主键字段的数据类型。默认为 `DataType.Int64`。

- `maxLength(Integer maxLength)` -

    varchar 字段的最大长度。默认为 `65535`。

- `vectorFieldName(String vectorFieldName)` -

    向量字段的名称。默认为 `"vector"`。

- `metricType(String metricType)` -

    向量相似度的度量类型。默认为 `IndexParam.MetricType.COSINE.name()`。

- `autoID(Boolean autoID)` -

    是否自动生成主键值。默认为 `Boolean.FALSE`。

- `enableDynamicField(Boolean enableDynamicField)` -

    是否启用动态字段。默认为 `Boolean.TRUE`。

- `numShards(Integer numShards)` -

    集合的分片数量。默认为 `1`。

- `collectionSchema(CollectionSchema collectionSchema)` -

    定义集合结构的 CollectionSchema 对象。

- `indexParams(List<IndexParam> indexParams)` -

    定义索引配置的 IndexParam 对象列表。默认为 `new ArrayList<>()`。

- `numPartitions(Integer numPartitions)` -

    集合的分区数量。

- `consistencyLevel(ConsistencyLevel consistencyLevel)` -

    操作的一致性级别。默认为 `ConsistencyLevel.BOUNDED`。

- `properties(final Map<String, String> properties)` -

    集合属性映射。默认为 `new HashMap<>()`。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a collection with schema, when indexParams is specified, it will create index as well
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(dim).build());

IndexParam indexParam = IndexParam.builder()
        .fieldName("vector")
        .metricType(IndexParam.MetricType.COSINE)
        .build();
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName(collectionName)
        .collectionSchema(collectionSchema)
        .indexParams(Collections.singletonList(indexParam))
        .build();
client.createCollection(createCollectionReq);
```
