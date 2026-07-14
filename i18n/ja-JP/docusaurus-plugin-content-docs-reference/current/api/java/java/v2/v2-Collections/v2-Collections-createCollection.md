---
title: "createCollection() | Java | v2"
slug: /java/java/v2-Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、デフォルト設定またはカスタマイズ設定で collection を作成します。 | Java | v2"
type: docx
token: GEvkd6lHion0nUxgdIRcxtqqnHb
sidebar_position: 7
keywords: 
  - milvus open source
  - milvus はどのように動作するか
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

この操作は、デフォルト設定またはカスタマイズ設定で collection を作成します。 

```java
public void createCollection(CreateCollectionReq request)
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象 collection の名前。

- `description(String description)` -

    collection の説明。デフォルトは `""` です。

- `dimension(Integer dimension)` -

    vector フィールドの次元数。

- `primaryFieldName(String primaryFieldName)` -

    主キー フィールドの名前。デフォルトは `"id"` です。

- `idType(DataType idType)` -

    主キー フィールドのデータ型。デフォルトは `DataType.Int64` です。

- `maxLength(Integer maxLength)` -

    varchar フィールドの最大長。デフォルトは `65535` です。

- `vectorFieldName(String vectorFieldName)` -

    vector フィールドの名前。デフォルトは `"vector"` です。

- `metricType(String metricType)` -

    vector 類似度の metric type。デフォルトは `IndexParam.MetricType.COSINE.name()` です。

- `autoID(Boolean autoID)` -

    主キー値を自動生成するかどうか。デフォルトは `Boolean.FALSE` です。

- `enableDynamicField(Boolean enableDynamicField)` -

    dynamic field を有効にするかどうか。デフォルトは `Boolean.TRUE` です。

- `numShards(Integer numShards)` -

    collection の shard 数。デフォルトは `1` です。

- `collectionSchema(CollectionSchema collectionSchema)` -

    collection の構造を定義する CollectionSchema オブジェクト。

- `indexParams(List<IndexParam> indexParams)` -

    index 設定を定義する IndexParam オブジェクトのリスト。デフォルトは `new ArrayList<>()` です。

- `numPartitions(Integer numPartitions)` -

    partition の数。

- `consistencyLevel(ConsistencyLevel consistencyLevel)` -

    この操作の整合性レベル。デフォルトは `ConsistencyLevel.BOUNDED` です。

- `properties(final Map<String, String> properties)` -

    collection プロパティのマップ。デフォルトは `new HashMap<>()` です。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

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
