---
title: "MinHash Function | BYOC"
slug: /minhash-function
sidebar_label: "MinHash Function"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The MinHash function converts raw text into binary vectors that approximate Jaccard similarity between documents. It applies text shingling and multiple hash functions to produce fixed-length signature vectors, enabling fast near-duplicate detection and document deduplication at scale. | BYOC"
type: origin
token: EAwdw2ZbtiBKttk66FTctUebn7f
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MinHash Function

The **MinHash function** converts raw text into **binary vectors** that approximate [Jaccard similarity](https://en.wikipedia.org/wiki/Jaccard_index) between documents. It applies text shingling and multiple hash functions to produce fixed-length signature vectors, enabling fast near-duplicate detection and document deduplication at scale.

As a built-in function, MinHash runs within Zilliz Cloud and does not require external model inference or preprocessing. You insert raw text, and Zilliz Cloud generates the MinHash signature vectors automatically.

## Limits\{#limits}

- The output field must be a `BINARY_VECTOR` with a dimension that satisfies `dim % 32 == 0`, because each MinHash signature is a 32-bit hash value.

- The `dim` of the binary vector field must equal `32 * num_hashes`. A mismatch causes an error.

- When using `MINHASH_LSH` index with MinHash function output, `mh_element_bit_width` must be set to `32`.

## How MinHash works\{#how-minhash-works}

<details>

<summary>Expand to see how it works</summary>

[MinHash](https://en.wikipedia.org/wiki/MinHash) is a locality-sensitive hashing technique that estimates [Jaccard similarity](https://en.wikipedia.org/wiki/Jaccard_index) between sets. In Zilliz Cloud, the MinHash function follows this pipeline: you provide raw text as input, and Zilliz Cloud produces a binary vector as output — handling all intermediate steps internally.

The overall workflow consists of a **shared text processing pipeline** used by both document ingestion and query processing, followed by phase-specific operations for storage and retrieval.

![IaqkbFEh8oQgGSx6NsocFoSOnDo](https://zdoc-images.s3.us-west-2.amazonaws.com/iaqkbfeh8oqggsx6nsocfosondo.png "IaqkbFEh8oQgGSx6NsocFoSOnDo")

### Shared text processing pipeline\{#shared-text-processing-pipeline}

Both document ingestion and query processing pass raw text through the same four-stage transformation:

1. **Text analysis**: The text is processed by an [analyzer](./analyzer-overview) (when `token_level` is `"word"`) or used directly (when `token_level` is `"char"`). Word-level tokenization applies the analyzer configured on the input field to segment text into terms — for example, `"milvus is vector db"` becomes `["milvus", "is", "vector", "db"]`.

1. **Shingling**: The tokens are split into overlapping n-grams (shingles) of size `shingle_size`. For example, with 3-grams at word level, the tokens `["information", "retrieval", "is", "a", "field"]` become shingles like `["information retrieval is", "retrieval is a", "is a field"]`.

1. **MinHash signature generation**: Multiple hash functions (H1, H2, ..., Hn, where n = `num_hashes`) are applied to the shingle set. For each hash function, the minimum hash value across all shingles is selected. The collection of these minimum values forms the MinHash signature — a fixed-length representation that approximates the Jaccard similarity of the original document.

1. **Binary vector encoding**: Each signature value is a 32-bit hash, and the full signature is packed into a `BINARY_VECTOR` of dimension `32 * num_hashes`.

### Document ingestion\{#document-ingestion}

During insertion, the binary vector produced by the shared pipeline is stored in the `MINHASH_LSH` index. The index maintains an LSH (Locality-Sensitive Hashing) table that groups similar signatures into the same buckets, enabling fast candidate retrieval at query time.

### Query processing\{#query-processing}

During search, the query text goes through the same shared pipeline to produce a binary vector. This vector is used to perform an LSH lookup in the `MINHASH_LSH` index, which quickly identifies candidate pairs that are likely similar. Candidates are then ranked by estimated Jaccard similarity and the top-K results are returned.

Because both paths share the same transformation logic, two documents with highly overlapping content produce similar MinHash signatures. This makes the function effective for finding near-duplicates even when documents differ in word order, formatting, or minor phrasing.

</details>

## Before you start\{#before-you-start}

Before using the MinHash function, plan your collection schema to include the following:

- **A text field for raw content**

    Your collection must include a `VARCHAR` field to store raw text. This field serves as the input to the MinHash function.

- **An analyzer for the text field** (when using word-level tokenization)

    If `token_level` is set to `"word"` (default), the text field must have an analyzer enabled. The analyzer defines how text is tokenized before shingling. By default, Zilliz Cloud uses the `standard` analyzer. To configure a different analyzer, refer to [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case).

- **A binary vector field for MinHash output**

    Your collection must include a `BINARY_VECTOR` field to store the binary vectors generated by the MinHash function. The dimension must equal `32 * num_hashes`.

## Step 1: Create a collection with a MinHash function\{#step-1-create-a-collection-with-a-minhash-function}

To use the MinHash function, define it when creating the collection. The function becomes part of the collection schema and is applied automatically during data insertion and search.

### Define schema fields\{#define-schema-fields}

Your collection schema must include at least three fields:

- **Primary field**: Uniquely identifies each entity in the collection.

- **Text field** (`VARCHAR`): Stores raw text documents. Set `enable_analyzer=True` so Zilliz Cloud can process the text for MinHash signature generation. By default, Zilliz Cloud uses the `standard` analyzer for text analysis. To configure a different analyzer, refer to [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case).

- **Binary vector field** (`BINARY_VECTOR`): Stores binary vectors automatically generated by the MinHash function. The dimension must equal `32 * num_hashes`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

schema = client.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(field_name="document_content", datatype=DataType.VARCHAR, max_length=9000, enable_analyzer=True)
schema.add_field(field_name="binary_vector", datatype=DataType.BINARY_VECTOR, dim=8192)
```

</TabItem>

<TabItem value='java'>

```java
// java
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

### Define the MinHash function\{#define-the-minhash-function}

The MinHash function converts analyzed text into binary vectors that approximate Jaccard similarity between documents.

Define the function and add it to your schema:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
minhash_function = Function(
    name="minhash_function",
    input_field_names=["document_content"], # Name of the VARCHAR field containing raw text
    output_field_names=["binary_vector"], # Name of the BINARY_VECTOR field for generated signatures
    function_type=FunctionType.MINHASH,
    params={
        "num_hashes": 256, # Number of hash functions; produces dim = 32 * 256 = 8192
        "shingle_size": 3, # N-gram size for shingling
    }
)

schema.add_function(minhash_function)
```

</TabItem>

<TabItem value='java'>

```java
// java
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

**Configuration options**

The `params` dictionary of the MinHash function accepts the following parameters. All parameter names are **case-insensitive**.

<table>
   <tr>
     <th><p><strong>Parameter</strong></p></th>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Default</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><code>num_hashes</code></p></td>
     <td><p>int</p></td>
     <td><p>Derived from <code>dim / 32</code></p></td>
     <td><p>Number of hash functions for signature generation. The output binary vector dimension equals <code>32 &ast; num_hashes</code>. Higher values reduce variance in similarity estimation but increase computation. Recommended: <code>256</code> (dim = 8192).</p></td>
   </tr>
   <tr>
     <td><p><code>shingle_size</code></p></td>
     <td><p>int</p></td>
     <td><p><code>3</code></p></td>
     <td><p>N-gram size for shingling. Word-level: 1-3 is typical. Character-level: 2-6 is typical.</p></td>
   </tr>
   <tr>
     <td><p><code>hash_function</code></p></td>
     <td><p>str</p></td>
     <td><p><code>&quot;xxhash&quot;</code></p></td>
     <td><p>Hash function to use. Options:</p><ul><li><p><code>&quot;xxhash&quot;</code> (fast)</p></li><li><p><code>&quot;sha1&quot;</code> (slower, higher collision resistance).</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>token_level</code></p></td>
     <td><p>str</p></td>
     <td><p><code>&quot;word&quot;</code></p></td>
     <td><p>Tokenization level. Options:</p><ul><li><p><code>&quot;word&quot;</code>: uses the field's analyzer for tokenization, then applies n-gram shingling.</p></li><li><p><code>&quot;char&quot;</code> / <code>&quot;character&quot;</code>: applies n-gram shingling directly on raw characters (no analyzer).</p></li></ul><p>Word-level provides stronger semantics and higher efficiency but depends on language-specific tokenization. Character-level is language-agnostic but produces higher-dimensional shingles with weaker semantics.</p></td>
   </tr>
   <tr>
     <td><p><code>seed</code></p></td>
     <td><p>int</p></td>
     <td><p><code>1234</code></p></td>
     <td><p>Random seed for MinHash function initialization.</p></td>
   </tr>
</table>

### Configure the index\{#configure-the-index}

The recommended index type for MinHash binary vectors is `MINHASH_LSH`, with metric type `MHJACCARD`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="binary_vector",
    index_type="MINHASH_LSH",
    metric_type="MHJACCARD",
    params={
        "mh_lsh_band": 128,
        "mh_element_bit_width": 32,
        "with_raw_data": True,
    },
)
```

</TabItem>

<TabItem value='java'>

```java
// java
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

### Create the collection\{#create-the-collection}

Create the collection using the schema and index parameters defined above:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="dedup_collection",
    schema=schema,
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
// java
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## Step 2: Insert documents\{#step-2-insert-documents}

After setting up your collection, insert text data. You only need to provide the raw text — the MinHash function automatically generates the binary vector for each document.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.insert(
    "dedup_collection",
    [
        {"document_content": "information retrieval is a field of study that helps users find relevant information in large datasets"},
        {"document_content": "information retrieval is a research field focused on helping users find relevant data in large collections"},
        {"document_content": "information retrieval is a field of research helping users search for relevant information in large datasets"},
    ],
)
```

</TabItem>

<TabItem value='java'>

```java
// java
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## Step 3: Search with MinHash\{#step-3-search-with-minhash}

Once you have inserted data, search for near-duplicate documents by providing raw text queries. Zilliz Cloud automatically converts your query text into a MinHash binary vector and retrieves the most similar documents using estimated Jaccard similarity.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
search_params = {
    "metric_type": "MHJACCARD",
    "params": {},
}

results = client.search(
    collection_name="dedup_collection",
    data=["information retrieval is a research field focused on helping users find relevant data in large collections"],
    anns_field="binary_vector",
    limit=3,
    output_fields=["document_content"],
    search_params=search_params,
)

for hits in results:
    for hit in hits:
        print(f"ID: {hit['id']}, Distance: {hit['distance']}")
        print(f"Document: {hit['entity']['document_content']}")
```

</TabItem>

<TabItem value='java'>

```java
// java
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## What's next\{#whats-next}

- [Full Text Search](./full-text-search): Use BM25 for lexical relevance ranking instead of near-duplicate detection.

- [Analyzer Overview](./analyzer-overview): Configure custom analyzers for text tokenization.

- [MINHASH_LSH Index](./minhash-lsh): Learn about tuning LSH parameters for recall and performance.

