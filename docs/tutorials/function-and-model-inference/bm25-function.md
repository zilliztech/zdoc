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
description: "The BM25 function enables full text search by transforming raw text into sparse vectors and scoring documents based on lexical relevance. It applies term-based matching and frequency-aware weighting to support efficient retrieval of text documents that closely match query terms. | Cloud"
type: origin
token: YbChwcPMBim5ryk1EQocEbDenDd
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - function
  - model
  - inference
  - bm25

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# BM25 Function

The **BM25 function** enables [full text search](./full-text-search) by transforming raw text into **sparse vectors** and scoring documents based on lexical relevance. It applies term-based matching and frequency-aware weighting to support efficient retrieval of text documents that closely match query terms.

As a local text function, the BM25 function runs within Zilliz Cloud and does not require model inference or external integrations. It provides a deterministic and transparent retrieval mechanism for text-based search scenarios.

## How BM25 works\{#how-bm25-works}

The [BM25](https://en.wikipedia.org/wiki/Okapi_BM25) algorithm is a term-based relevance scoring algorithm widely used in full text retrieval. In Zilliz Cloud, BM25 is implemented as a sparse retrieval pipeline that converts text into term-weight representations and retrieves top *K* documents using distributed sparse indexes.

The overall workflow consists of two symmetric paths: **document ingestion** and **query text processing**, which share the same text analysis logic.

### Document ingestion: From text to sparse representation\{#document-ingestion-from-text-to-sparse-representation}

When a document is inserted, its raw text is first processed by an **[analyzer](./analyzer-overview)**, which tokenizes the text into individual terms.

For example, the document:

```plaintext
"We are loving Milvus!"
```

can be analyzed into the following terms:

```plaintext
["we", "love", "milvus"]
```

Each document is then represented as a term frequency (TF) representation, which records how many times each term appears in the document. For example:

```plaintext
{
  "we": 1,
  "love": 1,
  "milvus": 1
}
```

At the same time, Zilliz Cloud updates corpus-level statistics, including:

- the document frequency (DF) of each term

- the average document length

- posting lists that map each term to the documents containing it

The document's TF representation is inserted into **sparse embeddings**, where term postings are partitioned across nodes for scalable retrieval.

### Query text process: Apply IDF weighting\{#query-text-process-apply-idf-weighting}

When a text-based query is issued, it is processed by the **same analyzer** used during [document ingestion](./bm25-function#document-ingestion-from-text-to-sparse-representation), ensuring consistent term segmentation.

For example, the query:

```plaintext
"who loves Milvus?"
```

can be analyzed into:

```plaintext
["who", "love", "milvus"]
```

For each query term, Zilliz Cloud looks up its [inverse document frequency](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) (IDF) from corpus statistics. IDF reflects how informative a term is across the entire dataset: rarer terms receive higher weights, while common terms receive lower weights.

Conceptually, this produces a set of IDF-weighted query terms, such as:

```plaintext
{
  "who": 0.1,
  "love": 0.5,
  "milvus": 1.2
}
```

### BM25 scoring and top K retrieval\{#bm25-scoring-and-top-k-retrieval}

BM25 ranks documents by computing a relevance score based on matched query terms. Scoring is performed at the **term level** and aggregated at the **document level**.

**Term-level scoring**

For each query term that appears in a document, BM25 computes a term-level score:

```plaintext
term_score =
  IDF(term) ×
  TF_boost(term, document, k1) ×
  length_normalization(document, b)
```

Where:

- **IDF(term)** reflects how rare the term is in the collection

- **TF_boost(…, k1)** increases with term frequency but saturates as frequency grows

- **length_normalization(…, b)** adjusts the score based on document length

**Document-level scoring and Top-K retrieval**

The final document score is the sum of term-level scores for all matched query terms:

```plaintext
document_score =
  sum of term_score over all matched query terms
```

Documents are ranked by their final scores, and the top-K highest-scoring documents are returned.

## Before you start\{#before-you-start}

Before using the BM25 function, plan your collection schema to ensure it supports lexical full text search:

- **A text field for raw content**

    Your collection must include a `VARCHAR` field to store raw text. This field is the source of text that will be processed for full text search.

- **An analyzer for the text field**

    The text field must have an analyzer enabled. The analyzer defines how text is tokenized and normalized before lexical relevance is computed by the BM25 function.

    By default, Zilliz Cloud provides a built-in analyzer that tokenizes text based on whitespace and punctuation. If your application requires custom tokenization or normalization behavior, you can define a custom analyzer. See [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case) for details.

- **A sparse vector for BM25 output**

    Your collection must include a `SPARSE_FLOAT_VECTOR` field to store the sparse representations generated by the BM25 function. This field is used for indexing and retrieval during full text search.

After these schema-level considerations are figured out, proceed to create the collection and use the BM25 function.

## Step 1: Create a collection with a BM25 function\{#step-1-create-a-collection-with-a-bm25-function}

To use the BM25 function, you must define it when creating the collection. The function becomes part of the collection schema and is applied automatically during data insertion and search.

### Via SDK\{#via-sdk}

#### Define schema fields\{#define-schema-fields}

Your collection schema must include at least three required fields:

- **Primary field**: Uniquely identifies each entity in the collection.

- **Text field** (`VARCHAR`): Stores raw text documents. Must set `enable_analyzer=True` so Zilliz Cloud can process the text for BM25 relevance ranking. By default, Zilliz Cloud uses the [`standard`](./standard-analyzer)[ analyzer](./standard-analyzer) for text analysis. To configure a different analyzer, refer to [Analyzer Overview](./analyzer-overview).

- **Sparse vector field** (`SPARSE_FLOAT_VECTOR`): Stores sparse embeddings automatically generated by the BM25 function.

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

#### Define the BM25 function\{#define-the-bm25-function}

The BM25 function converts tokenized text into sparse vectors that support BM25 scoring.

Define the function and add it to your schema:

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

#### Configure the index\{#configure-the-index}

After defining the schema with necessary fields and the built-in function, set up the index for your collection. To simplify this process, use `AUTOINDEX` as the `index_type`, an option that allows Zilliz Cloud to choose and configure the most suitable index type based on the structure of your data.

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

#### Create the collection\{#create-the-collection}

Now create the collection using the schema and index parameters defined:

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

### Via web console\{#via-web-console}

Alternatively, you can create a collection with a BM25 function in the [Zilliz Cloud console](https://cloud.zilliz.com/login).

<Supademo id="cmjl3i2jg4mkb3zz206xgz4tr" title=""  />

Once the collection with a BM25 function is created, you can insert text and perform lexical searches based on text query.

## Step 2: Insert text data into the collection\{#step-2-insert-text-data-into-the-collection}

After setting up your collection and index, you're ready to insert text data. In this process, you need only to provide the raw text. The BM25 function we defined earlier automatically generates the sparse vector for each text entry.

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

## Step 3: Search with text query\{#step-3-search-with-text-query}

Once you've inserted data into your collection, you can perform full text searches using raw text queries. Zilliz Cloud automatically converts your query into a sparse vector and ranks the matched search results using the BM25 algorithm, and then returns the topK (`limit`) results.

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

