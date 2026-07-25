---
title: "BM25 Function | Cloud"
slug: /bm25-function
sidebar_key: bm25-function
sidebar_label: "BM25 Function"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "BM25 Function 通过将原始文本转换为稀疏向量，并基于词法相关性对文档进行评分，从而实现全文检索。它采用基于词项的匹配机制和考虑词频的加权方式，高效检索与查询词高度匹配的文本内容。 | Cloud"
type: origin
token: K6J1wapTRipxweklQpNcdFCgnEr
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - function
  - 模型
  - 推理
  - bm25

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# BM25 Function

BM25 Function 通过将原始文本转换为稀疏向量，并基于词法相关性对文档进行评分，从而实现全文检索。它采用基于词项的匹配机制和考虑词频的加权方式，高效检索与查询词高度匹配的文本内容。

作为一种本地 Text Function，BM25 Function 直接运行在 Zilliz Cloud 内部，不依赖模型推理或外部集成。它为文本搜索场景提供了一种确定性强、机制透明的检索方式。

## BM25 的工作原理\{#how-bm25-works}

BM25 是一种广泛应用于全文检索的基于词项的相关性评分算法。在 Zilliz Cloud 中，BM25 以稀疏检索流水线的形式实现：系统将文本转换为词项加权表示，并通过分布式稀疏索引检索 Top-K 文档。

整体流程由两条对称的路径组成：文档写入和查询文本处理，二者共享相同的文本分析逻辑。

### 文档写入：从文本到稀疏表示\{#document-ingestion-from-text-to-sparse-representation}

当文档被插入时，其原始文本首先会经过 **Analyzer** 处理，将文本切分为独立的词项。

例如，文档：

```plaintext
"We are loving Milvus!"
```

可能会被分析为以下词项：

```plaintext
["we", "love", "milvus"]
```

随后，每个文档都会被表示为一个**词频（TF，Term Frequency）向量**，用于记录各词项在文档中的出现次数。例如：

```plaintext
{
  "we": 1,
  "love": 1,
  "milvus": 1
}
```

与此同时，Zilliz Cloud 会持续维护语料级统计信息，包括：

- 每个词项的文档频率（DF，Document Frequency）

- 文档的平均长度

- 将词项映射到包含该词项文档的倒排列表（Posting Lists）

文档的 TF 表示会被写入稀疏向量索引中，词项对应的 posting 会在不同节点之间分布，以支持可扩展的检索。

### 查询文本处理：应用 IDF 权重\{#query-text-process-apply-idf-weighting}

当发起基于文本的查询时，查询文本会使用与文档写入阶段相同的 Analyzer 进行处理，以确保词项切分的一致性。

例如，查询：

```plaintext
"who loves Milvus?"
```

可能会被分析为：

```plaintext
["who", "love", "milvus"]
```

对于每一个查询词项，Zilliz Cloud 会从语料统计信息中查找其逆文档频率（IDF，Inverse Document Frequency）。IDF 用于衡量词项在整个数据集中的区分能力：越罕见的词项权重越高，越常见的词项权重越低。

从概念上看，这一步会生成一组带有 IDF 权重的查询词项，例如：

```plaintext
{
  "who": 0.1,
  "love": 0.5,
  "milvus": 1.2
}
```

### BM25 评分与 Top-K 检索\{#bm25-scoring-and-top-k-retrieval}

BM25 通过计算与查询词项匹配的相关性分数，对文档进行排序。评分在**词项层级**进行计算，并在**文档层级**进行聚合。

**词项级评分（Term-level scoring）**

对于每一个同时出现在查询和文档中的词项，BM25 会计算一个词项级分数：

```plaintext
term_score =
  IDF(term) ×
  TF_boost(term, document, k1) ×
  length_normalization(document, b)
```

其中：

- **IDF(term)**：反映该词项在集合中的稀有程度

- **TF_boost(…, k1)**：随着词频增加而提升，但在高频时逐渐饱和

- **length_normalization(…, b)**：根据文档长度对分数进行归一化调整

**文档级评分与 Top-K 返回**

单个文档的最终得分，是其所有匹配查询词项的词项级分数之和：

```plaintext
document_score =
  sum of term_score over all matched query terms
```

系统会按照最终得分对文档进行排序，并返回得分最高的 **Top-K 文档** 作为检索结果。

## 开始前\{#before-you-start}

在使用 BM25 Function 之前，请先规划 Collection 的 Schema，确保其能够支持词法全文检索：

- **用于存储原始文本的文本字段**

    Collection 中必须包含一个 **VARCHAR** 字段，用于存储原始文本内容。该字段是全文检索中被处理和分析的文本来源。

