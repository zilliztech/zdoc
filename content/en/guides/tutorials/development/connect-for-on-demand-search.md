---
title: "Connect for On-Demand Search | Cloud"
slug: /connect-for-on-demand-search
sidebar_label: "Connect for On-Demand Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use a project endpoint when you want to run on-demand search or query workloads with compute from an on-demand cluster. | Cloud"
type: origin
token: BTrNwoEfYii1e9kf0BScWDpcnA2
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect for On-Demand Search

Use a project endpoint when you want to run on-demand search or query workloads with compute from an on-demand cluster.

<Admonition type="info" title="Note">

This page is for connecting to a project endpoint for on-demand search. If you want to connect to a Free, Serverless, or Dedicated serving cluster, see [Connect to Serving Clusters](./connect-to-clusters).

</Admonition>

## Endpoint format\{#endpoint-format}

| Endpoint type | Endpoint pattern | Use for |
| --- | --- | --- |
| Project endpoint | `https://{project-id}.{region}.api.zillizcloud.com` | Data import, batch search, query, get, search, and hybrid search through an on-demand cluster. |

## Before you begin\{#before-you-begin}

- Get the project endpoint from the Zilliz Cloud console.

- Get the on-demand cluster ID that should provide compute resources for the search workload.

- Create an API key with sufficient permissions for the project and target data.

- Install a Milvus SDK for your use case. For details, refer to [Install SDKs](./install-sdks).

## Connect to a Project Endpoint\{#connect-to-a-project-endpoint}

Create a `MilvusClient` with the project endpoint and specify the on-demand cluster that should serve the request.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY",
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
    .uri("https://{project-id}.{region}.api.zillizcloud.com")
    .token("YOUR_API_KEY")
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
// Note: The Go SDK does not support project-endpoint connections with
// on-demand cluster routing as of client/v3.0.0. Use a serving-cluster
// endpoint with the Go SDK instead.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("https://{project-id}.{region}.api.zillizcloud.com")
    .token("YOUR_API_KEY");
let client = ClientV2::new(&config).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("https://{project-id}.{region}.api.zillizcloud.com").WithToken("YOUR_API_KEY"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "https://{project-id}.{region}.api.zillizcloud.com",
  token: "YOUR_API_KEY",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not expose on-demand cluster routing.
# Connect to the project endpoint with the /v2/vectordb/* endpoints directly.
```

</TabItem>
</Tabs>

## Create a Search Session\{#create-a-search-session}

Use a session object to attach your operations to the on-demand cluster.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
session = client.session(cluster_id="inxx-xxxxxxxxxxxxxxx")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2Session;

MilvusClientV2Session session = client.session("inxx-xxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='go'>

```go
// Note: Not yet supported in the Go SDK as of client/v3.0.0.
```

</TabItem>

<TabItem value='rust'>

```rust
let session = client.session("inxx-xxxxxxxxxxxxxxx")?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::MilvusClientV2SessionPtr session;
status = client->Session("inxx-xxxxxxxxxxxxxxx", session);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const session = client.session("inxx-xxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: REST does not expose session objects or on-demand cluster routing.
```

</TabItem>
</Tabs>

Then use the session to run DQL operations such as `query`, `get`, `search`, and `hybrid_search`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
results = session.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="vector",
    limit=10,
)

print(results)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

SearchReq searchReq = SearchReq.builder()
    .collectionName("my_collection")
    .data(Collections.singletonList(new FloatVec(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f))))
    .annsField("vector")
    .topK(10)
    .build();

SearchResp results = session.search(searchReq);
System.out.println(results.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
// Note: Not yet supported in the Go SDK as of client/v3.0.0.
```

</TabItem>

<TabItem value='rust'>

```rust
let results = session
    .search(SearchRequest::builder()
        .collection_name("my_collection")
        .vector_field("vector")
        .vectors(SearchVectors::Float(vec![vec![0.1, 0.2, 0.3, 0.4]]))
        .limit(10)
        .build()?)
    .await?;

println!("{results:?}");
```

</TabItem>

<TabItem value='c++'>

```c++
#include <vector>

milvus::SearchRequest request;
request.WithCollectionName("my_collection").WithLimit(10).WithAnnsField("vector");
request.AddFloatVector(std::vector<float>{0.1f, 0.2f, 0.3f, 0.4f});

milvus::SearchResponse response;
status = session->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await session.search({
  collection_name: "my_collection",
  vector: [0.1, 0.2, 0.3, 0.4],
  anns_field: "vector",
  limit: 10,
});

console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: REST does not expose session objects or on-demand cluster routing.
# Search an on-demand cluster via the /v2/vectordb/search endpoint on the project endpoint.
```

</TabItem>
</Tabs>

## Authentication\{#authentication}

When connecting to a project endpoint, use a valid API key as the authentication token.

Cluster credentials in `username:password` format are for serving cluster endpoints. For on-demand search through a project endpoint, use an API key with the required project permissions.

## When to Use This Connection\{#when-to-use-this-connection}

Use the project endpoint for batch processing, exploration, validation, experiments, and other workloads where on-demand compute is a better fit than always-on serving.

For production applications that require the full Collection API and always-on low-latency serving, connect to a Free, Serverless, or Dedicated serving cluster instead. See [Connect to Serving Clusters](./connect-to-clusters) for the serving cluster endpoint formats and connection examples.