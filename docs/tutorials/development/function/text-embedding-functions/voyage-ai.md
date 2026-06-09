---
title: "Voyage AI | Cloud"
slug: /voyage-ai
sidebar_label: "Voyage AI"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how to configure and use Voyage AI embedding functions in Milvus. | Cloud"
type: origin
token: P4KNwDdqaivEZFk7RpOcYeyhn2N
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Voyage AI

This topic describes how to configure and use Voyage AI embedding functions in Milvus.

## Model choices\{#model-choices}

Milvus supports embedding models provided by Voyage AI. Below are the currently available embedding models for quick reference:

<table>
   <tr>
     <th><p>Model Name</p></th>
     <th><p>Dimensions</p></th>
     <th><p>Max Tokens</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>voyage-4-large</code></p></td>
     <td><p>1024 (default), 256, 512, 2048</p></td>
     <td><p>32,000</p></td>
     <td><p>The best general-purpose and multilingual retrieval quality. All embeddings created with the 4 series are compatible with each other. See <a href="https://blog.voyageai.com/2026/01/15/voyage-4/">blog post</a> for details.</p></td>
   </tr>
   <tr>
     <td><p><code>voyage-4</code></p></td>
     <td><p>1024 (default), 256, 512, 2048</p></td>
     <td><p>32,000</p></td>
     <td><p>Optimized for general-purpose and multilingual retrieval quality. All embeddings created with the 4 series are compatible with each other. See <a href="https://blog.voyageai.com/2026/01/15/voyage-4/">blog post</a> for details.</p></td>
   </tr>
   <tr>
     <td><p><code>voyage-4-lite</code></p></td>
     <td><p>1024 (default), 256, 512, 2048</p></td>
     <td><p>32,000</p></td>
     <td><p>Optimized for latency and cost. All embeddings created with the 4 series are compatible with each other. See <a href="https://blog.voyageai.com/2026/01/15/voyage-4/">blog post</a> for details.</p></td>
   </tr>
   <tr>
     <td><p>voyage-3-large</p></td>
     <td><p>1,024 (default), 256, 512, 2,048</p></td>
     <td><p>32,000</p></td>
     <td><p>The best general-purpose and multilingual retrieval quality.</p></td>
   </tr>
   <tr>
     <td><p>voyage-3</p></td>
     <td><p>1,024</p></td>
     <td><p>32,000</p></td>
     <td><p>Optimized for general-purpose and multilingual retrieval quality. Refer to <a href="https://blog.voyageai.com/2024/09/18/voyage-3/">blog post</a> for details.</p></td>
   </tr>
   <tr>
     <td><p>voyage-3-lite</p></td>
     <td><p>512</p></td>
     <td><p>32,000</p></td>
     <td><p>Optimized for latency and cost. Refer to <a href="https://blog.voyageai.com/2024/09/18/voyage-3/">blog post</a> for details.</p></td>
   </tr>
   <tr>
     <td><p>voyage-code-3</p></td>
     <td><p>1,024 (default), 256, 512, 2,048</p></td>
     <td><p>32,000</p></td>
     <td><p>Optimized for code retrieval. Refer to <a href="https://blog.voyageai.com/2024/12/04/voyage-code-3/">blog post</a> for details.</p></td>
   </tr>
   <tr>
     <td><p>voyage-finance-2</p></td>
     <td><p>1,024</p></td>
     <td><p>32,000</p></td>
     <td><p>Optimized for finance retrieval and RAG. Refer to <a href="https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/">blog post</a> for details.</p></td>
   </tr>
   <tr>
     <td><p>voyage-law-2</p></td>
     <td><p>1,024</p></td>
     <td><p>16,000</p></td>
     <td><p>Optimized for legal retrieval and RAG. Also improved performance across all domains. Refer to <a href="https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/">blog post</a> for details.</p></td>
   </tr>
   <tr>
     <td><p>voyage-code-2</p></td>
     <td><p>1,536</p></td>
     <td><p>16,000</p></td>
     <td><p>Optimized for code retrieval (17% better than alternatives) / Previous generation of code embeddings. Refer to <a href="https://blog.voyageai.com/2024/01/23/voyage-code-2-elevate-your-code-retrieval/">blog post</a> for details.</p></td>
   </tr>
</table>

