---
title: "稀疏向量 | BYOC"
slug: /use-sparse-vector
sidebar_label: "稀疏向量"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "稀疏向量（Sparse Vector）是信息检索和自然语言处理中的一种重要数据表示方法。虽然稠密向量（Dense Vector）因其出色的语义理解能力而广受欢迎，但在需要精确匹配关键词或短语的应用中，稀疏向量往往能够提供更为准确的结果。 | BYOC"
type: origin
token: EoJuwLBJEiIeoUktXbRcDXlFnxi
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 稀疏向量

稀疏向量（Sparse Vector）是信息检索和自然语言处理中的一种重要数据表示方法。虽然[稠密向量](./use-dense-vector)（Dense Vector）因其出色的语义理解能力而广受欢迎，但在需要精确匹配关键词或短语的应用中，稀疏向量往往能够提供更为准确的结果。

## 概述\{#overview}

稀疏向量是一种高维向量的特殊表示方法，其大多数元素为零，只有少数维度上有非零值。如下图所示，稠密向量通常以连续数组的形式表示，每个位置都有一个值（如 `[0.3, 0.8, 0.2, 0.3, 0.1]`）。相比之下，稀疏向量仅存储非零元素及其索引位置，通常表示为键值对列表（如 `[{2: 0.2}, ..., {9997: 0.5}, {9999: 0.7}]`）。

![XSFJwXDGGhJGoob8UaMcvpCrnOb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/XSFJwXDGGhJGoob8UaMcvpCrnOb.png)

通过符号化和打分体系，文档由词袋向量表示，每个维度对应词表中的一个单词。文档中出现的单词在对应的向量中才有非 0 的取值。将所有非 0 的维度拼接起来就形成了该文档的稀疏向量表示。您可以使用如下两种方式生成稀疏向量：

