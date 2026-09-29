---
title: "On-Demand DQL Operations | Cloud"
slug: /dql-sessions-external-collection
sidebar_label: "DQL sessions"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "DQL operations in collections for on-demand computing, such as search, query, get, and hybrid search, require attaching compute resources from an on-demand cluster. Zilliz Cloud allows you to create a session to meet your on-demand compute needs. | Cloud"
type: origin
token: BcjLwmXTni1fiMkkyx9ct5iWngc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# On-Demand DQL Operations

DQL operations in collections for on-demand computing, such as search, query, get, and hybrid search, require attaching compute resources from an on-demand cluster. Zilliz Cloud allows you to create a session to meet your on-demand compute needs.

This article assumes that you have created a collection in a database using the project endpoint. For details, refer to [Create an External Collection](./create-external-collection).

## Connect to a project endpoint\{#connect-to-a-project-endpoint}

A project endpoint is designed to provide your access to on-demand compute resources. You can use it to manage on-demand clusters and databases, as well as manipulate data stored in collections.

The following code example assumes that you have an external collection named `my_collection` in the default database. And you should always use a valid API key with sufficient permissions to set up the connection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client = MilvusClient(
    uri="https://{project-id}.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)

client.has_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("https://{project-id}.{region}.vectordb.zillizcloud.com")
        .token("YOUR_API_KEY")
        .build());

client.hasCollection("my_collection");
```

</TabItem>

<TabItem value='go'>

```go
// Note: the cluster session is not yet supported in milvus-sdk-go.
```

</TabItem>
</Tabs>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("https://{project-id}.{region}.vectordb.zillizcloud.com")
            .token("YOUR_API_KEY"),
    )
    .await?;

    let has = client.has_collection("my_collection").await?;
    Ok(())
}
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("https://{project-id}.{region}.vectordb.zillizcloud.com", "YOUR_API_KEY"));

bool has = client->HasCollection("my_collection");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const client = new MilvusClient({
    address: "https://{project-id}.{region}.vectordb.zillizcloud.com",
    token: "YOUR_API_KEY"
});

client.has_collection({
    collection_name: "my_collection"
});
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT='https://{project-id}.{region}.vectordb.zillizcloud.com'
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## Create a session\{#create-a-session}

Once you set up a connection to the project endpoint, create a session to attach the compute resource from a specified on-demand cluster.

The following example assumes that you have already created an on-demand cluster, whose ID is `inxx-xxxxxxxxxxxxxxxxx`.

<Admonition type="info" title="Notes">

For RESTful requests, instead of creating a session, you should pass the cluster ID as a query parameter to DQL calls.

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
session = client.session(
    cluster_id="inxx-xxxxxxxxxxxxxxxxx"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2Session;

MilvusClientV2Session session = client.session("inxx-xxxxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='go'>

```go
// Note: the cluster session is not yet supported in milvus-sdk-go.
```

</TabItem>
</Tabs>

```rust
let session = client.session("inxx-xxxxxxxxxxxxxxxxx")?;
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
milvus::MilvusClientV2SessionPtr session;
status = client->Session("inxx-xxxxxxxxxxxxxxxxx", session);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const session = client.session("inxx-xxxxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxxxx"
```

</TabItem>
</Tabs>

## Conduct DQL operations\{#conduct-dql-operations}

Once the session is ready, you can conduct searches. The following example uses a basic vector search as an example. This also applies to query, get, and hybrid search.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
res = session.search(
    db_name="my_database",
    collection_name="my_collection",
    anns_field="vector",
    data=[query_vector],
    limit=3,
    output_fields=["product_id", "title", "main_category", "price", "average_rating", "rating_number"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});

SearchReq searchReq = SearchReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .annsField("vector")
        .topK(3)
        .outputFields(Arrays.asList("product_id", "title", "main_category", "price", "average_rating", "rating_number"))
        .build();

SearchResp searchResp = session.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the cluster session is not yet supported in milvus-sdk-go.
```

</TabItem>
</Tabs>

```rust
let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

let res = session
    .search(
        SearchRequest::builder()
            .database_name("my_database")
            .collection_name("my_collection")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(3)
            .output_fields(["product_id", "title", "main_category", "price", "average_rating", "rating_number"])
            .build()?,
    )
    .await?;
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
std::vector<float> queryVector = {
    0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F
};

auto request = milvus::SearchRequest()
    .WithDatabaseName("my_database")
    .WithCollectionName("my_collection")
    .WithAnnsField("vector")
    .WithLimit(3)
    .AddOutputField("product_id")
    .AddOutputField("title")
    .AddFloatVector(queryVector);

milvus::SearchResponse response;
status = session->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];
const res = session.search({
    db_name: "my_database",
    collection_name: "my_collection",
    anns_field: "vector",
    data: [query_vector],
    limit: 3,
    output_fields: ["product_id", "title", "main_category", "price", "average_rating", "rating_number"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection",
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            0.9029438446296592
        ]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": [
        "product_id",
        "title",
        "main_category",
        "price",
        "average_rating",
        "rating_number"
    ]
}'
```

</TabItem>
</Tabs>

## Close a session\{#close-a-session}

Once your on-demand computing tasks are complete, you can close the session. A closed session cannot be used for further DQL operations.

<Admonition type="info" title="Notes">

RESTful calls do not need this.

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
session.close()
```

</TabItem>

<TabItem value='java'>

```java
session.close();
```

</TabItem>

<TabItem value='go'>

```go
// Note: the cluster session is not yet supported in milvus-sdk-go.
```

</TabItem>
</Tabs>

```rust
session.close();
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
session->Close();
```

</TabItem>

<TabItem value='javascript'>

```javascript
session.close();
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the RESTful API does not maintain a persistent session; no explicit close is required.
```

</TabItem>
</Tabs>

