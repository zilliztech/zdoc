---
title: "Sparse Vector | Cloud"
slug: /use-sparse-vector
sidebar_label: "Sparse Vector"
beta: FALSE
notebook: FALSE
description: "Sparse vectors are an important method of data representation in information retrieval and natural language processing. While dense vectors are popular for their excellent semantic understanding capabilities, sparse vectors often provide more accurate results when it comes to applications that require precise matching of keywords or phrases. | Cloud"
type: origin
token: JbPDwHqd0iZZSuk5tYicGqKbn9c
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - sparse vector
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sparse Vector

Sparse vectors are an important method of data representation in information retrieval and natural language processing. While dense vectors are popular for their excellent semantic understanding capabilities, sparse vectors often provide more accurate results when it comes to applications that require precise matching of keywords or phrases.

## Overview{#overview}

A sparse vector is a special representation of high-dimensional vectors where most elements are zero, and only a few dimensions have non-zero values. As shown in the diagram below, dense vectors are typically represented as continuous arrays where each position has a value (e.g., `[0.3, 0.8, 0.2, 0.3, 0.1]`). In contrast, sparse vectors store only non-zero elements and their indices, often represented as key-value pairs (e.g., `[{2: 0.2}, ..., {9997: 0.5}, {9999: 0.7}]`). 

![VPhswBhHmhJrh3byaVnc3onYnPc](/img/VPhswBhHmhJrh3byaVnc3onYnPc.png)

Sparse vectors reduce storage and boost efficiency in high-dimensional data, making them ideal for large & sparse datasets. Common use cases include:

- **Text analysis**: Representing documents as bag-of-words vectors, where each dimension corresponds to a word in the vocabulary, and only words present in the document have non-zero values.

- **Recommendation systems**: User-item interaction matrices, where each dimension represents a user’s rating for a particular item, with most users interacting with only a few items.

- **Image processing**: Local feature representation, focusing only on key points in the image, resulting in high-dimensional sparse vectors.