- **传统统计方法**：例如词频-逆文档频率（[TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)）和最佳匹配 25（[BM25](https://en.wikipedia.org/wiki/Okapi_BM25)）等。这些方法基于词汇在语料库中的频率和重要性为词汇赋予权重，通过计算简单统计量作为每个维度的评分。每个维度代表一个词元。 Zilliz Cloud内置基于 BM25 算法的全文搜索功能，可自动将文本转换为稀疏向量，无需人工预处理。该方案特别适用于强调精确匹配和搜索精度的关键词检索场景。更多详情，请参阅[Full Text Search](./full-text-search)。

- **神经稀疏向量嵌入模型**：基于大量数据训练的可以生成使用稀疏向量表示的模型。通常都是 Transformer 架构的深度学习模型，能够根据语义上下文扩充和权衡待评估词句。Zilliz Cloud 也支持使用诸如 [SPLADE](https://arxiv.org/abs/2109.10086) 等外部的生成式稀疏向量模型。更多详情，请参阅 [Embeddings](https://milvus.io/docs/embeddings.md#Embedding-Overview)。

数据在向量化后，可以存储在 Zilliz Cloud 中进行管理和向量检索。下图展示了基本流程。

![AAIowWHINh4lYhbAmPlcJ5yQnUn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/AAIowWHINh4lYhbAmPlcJ5yQnUn.png)

<Admonition type="info" title="说明">

除了稀疏向量，Zilliz Cloud 还支持稠密向量和 Binary 向量。稠密向量适用于捕捉深层次的语义关联，而 Binary 向量则在快速相似性比较和内容去重等场景中表现出色。有关更多信息，请参考[稠密向量](./use-dense-vector)和 [Binary 向量](./use-binary-vector)。

</Admonition>

## 数据格式\{#data-formats}

Zilliz Cloud 支持用以下任意格式表示稀疏向量：

- 字典列表（格式为 `{dimension_index: value, ...}`）

    ```python
    # Represent each sparse vector using a dictionary
    sparse_vectors = [{27: 0.5, 100: 0.3, 5369: 0.6} , {100: 0.1, 3: 0.8}]
    ```

- 稀疏矩阵（使用 scipy.sparse 类）

    ```python
    from scipy.sparse import csr_matrix
    
    # First vector: indices [27, 100, 5369] with values [0.5, 0.3, 0.6]
    # Second vector: indices [3, 100] with values [0.8, 0.1]
    indices = [[27, 100, 5369], [3, 100]]
    values = [[0.5, 0.3, 0.6], [0.8, 0.1]]
    sparse_vectors = [csr_matrix((vals, ([0]*len(idx), idx)), shape=(1, 5369+1)) for idx, vals in zip(indices, values)]
    ```

- 元组迭代器列表（格式为 `[(dimension_index, value)]`）

    ```python
    # Represent each sparse vector using a list of iterables (e.g. tuples)
    sparse_vector = [
        [(27, 0.5), (100, 0.3), (5369, 0.6)],
        [(100, 0.1), (3, 0.8)]
        ]
    ```

## 定义 Collection Schema\{#define-collection-schema}

在创建 Collection 之前，需要定义 Collection Schema。这包括添加字段和定义将文本转换成对应稀疏向量表示的派生方法。

### 添加字段\{#add-fields}

要在 Zilliz Cloud 中使用稀疏向量，首先需要在创建 Collection 时定义用于存储稀疏向量的字段。这个过程包括：

1. 设置 `datatype` 为支持的稀疏向量数据类型，即 `SPARSE_FLOAT_VECTOR`。该字段的值可以由您提供或由指定 VARCHAR 字段自动转换而来。

1. 通常建议您将原始文本和向量字段都存入 Collection中。您可以使用 VARCHAR 字段来存放原始文本。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(
    auto_id=True,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="pk", datatype=DataType.VARCHAR, is_primary=True, max_length=100)
schema.add_field(field_name="sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535, enable_analyzer=True)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);
schema.addField(AddFieldReq.builder()
        .fieldName("pk")
        .dataType(DataType.VarChar)
        .isPrimaryKey(true)
        .autoID(true)
        .maxLength(100)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("sparse_vector")
        .dataType(DataType.SparseFloatVector)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(65535)
        .enableAnalyzer(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("pk").
    WithDataType(entity.FieldTypeVarChar).
    WithIsAutoID(true).
    WithIsPrimaryKey(true).
    WithMaxLength(100),
).WithField(entity.NewField().
    WithName("sparse_vector").
    WithDataType(entity.FieldTypeSparseVector),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithEnableAnalyzer(true).
    WithMaxLength(65535),
)
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

let client = ClientV2::new(
    &ConnectConfig::new()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN"),
)
.await?;

let schema = CollectionSchema::new()
    .add_field(
        FieldSchema::new()
            .name("pk")
            .data_type(DataType::VarChar)
            .primary_key(true)
            .auto_id(true)
            .max_length(100),
    )
    .add_field(
        FieldSchema::new()
            .name("sparse_vector")
            .data_type(DataType::SparseFloatVector),
    )
    .add_field(
        FieldSchema::new()
            .name("text")
            .data_type(DataType::VarChar)
            .enable_analyzer(true)
            .max_length(65535),
    );
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("pk", milvus::DataType::VARCHAR, "", true, true).WithMaxLength(100));
schema->AddField(milvus::FieldSchema("sparse_vector", milvus::DataType::SPARSE_FLOAT_VECTOR));
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(65535).EnableAnalyzer(true));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, MetricType, IndexType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

const schema = [
  {
    name: "pk",
    data_type: DataType.VarChar,
    is_primary_key: true,
    autoID: true,
    max_length: 100,
  },
  {
    name: "sparse_vector",
    data_type: DataType.SparseFloatVector,
  },
  {
    name: "text",
    data_type: DataType.VarChar,
    enable_analyzer: true,
    max_length: 65535,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export primaryField='{
    "fieldName": "pk",
    "dataType": "VarChar",
    "isPrimary": true,
    "elementTypeParams": {
        "max_length": 100
    }
}'

export vectorField='{
    "fieldName": "sparse_vector",
    "dataType": "SparseFloatVector"
}'

export textField='{
    "fieldName": "text",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 65535,
        "enable_analyzer": true
    }
}'

