---
title: "Full Text Search | Cloud"
slug: /full-text-search
sidebar_label: "Full Text Search"
beta: PUBLIC
notebook: FALSE
description: "Full text search is a feature that retrieves documents containing specific terms or phrases in text datasets, then ranking the results based on relevance. This feature overcomes semantic search limitations, which might overlook precise terms, ensuring you receive the most accurate and contextually relevant results. Additionally, it simplifies vector searches by accepting raw text input, automatically converting your text data into sparse embeddings without the need to manually generate vector embeddings. | Cloud"
type: origin
token: RQTRwhOVPiwnwokqr4scAtyfnBf
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - full-text search
  - data in data out
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Full Text Search

Full text search is a feature that retrieves documents containing specific terms or phrases in text datasets, then ranking the results based on relevance. This feature overcomes semantic search limitations, which might overlook precise terms, ensuring you receive the most accurate and contextually relevant results. Additionally, it simplifies vector searches by accepting raw text input, automatically converting your text data into sparse embeddings without the need to manually generate vector embeddings.

Using the BM25 algorithm for relevance scoring, this feature is particularly valuable in retrieval-augmented generation (RAG) scenarios, where it prioritizes documents that closely match specific search terms.

<Admonition type="info" icon="📘" title="Notes">

<p>By integrating full text search with semantic-based dense vector search, you can enhance the accuracy and relevance of search results. For more information, refer to <a href="./hybrid-search">Hybrid Search</a>.</p>

</Admonition>

## Overview{#overview}

Full text search simplifies the process of text-based searching by eliminating the need for manual embedding. This feature operates through the following workflow:

1. **Text input**: You insert raw text documents or provide query text without any need for manual embedding.

1. **Text analysis**: Zilliz Cloud uses an [analyzer](./analyzer-overview) to tokenize input text into individual, searchable terms.

1. **Function processing**: The built-in function receives tokenized terms and converts them into sparse vector representations.

1. **Collection store**: Zilliz Cloud stores these sparse embeddings in a collection for efficient retrieval.

1. **BM25 scoring**: During a search, Zilliz Cloud applies the BM25 algorithm to calculate scores for the stored documents and ranks matched results based on relevance to the query text.

![DfPMwP6ZahhHlLbIN0gcG9d7nQM](/img/DfPMwP6ZahhHlLbIN0gcG9d7nQM.png)

To use full text search, follow these main steps:

1. [Create a collection](./full-text-search): Set up a collection with necessary fields and define a function to convert raw text into sparse embeddings.

1. [Insert data](./full-text-search): Ingest your raw text documents to the collection.

1. [Perform searches](./full-text-search): Use query texts to search through your collection and retrieve relevant results.

## Create a collection for full text search{#create-a-collection-for-full-text-search}

To enable full text search, create a collection with a specific schema. This schema must include three necessary fields:

- The primary field that uniquely identifies each entity in a collection.

- A `VARCHAR` field that stores raw text documents, with the `enable_analyzer` attribute set to `True`. This allows Zilliz Cloud to tokenize text into specific terms for function processing.

- A `SPARSE_FLOAT_VECTOR` field reserved to store sparse embeddings that Zilliz Cloud will automatically generate for the `VARCHAR` field.

### Define the collection schema{#define-the-collection-schema}

First, create the schema and add the necessary fields:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = MilvusClient.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True)
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR)
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

In this configuration,

- `id`: serves as the primary key and is automatically generated with `auto_id=True`.

- `text`: stores your raw text data for full text search operations. The data type must be `VARCHAR`, as `VARCHAR` is Zilliz Cloud' string data type for text storage. Set `enable_analyzer=True` to allow Zilliz Cloud to tokenize the text. By default, Zilliz Cloud uses the `standard`[ analyzer](./standard-analyzer) for text analysis. To configure a different analyzer, refer to [Analyzer Overview](./analyzer-overview).

- `sparse`: a vector field reserved to store internally generated sparse embeddings for full text search operations. The data type must be `SPARSE_FLOAT_VECTOR`.

