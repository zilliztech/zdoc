---
title: "Text 类型 | Cloud"
slug: /use-text-field
sidebar_label: "Text 类型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 AI 搜索应用中，向量搜索可帮助您找到语义相似的 Entity，但应用通常还需要获取每个匹配项背后的原始文本。LLM 或 Agent 可将这些文本用作上下文，以便读取、引用、总结结果，或将结果加入 Prompt。 | Cloud"
type: origin
token: QD5jwHBpaiZECQkWZs3ciYemnHb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Text 类型

在 AI 搜索应用中，向量搜索可帮助您找到语义相似的 Entity，但应用通常还需要获取每个匹配项背后的原始文本。LLM 或 Agent 可将这些文本用作上下文，以便读取、引用、总结结果，或将结果加入 Prompt。

Zilliz Cloud 提供 `TEXT` 标量字段类型，用于随 Entity 直接存储较长的源文本。典型值包括段落、长文档、文章正文、工单和日志。与需要固定 `max_length` 的 `VARCHAR` 不同，`TEXT` 无需在 Collection Schema 中设置最大字节长度。

要在 Collection Schema 中定义 `TEXT` 字段，请将 `datatype` 设置为 `DataType.TEXT`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="content",
    # highlight-next-line
    datatype=DataType.TEXT,
)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("content")
        .dataType(DataType.Text)
        .enableAnalyzer(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Note: DataType.Text is not supported in milvus-sdk-go as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: DataType.Text is not supported in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::FieldSchema content_field("content", milvus::DataType::TEXT);
content_field.EnableAnalyzer(true);
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "content",
    data_type: DataType.Text,
    enable_analyzer: true
});
```

</TabItem>

<TabItem value='bash'>

```bash
export contentField='{
    "fieldName": "content",
    "dataType": "Text",
    "elementTypeParams": {
        "enable_analyzer": true
    }
}'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

定义字段后，每个 Entity 都可以在该字段中包含字符串值。您可以像插入其他标量字段一样插入该值，并通过在 `output_fields` 中列出该字段，从 Query 或 Search 结果中返回它。

<Admonition type="info" title="说明">

TEXT 字段支持空值。要启用此功能，请将 nullable 设置为 True。详情请参阅[Nullable 属性](./nullable-fields)。

</Admonition>

## 限制\{#limits}

- 一个 `TEXT` 字段不能用作主字段。主字段支持 `INT64` 和 `VARCHAR`。

- `TEXT` 字段不支持 `PHRASE_MATCH`。

- `TEXT` 字段不支持默认值。

- `TEXT` 字段不支持标量索引。

- `TEXT` 不适用于常规元数据过滤。如果您需要过滤短字符串元数据，且字段值未超过 `VARCHAR` 长度限制，请使用 `VARCHAR`。

- `TEXT` 字段不支持外部 Collection。

## 选择 TEXT 还是 VARCHAR\{#choose-text-or-varchar}

`TEXT` 和 `VARCHAR` 都用于存储字符串值，但适用于不同的应用需求。对于用于标识、分类或过滤 Entity 的短小且长度有界的元数据，请使用 `VARCHAR`。对于可为 LLM 或 Agent 提供足够上下文以读取、引用、总结或构建 Prompt 的较长源内容，请使用 `TEXT`。

| **对比项** | **`VARCHAR`** | **`TEXT`** |
| --- | --- | --- |
| 适用场景 | 用于标识、分类或过滤 Entity 的短元数据，例如 `title`、`tag`、`category`、`external_id`。 | LLM 或 Agent 工作流使用的较长源内容，例如 `content`、`passage`、`article_body`、`log_message`。 |
| 长度设置 | 必须设置 `max_length`，用于定义字段可存储的最大字节数。最大值为 65,535 字节。如果值可能超过此限制，请使用 `TEXT`。 | 无需设置 `max_length`，因此 Schema 无需为文本值设置固定的字节上限。 |
| 存储行为 | 每个值都存储在字段配置的 `max_length` 范围内。 | 对较大的文本值自动选择存储方式。。 |
| 主字段支持 | 可用作主字段。 | 不能用作主字段。 |
| 过滤 | 适用于需要出现在过滤表达式中的短字符串元数据，例如 `category == "news"` 或 `tag in ["ai", "database"]`。 | 不适用于常规元数据过滤。 |

