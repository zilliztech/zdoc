---
title: "createCollection() | Java | v2"
slug: /java/java/v2-Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、デフォルト設定またはカスタマイズ設定でコレクションを作成します。 | Java | v2"
type: docx
token: LhrNdndqnoYPaZxCAMscINykno8
sidebar_position: 7
keywords: 
  - milvus オープンソース
  - milvus はどのように動作するか
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - createCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createCollection()

この操作は、デフォルト設定またはカスタマイズ設定でコレクションを作成します。 

```java
public void createCollection(CreateCollectionReq request)
```

## リクエスト構文\{#request-syntax}

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

**ビルダーメソッド：**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象コレクションの名前です。

- `description(String description)` -

    コレクションの説明です。デフォルトは `""` です。

- `dimension(Integer dimension)` -

    ベクトルフィールドの次元数です。

- `primaryFieldName(String primaryFieldName)` -

    主キーフィールドの名前です。デフォルトは `"id"` です。

- `idType(DataType idType)` -

    主キーフィールドのデータ型です。デフォルトは `DataType.Int64` です。

- `maxLength(Integer maxLength)` -

    varchar フィールドの最大長です。デフォルトは `65535` です。

- `vectorFieldName(String vectorFieldName)` -

    ベクトルフィールドの名前です。デフォルトは `"vector"` です。

- `metricType(String metricType)` -

    ベクトル類似度のメトリックタイプです。デフォルトは `IndexParam.MetricType.COSINE.name()` です。

- `autoID(Boolean autoID)` -

    主キー値を自動生成するかどうかです。デフォルトは `Boolean.FALSE` です。

- `enableDynamicField(Boolean enableDynamicField)` -

    動的フィールドを有効にするかどうかです。デフォルトは `Boolean.TRUE` です。

- `numShards(Integer numShards)` -

    コレクションのシャード数です。デフォルトは `1` です。

- `collectionSchema(CollectionSchema collectionSchema)` -

    コレクションの構造を定義する CollectionSchema オブジェクトです。

- `indexParams(List<IndexParam> indexParams)` -

    インデックス設定を定義する IndexParam オブジェクトのリストです。デフォルトは `new ArrayList<>()` です。

- `indexParam(IndexParam indexParam)` -

    コレクションとともにインデックスを作成するために、インデックスパラメーターを1つ追加します。

- `numPartitions(Integer numPartitions)` -

    コレクションのパーティション数です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)` -

    この操作の整合性レベルです。デフォルトは `ConsistencyLevel.BOUNDED` です。

- `properties(final Map<String, String> properties)` -

    コレクションプロパティのマップです。デフォルトは `new HashMap<>()` です。

- `property(String key, String value)` -

    コレクションにプロパティを1つ追加します。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.Collections;
import java.util.Set;

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
