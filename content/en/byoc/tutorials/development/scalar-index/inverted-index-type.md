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

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import MilvusClient
    
    client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address
    
    # Create an empty index parameter object
    index_params = client.prepare_index_params()
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.client.ConnectConfig;
    import io.milvus.v2.client.MilvusClientV2;
    
    // Initialize Milvus client
    MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
            .uri("YOUR_CLUSTER_ENDPOINT") // Replace with your server address
            .build());
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import (
        "context"
        "fmt"
    
        "github.com/milvus-io/milvus/client/v3/milvusclient"
    )
    
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    // Initialize Milvus client
    client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: "YOUR_CLUSTER_ENDPOINT", // Replace with your server address
    })
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    use milvus::v2::prelude::*;
    
    // Initialize Milvus client
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT"); // Replace with your server address
    let client = ClientV2::new(&config).await?;
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    #include "milvus/MilvusClientV2.h"
    
    // Initialize Milvus client
    auto client = milvus::MilvusClientV2::Create();
    auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT")); // Replace with your server address
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { MilvusClient } from "@zilliz/milvus2-sdk-node";
    
    // Initialize Milvus client
    const client = new MilvusClient({
        address: "YOUR_CLUSTER_ENDPOINT", // Replace with your server address
    });
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Replace with your server address
    export TOKEN="YOUR_CLUSTER_TOKEN"
    ```

    </TabItem>
    </Tabs>

1. Add the `INVERTED` index:

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    index_params.add_index(
        field_name="category",           # Name of the field to index
        # highlight-next-line
        index_type="INVERTED",          # Specify INVERTED index type
        index_name="category_index"     # Give your index a name
    )
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.common.IndexParam;
    
    // Add the INVERTED index
    IndexParam indexParam = IndexParam.builder()
            .fieldName("category") // Name of the field to index
            .indexType(IndexParam.IndexType.INVERTED) // Specify INVERTED index type
            .indexName("category_index") // Give your index a name
            .build();
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import "github.com/milvus-io/milvus/client/v3/index"
    
    // Add the INVERTED index
    idx := index.NewInvertedIndex() // Specify INVERTED index type
    idx.WithIndexName("category_index") // Give your index a name
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Add the INVERTED index
    let index_params = vec![
        IndexParam::new()
            .field_name("category") // Name of the field to index
            .index_type(IndexType::Inverted) // Specify INVERTED index type
            .index_name("category_index"), // Give your index a name
    ];
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    // Add the INVERTED index
    milvus::IndexDesc index_desc("category", "category_index", milvus::IndexType::INVERTED); // field name, index name, index type
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { IndexType } from "@zilliz/milvus2-sdk-node";
    
    // Add the INVERTED index
    const indexParams = {
        field_name: "category", // Name of the field to index
        index_type: IndexType.INVERTED, // Specify INVERTED index type
        index_name: "category_index", // Give your index a name
    };
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Add the INVERTED index
    export indexParams='[
        {
            "fieldName": "category", # Name of the field to index
            "indexName": "category_index", # Give your index a name
            "params": {
                "index_type": "INVERTED" # Specify INVERTED index type
            }
        }
    ]'
    ```

    </TabItem>
    </Tabs>

1. Create the index:

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    client.create_index(
        collection_name="my_collection", # Replace with your collection name
        index_params=index_params
    )
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.service.index.request.CreateIndexReq;
    import java.util.Collections;
    
    // Create the index
    client.createIndex(CreateIndexReq.builder()
            .collectionName("my_collection") // Replace with your collection name
            .indexParams(Collections.singletonList(indexParam))
            .build());
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import "github.com/milvus-io/milvus/client/v3/milvusclient"
    
    // Create the index
    _, err = client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "category", idx)) // Replace with your collection name
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Create the index
    client
        .create_index(
            CreateIndexRequest::builder()
                .collection_name("my_collection") // Replace with your collection name
                .index_params(index_params)
                .build()?,
        )
        .await?;
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    // Create the index
    status = client->CreateIndex(milvus::CreateIndexRequest()
                                     .WithCollectionName("my_collection") // Replace with your collection name
                                     .WithIndexes({std::move(index_desc)}));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Create the index
    await client.createIndex({
        collection_name: "my_collection", // Replace with your collection name
        field_name: indexParams.field_name,
        index_type: indexParams.index_type,
        index_name: indexParams.index_name,
    });
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Create the index
    curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d "{
        \"collectionName\": \"my_collection\", # Replace with your collection name
        \"indexParams\": $indexParams
    }"
    ```

    </TabItem>
    </Tabs>

## Create indexes on JSON fields\{#create-indexes-on-json-fields}

You can also create INVERTED indexes on specific paths within JSON fields. This requires additional parameters to specify the JSON path and data type:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

// Build index params
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"category\"]"); // Path to the JSON key
extraParams.put("json_cast_type", "varchar"); // Data type to cast to during indexing

IndexParam jsonIndexParam = IndexParam.builder()
        .fieldName("metadata") // JSON field name
        .indexType(IndexParam.IndexType.INVERTED)
        .indexName("metadata_category_index")
        .extraParams(extraParams)
        .build();

// Create index
client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection") // Replace with your collection name
        .indexParams(Collections.singletonList(jsonIndexParam))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// Build index params
jsonIdx := index.NewJSONPathIndex(index.Inverted, "varchar", "metadata[\"category\"]") // indexType, json_cast_type, json_path
jsonIdx.WithIndexName("metadata_category_index")

// Create index
_, err = client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "metadata", jsonIdx)) // Replace with your collection name
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

// Build index params
let json_index_params = vec![
    IndexParam::new()
        .field_name("metadata") // JSON field name
        .index_type(IndexType::Inverted)
        .index_name("metadata_category_index")
        .extra_params(HashMap::from([
            ("json_path".into(), "metadata[\"category\"]".into()), // Path to the JSON key
            ("json_cast_type".into(), "varchar".into()), // Data type to cast to during indexing
        ])),
];

// Create index
client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name("my_collection") // Replace with your collection name
            .index_params(json_index_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
// Build index params
milvus::IndexDesc json_index_desc("metadata", "metadata_category_index", milvus::IndexType::INVERTED); // JSON field name, index name, index type
json_index_desc.AddExtraParam("json_path", "metadata[\"category\"]"); // Path to the JSON key
json_index_desc.AddExtraParam("json_cast_type", "varchar"); // Data type to cast to during indexing

// Create index
status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName("my_collection") // Replace with your collection name
                                 .WithIndexes({std::move(json_index_desc)}));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { IndexType } from "@zilliz/milvus2-sdk-node";

// Build index params
await client.createIndex({
    collection_name: "my_collection", // Replace with your collection name
    field_name: "metadata", // JSON field name
    index_type: IndexType.INVERTED,
    index_name: "metadata_category_index",
    params: {
        json_path: "metadata[\"category\"]", // Path to the JSON key
        json_cast_type: "varchar", // Data type to cast to during indexing
    },
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Build index params
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection", # Replace with your collection name
    "indexParams": [
        {
            "fieldName": "metadata", # JSON field name
            "indexName": "metadata_category_index",
            "params": {
                "index_type": "INVERTED",
                "json_path": "metadata[\"category\"]", # Path to the JSON key
                "json_cast_type": "varchar" # Data type to cast to during indexing
            }
        }
    ]
}'
```

</TabItem>
</Tabs>

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