有关 `VARCHAR` 字段的详细信息，请参阅 [VARCHAR 类型](./use-string-field)。

`TEXT` 的常见用途之一是基于 BM25 的全文搜索。在此模式下，`TEXT` 字段存储原始源内容，BM25 分析文本并生成稀疏向量，用于对基于关键词的匹配结果进行排序。随后，Search 结果可返回匹配的 `TEXT` 值，作为 LLM 或 Agent 工作流的上下文。以下示例展示如何将 `TEXT` 字段用作 BM25 的输入字段。如需了解全文搜索的概念和 Query 选项，请参阅[全文搜索](./full-text-search)。

## 步骤 1：创建包含 TEXT 字段的 Collection\{#step 1-create-a-collection-with-a-text-field}

以下示例创建一个 Collection，其中包含用于存储源内容的 `TEXT` 字段，以及用于存储 BM25 生成的稀疏向量的稀疏向量字段。BM25 Function 将 `content` 中经过分词的文本转换为稀疏向量，并存储在 `sparse` 中。

对于 BM25 全文搜索，输入 `TEXT` 字段必须设置 `enable_analyzer=True`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
COLLECTION_NAME = "text_bm25_collection"

if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
# highlight-start
schema.add_field(
    field_name="content",
    datatype=DataType.TEXT,
    enable_analyzer=True,
)
# highlight-end
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR)

# highlight-start
bm25_function = Function(
    name="content_bm25",
    input_field_names=["content"],
    output_field_names=["sparse"],
    function_type=FunctionType.BM25,
)
schema.add_function(bm25_function)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import java.util.*;
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

String COLLECTION_NAME = "text_bm25_collection";
client.dropCollection(DropCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .async(false)
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("content")
        .dataType(DataType.Text)
        .enableAnalyzer(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("sparse")
        .dataType(DataType.SparseFloatVector)
        .build());

schema.addFunction(CreateCollectionReq.Function.builder()
        .name("content_bm25")
        .functionType(FunctionType.BM25)
        .inputFieldNames(Collections.singletonList("content"))
        .outputFieldNames(Collections.singletonList("sparse"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Note: DataType.Text is not supported in milvus-sdk-go as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: DataType.Text is not supported in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const std::string COLLECTION_NAME = "text_bm25_collection";
milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->SetEnableDynamicField(false);
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true));
schema->AddField(milvus::FieldSchema("content", milvus::DataType::TEXT).EnableAnalyzer(true));
schema->AddField(milvus::FieldSchema("sparse", milvus::DataType::SPARSE_FLOAT_VECTOR));

auto function = std::make_shared<milvus::Function>("content_bm25", milvus::FunctionType::BM25);
function->AddInputFieldName("content");
function->AddOutputFieldName("sparse");
schema->AddFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, FunctionType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });
const COLLECTION_NAME = "text_bm25_collection";

if (await client.hasCollection({ collection_name: COLLECTION_NAME })) {
    await client.dropCollection({ collection_name: COLLECTION_NAME });
}

const schema = [
    { name: "id", data_type: DataType.Int64, is_primary_key: true },
    { name: "content", data_type: DataType.Text, enable_analyzer: true },
    { name: "sparse", data_type: DataType.SparseFloatVector }
];

const functions = [{
    name: "content_bm25",
    type: FunctionType.BM25,
    input_field_names: ["content"],
    output_field_names: ["sparse"],
    params: {}
}];
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"
export COLLECTION_NAME="text_bm25_collection"