- **为文本字段启用 Analyzer**

    文本字段必须启用 **Analyzer**。Analyzer 定义了在 BM25 计算词法相关性之前，文本是如何被**分词和归一化**的。

    默认情况下，Zilliz Cloud 提供内置的 Analyzer，会基于空白符和标点符号对文本进行分词。如果你的应用需要自定义分词或归一化行为，可以配置自定义 Analyzer。详情参见 [最佳实践：如何选择合适的 Analyzer](./choose-the-right-analyzer-for-your-use-case)。

- **用于存储 BM25 输出的稀疏向量字段**

    Collection 中必须包含一个 **SPARSE_FLOAT_VECTOR** 字段，用于存储 BM25 Function 生成的稀疏向量表示。该字段将在全文检索过程中用于索引和检索。

完成以上 schema 层面的准备后，即可开始创建 Collection 并使用 BM25 Function。

## 步骤 1：创建包含 BM25 Function 的 Collection\{#step-1-create-a-collection-with-a-bm25-function}

要使用 BM25 Function，必须在创建集合时进行定义。该 Function 会成为 Collection Schema 的一部分，并在数据写入和搜索阶段自动生效。

### 通过 SDK 创建\{#via-sdk}

#### 定义 Schema 字段\{#define-schema-fields}

你的集合 schema 至少需要包含以下三个必需字段：

- **Primary field**：用于唯一标识集合中的每一条数据。

- **文本字段（VARCHAR）**：用于存储原始文本内容。必须设置 `enable_analyzer=True`，以便 Zilliz Cloud 对文本进行处理并计算 BM25 相关性评分。默认情况下，系统使用标准 Analyzer。如需配置其他 Analyzer，请参考 [Analyzer 概述](./analyzer-overview)。

- **稀疏向量字段（SPARSE_FLOAT_VECTOR）**：用于存储由 BM25 Function 自动生成的稀疏向量表示。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = client.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True) # Primary field
# highlight-start
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True) # Text field
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR) # Sparse vector field; no dim required for sparse vectors
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("sparse")
        .dataType(DataType.SparseFloatVector)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: token
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithEnableAnalyzer(true).
    WithMaxLength(1000),
).WithField(entity.NewField().
    WithName("sparse").
    WithDataType(entity.FieldTypeSparseVector),
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});
const schema = [
  {
    name: "id",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "text",
    data_type: "VarChar",
    enable_analyzer: true,
    enable_match: true,
    max_length: 1000,
  },
  {
    name: "sparse",
    data_type: DataType.SparseFloatVector,
  },
];

console.log(res.results)
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "text",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": 1000,
                    "enable_analyzer": true
                }
            },
            {
                "fieldName": "sparse",
                "dataType": "SparseFloatVector"
            }
        ]
    }'
```

</TabItem>
</Tabs>

#### 定义 BM25 Function\{#define-bm25-function}

BM25 Function 用于将分词后的文本转换为稀疏向量，以支持基于 BM25 的相关性评分。

请先定义 BM25 Function，然后将其添加到 Collection 的 Schema 中：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
bm25_function = Function(
    name="text_bm25_emb", # Function name
    input_field_names=["text"], # Name of the VARCHAR field containing raw text data
    output_field_names=["sparse"], # Name of the SPARSE_FLOAT_VECTOR field reserved to store generated embeddings
    # highlight-next-line
    function_type=FunctionType.BM25, # Set to \`BM25\`
)

schema.add_function(bm25_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

import java.util.*;

schema.addFunction(Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_bm25_emb")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("sparse"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
function := entity.NewFunction().
    WithName("text_bm25_emb").
    WithInputFields("text").
    WithOutputFields("sparse").
    WithType(entity.FunctionTypeBM25)
schema.WithFunction(function)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const functions = [
    {
      name: 'text_bm25_emb',
      description: 'bm25 function',
      type: FunctionType.BM25,
      input_field_names: ['text'],
      output_field_names: ['sparse'],
      params: {},
    },
]；
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "text",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": 1000,
                    "enable_analyzer": true
                }
            },
            {
                "fieldName": "sparse",
                "dataType": "SparseFloatVector"
            }
        ],
        "functions": [
            {
                "name": "text_bm25_emb",
                "type": "BM25",
                "inputFieldNames": ["text"],
                "outputFieldNames": ["sparse"],
                "params": {}
            }
        ]
    }'
```

</TabItem>
</Tabs>

#### 配置索引\{#configure-the-index}

在定义好包含必要字段和内置 Function 的 schema 之后，需要为 Collection 配置向量索引。

为简化这一过程，你可以将 index_type 设置为 **AUTOINDEX**。该选项会由 Zilliz Cloud 根据数据结构自动选择并配置最合适的索引类型。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="sparse",

    index_type="AUTOINDEX", 
    metric_type="BM25"

)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