Sparse vectors are commonly generated through traditional statistical methods like [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) and [BM25](https://en.wikipedia.org/wiki/Okapi_BM25), or via neural models that learn sparse representations from text. Zilliz Cloud supports full-text search for text data using the BM25 algorithm. It automatically converts text into sparse embeddings — no manual vectorization required. Refer to [Full Text Search](./full-text-search) for more information. 

Once vectorized, the data can be stored in Zilliz Cloud for efficient management and retrieval. The diagram below illustrates the overall process.

![A7FvwnB5bhpBlKbgrzYcQijbnxg](/img/A7FvwnB5bhpBlKbgrzYcQijbnxg.png)

<Admonition type="info" icon="📘" title="Notes">

<p>In addition to sparse vectors, Zilliz Cloud also supports dense vectors and binary vectors. Dense vectors are ideal for capturing deep semantic relationships, while binary vectors excel in scenarios like quick similarity comparisons and content deduplication. For more information, refer to <a href="./use-dense-vector">Dense Vector</a> and <a href="./use-binary-vector">Binary Vector</a>.</p>

</Admonition>

## Data Formats{#data-formats}

Zilliz Cloud supports representing sparse vectors in any of the following formats:

- **Sparse Matrix (using the `scipy.sparse` class)**

    ```python
    from scipy.sparse import csr_matrix
    
    # Create a sparse matrix
    row = [0, 0, 1, 2, 2, 2]
    col = [0, 2, 2, 0, 1, 2]
    data = [1, 2, 3, 4, 5, 6]
    sparse_matrix = csr_matrix((data, (row, col)), shape=(3, 3))
    
    # Represent sparse vector using the sparse matrix
    sparse_vector = sparse_matrix.getrow(0)
    ```

- **List of Dictionaries (formatted as `{dimension_index: value, ...}`)**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    # Represent sparse vector using a dictionary
    sparse_vector = [{1: 0.5, 100: 0.3, 500: 0.8, 1024: 0.2, 5000: 0.6}]
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    SortedMap<Long, Float> sparseVector = new TreeMap<>();
    sparseVector.put(1L, 0.5f);
    sparseVector.put(100L, 0.3f);
    sparseVector.put(500L, 0.8f);
    sparseVector.put(1024L, 0.2f);
    sparseVector.put(5000L, 0.6f);
    ```

    </TabItem>
    </Tabs>

- **List of Tuple Iterators (formatted as `[(dimension_index, value)]`)**

    ```python
    # Represent sparse vector using a list of tuples
    sparse_vector = [[(1, 0.5), (100, 0.3), (500, 0.8), (1024, 0.2), (5000, 0.6)]]
    ```

## Define Collection Schema{#define-collection-schema}

### Add fields{#add-fields}

To use sparse vectors in Zilliz Cloud clusters, you need to create a collection with a schema including at least the following fields:

- A `SPARSE_FLOAT_VECTOR` field reserved for storing sparse embeddings, either auto-generated from a `VARCHAR` field or provided directly by the inserted data.

- (For built-in BM25) A `VARCHAR` field for raw text documents with `enable_analyzer` set to `True`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True)
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
        .maxLength(1000)
        .enableAnalyzer(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

const schema = [
  {
    name: "metadata",
    data_type: DataType.JSON,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "sparse_vector",
    data_type: DataType.SparseFloatVector,
  },
  {
    name: "text",
    data_type: "VarChar",
    enable_analyzer: true,
    enable_match: true,
    max_length: 1000,
  },
];

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
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
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
    WithMaxLength(1000),
)
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
        "max_length": 1000,
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

In this example, three fields are added:

- `pk`: This field stores primary keys using the `VARCHAR` data type, which is auto-generated with a maximum length of 100 bytes.

- `sparse_vector`: This field stores sparse vectors using the `SPARSE_FLOAT_VECTOR` data type.

- `text`: This field stores text strings using the `VARCHAR` data type, with a maximum length of 1000 bytes.

### Add functions{#add-functions}

<Admonition type="info" icon="📘" title="**Notes:** You can skip this step if generating embeddings on your own. However, you will need to provide sparse embeddings to be inserted into the sparse vector field.">

</Admonition>

To utilize the full-text search feature built in Milvus, powered by BM25 (eliminating the need for manual generation of sparse embeddings), you need to add the Milvus `Function` to the schema:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

bm25_function = Function(
    name="text_bm25_emb",
    input_field_names=["text"],
    output_field_names=["sparse"],
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
        .outputFieldNames(Collections.singletonList("sparse"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import FunctionType from "@zilliz/milvus2-sdk-node";

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

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/entity"

function := entity.NewFunction().
    WithName("text_bm25_emb").
    WithInputFields("text").
    WithOutputFields("sparse").
    WithType(entity.FunctionTypeBM25)
schema.WithFunction(function)
```

</TabItem>

<TabItem value='bash'>

```bash
export bm25Function='{
    "name": "text_bm25_emb",
    "type": "BM25",
    "inputFieldNames": ["text"],
    "outputFieldNames": ["sparse"],
    "params": {}
}'

export schema="{
    \"autoID\": true,
    \"fields\": [
        $primaryField,
        $vectorField,
        $textField
    ],
    \"functions\": [$bm25Function]
}"
```

</TabItem>
</Tabs>

 For more details, see [Full Text Search](./full-text-search).

## Set Index Parameters{#set-index-parameters}

The process of creating an index for sparse vectors is similar to that for [dense vectors](./use-dense-vector), but with differences in the specified index type (`index_type`), distance metric (`metric_type`), and index parameters (`params`).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="sparse_vector",
    index_name="sparse_auto_index",
    index_type="AUTOINDEX",
    metric_type="BM25" # or "IP" for custom sparse vectors
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

        .metricType(IndexParam.MetricType.BM25) // Or IndexParam.MetricType.IP for custom sparse vectors

        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = await client.createIndex({
    field_name: 'sparse_vector',
    metric_type: MetricType.BM25, // or MetricType.IP for custom sparse vectors

    index_name: 'sparse_auto_index',
    index_type: IndexType.AUTOINDEX,

});
```

</TabItem>

<TabItem value='go'>

```go
idx := index.NewSparseInvertedIndex(entity.BM25, 0.2) // or entity.IP for custom sparse vectors
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse_vector", idx)
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "sparse_vector",
            "metricType": "BM25", # or "IP" for custom sparse vectors

            "indexName": "sparse_auto_index",
            "indexType": "AUTOINDEX"

        }
    ]'