# Drop an old copy if this example is run repeatedly.
curl --request POST \
--url "${BASE_URL}/v2/vectordb/collections/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{\"collectionName\": \"${COLLECTION_NAME}\"}"

export schema='{
    "fields": [
        {"fieldName": "id", "dataType": "Int64", "isPrimary": true},
        {"fieldName": "content", "dataType": "Text", "elementTypeParams": {"enable_analyzer": true}},
        {"fieldName": "sparse", "dataType": "SparseFloatVector"}
    ],
    "functions": [
        {
            "name": "content_bm25",
            "type": "BM25",
            "inputFieldNames": ["content"],
            "outputFieldNames": ["sparse"]
        }
    ]
}'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

## 步骤 2：创建稀疏向量索引\{#step-2-create-a-sparse-vector-index}

为 BM25 Function 生成的稀疏向量字段创建索引。Metric Type 必须设置为 `BM25`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
# highlight-start
index_params.add_index(
    field_name="sparse",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75,
    },
)
# highlight-end

client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema,
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexParams = new ArrayList<>();
Map<String, Object> bm25Params = new HashMap<>();
bm25Params.put("inverted_index_algo", "DAAT_MAXSCORE");
bm25Params.put("bm25_k1", 1.2);
bm25Params.put("bm25_b", 0.75);
indexParams.add(IndexParam.builder()
        .fieldName("sparse")
        .indexName("sparse_bm25_index")
        .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
        .metricType(IndexParam.MetricType.BM25)
        .extraParams(bm25Params)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("text_bm25_collection")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
// Note: DataType.Text is not supported in milvus-sdk-go as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: DataType.Text is not supported in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("sparse", "sparse_bm25_index", milvus::IndexType::SPARSE_INVERTED_INDEX, milvus::MetricType::BM25)
};

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("text_bm25_collection")
                                      .WithIndexes(std::move(indexes))
                                      .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    field_name: "sparse",
    index_name: "sparse_bm25_index",
    index_type: "SPARSE_INVERTED_INDEX",
    metric_type: "BM25",
    params: {
        inverted_index_algo: "DAAT_MAXSCORE",
        bm25_k1: 1.2,
        bm25_b: 0.75
    }
}];

const res = await client.createCollection({
    collection_name: "text_bm25_collection",
    schema: schema,
    functions: functions,
    index_params: indexParams
});

console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
    {
        "fieldName": "sparse",
        "indexName": "sparse_bm25_index",
        "indexType": "SPARSE_INVERTED_INDEX",
        "metricType": "BM25",
        "params": {
            "inverted_index_algo": "DAAT_MAXSCORE",
            "bm25_k1": 1.2,
            "bm25_b": 0.75
        }
    }
]'

curl --request POST \
--url "${BASE_URL}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 30" \
-d "{
    \"collectionName\": \"text_bm25_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

## 步骤 3：插入 TEXT 数据\{#step-3-insert-text-data}

直接向 `TEXT` 字段插入文本。不要为 `sparse` 字段提供值。Milvus 会在内部对 `content` 应用 BM25 Function 以生成稀疏向量。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
data = [
    {
        "id": 1,
        "content": "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.",
    },
    {
        "id": 2,
        "content": "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.",
    },
    {
        "id": 3,
        "content": "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.",
    },
]

client.insert(collection_name=COLLECTION_NAME, data=data)
client.load_collection(collection_name=COLLECTION_NAME)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;