Map<String,Object> params = new HashMap<>();
params.put("inverted_index_algo", "DAAT_MAXSCORE");
params.put("bm25_k1", 1.2);
params.put("bm25_b", 0.75);

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.BM25)
        .extraParams(params)
        .build());    
```

</TabItem>

<TabItem value='go'>

```go
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse",
    index.NewAutoIndex(entity.MetricType(entity.BM25)))
    .WithExtraParam("inverted_index_algo", "DAAT_MAXSCORE")
    .WithExtraParam("bm25_k1", 1.2)
    .WithExtraParam("bm25_b", 0.75)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [
  {
    field_name: "sparse",
    metric_type: "BM25",
    index_type: "SPARSE_INVERTED_INDEX",
    params: {
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75
    }
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "sparse",
            "metricType": "BM25",
            "indexType": "AUTOINDEX",
            "params":{
               "inverted_index_algo": "DAAT_MAXSCORE",
               "bm25_k1": 1.2,
               "bm25_b": 0.75
            }
        }
    ]'
```

</TabItem>
</Tabs>

#### 创建 Collection\{#create-the-collection}

现在，使用前面定义好的 schema 和索引参数来创建 Collection：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name='my_collection', 
    schema=schema, 
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

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
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection(
    collection_name: 'my_collection', 
    schema: schema, 
    index_params: index_params,
    functions: functions
);
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
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

### 通过控制台创建\{#via-web-console}

或者，你也可以在 Zilliz Cloud 控制台中创建包含 BM25 Function 的 Collection。

在创建好包含 BM25 Function 的 Collection 后，你就可以插入文本数据，并基于文本查询执行词法搜索。

## 步骤 2：向 Collection 中插入文本数据\{#step-2-insert-text-data-into-the-collection}

完成 Collection 和索引的配置后，即可开始写入文本数据。在这一过程中，你只需提供原始文本内容。此前定义的 BM25 Function 会在写入阶段自动为每条文本生成对应的稀疏向量表示。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert('my_collection', [
    {'text': 'information retrieval is a field of study.'},
    {'text': 'information retrieval focuses on finding relevant information in large datasets.'},
    {'text': 'data mining and information retrieval overlap in research.'},
])
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;

Gson gson = new Gson();
List<JsonObject> rows = Arrays.asList(
        gson.fromJson("{\"text\": \"information retrieval is a field of study.\"}", JsonObject.class),
        gson.fromJson("{\"text\": \"information retrieval focuses on finding relevant information in large datasets.\"}", JsonObject.class),
        gson.fromJson("{\"text\": \"data mining and information retrieval overlap in research.\"}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.insert({
collection_name: 'my_collection', 
data: [
    {'text': 'information retrieval is a field of study.'},
    {'text': 'information retrieval focuses on finding relevant information in large datasets.'},
    {'text': 'data mining and information retrieval overlap in research.'},
]);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"text": "information retrieval is a field of study."},
        {"text": "information retrieval focuses on finding relevant information in large datasets."},
        {"text": "data mining and information retrieval overlap in research."}       
    ],
    "collectionName": "my_collection"
}'

```

</TabItem>
</Tabs>

## 步骤 3：使用文本查询进行搜索\{#step-3-search-with-text-query}

在向 Collection 中插入数据后，你就可以使用原始文本查询来执行全文检索。

Zilliz Cloud 会自动将查询文本转换为稀疏向量，并使用 BM25 算法对匹配结果进行排序，最终返回得分最高的 Top-K（`limit`） 条结果。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    'params': {'level': 10},
}

res = client.search(
    collection_name='my_collection', 
    # highlight-start
    data=['whats the focus of information retrieval?'],
    anns_field='sparse',
    output_fields=['text'], # Fields to return in search results; sparse field cannot be output
    # highlight-end
    limit=3,
    search_params=search_params
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

Map<String,Object> searchParams = new HashMap<>();
searchParams.put("level", 10);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new EmbeddedText("whats the focus of information retrieval?")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Collections.singletonList("text"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
annSearchParams := index.NewCustomAnnParam()
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    3,               // limit
    []entity.Vector{entity.Text("whats the focus of information retrieval?")},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("sparse").
    WithAnnParam(annSearchParams).
    WithOutputFields("text"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("text: ", resultSet.GetColumn("text").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search(
    collection_name: 'my_collection', 
    data: ['whats the focus of information retrieval?'],
    anns_field: 'sparse',
    output_fields: ['text'],
    limit: 3,
    params: {'level': 10},
)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "my_collection",
    "data": [
        "whats the focus of information retrieval?"
    ],
    "annsField": "sparse",
    "limit": 3,
    "outputFields": [
        "text"
    ],
    "searchParams":{
        "params":{}
    }
}'
```

</TabItem>
</Tabs>