```

</TabItem>
</Tabs>

This example uses the `SPARSE_INVERTED_INDEX` index type with `BM25` as the metric. For more details, see the following resources:

- SPARSE_INVERTED_INDEX: Explained index and its parameters

- [Metric Types](./search-metrics-explained): Supported metric types for different field types

- [Full Text Search](./full-text-search): Detailed tutorial on full-text search

## Create Collection{#create-collection}

Once the sparse vector and index settings are complete, you can create a collection that contains sparse vectors. The example below uses the `create_collection` method to create a collection named `my_collection`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT'
});

await client.createCollection({
    collection_name: 'my_collection',
    schema: schema,
    index_params: indexParams
});
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

<TabItem value='bash'>

```bash
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

## Insert data{#insert-data}

You must provide data for all fields defined during collection creation, except for fields that are auto-generated (such as the primary key with `auto_id` enabled). If you are using the built-in BM25 function to auto-generate sparse vectors, you should also omit the sparse vector field when inserting data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "text": "information retrieval is a field of study.",
        # "sparse_vector": {1: 0.5, 100: 0.3, 500: 0.8} # Do NOT provide sparse vectors if using built-in BM25
    },
    {
        "text": "information retrieval focuses on finding relevant information in large datasets.",
        # "sparse_vector": {10: 0.1, 200: 0.7, 1000: 0.9} # Do NOT provide sparse vectors if using built-in BM25
    },
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
    /* Do NOT provide sparse vectors if using the built-in BM25
    sparse.put(1L, 0.5f);
    sparse.put(100L, 0.3f);
    sparse.put(500L, 0.8f);
    row.add("sparse_vector", gson.toJsonTree(sparse));
    */
    rows.add(row);
}
{
    JsonObject row = new JsonObject();
    row.addProperty("text", "information retrieval focuses on finding relevant information in large datasets.");
    SortedMap<Long, Float> sparse = new TreeMap<>();
    /* Do NOT provide sparse vectors if using the built-in BM25
    sparse.put(10L, 0.1f);
    sparse.put(200L, 0.7f);
    sparse.put(1000L, 0.9f);
    row.add("sparse_vector", gson.toJsonTree(sparse));
    */
    rows.add(row);
}

InsertResp insertResp = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {
        text: 'information retrieval is a field of study.',
        // sparse_vector: {1: 0.5, 100: 0.3, 500: 0.8} // Do NOT provide sparse vectors if using built-in BM25
    },
    {
        text: 'information retrieval focuses on finding relevant information in large datasets.',
        // sparse_vector: {10: 0.1, 200: 0.7, 1000: 0.9} // Do NOT provide sparse vectors if using built-in BM25
    },
];

client.insert({
    collection_name: "my_collection",
    data: data
});
```

</TabItem>

<TabItem value='go'>

```go
texts := []string{
    "information retrieval is a field of study.",
    "information retrieval focuses on finding relevant information in large datasets.",
}
textColumn := entity.NewColumnVarChar("text", texts)