Gson gson = new Gson();
List<JsonObject> rows = Arrays.asList(
        gson.fromJson("{\"id\": 1, \"content\": \"Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"content\": \"Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 3, \"content\": \"Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.\"}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName("text_bm25_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Note: DataType.Text is not supported in milvus-sdk-go as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: DataType.Text is not supported in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows rows = {
    {{"id", static_cast<int64_t>(1)},
     {"content", "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications."}},
    {{"id", static_cast<int64_t>(2)},
     {"content", "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text."}},
    {{"id", static_cast<int64_t>(3)},
     {"content", "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting."}}
};

milvus::InsertResponse response;
status = client->Insert(milvus::InsertRequest()
                            .WithCollectionName("text_bm25_collection")
                            .WithRowsData(std::move(rows)),
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
        id: 1,
        content: "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications."
    },
    {
        id: 2,
        content: "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text."
    },
    {
        id: 3,
        content: "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting."
    }
];

const res = await client.insert({
    collection_name: "text_bm25_collection",
    data: data
});

console.log(res);

await client.flushSync({ collection_names: ["text_bm25_collection"] });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${BASE_URL}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 30" \
-d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [
        {
            \"id\": 1,
            \"content\": \"Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.\"
        },
        {
            \"id\": 2,
            \"content\": \"Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.\"
        },
        {
            \"id\": 3,
            \"content\": \"Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.\"
        }
    ]
}"
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

## 步骤 4：执行 BM25 全文搜索\{#step-4-perform-bm25-full-text-search}

使用原始 Query 文本作为 Search 数据，并在稀疏向量字段上执行搜索。Milvus 将 Query 文本转换为稀疏向量，使用 BM25 对匹配结果排序，并返回 `output_fields` 中请求的 `TEXT` 字段。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
results = client.search(
    collection_name=COLLECTION_NAME,
    # highlight-start
    data=["how does Milvus store source text for retrieval"],
    anns_field="sparse",
    limit=2,
    output_fields=["content"],
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("text_bm25_collection")
        .data(Collections.singletonList(new EmbeddedText("how does Milvus store source text for retrieval")))
        .annsField("sparse")
        .limit(2)
        .outputFields(Collections.singletonList("content"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Note: DataType.Text is not supported in milvus-sdk-go as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: DataType.Text is not supported in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
std::string query_text = "how does Milvus store source text for retrieval";
auto request = milvus::SearchRequest()
                   .WithCollectionName("text_bm25_collection")
                   .WithAnnsField("sparse")
                   .WithLimit(2)
                   .AddOutputField("content")
                   .AddEmbeddedText(query_text);

milvus::SearchResponse response;
status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "text_bm25_collection",
    data: ["how does Milvus store source text for retrieval"],
    anns_field: "sparse",
    limit: 2,
    output_fields: ["id", "content"]
});

console.log(JSON.stringify(res.results, null, 2));
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${BASE_URL}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 30" \
-d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [\"how does Milvus store source text for retrieval\"],
    \"annsField\": \"sparse\",
    \"limit\": 2,
    \"outputFields\": [\"content\"]
}"
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

## 步骤 5：读取返回的 TEXT 值\{#step-5-read-the-returned-text-values}

每个 Search 命中都包含 BM25 分数和原始 `TEXT` 值。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
for hit in results[0]:
    print(f"id: {hit['id']}, score: {hit['distance']}")
    print(hit["entity"]["content"])
```

</TabItem>

<TabItem value='java'>

```java
for (List<SearchResp.SearchResult> hits : searchResp.getSearchResults()) {
    for (SearchResp.SearchResult hit : hits) {
        System.out.println("id: " + hit.getId() + ", score: " + hit.getScore());
        System.out.println(hit.getEntity().get("content"));
    }
}
```

</TabItem>

<TabItem value='go'>

```go
// Note: DataType.Text is not supported in milvus-sdk-go as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: DataType.Text is not supported in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
auto search_results = response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        continue;
    }
    for (const auto& row : output_rows) {
        std::cout << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
for (const hit of res.results) {
    console.log(`id: ${hit.id}, score: ${hit.distance}`);
    console.log(hit.entity?.content ?? hit.content);
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${BASE_URL}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"text_bm25_collection\",
    \"data\": [\"how does Milvus store source text for retrieval\"],
    \"annsField\": \"sparse\",
    \"limit\": 2,
    \"outputFields\": [\"content\"]
}"
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

有关 BM25 Function、稀疏向量索引和全文搜索 Query 语法的更多信息，请参阅[全文搜索](./full-text-search)。