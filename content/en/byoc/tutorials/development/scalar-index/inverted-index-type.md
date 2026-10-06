---
title: "INVERTED | BYOC"
slug: /inverted-index-type
sidebar_label: "INVERTED"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "When you need to perform frequent filter queries on your data, `INVERTED` indexes can dramatically improve query performance. Instead of scanning through all documents, Zilliz Cloud uses inverted indexes to quickly locate the exact records that match your filter conditions. | BYOC"
type: origin
token: YNczwtWpFiN0CckMvDVcn0pvnEb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# INVERTED

When you need to perform frequent filter queries on your data, `INVERTED` indexes can dramatically improve query performance. Instead of scanning through all documents, Zilliz Cloud uses inverted indexes to quickly locate the exact records that match your filter conditions.

## When to use INVERTED indexes\{#when-to-use-inverted-indexes}

Use INVERTED indexes when you need to:

- **Filter by specific values**: Find all records where a field equals a specific value (e.g., `category == "electronics"`)

- **Filter text content**: Perform efficient searches on `VARCHAR` fields

- **Query JSON field values**: Filter on specific keys within JSON structures

**Performance benefit**: INVERTED indexes can reduce query time from seconds to milliseconds on large datasets by eliminating the need for full collection scans.

## How INVERTED indexes work\{#how-inverted-indexes-work}

An **INVERTED index** in Zilliz Cloud maps each unique field value (term) to the set of document IDs where that value occurs. This structure enables fast lookups for fields with repeated or categorical values.

As shown in the diagram, the process works in two steps:

1. **Forward mapping (ID → Term):** Each document ID points to the field value it contains.

1. **Inverted mapping (Term → IDs):** Zilliz Cloud collects unique terms and builds a reverse mapping from each term to all IDs that contain it.

For example, the value **"electronics"** maps to IDs **1** and **3**, while **"books"** maps to IDs **2** and **5**.

![A19NwPlGIh1YrGbSBZKcNKz0nhd](https://zdoc-images.s3.us-west-2.amazonaws.com/A19NwPlGIh1YrGbSBZKcNKz0nhd.png)

When you filter for a specific value (e.g., `category == "electronics"`), Zilliz Cloud simply looks up the term in the index and retrieves the matching IDs directly. This avoids scanning the full dataset and enables fast filtering, especially for categorical or repeated values.

INVERTED indexes support all scalar field types, such as **BOOL**, **INT8**, **INT16**, **INT32**, **INT64**, **FLOAT**, **DOUBLE**, **VARCHAR**, **JSON**, and **ARRAY**. However, the index parameters for indexing a JSON field are slightly different from regular scalar fields.

## Create indexes on non-JSON fields\{#create-indexes-on-non-json-fields}

To create an index on a non-JSON field, follow these steps:

1. Prepare your index parameters:

    ```python
    from pymilvus import MilvusClient
    
    client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address
    
    # Create an empty index parameter object
    index_params = client.prepare_index_params()
    ```

1. Add the `INVERTED` index:

    ```python
    index_params.add_index(
        field_name="category",           # Name of the field to index
        # highlight-next-line
        index_type="INVERTED",          # Specify INVERTED index type
        index_name="category_index"     # Give your index a name
    )
    ```

1. Create the index:

    ```python
    client.create_index(
        collection_name="my_collection", # Replace with your collection name
        index_params=index_params
    )
    ```

## Create indexes on JSON fields\{#create-indexes-on-json-fields}

You can also create INVERTED indexes on specific paths within JSON fields. This requires additional parameters to specify the JSON path and data type:

```python
# Build index params
index_params.add_index(
    field_name="metadata",                    # JSON field name
    # highlight-next-line
    index_type="INVERTED",
    index_name="metadata_category_index",
    # highlight-start
    params={
        "json_path": "metadata[\"category\"]",    # Path to the JSON key
        "json_cast_type": "varchar"              # Data type to cast to during indexing
    }
    # highlight-end
)

# Create index
client.create_index(
    collection_name="my_collection", # Replace with your collection name
    index_params=index_params
)
```

For detailed information about JSON field indexing, including supported paths, data types, and limitations, refer to [JSON Indexing](./json-indexing).

## Drop an index\{#drop-an-index}

Use the `drop_index()` method to remove an existing index from a collection.

<Admonition type="info" title="Notes">

In your cluster compatible with **Milvus v2.6.x**, you can drop a scalar index directly once it’s no longer needed—no need to release the collection first.

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_index" # Name of the index to drop
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DropIndexReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

client.dropIndex(DropIndexReq.builder()
        .collectionName("my_collection")
        .indexName("category_index")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

err := client.DropIndex(ctx, milvusclient.NewDropIndexOption("my_collection", "category_index"))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN")).await?;

client
    .drop_index(
        DropIndexRequest::builder()
            .collection_name("my_collection")
            .index_name("category_index")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->DropIndex(milvus::DropIndexRequest()
                           .WithCollectionName("my_collection")
                           .WithIndexName("category_index"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
});

await client.dropIndex({
    collection_name: "my_collection",
    index_name: "category_index"
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "indexName": "category_index"
}'
```

</TabItem>
</Tabs>

## Best practices\{#best-practices}

- **Create indexes after loading data**: Build indexes on collections that already contain data for better performance

- **Use descriptive index names**: Choose names that clearly indicate the field and purpose

- **Monitor index performance**: Check query performance before and after creating indexes

- **Consider your query patterns**: Create indexes on fields you frequently filter by

## Next steps\{#next-steps}

- Learn about [AUTOINDEX](./autoindex-explained).

- See [JSON Indexing](./json-indexing) for advanced JSON indexing scenarios