export schema="{
    \"autoID\": true,
    \"fields\": [
        $primaryField,
        $vectorField,
        $textField
    ]
}"
```

</TabItem>
</Tabs>

以上示例中，我们添加了三个名字段。它们分别为：

- `pk`: 该字段用于存放 VARCHAR 类型的主键，其值为最大长度不超过 100 字节的自动生成的文本。

- `sparse_vector`: 该字段用于存放 SPARSE_FLOAT_VECTOR 类型的向量字段，用于存储稀疏向量。

- `text`: 该字段用于存放 VARCHAR 类型的文本字符串，最大长度为 1000 字节。

<Admonition type="info" title="说明">

如果希望  or Zilliz Cloud 在插入数据时将指定的文本转换成稀疏向量。您还需要创建 Function。关于 Function 的更多内容，可以参考 [Full Text Search](./full-text-search)。

</Admonition>

## 为稀疏向量创建索引\{#set-index-params-for-vector-field}

为稀疏向量创建索引的过程和[稠密向量](./use-dense-vector)类似，但指定的索引类型（`index_type`），距离度量类型（`metric_type`），和索引参数（`params`）有所差别。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="sparse_vector",
    index_name="sparse_auto_index",
    index_type="AUTOINDEX",
    metric_type="IP"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse_vector")
        .indexName("sparse_auto_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
idx := index.NewSparseInvertedIndex(entity.IP, 0.2)
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse_vector", idx)
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let index_param = IndexParam::new()
    .field_name("sparse_vector")
    .index_name("sparse_inverted_index")
    .index_type(IndexType::SparseInvertedIndex)
    .metric_type(MetricType::Ip)
    .extra_params(HashMap::from([(
        "inverted_index_algo".to_string(),
        "DAAT_MAXSCORE".to_string(),
    )]));
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc sparse_index("sparse_vector", "sparse_auto_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::IP);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = {
    field_name: 'sparse_vector',
    metric_type: MetricType.IP,
    index_name: 'sparse_auto_index',
    index_type: IndexType.AUTOINDEX,
};
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "sparse_vector",
            "metricType": "IP",
            "indexName": "sparse_auto_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

上述示例使用索引类型为 `SPARSE_INVERTED_INDEX`，度量类型为 `BM25`。更多详细内容，可以参考如下内容：

- [相似度类型](./search-metrics-explained)：不同类型的字段支持的度量类型。

- [全文搜索](./full-text-search)：全文检索功能的详细教程。

## 创建 Collection\{#create-collection}

稀疏向量和索引定义完成后，我们便可以创建包含稀疏向量的 Collection。以下示例通过 `create_collection` 方法创建了一个名为 `my_sparse_collection` 的 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("my_collection")
            .schema(schema)
            .index_params(vec![index_param])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("my_collection")
                                        .AddIndex(std::move(sparse_index))
                                        .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
    collection_name: 'my_collection',
    schema: schema,
});

await client.createIndex({
    collection_name: 'my_collection',
    ...indexParams,
});

await client.loadCollection({
    collection_name: 'my_collection',
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## 插入稀疏向量\{#insert-data}

在插入数据时，您需要为所有在 Schema 中字义的字段提供相应的值，除了那些自动生成的字段（如因开启 AutoID 为自动生成的主键等）。如果您使用内置的 BM25 功能自动生成稀疏向量字段，在插入数据时，也不需要提供该字段的取值。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "text": "information retrieval is a field of study.",
        "sparse_vector": {1: 0.5, 100: 0.3, 500: 0.8}
    },
    {
        "text": "information retrieval focuses on finding relevant information in large datasets.",
        "sparse_vector": {10: 0.1, 200: 0.7, 1000: 0.9}
    }
]

client.insert(
    collection_name="my_collection",
    data=data
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

import java.util.ArrayList;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

Gson gson = new Gson();
List<JsonObject> rows = new ArrayList<>();

{
    JsonObject row = new JsonObject();
    row.addProperty("text", "information retrieval is a field of study.");
    
    SortedMap<Long, Float> sparse = new TreeMap<>();
    sparse.put(1L, 0.5f);
    sparse.put(100L, 0.3f);
    sparse.put(500L, 0.8f);
    row.add("sparse_vector", gson.toJsonTree(sparse));
    rows.add(row);
}
{
    JsonObject row = new JsonObject();
    row.addProperty("text", "information retrieval focuses on finding relevant information in large datasets.");
    
    SortedMap<Long, Float> sparse = new TreeMap<>();
    sparse.put(10L, 0.1f);
    sparse.put(200L, 0.7f);
    sparse.put(1000L, 0.9f);
    row.add("sparse_vector", gson.toJsonTree(sparse));
    rows.add(row);
}

InsertResp insertResp = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
texts := []string{
    "information retrieval is a field of study.",
    "information retrieval focuses on finding relevant information in large datasets.",
}
textColumn := column.NewColumnVarChar("text", texts)

// Prepare sparse vectors
sparseVectors := make([]entity.SparseEmbedding, 0, 2)
sparseVector1, _ := entity.NewSliceSparseEmbedding([]uint32{1, 100, 500}, []float32{0.5, 0.3, 0.8})
sparseVectors = append(sparseVectors, sparseVector1)
sparseVector2, _ := entity.NewSliceSparseEmbedding([]uint32{10, 200, 1000}, []float32{0.1, 0.7, 0.9})
sparseVectors = append(sparseVectors, sparseVector2)
sparseVectorColumn := column.NewColumnSparseVectors("sparse_vector", sparseVectors)

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithColumns(
        sparseVectorColumn,
        textColumn,
    ))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

client
    .insert(
        InsertRequest::builder()
            .collection_name("my_collection")
            .rows([
                serde_json::json!({"text": "information retrieval is a field of study.", "sparse_vector": {"1": 0.5, "100": 0.3, "500": 0.8}}),
                serde_json::json!({"text": "information retrieval focuses on finding relevant information in large datasets.", "sparse_vector": {"10": 0.1, "200": 0.7, "1000": 0.9}}),
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

milvus::EntityRows data = {{{"text", "information retrieval is a field of study."}, {"sparse_vector", {{"1", 0.5}, {"100", 0.3}, {"500", 0.8}}}},
                           {{"text", "information retrieval focuses on finding relevant information in large datasets."}, {"sparse_vector", {{"10", 0.1}, {"200", 0.7}, {"1000", 0.9}}}}};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("my_collection")
                                .WithRowsData(std::move(data)),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {
        text: 'information retrieval is a field of study.',
        sparse_vector: {1: 0.5, 100: 0.3, 500: 0.8},
    },
    {
        text: 'information retrieval focuses on finding relevant information in large datasets.',
        sparse_vector: {10: 0.1, 200: 0.7, 1000: 0.9},
    },
];

await client.insert({
    collection_name: "my_collection",
    data: data
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "data": [
        {
            "text": "information retrieval is a field of study.",
            "sparse_vector": {"1": 0.5, "100": 0.3, "500": 0.8}
        },
        {
            "text": "information retrieval focuses on finding relevant information in large datasets.",
            "sparse_vector": {"10": 0.1, "200": 0.7, "1000": 0.9}
        }     
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## 基于稀疏向量执行相似性搜索\{#perform-similarity-search}

要基于稀疏向量进行相似性搜索，您需要先准备查询向量和搜索参数。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Prepare search parameters
search_params = {
    "params": {"drop_ratio_search": 0.2},  # A tunable drop ratio parameter with a valid range between 0 and 1
}

# Query with sparse vector
query_data = [{1: 0.2, 50: 0.4, 1000: 0.7}]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.data.SparseFloatVec;

import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

// Prepare search parameters
Map<String,Object> searchParams = new HashMap<>();
searchParams.put("drop_ratio_search", 0.2);

// Query with the sparse vector
SortedMap<Long, Float> sparse = new TreeMap<>();
sparse.put(1L, 0.2f);
sparse.put(50L, 0.4f);
sparse.put(1000L, 0.7f);
SparseFloatVec queryData = new SparseFloatVec(sparse);
```