// Prepare sparse vectors (Do NOT provide sparse vectors if using the built-in BM25)
// sparseVectors := make([]entity.SparseEmbedding, 0, 2)
// sparseVector1, _ := entity.NewSliceSparseEmbedding([]uint32{1, 100, 500}, []float32{0.5, 0.3, 0.8})
// sparseVectors = append(sparseVectors, sparseVector1)
// sparseVector2, _ := entity.NewSliceSparseEmbedding([]uint32{10, 200, 1000}, []float32{0.1, 0.7, 0.9})
// sparseVectors = append(sparseVectors, sparseVector2)
// sparseVectorColumn := entity.NewColumnSparseVectors("sparse_vector", sparseVectors)

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithColumns(
        textColumn,
        // sparseVectorColumn
    ))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
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
        {"text": "information retrieval is a field of study.",
        {"text": "information retrieval focuses on finding relevant information in large datasets."       
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## Perform Similarity Search{#perform-similarity-search}

To perform a similarity search using sparse vectors, prepare both the query data and the search parameters. If you are using the built-in BM25 function, simply provide the query text — there is no need to supply a sparse vector. Refer to SPARSE_INVERTED_INDEX for available search parameters.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# Prepare search parameters
search_params = {
    "params": {"drop_ratio_search": 0.2},  # A tunable drop ratio parameter with a valid range between 0 and 1
}

# Query with text if search with the built-in BM25
query_data = ["What is information retrieval?"]

# Otherwise, query with the sparse vector
# query_data = [{1: 0.2, 50: 0.4, 1000: 0.7}]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.request.data.SparseFloatVec;

// Prepare search parameters
Map<String,Object> searchParams = new HashMap<>();
searchParams.put("drop_ratio_search", 0.2);

// Query with text if search with the built-in BM25
EmbeddedText queryData = new EmbeddedText("What is information retrieval?");

// Otherwise, query with the sparse vector
// SortedMap<Long, Float> sparse = new TreeMap<>();
// sparse.put(1L, 0.2f);
// sparse.put(50L, 0.4f);
// sparse.put(1000L, 0.7f);
// SparseFloatVec queryData = new SparseFloatVec(sparse);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Prepare search parameters
const searchParams = {drop_ratio_search: 0.2}

// Query with text if search with the built-in BM25
const queryData = ["What is information retrieval?"]

// Otherwise, query with the sparse vector
// const queryData = [{1: 0.2, 50: 0.4, 1000: 0.7}]
```

</TabItem>

<TabItem value='go'>

```go
// Prepare search parameters
annSearchParams := index.NewCustomAnnParam()
annSearchParams.WithExtraParam("drop_ratio_search", 0.2)

// Query with text if search with the built-in BM25
queryData := entity.Text({"What is information retrieval?"})

// Otherwise, query with the sparse vector
// queryData, _ := entity.NewSliceSparseEmbedding([]uint32{1, 50, 1000}, []float32{0.2, 0.4, 0.7})
```

</TabItem>
</Tabs>

Then, execute the similarity search using the `search` method:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=query_data,
    limit=3,
    output_fields=["pk"],
    search_params=search_params,
)

print(res)

# Output
# data: ["[{'id': '453718927992172266', 'distance': 0.6299999952316284, 'entity': {'pk': '453718927992172266'}}, {'id': '453718927992172265', 'distance': 0.10000000149011612, 'entity': {'pk': '453718927992172265'}}]"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

SparseFloatVec queryVector = new SparseFloatVec(sparse);

SearchResp searchR = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryData))
        .annsField("sparse_vector")
        .searchParams(searchParams)
        .topK(3)
        .outputFields(Collections.singletonList("pk"))
        .build());
        
System.out.println(searchR.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={pk=457270974427187729}, score=0.63, id=457270974427187729), SearchResp.SearchResult(entity={pk=457270974427187728}, score=0.1, id=457270974427187728)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: queryData,
    limit: 3,
    output_fields: ['pk'],
    params: searchParams
});
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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [
        {"1": 0.2, "50": 0.4, "1000": 0.7}
    ],
    "annsField": "sparse_vector",
    "limit": 3,
    "searchParams":{
        "params":{"drop_ratio_search": 0.2}
    },
    "outputFields": ["pk"]
}'

## {"code":0,"cost":0,"data":[{"distance":0.63,"id":"453577185629572535","pk":"453577185629572535"},{"distance":0.1,"id":"453577185629572534","pk":"453577185629572534"}]}
```

</TabItem>
</Tabs>

For more information on similarity search parameters, refer to [Basic Vector Search](./single-vector-search).