Now, define a function that will convert your text into sparse vector representations and then add it to the schema:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
bm25_function = Function(
    name="text_bm25_emb", # Function name
    input_field_names=["text"], # Name of the VARCHAR field containing raw text data
    output_field_names=["sparse"], # Name of the SPARSE_FLOAT_VECTOR field reserved to store generated embeddings
    function_type=FunctionType.BM25,
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
        .outputFieldNames(Collections.singletonList("vector"))
        .build());
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
      output_field_names: ['vector'],
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

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>The name of the function. This function converts your raw text from the <code>text</code> field into searchable vectors that will be stored in the <code>sparse</code> field.</p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>The name of the <code>VARCHAR</code> field requiring text-to-sparse-vector conversion. For <code>FunctionType.BM25</code>, this parameter accepts only one field name.</p></td>
   </tr>
   <tr>
     <td><p><code>output_field_names</code></p></td>
     <td><p>The name of the field where the internally generated sparse vectors will be stored. For <code>FunctionType.BM25</code>, this parameter accepts only one field name.</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>The type of the function to use. Set the value to <code>FunctionType.BM25</code>.</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>For collections with multiple <code>VARCHAR</code> fields requiring text-to-sparse-vector conversion, add separate functions to the collection schema, ensuring each function has a unique name and <code>output_field_names</code> value.</p>

</Admonition>

### Configure the index{#configure-the-index}

After defining the schema with necessary fields and the built-in function, set up the index for your collection. To simplify this process, use `AUTOINDEX` as the `index_type`, an option that allows Zilliz Cloud to choose and configure the most suitable index type based on the structure of your data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = MilvusClient.prepare_index_params()

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

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.BM25)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [
  {
    field_name: "sparse",
    metric_type: "BM25",
    index_type: "AUTOINDEX",
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
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>The name of the vector field to index. For full text search, this should be the field that stores the generated sparse vectors. In this example, set the value to <code>sparse</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>The type of the index to create. <code>AUTOINDEX</code> allows Zilliz Cloud to automatically optimize index settings. If you need more control over your index settings, you can choose from various index types available for sparse vectors in Zilliz Cloud. .</p></td>
   </tr>
   <tr>
     <td><p><code>metric_type</code></p></td>
     <td><p>The value for this parameter must be set to <code>BM25</code> specifically for full text search functionality.</p></td>
   </tr>
</table>

### Create the collection{#create-the-collection}

Now create the collection using the schema and index parameters defined.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name='demo', 
    schema=schema, 
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection(
    collection_name: 'demo', 
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
    \"collectionName\": \"demo\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## Insert text data{#insert-text-data}

After setting up your collection and index, you're ready to insert text data. In this process, you need only to provide the raw text. The built-in function we defined earlier automatically generates the corresponding sparse vector for each text entry.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert('demo', [
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
        .collectionName("demo")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.insert({
collection_name: 'demo', 
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
    "collectionName": "demo"
}'

```

</TabItem>
</Tabs>

## Perform full text search{#perform-full-text-search}

Once you've inserted data into your collection, you can perform full text searches using raw text queries. Zilliz Cloud automatically converts your query into a sparse vector and ranks the matched search results using the BM25 algorithm, and then returns the topK (`limit`) results.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    'params': {'drop_ratio_search': 0.2},
}

client.search(
    collection_name='demo', 
    data=['whats the focus of information retrieval?'],
    anns_field='sparse',
    limit=3,
    search_params=search_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

Map<String,Object> searchParams = new HashMap<>();
searchParams.put("drop_ratio_search", 0.2);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("demo")
        .data(Collections.singletonList(new EmbeddedText("whats the focus of information retrieval?")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Collections.singletonList("text"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search(
    collection_name: 'demo', 
    data: ['whats the focus of information retrieval?'],
    anns_field: 'sparse',
    limit: 3,
    params: {'drop_ratio_search': 0.2},
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
    "collectionName": "demo",
    "data": [
        "whats the focus of information retrieval?"
    ],
    "annsField": "sparse",
    "limit": 3,
    "outputFields": [
        "text"
    ],
    "searchParams":{
        "params":{
            "drop_ratio_search":0.2
        }
    }
}'
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>search_params</code></p></td>
     <td><p>A dictionary containing search parameters.</p></td>
   </tr>
   <tr>
     <td><p><code>params.drop_ratio_search</code></p></td>
     <td><p>Proportion of terms with less contribution to BM25 scoring to ignore during search. For details, refer to <a href="./use-sparse-vector">Sparse Vector</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>data</code></p></td>
     <td><p>The raw query text.</p></td>
   </tr>
   <tr>
     <td><p><code>anns_field</code></p></td>
     <td><p>The name of the field that contains internally generated sparse vectors.</p></td>
   </tr>
   <tr>
     <td><p><code>limit</code></p></td>
     <td><p>Maximum number of top matches to return.</p></td>
   </tr>
</table>