</TabItem>

<TabItem value='go'>

```go
// Prepare search parameters
annSearchParams := index.NewCustomAnnParam()
annSearchParams.WithExtraParam("drop_ratio_search", 0.2)

// Query with the sparse vector
queryData, _ := entity.NewSliceSparseEmbedding([]uint32{1, 50, 1000}, []float32{0.2, 0.4, 0.7})
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

// Prepare search parameters
let search_params = HashMap::from([("drop_ratio_search".to_string(), "0.2".to_string())]);

// Query with the sparse vector
let sparse: SparseVector = [(1, 0.2f32), (50, 0.4f32), (1000, 0.7f32)].into_iter().collect();
```

</TabItem>

<TabItem value='c++'>

```c++
// Prepare search parameters
const std::string drop_ratio_search = "0.2";  // A tunable drop ratio parameter with a valid range between 0 and 1

// Query with the sparse vector
nlohmann::json query_vector = {{"1", 0.2}, {"50", 0.4}, {"1000", 0.7}};
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Prepare search parameters
const searchParams = {drop_ratio_search: 0.2}

// Query with the sparse vector
const queryData = [{1: 0.2, 50: 0.4, 1000: 0.7}]
```

</TabItem>

<TabItem value='bash'>

```bash
# Prepare search parameters
export searchParams='{"drop_ratio_search": 0.2}'

# Query with the sparse vector
export queryData='[{"1": 0.2, "50": 0.4, "1000": 0.7}]'
```

