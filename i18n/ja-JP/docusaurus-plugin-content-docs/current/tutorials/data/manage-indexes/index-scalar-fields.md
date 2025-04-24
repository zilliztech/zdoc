---
title: "インデックススカラーフィールド | Cloud"
slug: /index-scalar-fields
sidebar_label: "インデックススカラーフィールド"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、従来のデータベースインデックスと同様に、特定の非ベクトルフィールド値によるメタフィルタリングを高速化するためにスカラーインデックスが使用されます。このガイドでは、整数、文字列などのフィールドのスカラーインデックスの作成と設定について説明します。 | Cloud"
type: origin
token: XsuHwokFtiqk1pkAgGeczurLnyh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - scalar field
  - index
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# インデックススカラーフィールド

Zilliz Cloudでは、従来のデータベースインデックスと同様に、特定の非ベクトルフィールド値によるメタフィルタリングを高速化するためにスカラーインデックスが使用されます。このガイドでは、整数、文字列などのフィールドのスカラーインデックスの作成と設定について説明します。

## 自動インデックス作成{#auto-indexing}

自動インデックスを使用するには、Milvusがスカラーフィールドタイプに基づいてインデックスタイプを推測できるように、**index_type**パラメータを省略してください。スカラーデータ型とデフォルトのインデックスアルゴリズムのマッピングについては、[スカラーフィールドインデックスアルゴリズム](https://milvus.io/docs/scalar_index.md#Scalar-field-indexing-algorithms)を参照してください。

例えば:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# Auto indexing
CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

index_params = client.prepare_index_params() # Prepare an empty IndexParams object, without having to specify any index parameters

index_params.add_index(
    field_name="scalar_1", # Name of the scalar field to be indexed
    # highlight-next-line
    index_type="", # Type of index to be created. For auto indexing, leave it empty or omit this parameter.
    index_name="default_index" # Name of the index to be created
)

client.create_index(
  collection_name="test_scalar_index", # Specify the collection name
  index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

IndexParam indexParamForScalarField = IndexParam.builder()
    .fieldName("scalar_1") // Name of the scalar field to be indexed
    .indexName("default_index") // Name of the index to be created
    // highlight-next-line
    .indexType("") // Type of index to be created. For auto indexing, leave it empty or omit this parameter.
    .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForVectorField);

CreateIndexReq createIndexReq = CreateIndexReq.builder()
    .collectionName("test_scalar_index") // Specify the collection name
    .indexParams(indexParams)
    .build();

client.createIndex(createIndexReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
    collection_name: "test_scalar_index", // Specify the collection name
    field_name: "scalar_1", // Name of the scalar field to be indexed
    index_name: "default_index", // Name of the index to be created
    // highlight-next-line
    index_type: "" // Type of index to be created. For auto indexing, leave it empty or omit this parameter.
})
```

</TabItem>
</Tabs>

