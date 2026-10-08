---
title: "MINHASH_LSH | Cloud"
slug: /minhash-lsh
sidebar_label: "MINHASH_LSH"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Efficient deduplication and similarity search are critical for large-scale machine learning datasets, especially for tasks like cleaning training corpora for Large Language Models (LLMs). When dealing with millions or billions of documents, traditional exact matching becomes too slow and costly. | Cloud"
type: origin
token: BYtDwHuOXiG7imkyIjHcWa6fnlb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MINHASH_LSH

Efficient deduplication and similarity search are critical for large-scale machine learning datasets, especially for tasks like cleaning training corpora for Large Language Models (LLMs). When dealing with millions or billions of documents, traditional exact matching becomes too slow and costly.

The **MINHASH_LSH** index in Zilliz Cloud enables fast, scalable, and accurate approximate deduplication by combining two powerful techniques:

- [MinHash](https://en.wikipedia.org/wiki/MinHash): Quickly generates compact signatures (or "fingerprints") to estimate document similarity.

- [Locality-Sensitive Hashing (LSH)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing): Rapidly finds groups of similar documents based on their MinHash signatures.

This guide walks you through the concepts, prerequisites, setup, and best practices for using MINHASH_LSH in Zilliz Cloud.

## Overview\{#overview}

<details>

<summary>Expand to see how it works</summary>

### Jaccard similarity\{#jaccard-similarity}

Jaccard similarity measures the overlap between two sets A and B, formally defined as:

$$
J(A, B) = \frac{|A \cap B|}{|A \cup B|}
$$

Where its value ranges from 0 (completely disjoint) to 1 (identical).

However, computing Jaccard similarity exactly between all document pairs in large-scale datasets is computationally expensive—**O(n²)** in time and memory when **n** is large. This makes it infeasible for use cases such as LLM training corpus cleaning or web-scale document analysis.

### MinHash signatures: Approximate Jaccard similarity\{#minhash-signatures-approximate-jaccard-similarity}

[MinHash](https://en.wikipedia.org/wiki/MinHash) is a probabilistic technique that offers an efficient way to estimate Jaccard similarity. It works by transforming each set into a compact **signature vector**, preserving enough information to approximate set similarity efficiently.

**The core idea**:

The more similar the two sets are, the more likely their MinHash signatures will match at the same positions. This property enables MinHash to approximate the Jaccard similarity between sets.

This property allows MinHash to **approximate the Jaccard similarity** between sets without needing to compare the full sets directly.

The MinHash process involves:

1. **Shingling**: Convert documents into sets of overlapping token sequences (shingles)

1. **Hashing**: Apply multiple independent hash functions to each shingle

1. **Min Selection**: For each hash function, record the **minimum** hash value across all shingles

You can see the entire process illustrated below:

![CCzEwT7uchMqI6bsxRJcK1qenEh](https://zdoc-images.s3.us-west-2.amazonaws.com/CCzEwT7uchMqI6bsxRJcK1qenEh.png)

<Admonition type="info" title="Notes">

The number of hash functions used determines the dimensionality of the MinHash signature. Higher dimensions provide better approximation accuracy, at the cost of increased storage and computation.

</Admonition>

### LSH for MinHash\{#lsh-for-minhash}

While MinHash signatures significantly reduce the cost of computing exact Jaccard similarity between documents, exhaustively comparing every pair of signature vectors is still inefficient at scale.

To solve this, [LSH](https://zilliz.com/learn/Local-Sensitivity-Hashing-A-Comprehensive-Guide) is used. LSH enables fast approximate similarity search by ensuring that similar items are hashed into the same "bucket" with high probability — avoiding the need to compare every pair directly.

The process involves:

1. **Signature segmentation:**

    An *n*-dimensional MinHash signature is divided into *b* bands. Each band contains *r* consecutive hash values, so the total signature length satisfies: *n = b × r*.

    For example, if you have a 128-dimensional MinHash signature (*n = 128*) and divide it into 32 bands (*b = 32*), then each band contains 4 hash values (*r = 4*).

1. **Band-level hashing:**

    After segmentation, each band is independently processed using a standard hash function to assign it to a bucket. If two signatures produce the same hash value within a band—i.e., they fall into the same bucket—they are considered potential matches.

1. **Candidate selection:**

    Pairs that collide in at least one band are selected as similarity candidates.

<Admonition type="info" title="Notes">

Why it works?

Mathematically, if two signatures have Jaccard similarity $s$,

- The probability they are identical in one row (hash position) is $s$

- The probability they match in all $r$ rows of a band is $s^r$

- The probability that they match in **at least one band** is &#36;1 - (1 - s^r)^b$

For details, refer to [Locality-sensitive hashing](https://en.wikipedia.org/wiki/Locality-sensitive_hashing).

</Admonition>

Consider three documents with 128-dimensional MinHash signatures:

![E1dewMnqshua0ib7aHmcL10lnIe](https://zdoc-images.s3.us-west-2.amazonaws.com/E1dewMnqshua0ib7aHmcL10lnIe.png)

First, LSH divides the 128-dimensional signature into 32 bands of 4 consecutive values each:

![PhSMwS74rh25oybv9Docmfionze](https://zdoc-images.s3.us-west-2.amazonaws.com/PhSMwS74rh25oybv9Docmfionze.png)

Then, each band is hashed into different buckets using a hash function. Document pairs sharing buckets are selected as similarity candidates. In the example below, Document A and Document B are selected as similarity candidates as their hash results collide in **Band 0**:

![RfmMwNkIvhlUFSb11alcP8fqnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/RfmMwNkIvhlUFSb11alcP8fqnmf.png)

<Admonition type="info" title="Notes">

The number of bands is controlled by the `mh_lsh_band` parameter. For more information, refer to [Index building params](./minhash-lsh#index-building-params).

</Admonition>

### MHJACCARD: Comparing MinHash signatures\{#mhjaccard-comparing-minhash-signatures}

MinHash signatures approximate the Jaccard similarity between sets using fixed-length binary vectors. However, since these signatures do not preserve the original sets, standard metrics such as `JACCARD`, `L2`, or `COSINE` cannot be directly applied to compare them.

To address this, Zilliz Cloud introduces a specialized metric type called `MHJACCARD`, designed specifically for comparing MinHash signatures.

When using MinHash in Zilliz Cloud:

- The vector field must be of type `BINARY_VECTOR`

- The `index_type` must be `MINHASH_LSH` (or `BIN_FLAT`)

- The `metric_type` must be set to `MHJACCARD`

Using other metrics will either be invalid or yield incorrect results.

For more information about this metric type, refer to [MHJACCARD](./search-metrics-explained#mhjaccard).

### Deduplication workflow\{#deduplication-workflow}

The deduplication process powered by MinHash LSH allows Zilliz Cloud to efficiently identify and filter out near-duplicate text or structured records before inserting them into the collection.

![It9wwbCFwhfT0RbwosAcGltZneb](https://zdoc-images.s3.us-west-2.amazonaws.com/It9wwbCFwhfT0RbwosAcGltZneb.png)

1. **Chunk & preprocess**: Split incoming text data or structured data (e.g., records, fields) into chunks; normalize text (lowercasing, punctuation removal), and remove stopwords as needed.

1. **Feature construction**: Build the token set used for MinHash (e.g., shingles from text; concatenated field tokens for structured data).

1. **MinHash signature generation**: Compute MinHash signatures for each chunk or record.

1. **Binary vector conversion**: Convert the signature to a binary vector compatible with Milvus.

1. **Search before insert**: Use the MinHash LSH index to search the target collection for near-duplicates of the incoming item.

1. **Insert & store**: Insert only unique items into the collection. They become searchable for future dedup checks.

</details>

## Prerequisites\{#prerequisites}

Before using MinHash LSH in Zilliz Cloud, you must first generate **MinHash signatures**. These compact binary signatures approximate Jaccard similarity between sets and are required for `MHJACCARD`-based search in Zilliz Cloud.

<Admonition type="info" title="Notes">

You can prepare MinHash signatures for the `MINHASH_LSH` index in two ways:

- Generate signatures yourself using external tools and insert them into a BINARY_VECTOR field, or

- Use the built-in MinHash function to automatically generate compatible binary vectors from text. For the end-to-end workflow and configuration options of the MinHash function, see [MinHash Function](./minhash-function).

</Admonition>

### Choose a method to generate MinHash signatures\{#choose-a-method-to-generate-minhash-signatures}

Depending on your workload, you can choose:

- Use Python's [`datasketch`](https://ekzhu.github.io/datasketch/) for simplicity (recommended for prototyping)

- Use distributed tools (e.g., Spark, Ray) for large-scale datasets

- Implement custom logic (NumPy, C++, etc.) if performance tuning is critical

In this guide, we use `datasketch` for simplicity and compatibility with Zilliz Cloud input format.

### Install required libraries\{#install-required-libraries}

Install the necessary packages for this example:

```bash
pip install pymilvus datasketch numpy
```

### Generate MinHash signatures\{#generate-minhash-signatures}

We'll generate 256-dimensional MinHash signatures, with each hash value represented as a 64-bit integer. This aligns with the expected vector format for `MINHASH_LSH`.

```python
from datasketch import MinHash
import numpy as np

MINHASH_DIM = 256
HASH_BIT_WIDTH = 64

def generate_minhash_signature(text, num_perm=MINHASH_DIM) -> bytes:
    m = MinHash(num_perm=num_perm)
    for token in text.lower().split():
        m.update(token.encode("utf8"))
    return m.hashvalues.astype('>u8').tobytes()  # Returns 2048 bytes
```

Each signature is 256 × 64 bits = 2048 bytes. This byte string can be directly inserted into a `BINARY_VECTOR` field. For more information on binary vectors used in Zilliz Cloud, refer to [Binary Vector](./use-binary-vector).

### (Optional) Prepare raw token sets (for refined search)\{#optional-prepare-raw-token-sets-for-refined-search}

By default, Zilliz Cloud uses only the MinHash signatures and LSH index to find approximate neighbors. This is fast but may return false positives or miss close matches.

If you want **accurate Jaccard similarity**, Zilliz Cloud supports refined search that uses original token sets. To enable it:

- Store token sets as a separate `VARCHAR` field

- Set `"with_raw_data": True` when [building index parameters](./minhash-lsh#build-index-parameters-and-create-collection)

- And enable `"mh_search_with_jaccard": True` when [performing similarity search](./minhash-lsh#perform-similarity-search)

**Token set extraction example**:

```python
def extract_token_set(text: str) -> str:
    tokens = set(text.lower().split())
    return " ".join(tokens)
```

## Use MinHash LSH\{#use-minhash-lsh}

Once your MinHash vectors and original token sets are ready, you can store, index, and search them using Zilliz Cloud with `MINHASH_LSH`.

### Connect to your cluster\{#connect-to-your-cluster}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")  # Update if your URI is different
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    log.Fatal(err)
}
defer cli.Close(ctx)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");
let client = ClientV2::new(&config).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({ address: 'YOUR_CLUSTER_ENDPOINT' });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"
```

</TabItem>
</Tabs>

### Define collection schema\{#define-collection-schema}

Define a schema with:

- The primary key

- A `BINARY_VECTOR` field for the MinHash signatures

- A `VARCHAR` field for the original token set (if refined search is enabled)

- Optionally, a `document` field for original text

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType

VECTOR_DIM = MINHASH_DIM * HASH_BIT_WIDTH  # 256 × 64 = 16384 bits

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("doc_id", DataType.INT64, is_primary=True)
schema.add_field("minhash_signature", DataType.BINARY_VECTOR, dim=VECTOR_DIM)
schema.add_field("token_set", DataType.VARCHAR, max_length=1000)  # required for refinement
schema.add_field("document", DataType.VARCHAR, max_length=1000)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

int VECTOR_DIM = 256 * 64;  // 256 × 64 = 16384 bits

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(false)
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("doc_id").dataType(DataType.Int64).isPrimaryKey(true).build());
schema.addField(AddFieldReq.builder()
        .fieldName("minhash_signature").dataType(DataType.BinaryVector).dimension(VECTOR_DIM).build());
schema.addField(AddFieldReq.builder()
        .fieldName("token_set").dataType(DataType.VarChar).maxLength(1000).build());
schema.addField(AddFieldReq.builder()
        .fieldName("document").dataType(DataType.VarChar).maxLength(1000).build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
)

// 256 × 64 = 16384 bits
schema := entity.NewSchema().
    WithField(entity.NewField().WithName("doc_id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
    WithField(entity.NewField().WithName("minhash_signature").WithDataType(entity.FieldTypeBinaryVector).WithDim(256 * 64)).
    WithField(entity.NewField().WithName("token_set").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000)).
    WithField(entity.NewField().WithName("document").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// 256 × 64 = 16384 bits
let schema = CollectionSchema::new()
    .enable_dynamic_field(false)
    .add_field(FieldSchema::new().name("doc_id").data_type(DataType::Int64).primary_key(true))
    .add_field(FieldSchema::new().name("minhash_signature").data_type(DataType::BinaryVector).dimension(256 * 64))
    .add_field(FieldSchema::new().name("token_set").data_type(DataType::VarChar).max_length(1000))
    .add_field(FieldSchema::new().name("document").data_type(DataType::VarChar).max_length(1000));
```

</TabItem>

<TabItem value='c++'>

```c++
const int VECTOR_DIM = 256 * 64;  // 256 × 64 = 16384 bits

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"doc_id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("minhash_signature", milvus::DataType::BINARY_VECTOR).WithDimension(VECTOR_DIM));
schema->AddField(milvus::FieldSchema("token_set", milvus::DataType::VARCHAR).WithMaxLength(1000));
schema->AddField(milvus::FieldSchema("document", milvus::DataType::VARCHAR).WithMaxLength(1000));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const VECTOR_DIM = 256 * 64; // 256 × 64 = 16384 bits

const schema = [
  { name: 'doc_id', data_type: DataType.Int64, is_primary_key: true },
  { name: 'minhash_signature', data_type: DataType.BinaryVector, dim: VECTOR_DIM },
  { name: 'token_set', data_type: DataType.VarChar, max_length: 1000 },
  { name: 'document', data_type: DataType.VarChar, max_length: 1000 },
];
```

</TabItem>

<TabItem value='bash'>

```bash
SCHEMA='{
  "autoId": false,
  "enableDynamicField": false,
  "fields": [
    {"fieldName": "doc_id", "dataType": "Int64", "isPrimary": true},
    {"fieldName": "minhash_signature", "dataType": "BinaryVector", "elementTypeParams": {"dim": "16384"}},
    {"fieldName": "token_set", "dataType": "VarChar", "elementTypeParams": {"max_length": "1000"}},
    {"fieldName": "document", "dataType": "VarChar", "elementTypeParams": {"max_length": "1000"}}
  ]
}'
```

</TabItem>
</Tabs>

### Build index parameters and create collection\{#build-index-parameters-and-create-collection}

Build a `MINHASH_LSH` index with Jaccard refinement enabled:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="minhash_signature",
    index_type="MINHASH_LSH",
    metric_type="MHJACCARD",
    params={
        "mh_element_bit_width": HASH_BIT_WIDTH,  # Must match signature bit width
        "mh_lsh_band": 16,                       # Band count (256/16 = 16 hashes per band)
        "with_raw_data": True                    # Required for Jaccard refinement
    }
)

client.create_collection("minhash_demo", schema=schema, index_params=index_params)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.Collections;

IndexParam indexParam = IndexParam.builder()
        .fieldName("minhash_signature")
        .indexType(IndexParam.IndexType.MINHASH_LSH)
        .metricType(IndexParam.MetricType.MHJACCARD)
        .extraParams(new java.util.HashMap<String, Object>() {{
            put("mh_element_bit_width", 64);
            put("mh_lsh_band", 16);
            put("with_raw_data", true);
        }})
        .build();

client.createCollection(CreateCollectionReq.builder()
        .collectionName("minhash_demo")
        .collectionSchema(schema)
        .indexParams(Collections.singletonList(indexParam))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

idx := index.NewMinHashLSHIndex(entity.MHJACCARD, 16).
    WithElementBitWidth(64).
    WithRawData(true)

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("minhash_demo", schema).
    WithIndexOptions(milvusclient.NewCreateIndexOption("minhash_demo", "minhash_signature", idx)))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let index_param = IndexParam::new()
    .field_name("minhash_signature")
    .index_type(IndexType::MinhashLsh)
    .metric_type(MetricType::MhJaccard)
    .extra_params(HashMap::from([
        ("mh_element_bit_width".into(), "64".into()),
        ("mh_lsh_band".into(), "16".into()),
        ("with_raw_data".into(), "true".into()),
    ]));

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("minhash_demo")
            .schema(schema)
            .index_param(index_param)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc index_vector("minhash_signature", "", milvus::IndexType::MINHASH_LSH, milvus::MetricType::MHJACCARD);
index_vector.AddExtraParam("mh_element_bit_width", "64");
index_vector.AddExtraParam("mh_lsh_band", "16");
index_vector.AddExtraParam("with_raw_data", "true");

auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                .WithCollectionName("minhash_demo")
                                .WithCollectionSchema(schema)
                                .AddIndex(std::move(index_vector)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
  collection_name: 'minhash_demo',
  fields: schema,
  index_params: [{
    field_name: 'minhash_signature',
    index_type: 'MINHASH_LSH',
    metric_type: 'MHJACCARD',
    params: { mh_element_bit_width: 64, mh_lsh_band: 16, with_raw_data: true },
  }],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data "{
    \"collectionName\": \"minhash_demo\",
    \"schema\": ${SCHEMA},
    \"indexParams\": [
        {
            \"fieldName\": \"minhash_signature\",
            \"indexType\": \"MINHASH_LSH\",
            \"metricType\": \"MHJACCARD\",
            \"params\": {\"mh_element_bit_width\": \"64\", \"mh_lsh_band\": \"16\", \"with_raw_data\": \"true\"}
        }
    ]
}"
```

</TabItem>
</Tabs>

For more information on index building parameters, refer to [Index building params](./minhash-lsh#index-building-params).

### Insert data\{#insert-data}

For each document, prepare:

- A binary MinHash signature

- A serialized token set string

- (Optionally) the original text

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
documents = [
    "machine learning algorithms process data automatically",
    "deep learning uses neural networks to model patterns"
]

insert_data = []
for i, doc in enumerate(documents):
    sig = generate_minhash_signature(doc)
    token_str = extract_token_set(doc)
    insert_data.append({
        "doc_id": i,
        "minhash_signature": sig,
        "token_set": token_str,
        "document": doc
    })

client.insert("minhash_demo", insert_data)
client.flush("minhash_demo")
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.ArrayList;
import java.util.List;

// MinHash signatures (2048 bytes each) generated externally, e.g. via datasketch.
// `signatures[i]` corresponds to `documents[i]`.
String[] documents = {
    "machine learning algorithms process data automatically",
    "deep learning uses neural networks to model patterns"
};
String[] tokenSets = {
    "automatically learning data machine algorithms process",
    "learning uses deep neural networks to model patterns"
};
byte[][] signatures = { signature0, signature1 };

Gson gson = new Gson();
List<JsonObject> rows = new ArrayList<>();
for (int i = 0; i < documents.length; i++) {
    JsonObject row = new JsonObject();
    row.addProperty("doc_id", i);
    row.add("minhash_signature", gson.toJsonTree(signatures[i]));
    row.addProperty("token_set", tokenSets[i]);
    row.addProperty("document", documents[i]);
    rows.add(row);
}

client.insert(InsertReq.builder()
        .collectionName("minhash_demo")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/column"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// MinHash signatures (2048 bytes each) generated externally, e.g. via datasketch.
// `signatures[i]` corresponds to `documents[i]`.
documents := []string{
    "machine learning algorithms process data automatically",
    "deep learning uses neural networks to model patterns",
}
tokenSets := []string{
    "automatically learning data machine algorithms process",
    "learning uses deep neural networks to model patterns",
}
signatures := [][]byte{signature0, signature1}

result, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("minhash_demo").
    WithInt64Column("doc_id", []int64{0, 1}).
    WithColumns(
        column.NewColumnBinaryVector("minhash_signature", 16384, signatures),
        column.NewColumnVarChar("token_set", tokenSets),
        column.NewColumnVarChar("document", documents),
    ))
if err != nil {
    log.Fatal(err)
}
log.Println("insert count:", result.InsertCount)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

// MinHash signatures (2048 bytes each) generated externally, e.g. via datasketch.
// `signatures[i]` corresponds to `documents[i]`.
let documents = [
    "machine learning algorithms process data automatically",
    "deep learning uses neural networks to model patterns",
];
let token_sets = [
    "automatically learning data machine algorithms process",
    "learning uses deep neural networks to model patterns",
];
let signatures: [Vec<u8>; 2] = [signature0, signature1];

for i in 0..documents.len() {
    client
        .insert(
            InsertRequest::builder()
                .collection_name("minhash_demo")
                .row(json!({
                    "doc_id": i,
                    "minhash_signature": signatures[i],
                    "token_set": token_sets[i],
                    "document": documents[i],
                }))
                .build()?,
        )
        .await?;
}
```

</TabItem>

<TabItem value='c++'>

```c++
// MinHash signatures (2048 bytes each) generated externally, e.g. via datasketch.
// `signatures[i]` corresponds to `documents[i]`.
std::vector<std::vector<uint8_t>> signatures = {signature0, signature1};

milvus::EntityRows data = {
    {{"doc_id", 0}, {"minhash_signature", signatures[0]},
     {"token_set", "automatically learning data machine algorithms process"},
     {"document", "machine learning algorithms process data automatically"}},
    {{"doc_id", 1}, {"minhash_signature", signatures[1]},
     {"token_set", "learning uses deep neural networks to model patterns"},
     {"document", "deep learning uses neural networks to model patterns"}},
};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("minhash_demo")
                                .WithRowsData(std::move(data)),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// MinHash signatures (2048 bytes each) generated externally, e.g. via datasketch.
// `signatures[i]` corresponds to `documents[i]`.
const documents = [
  'machine learning algorithms process data automatically',
  'deep learning uses neural networks to model patterns',
];
const tokenSets = [
  'automatically learning data machine algorithms process',
  'learning uses deep neural networks to model patterns',
];
const signatures = [signature0, signature1]; // Buffer(2048) each

const rows = documents.map((doc, i) => ({
  doc_id: i,
  minhash_signature: signatures[i],
  token_set: tokenSets[i],
  document: doc,
}));

await client.insert({
  collection_name: 'minhash_demo',
  data: rows,
});
```

</TabItem>

<TabItem value='bash'>

```bash
# MinHash signatures (2048 bytes each) generated externally, e.g. via datasketch,
# and base64-encoded for the REST insert.
SIGNATURE_0="<base64 of the 2048-byte MinHash signature>"
SIGNATURE_1="<base64 of the 2048-byte MinHash signature>"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data "{
    \"collectionName\": \"minhash_demo\",
    \"data\": [
        {
            \"doc_id\": 0,
            \"minhash_signature\": \"${SIGNATURE_0}\",
            \"token_set\": \"automatically learning data machine algorithms process\",
            \"document\": \"machine learning algorithms process data automatically\"
        },
        {
            \"doc_id\": 1,
            \"minhash_signature\": \"${SIGNATURE_1}\",
            \"token_set\": \"learning uses deep neural networks to model patterns\",
            \"document\": \"deep learning uses neural networks to model patterns\"
        }
    ]
}"
```

</TabItem>
</Tabs>

### Perform similarity search\{#perform-similarity-search}

Zilliz Cloud supports two modes of similarity search using MinHash LSH:

- **Approximate search** — uses only MinHash signatures and LSH for fast but probabilistic results.

- **Refined search** — re-computes Jaccard similarity using original token sets for improved accuracy.

#### 5.1 Prepare the query\{#51-prepare-the-query}

To perform a similarity search, generate a MinHash signature for the query document. This signature must match the same dimension and encoding format used during data insertion.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_text = "deep learning uses neural networks to model patterns"
query_sig = generate_minhash_signature(query_text)
```

</TabItem>

<TabItem value='java'>

```java
String queryText = "deep learning uses neural networks to model patterns";
// MinHash signature of the query text, generated externally (e.g., via datasketch).
byte[] querySignature = querySignatureBytes;
```

</TabItem>

<TabItem value='go'>

```go
queryText := "deep learning uses neural networks to model patterns"
// MinHash signature of the query text, generated externally (e.g., via datasketch).
querySignature := querySignatureBytes
```

</TabItem>

<TabItem value='rust'>

```rust
let query_text = "deep learning uses neural networks to model patterns";
// MinHash signature of the query text, generated externally (e.g., via datasketch).
let query_signature: Vec<u8> = query_signature_bytes;
```

</TabItem>

<TabItem value='c++'>

```c++
std::string query_text = "deep learning uses neural networks to model patterns";
// MinHash signature of the query text, generated externally (e.g., via datasketch).
std::vector<uint8_t> query_signature = query_signature_bytes;
```

</TabItem>

<TabItem value='javascript'>

```javascript
const queryText = 'deep learning uses neural networks to model patterns';
// MinHash signature of the query text, generated externally (e.g., via datasketch).
const querySignature = querySignatureBytes; // Buffer(2048)
```

</TabItem>

<TabItem value='bash'>

```bash
# MinHash signature of the query text, generated externally (e.g., via datasketch),
# and base64-encoded for the REST search request.
QUERY_SIGNATURE="<base64 of the query MinHash signature>"

# Load the collection before searching (REST does not auto-load).
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{"collectionName": "minhash_demo"}'
```

</TabItem>
</Tabs>

#### 5.2 Approximate search (LSH-only)\{#52-approximate-search-lsh-only}

This is fast and scalable but may miss close matches or include false positives:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
search_params={
    "metric_type": "MHJACCARD", 
    "params": {}
}
# highlight-end

approx_results = client.search(
    collection_name="minhash_demo",
    data=[query_sig],
    anns_field="minhash_signature",
    # highlight-next-line
    search_params=search_params,
    limit=3,
    output_fields=["doc_id", "document"],
    consistency_level="Strong"
)

for i, hit in enumerate(approx_results[0]):
    sim = hit['distance']
    print(f"{i+1}. Similarity: {sim:.3f} | {hit['entity']['document']}")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.BinaryVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Collections;

// Approximate search (LSH-only): uses only MinHash signatures and LSH.
SearchResp approxResp = client.search(SearchReq.builder()
        .collectionName("minhash_demo")
        .annsField("minhash_signature")
        .data(Collections.singletonList(new BinaryVec(querySignature)))
        .metricType(IndexParam.MetricType.MHJACCARD)
        .searchParams(Collections.emptyMap())
        .limit(3)
        .outputFields(Collections.singletonList("document"))
        .build());

for (SearchResp.SearchResult hit : approxResp.getSearchResults().get(0)) {
    double sim = hit.getScore();
    System.out.printf("Similarity: %.3f | %s%n", sim, hit.getEntity().get("document"));
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// Approximate search (LSH-only): uses only MinHash signatures and LSH.
resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("minhash_demo", 3, []entity.Vector{entity.BinaryVector(querySignature)}).
    WithANNSField("minhash_signature").
    WithAnnParam(index.NewMinHashLSHAnnParam()).
    WithOutputFields("doc_id", "document"))
if err != nil {
    log.Fatal(err)
}
for _, resultSet := range resultSets {
    docCol := resultSet.GetColumn("document")
    for i := 0; i < resultSet.ResultCount; i++ {
        doc, _ := docCol.GetAsString(i)
        log.Printf("Similarity: %.3f | %s", resultSet.Scores[i], doc)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Approximate search (LSH-only): uses only MinHash signatures and LSH.
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("minhash_demo")
            .vector_field("minhash_signature")
            .vectors(SearchVectors::Binary(vec![query_signature]))
            .metric_type(MetricType::MhJaccard)
            .limit(3)
            .output_fields(["doc_id", "document"])
            .build()?,
    )
    .await?;

for result in response.results() {
    for row in result.rows()? {
        let entity = row.to_entity_row()?;
        let sim = entity.get("distance").unwrap_or_default();
        println!("{:?}", entity);
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
// Approximate search (LSH-only): uses only MinHash signatures and LSH.
auto request = milvus::SearchRequest()
                    .WithCollectionName("minhash_demo")
                    .WithAnnsField("minhash_signature")
                    .WithMetricType(milvus::MetricType::MHJACCARD)
                    .WithLimit(3)
                    .AddOutputField("doc_id")
                    .AddOutputField("document")
                    .AddBinaryVector(query_signature);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto search_results = response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows rows;
    status = result.OutputRows(rows);
    for (const auto& row : rows) {
        std::cout << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Approximate search (LSH-only): uses only MinHash signatures and LSH.
const approx_results = await client.search({
  collection_name: 'minhash_demo',
  data: [querySignature],
  anns_field: 'minhash_signature',
  metric_type: 'MHJACCARD',
  params: {},
  limit: 3,
  output_fields: ['doc_id', 'document'],
  consistency_level: 'Strong',
});
for (const hit of approx_results.results) {
  const sim = hit.score;
  console.log(`Similarity: ${sim.toFixed(3)} | ${hit.document}`);
}
```

</TabItem>

<TabItem value='bash'>

```bash
# Approximate search (LSH-only): uses only MinHash signatures and LSH.
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data "{
    \"collectionName\": \"minhash_demo\",
    \"data\": [\"${QUERY_SIGNATURE}\"],
    \"annsField\": \"minhash_signature\",
    \"metricType\": \"MHJACCARD\",
    \"limit\": 3,
    \"outputFields\": [\"doc_id\", \"document\"]
}"
```

</TabItem>
</Tabs>

#### 5.3 Refined search (recommended for accuracy):\{#53-refined-search-recommended-for-accuracy}

This enables accurate Jaccard comparison using the original token sets stored in Zilliz Cloud. It's slightly slower but recommended for quality-sensitive tasks:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
search_params = {
    "metric_type": "MHJACCARD",
    "params": {
        "mh_search_with_jaccard": True,  # Enable real Jaccard computation
        "refine_k": 5                    # Refine top 5 candidates
    }
}
# highlight-end

refined_results = client.search(
    collection_name="minhash_demo",
    data=[query_sig],
    anns_field="minhash_signature",
    # highlight-next-line
    search_params=search_params,
    limit=3,
    output_fields=["doc_id", "document"],
    consistency_level="Strong"
)

for i, hit in enumerate(refined_results[0]):
    sim = hit['distance']
    print(f"{i+1}. Similarity: {sim:.3f} | {hit['entity']['document']}")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.BinaryVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Collections;

// Refined search: re-computes the exact Jaccard similarity on the candidates.
SearchResp refinedResp = client.search(SearchReq.builder()
        .collectionName("minhash_demo")
        .annsField("minhash_signature")
        .data(Collections.singletonList(new BinaryVec(querySignature)))
        .metricType(IndexParam.MetricType.MHJACCARD)
        .searchParams(new java.util.HashMap<String, Object>() {{
            put("mh_search_with_jaccard", true);
            put("refine_k", 5);
        }})
        .limit(3)
        .outputFields(Collections.singletonList("document"))
        .build());

for (SearchResp.SearchResult hit : refinedResp.getSearchResults().get(0)) {
    double sim = hit.getScore();
    System.out.printf("Similarity: %.3f | %s%n", sim, hit.getEntity().get("document"));
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// Refined search: re-computes the exact Jaccard similarity on the candidates.
resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("minhash_demo", 3, []entity.Vector{entity.BinaryVector(querySignature)}).
    WithANNSField("minhash_signature").
    WithSearchParam("params", `{"mh_search_with_jaccard":true,"refine_k":5}`).
    WithOutputFields("doc_id", "document"))
if err != nil {
    log.Fatal(err)
}
for _, resultSet := range resultSets {
    docCol := resultSet.GetColumn("document")
    for i := 0; i < resultSet.ResultCount; i++ {
        doc, _ := docCol.GetAsString(i)
        log.Printf("Similarity: %.3f | %s", resultSet.Scores[i], doc)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: Refined search (`mh_search_with_jaccard` / `refine_k`) is not supported
// in milvus-sdk-rust as of v3.0.2 — search params are string-typed, and the
// server rejects the string form for MINHASH refinement. Use the approximate
// LSH search above instead; refined Jaccard search is available in the
// Python, Java, Go, and Node.js SDKs.
```

</TabItem>

<TabItem value='c++'>

```c++
// Refined search: re-computes the exact Jaccard similarity on the candidates.
auto request = milvus::SearchRequest()
                    .WithCollectionName("minhash_demo")
                    .WithAnnsField("minhash_signature")
                    .WithMetricType(milvus::MetricType::MHJACCARD)
                    .WithExtraParams({{"mh_search_with_jaccard", "true"}, {"refine_k", "5"}})
                    .WithLimit(3)
                    .AddOutputField("doc_id")
                    .AddOutputField("document")
                    .AddBinaryVector(query_signature);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto search_results = response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows rows;
    status = result.OutputRows(rows);
    for (const auto& row : rows) {
        std::cout << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Refined search: re-computes the exact Jaccard similarity on the candidates.
const refined_results = await client.search({
  collection_name: 'minhash_demo',
  data: [querySignature],
  anns_field: 'minhash_signature',
  metric_type: 'MHJACCARD',
  params: {
    mh_search_with_jaccard: true,
    refine_k: 5,
  },
  limit: 3,
  output_fields: ['doc_id', 'document'],
  consistency_level: 'Strong',
});
for (const hit of refined_results.results) {
  const sim = hit.score;
  console.log(`Similarity: ${sim.toFixed(3)} | ${hit.document}`);
}
```

</TabItem>

<TabItem value='bash'>

```bash
# The REST API accepts only numeric values in search `params`, so the boolean
# `mh_search_with_jaccard` cannot be expressed. Use the approximate LSH search
# (refined Jaccard search is available via the SDKs).
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data "{
    \"collectionName\": \"minhash_demo\",
    \"data\": [\"${QUERY_SIGNATURE}\"],
    \"annsField\": \"minhash_signature\",
    \"metricType\": \"MHJACCARD\",
    \"limit\": 3,
    \"outputFields\": [\"doc_id\", \"document\"]
}"
```

</TabItem>
</Tabs>

## Index params\{#index-params}

This section provides an overview of the parameters used for building an index and performing searches on the index.

### Index building params\{#index-building-params}

The following table lists the parameters that can be configured in `params` when [building an index](./minhash-lsh#build-index-parameters-and-create-collection).

| Parameter | Description | Value Range | Tuning Suggestion |
| --- | --- | --- | --- |
| `mh_element_bit_width` | Bit width of each hash value in the MinHash signature. Must be divisible by 8. | 8, 16, 32, 64 | Use `32` for balanced performance and accuracy. Use `64` for higher precision with larger datasets. Use `16` to save memory with acceptable accuracy loss. |
| `mh_lsh_band` | Number of bands to divide the MinHash signature for LSH. Controls the recall-performance tradeoff. | [1, *signature_length*] | For 128-dim signatures: start with 32 bands (4 values/band). Increase to 64 for higher recall, decrease to 16 for better performance. Must divide signature length evenly. |
| `mh_lsh_code_in_mem` | Whether to store LSH hash codes in anonymous memory (`true`) or use memory mapping (`false`). | true, false | Use `false` for large datasets (>1M sets) to reduce memory usage. Use `true` for smaller datasets requiring maximum search speed. |
| `with_raw_data` | Whether to store original MinHash signatures alongside LSH codes for refinement. | true, false | Use `true` when high precision is required and storage cost is acceptable. Use `false` to minimize storage overhead with slight accuracy reduction. |
| `mh_lsh_bloom_false_positive_prob` | False positive probability for Bloom filter used in LSH bucket optimization. | [0.001, 0.1] | Use `0.01` for balanced memory usage and accuracy. Lower values (`0.001`) reduce false positives but increase memory. Higher values (`0.05`) save memory but may reduce precision. |

### Index-specific search params\{#index-specific-search-params}

The following table lists the parameters that can be configured in `search_params.params` when [searching on the index](./minhash-lsh#perform-similarity-search).

| Parameter | Description | Value Range | Tuning Suggestion |
| --- | --- | --- | --- |
| `mh_search_with_jaccard` | Whether to perform exact Jaccard similarity computation on candidate results for refinement. | true, false | Use `true` for applications requiring high precision (e.g., deduplication). Use `false` for faster approximate search when slight accuracy loss is acceptable. |
| `refine_k` | Number of candidates to retrieve before Jaccard refinement. Only effective when `mh_search_with_jaccard` is `true`. | [*top_k*, *top_k &ast; 10*] | Set to 2-5x the desired *top_k* for good recall-performance balance. Higher values improve recall but increase computation cost. |
| `mh_lsh_batch_search` | Whether to enable batch optimization for multiple simultaneous queries. | true, false | Use `true` when searching with multiple queries simultaneously for better throughput. Use `false` for single-query scenarios to reduce memory overhead. |