</TabItem>
</Tabs>

然后就可以使用 `search` 方法进行相似性搜索了。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=query_data,
    limit=3,
    output_fields=["pk"],
    search_params=search_params,
    consistency_level="Strong"
)

print(res)

# Output
# data: ["[{'id': '453718927992172266', 'distance': 0.6299999952316284, 'entity': {'pk': '453718927992172266'}}, {'id': '453718927992172265', 'distance': 0.10000000149011612, 'entity': {'pk': '453718927992172265'}}]"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Collections;

SearchResp searchR = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryData))
        .annsField("sparse_vector")
        .searchParams(searchParams)
        .consistencyLevel(ConsistencyLevel.STRONG)
        .topK(3)
        .outputFields(Collections.singletonList("pk"))
        .build());

System.out.println(searchR.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={pk=457270974427187729}, score=0.63, id=457270974427187729), SearchResp.SearchResult(entity={pk=457270974427187728}, score=0.1, id=457270974427187728)]]
```

</TabItem>

<TabItem value='go'>

```go
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3, // limit
    []entity.Vector{queryData},
).WithANNSField("sparse_vector").
    WithOutputFields("pk").
    WithAnnParam(annSearchParams))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("Pks: ", resultSet.GetColumn("pk").FieldData().GetScalars())
}

// Results:
//   IDs:  string_data:{data:"457270974427187705"  data:"457270974427187704"}
//   Scores:  [0.63 0.1]
//   Pks:  string_data:{data:"457270974427187705"  data:"457270974427187704"}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

let results = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("sparse_vector")
            .vectors(SearchVectors::SparseFloat(vec![sparse]))
            .limit(3)
            .output_fields(["pk"])
            .extra_params(search_params)
            .build()?,
    )
    .await?;

println!("{:?}", results);
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("sparse_vector")
                   .WithLimit(3)
                   .AddExtraParam("drop_ratio_search", drop_ratio_search)
                   .AddOutputField("pk")
                   .AddSparseVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
auto search_results = response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: queryData,
    limit: 3,
    output_fields: ['pk'],
    params: searchParams,
    consistency_level: "Strong"
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"data\": $queryData,
    \"annsField\": \"sparse_vector\",
    \"limit\": 3,
    \"searchParams\": $searchParams,
    \"outputFields\": [\"pk\"],
    \"consistencyLevel\": \"Strong\"
}"
```

</TabItem>
</Tabs>

有关更多搜索相关信息，请参考[基本 ANN Search](./single-vector-search)。