For details, refer to [Text embedding models](https://docs.voyageai.com/reference/embeddings-api).

## Before you start\{#before-you-start}

Before using a text embedding function, make sure the following prerequisites are met:

- **Choose an embedding model**

    Decide which embedding model to use, as this choice determines the embedding behavior and output format. See [Choose an embedding model](./voyage-ai#model-choices) for details.

- **Integrate with Voyage AI and get your integration ID**

    You must create a model provider integration with Voyage AI and get your integration ID before using any embedding models provided by it. See [Integrate with Model Providers](./integrate-with-model-providers) for details.

- **Design a compatible collection schema**

    Plan your collection schema to include:

    - A text field (`VARCHAR`) for raw input text

    - A dense vector field whose data type and dimension match the selected embedding model

- **Prepare to work with raw text at insert and search time**

    With a text embedding function enabled, you insert and query raw text directly. Embeddings are generated automatically by the system.

## Step 1: Create a collection with a text embedding function\{#step-1-create-a-collection-with-a-text-embedding-function}

### Define schema fields\{#define-schema-fields}

To use an embedding function, create a collection with a specific schema. This schema must include at least three necessary fields:

- The primary field that uniquely identifies each entity in a collection.

- A `VARCHAR` field that stores raw data to be embedded.

- A vector field reserved to store dense vector embeddings that the text embedding function will generate for the `VARCHAR` field.

The following example defines a schema with one `VARCHAR` field `"document"` for storing text data and one vector field `"dense"` for storing dense embeddings to be generated by the text embedding function. Remember to set the vector dimension (`dim`) to match the output of your chosen embedding model.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

# Initialize Milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a new schema for the collection
schema = client.create_schema()

# Add primary field "id"
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)

# Add scalar field "document" for storing textual data
schema.add_field("document", DataType.VARCHAR, max_length=9000)

# Add vector field "dense" for storing embeddings.
# IMPORTANT: Set dim to match the exact output dimension of the embedding model.
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1024)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(false)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("document")
        .dataType(DataType.VarChar)
        .maxLength(9000)
        .build());
        
schema.addField(AddFieldReq.builder()
        .fieldName("dense")
        .dataType(DataType.FloatVector)
        .dimension(1024)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### Define the text embedding function\{#define-the-text-embedding-function}

The text embedding function automatically converts raw data stored in a `VARCHAR` field into embeddings and stores them into the explicitly defined vector field.

The example below adds a Function module (`voya`) that converts the scalar field `"document"` into embeddings, storing the resulting vectors in the `"dense"` vector field defined earlier.

Once you have defined your embedding function, add it to your collection schema. This instructs Milvus to use the specified embedding function to process and store embeddings from your text data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define embedding function specifically for embedding model provider
text_embedding_function = Function(
    name="voya",                                  # Unique identifier for this embedding function
    function_type=FunctionType.TEXTEMBEDDING,     # Indicates a text embedding function
    input_field_names=["document"],               # Scalar field(s) containing text data to embed
    output_field_names=["dense"],                 # Vector field(s) for storing embeddings
    params={                                      # Provider-specific embedding parameters (function-level)
        "provider": "voyageai",                   # Must be set to "voyageai"
        "model_name": "voyage-3-large",                 # Specifies the embedding model to use

        "integration_id": "YOUR_INTEGRATION_ID",    # Integration ID generated in the Zilliz Cloud console for the selected model provider

        # "url": "https://api.voyageai.com/v1/embeddings",     # Defaults to the official endpoint if omitted
        # "dim": "1024"                           # Output dimension of the vector embeddings after truncation
        # "truncation": "true"                    # Whether to truncate the input texts to fit within the context length. Defaults to true.
    }
)

# Add the configured embedding function to your existing collection schema
schema.add_function(text_embedding_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

Function function = Function.builder()
        .functionType(FunctionType.TEXTEMBEDDING)
        .name("voya")
        .inputFieldNames(Collections.singletonList("document"))
        .outputFieldNames(Collections.singletonList("dense"))
        .param("provider", "voyageai")
        .param("model_name", "voyage-3-large")

        .param("integration_id", "YOUR_INTEGRATION_ID")

        .build();
schema.addFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### Configure the index\{#configure-the-index}

After defining the schema with necessary fields and the built-in function, set up the index for your collection. To simplify this process, use `AUTOINDEX` as the `index_type`, an option that allows Zilliz Cloud to choose and configure the most suitable index type based on the structure of your data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Prepare index parameters
index_params = client.prepare_index_params()

# Add AUTOINDEX to automatically select optimal indexing method
index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE" 
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("dense")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### Create the collection\{#create-the-collection}

Now create the collection using the schema and index parameters defined.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create collection named "demo"
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
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## Step 2: Insert data\{#step-2-insert-data}

After setting up your collection and index, you're ready to insert your raw data. In this process, you need only to provide the raw text. The Function module we defined earlier automatically generates the corresponding sparse vector for each text entry.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Insert sample documents
client.insert('demo', [
    {'id': 1, 'document': 'Milvus simplifies semantic search through embeddings.'},
    {'id': 2, 'document': 'Vector embeddings convert text into searchable numeric data.'},
    {'id': 3, 'document': 'Semantic search helps users find relevant information quickly.'},
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
        gson.fromJson("{\"id\": 0, \"document\": \"Milvus simplifies semantic search through embeddings.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 1, \"document\": \"Vector embeddings convert text into searchable numeric data.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"document\": \"Semantic search helps users find relevant information quickly.\"}", JsonObject.class),
);

client.insert(InsertReq.builder()
        .collectionName("demo")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## Step 3: Search with text\{#step-3-search-with-text}

After data insertion, perform a semantic search using raw query text. Milvus automatically converts your query into an embedding vector, retrieves relevant documents based on similarity, and returns the top-matching results.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Perform semantic search
results = client.search(
    collection_name='demo', 
    data=['How does Milvus handle semantic search?'], # Use text query rather than query vector
    anns_field='dense',   # Use the vector field that stores embeddings
    limit=1,
    output_fields=['document'],
)

print(results)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("demo")
        .data(Collections.singletonList(new EmbeddedText("How does Milvus handle semantic search?")))
        .limit(1)
        .outputFields(Collections.singletonList("document"))
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

